/**
 * fuzz-harness.ts — Phase 12: Determinism Hardening
 *
 * Shared infrastructure for all fuzz test suites:
 *
 *   - Seeded PRNG (Mulberry32 — reproducible, no external dependency)
 *   - Worksheet state capture and equality oracle (strict, type-aware)
 *   - Patch generator (valid patches from current worksheet state)
 *   - Trial runner (seed-annotated failures for reproducibility)
 *   - MockWorker + engine factory (shared across transaction/snapshot fuzz)
 *
 * All fuzz trials report seed on failure so any failure can be reproduced
 * by running the trial with that exact seed.
 *
 * CI vs full-fuzz:
 *   Set FUZZ_FULL=1 env var to run full trial counts (slow, thorough).
 *   CI runs reduced counts automatically.
 */

import { Worksheet } from '../../src/worksheet';
import {
  type WorksheetPatch,
  type PatchOp,
  PatchOps,
  invertPatch,
  applyPatch,
} from '../../src/patch/WorksheetPatch';
import type { ExtendedCellValue } from '../../src/types';
import { PatchRecorder, recordingApplyPatch } from '../../src/patch/PatchRecorder';
import { PatchUndoStack } from '../../src/patch/PatchUndoStack';
import { EngineWorkerHost } from '../../src/worker/EngineWorkerHost';
import { WorkerEngineProxy, type IWorkerLike } from '../../src/worker/WorkerEngineProxy';
import type { EngineRequest } from '../../src/worker/EngineWorkerProtocol';

// Re-export for convenience in test files
export {
  Worksheet,
  type WorksheetPatch,
  type PatchOp,
  type ExtendedCellValue,
  PatchOps,
  invertPatch,
  applyPatch,
  PatchRecorder,
  recordingApplyPatch,
  PatchUndoStack,
  EngineWorkerHost,
  WorkerEngineProxy,
};

// ---------------------------------------------------------------------------
// Fuzz configuration
// ---------------------------------------------------------------------------

/** Full trial counts when FUZZ_FULL=1, reduced for CI. */
export const FUZZ = {
  full: !!process.env['FUZZ_FULL'],
  /** P1: apply∘inverse identity */
  P1_TRIALS:  process.env['FUZZ_FULL'] ? 2000 :  200,
  /** P2: commit = sequential */
  P2_TRIALS:  process.env['FUZZ_FULL'] ?  500 :   50,
  /** P3: rollback identity */
  P3_TRIALS:  process.env['FUZZ_FULL'] ? 1000 :  100,
  /** P4: snapshot round-trip */
  P4_TRIALS:  process.env['FUZZ_FULL'] ?  500 :   50,
  /** P5: snapshot ∘ patch composition */
  P5_TRIALS:  process.env['FUZZ_FULL'] ?  200 :   30,
  /** P6: undo/redo walk — walk count */
  P6_WALKS:   process.env['FUZZ_FULL'] ?  300 :   30,
  /** P6: steps per walk */
  P6_STEPS:   process.env['FUZZ_FULL'] ?   50 :   30,
  /** P7: deterministic replay */
  P7_TRIALS:  process.env['FUZZ_FULL'] ?  500 :  100,
  /** Max ops per generated patch batch */
  MAX_OPS_PER_BATCH: 8,
  /** Fuzz worksheet dimensions */
  ROWS: 20,
  COLS: 10,
};

// Base seed — changing this also changes all trial seeds (useful to sweep different families)
const BASE_SEED = 0xDEADBEEF;

// ---------------------------------------------------------------------------
// Mulberry32 — seeded PRNG
// ---------------------------------------------------------------------------

/**
 * Returns a Mulberry32 PRNG function from the given seed.
 * Each call advances the state and returns a uniform float in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [lo, hi] inclusive. */
export function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Pick a random element from an array. */
export function randPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[randInt(rng, 0, arr.length - 1)]!;
}

// ---------------------------------------------------------------------------
// Worksheet state capture
// ---------------------------------------------------------------------------

export type CapturedMerge = { startRow: number; startCol: number; endRow: number; endCol: number };

export type WorksheetState = {
  cells: Map<string, ExtendedCellValue>;   // key: "r{row}c{col}"
  formulas: Map<string, string>;           // key: "r{row}c{col}", value: formula string
  merges: CapturedMerge[];                 // sorted for stable comparison
  hiddenRows: Set<number>;
  hiddenCols: Set<number>;
};

function cellKey(row: number, col: number): string {
  return `r${row}c${col}`;
}

/**
 * Capture a complete snapshot of observable worksheet state.
 * Used as the oracle ground-truth before and after operations.
 */
export function captureState(
  ws: Worksheet,
  rows = FUZZ.ROWS,
  cols = FUZZ.COLS,
): WorksheetState {
  const cells   = new Map<string, ExtendedCellValue>();
  const formulas = new Map<string, string>();
  const hiddenRows = new Set<number>();
  const hiddenCols = new Set<number>();

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const v = ws.getCellValue({ row: r, col: c });
      if (v !== null) cells.set(cellKey(r, c), v);

      const cell = ws.getCell({ row: r, col: c });
      if (cell?.formula) formulas.set(cellKey(r, c), cell.formula);
    }
    if (ws.isRowHidden(r)) hiddenRows.add(r);
  }
  for (let c = 1; c <= cols; c++) {
    if (ws.isColHidden(c)) hiddenCols.add(c);
  }

  // Capture merges, normalise order for stable comparison
  const merges = ws.getMergedRanges().map(r => ({
    startRow: r.start.row,
    startCol: r.start.col,
    endRow:   r.end.row,
    endCol:   r.end.col,
  })).sort((a, b) =>
    a.startRow !== b.startRow ? a.startRow - b.startRow :
    a.startCol - b.startCol
  );

  return { cells, formulas, merges, hiddenRows, hiddenCols };
}

// ---------------------------------------------------------------------------
// Oracle — strict type-aware equality
// ---------------------------------------------------------------------------

export type OracleResult = { equal: true } | { equal: false; diff: string };

/**
 * Strict worksheet state equality oracle.
 *
 * Type-aware: number 1 ≠ string "1", null ≠ 0, null ≠ absent.
 * Checks: cell values, formula text, merge regions, row/col visibility.
 */
export function statesEqual(a: WorksheetState, b: WorksheetState): OracleResult {
  // 1. Cell values (null = absent for these purposes, but we stored both)
  const allKeys = new Set([...a.cells.keys(), ...b.cells.keys()]);
  for (const k of allKeys) {
    const va = a.cells.get(k) ?? null;
    const vb = b.cells.get(k) ?? null;
    if (va !== vb) {
      // Special-case: two Date objects with same timestamp are equal
      if (va instanceof Date && vb instanceof Date) {
        if (va.getTime() !== vb.getTime()) {
          return { equal: false, diff: `cell[${k}]: Date(${va.getTime()}) ≠ Date(${vb.getTime()})` };
        }
      } else {
        return { equal: false, diff: `cell[${k}]: ${JSON.stringify(va)} (${typeof va}) ≠ ${JSON.stringify(vb)} (${typeof vb})` };
      }
    }
  }

  // 2. Formula text
  const allFmKeys = new Set([...a.formulas.keys(), ...b.formulas.keys()]);
  for (const k of allFmKeys) {
    const fa = a.formulas.get(k) ?? null;
    const fb = b.formulas.get(k) ?? null;
    if (fa !== fb) {
      return { equal: false, diff: `formula[${k}]: ${fa} ≠ ${fb}` };
    }
  }

  // 3. Merge regions (sorted above)
  if (a.merges.length !== b.merges.length) {
    return { equal: false, diff: `merge count: ${a.merges.length} ≠ ${b.merges.length}` };
  }
  for (let i = 0; i < a.merges.length; i++) {
    const ma = a.merges[i]!;
    const mb = b.merges[i]!;
    if (
      ma.startRow !== mb.startRow || ma.startCol !== mb.startCol ||
      ma.endRow   !== mb.endRow   || ma.endCol   !== mb.endCol
    ) {
      return {
        equal: false,
        diff:  `merge[${i}]: ${JSON.stringify(ma)} ≠ ${JSON.stringify(mb)}`,
      };
    }
  }

  // 4. Hidden rows
  const allHiddenRows = new Set([...a.hiddenRows, ...b.hiddenRows]);
  for (const r of allHiddenRows) {
    if (a.hiddenRows.has(r) !== b.hiddenRows.has(r)) {
      return { equal: false, diff: `row ${r} hidden: ${a.hiddenRows.has(r)} ≠ ${b.hiddenRows.has(r)}` };
    }
  }

  // 5. Hidden cols
  const allHiddenCols = new Set([...a.hiddenCols, ...b.hiddenCols]);
  for (const c of allHiddenCols) {
    if (a.hiddenCols.has(c) !== b.hiddenCols.has(c)) {
      return { equal: false, diff: `col ${c} hidden: ${a.hiddenCols.has(c)} ≠ ${b.hiddenCols.has(c)}` };
    }
  }

  return { equal: true };
}

// ---------------------------------------------------------------------------
// Random value generator
// ---------------------------------------------------------------------------

const STRING_POOL = ['', 'hello', 'world', 'foo', 'bar', '123', 'abc', 'test'];

/**
 * Generate a random ExtendedCellValue.
 * Deliberately includes null (∼25%), keeping cell sparsity realistic.
 */
export function randomValue(rng: () => number): ExtendedCellValue {
  const n = rng();
  if (n < 0.25) return null;
  if (n < 0.50) return Math.round(rng() * 1000 - 500) + rng(); // float in [-500, 500]
  if (n < 0.70) return randPick(rng, STRING_POOL);
  if (n < 0.85) return rng() > 0.5;
  // 15%: integer (tests number vs string "1" distinction)
  return randInt(rng, 0, 100);
}

// ---------------------------------------------------------------------------
// Patch generator
// ---------------------------------------------------------------------------

/**
 * Generate a single random valid PatchOp against the given worksheet state.
 *
 * Validity contract:
 *   - setCellValue: before = current stored value (or null if absent)
 *   - mergeCells: only on regions where no cell is already in a merge
 *   - cancelMerge: only on existing merge anchors
 *   - visibility: always valid (idempotent toggle operations included)
 *
 * Op-mix (approx):
 *   55% setCellValue (random new value)
 *   13% setCellValue same-as-current (no-op, idempotency coverage)
 *   10% hideRow / showRow (including already-hidden / already-visible)
 *    8% hideCol / showCol
 *    8% mergeCells (2×2 region on free cells)
 *    6% cancelMerge (on existing region, if any)
 *
 * Returns null if no valid op could be generated for the chosen category.
 */
function generateOp(rng: () => number, ws: Worksheet): PatchOp | null {
  const roll = rng();
  const rows = FUZZ.ROWS;
  const cols = FUZZ.COLS;

  // setCellValue (regular): 55%
  if (roll < 0.55) {
    const row   = randInt(rng, 1, rows);
    const col   = randInt(rng, 1, cols);
    const before = ws.getCellValue({ row, col });
    const after  = randomValue(rng);
    return PatchOps.setCellValue(row, col, before, after);
  }

  // setCellValue same-as-current (no-op): 13%
  if (roll < 0.68) {
    const row   = randInt(rng, 1, rows);
    const col   = randInt(rng, 1, cols);
    const v     = ws.getCellValue({ row, col });
    return PatchOps.setCellValue(row, col, v, v);
  }

  // hideRow / showRow: 10%
  // Only generate effective (state-changing) ops — Worksheet now silently
  // drops idempotent visibility calls to avoid spurious recorder entries.
  if (roll < 0.78) {
    const row = randInt(rng, 1, rows);
    // Toggle: if currently hidden → show; if visible → hide
    return ws.isRowHidden(row)
      ? PatchOps.showRow(row)
      : PatchOps.hideRow(row);
  }

  // hideCol / showCol: 8%
  if (roll < 0.86) {
    const col = randInt(rng, 1, cols);
    // Toggle: if currently hidden → show; if visible → hide
    return ws.isColHidden(col)
      ? PatchOps.showCol(col)
      : PatchOps.hideCol(col);
  }

  // mergeCells: 8% — try 2×2 region on free cells
  if (roll < 0.94) {
    if (rows < 2 || cols < 2) return null;
    const startRow = randInt(rng, 1, rows - 1);
    const startCol = randInt(rng, 1, cols - 1);
    const endRow   = startRow + 1;
    const endCol   = startCol + 1;
    // Skip if any cell in 2×2 is already part of a merge
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (ws.isInMerge({ row: r, col: c })) return null;
      }
    }
    return PatchOps.mergeCells(startRow, startCol, endRow, endCol);
  }

  // cancelMerge: 6% — pick a random existing merge
  const merges = ws.getMergedRanges();
  if (merges.length === 0) return null;
  const m = randPick(rng, merges);
  return PatchOps.cancelMerge(m.start.row, m.start.col, m.end.row, m.end.col);
}

/**
 * Generate a WorksheetPatch with 1-MAX_OPS_PER_BATCH ops.
 * Skips null ops from generateOp (invalid conditions).
 * Returns an empty-ops patch if no valid ops could be generated.
 *
 * IMPORTANT: Applies each op to `ws` as it generates them so subsequent
 * ops see correct `before` values. Callers must pass a *scratch* worksheet
 * for generation, or understand that `ws` state advances with each call.
 */
export function generatePatch(rng: () => number, ws: Worksheet): WorksheetPatch {
  const opCount = randInt(rng, 1, FUZZ.MAX_OPS_PER_BATCH);
  const ops: PatchOp[] = [];
  for (let i = 0; i < opCount; i++) {
    const op = generateOp(rng, ws);
    if (op === null) continue;
    ops.push(op);
    // Advance ws state for next op's before-value correctness
    try {
      applyPatch(ws, { seq: 0, ops: [op] });
    } catch {
      // merge conflict etc — remove the op we just added
      ops.pop();
    }
  }
  return { seq: 0, ops };
}

/**
 * Like generatePatch but excludes mergeCells / cancelMerge ops.
 *
 * Use this when testing algebraic properties (P1, P7) that rely on
 * invertPatch to restore state: mergeCells is a destructive operation
 * that permanently deletes non-anchor cell data, making full state
 * restoration via invertPatch impossible.  This variant guarantees every
 * generated op is fully reversible.
 */
export function generatePatchNonDestructive(
  rng: () => number,
  ws: Worksheet,
): WorksheetPatch {
  const opCount = randInt(rng, 1, FUZZ.MAX_OPS_PER_BATCH);
  const ops: PatchOp[] = [];
  for (let i = 0; i < opCount; i++) {
    // Re-roll until we get a non-merge op (or exhaust attempts)
    let op: PatchOp | null = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const roll = rng();
      // Scale roll into [0, 0.86) to exclude the mergeCells (8%) and
      // cancelMerge (6%) buckets that normally live in [0.86, 1.0).
      const scaledRoll = roll * 0.86;
      const rows = FUZZ.ROWS;
      const cols = FUZZ.COLS;

      if (scaledRoll < 0.55) {
        const row    = randInt(rng, 1, rows);
        const col    = randInt(rng, 1, cols);
        const before = ws.getCellValue({ row, col });
        const after  = randomValue(rng);
        op = PatchOps.setCellValue(row, col, before, after);
        break;
      }
      if (scaledRoll < 0.68) {
        const row    = randInt(rng, 1, rows);
        const col    = randInt(rng, 1, cols);
        const v      = ws.getCellValue({ row, col });
        op = PatchOps.setCellValue(row, col, v, v);
        break;
      }
      if (scaledRoll < 0.78) {
        const row = randInt(rng, 1, rows);
        op = ws.isRowHidden(row) ? PatchOps.showRow(row) : PatchOps.hideRow(row);
        break;
      }
      // Visibility col (scaled [0.78, 0.86))
      const col = randInt(rng, 1, cols);
      op = ws.isColHidden(col) ? PatchOps.showCol(col) : PatchOps.hideCol(col);
      break;
    }
    if (op === null) continue;
    ops.push(op);
    try {
      applyPatch(ws, { seq: 0, ops: [op] });
    } catch {
      ops.pop();
    }
  }
  return { seq: 0, ops };
}

/**
 * Generate N patches sequentially.
 * Returns both patches and the intermediate states after each.
 * ws is mutated in place.
 */
export function generatePatches(
  rng: () => number,
  ws: Worksheet,
  count: number,
): WorksheetPatch[] {
  const patches: WorksheetPatch[] = [];
  for (let i = 0; i < count; i++) {
    patches.push(generatePatch(rng, ws));
  }
  return patches;
}

// ---------------------------------------------------------------------------
// Trial runner
// ---------------------------------------------------------------------------

/**
 * Run `trials` random fuzz trials.
 *
 * Each trial receives a seeded RNG and its seed.
 * On failure, re-throws with the seed embedded so Jest reports it.
 *
 * Usage:
 *   runFuzzTrials(FUZZ.P1_TRIALS, (rng, seed) => {
 *     // build state, apply ops, assert properties
 *   });
 */
export function runFuzzTrials(
  trials: number,
  fn: (rng: () => number, seed: number) => void,
  baseSeed = BASE_SEED,
): void {
  for (let i = 0; i < trials; i++) {
    // Mix base seed with trial index using knuth multiplicative hash
    const seed = ((baseSeed >>> 0) + Math.imul(i + 1, 0x9E3779B9)) >>> 0;
    try {
      fn(mulberry32(seed), seed);
    } catch (err) {
      throw new Error(
        `Fuzz failure at trial=${i} seed=0x${seed.toString(16).padStart(8, '0')}: ${err}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// MockWorker + engine factory (all fuzz tests share this)
// ---------------------------------------------------------------------------

export class MockWorker implements IWorkerLike {
  private readonly host: EngineWorkerHost;
  private handlers: Array<(ev: MessageEvent) => void> = [];
  public terminated = false;

  constructor(host: EngineWorkerHost) { this.host = host; }

  postMessage(data: unknown, _transferList?: Transferable[]): void {
    if (this.terminated) return;
    const req = data as EngineRequest;
    const { response } = this.host.handleMessage(req);
    const ev = new MessageEvent('message', { data: response });
    for (const h of this.handlers) h(ev);
  }

  addEventListener(_: 'message', h: (ev: MessageEvent) => void): void { this.handlers.push(h); }
  removeEventListener(_: 'message', h: (ev: MessageEvent) => void): void {
    this.handlers = this.handlers.filter(x => x !== h);
  }
  terminate(): void { this.terminated = true; this.handlers = []; }
}

export function makeEngine(name = 'Fuzz'): {
  host:  EngineWorkerHost;
  proxy: WorkerEngineProxy;
  mock:  MockWorker;
} {
  const host  = new EngineWorkerHost(name);
  const mock  = new MockWorker(host);
  const proxy = new WorkerEngineProxy(mock);
  return { host, proxy, mock };
}

// ---------------------------------------------------------------------------
// Convenience: apply patches through proxy and return applied-patch list
// ---------------------------------------------------------------------------

/**
 * Apply an array of patches via proxy.applyPatch in sequence.
 * Returns the inverse patches returned by each call.
 */
export async function applyPatchesViaProxy(
  proxy: WorkerEngineProxy,
  patches: WorksheetPatch[],
): Promise<WorksheetPatch[]> {
  const inverses: WorksheetPatch[] = [];
  for (const p of patches) {
    inverses.push(await proxy.applyPatch(p));
  }
  return inverses;
}

// ---------------------------------------------------------------------------
// Directed state builders (for P4 specific edge cases)
// ---------------------------------------------------------------------------

/**
 * Install edge-case cell values into ws for P4 directed tests:
 *   (1,1) = null    (explicit null — absent in store)
 *   (1,2) = 0       (numeric zero — distinct from null)
 *   (1,3) = ""      (empty string — distinct from null/0)
 *   (1,4) = "1"     (string "1" — distinct from number 1)
 *   (1,5) = 1       (number 1)
 *   (1,6) = false   (boolean false)
 *   (1,7) = true    (boolean true)
 */
export function installEdgeCaseCells(ws: Worksheet): void {
  ws.setCellValue({ row: 1, col: 1 }, null);
  ws.setCellValue({ row: 1, col: 2 }, 0);
  ws.setCellValue({ row: 1, col: 3 }, '');
  ws.setCellValue({ row: 1, col: 4 }, '1');
  ws.setCellValue({ row: 1, col: 5 }, 1);
  ws.setCellValue({ row: 1, col: 6 }, false);
  ws.setCellValue({ row: 1, col: 7 }, true);
}
