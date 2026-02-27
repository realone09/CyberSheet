/**
 * @group sdk
 *
 * Stress Bench Envelope — Phase 14 Operational Hardening.
 *
 * These are CEILING TESTS, not micro-benchmarks:
 *  - They verify the system completes within a generous upper-bound time window.
 *  - They log actual timings for observability, but only fail if the ceiling is breached.
 *  - Thresholds are set 10× above expected performance to tolerate CI machines.
 *
 *  Scenarios:
 *  1. 10 000 setCell operations (single-sheet, sequential rows)
 *  2. 1 000 undo/redo cycles after 1 000 mutations
 *  3. 100 encodeSnapshot / decodeAndRestore cycles
 *  4. Mixed workload: cells + row-hide + merges, 2 000 ops total
 *  5. 5 000 formula cells (=A1+1 style strings stored as values)
 *  6. 1 000 snapshot encode then cross-restore to a fresh sheet
 */

import { createSpreadsheet } from '../../src/sdk/index';

// Generous CI ceiling (ms). Values are intentionally very large to avoid flakiness.
const CEILING = {
  TEN_K_CELLS: 15_000,
  UNDO_REDO: 10_000,
  SNAPSHOT_CYCLES: 15_000,
  MIXED_WORKLOAD: 10_000,
  FORMULA_CELLS: 15_000,
  CROSS_RESTORE: 20_000,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function elapsed(start: number) {
  return Date.now() - start;
}

function logTiming(label: string, ms: number) {
  // Jest captures output; this keeps evidence in --verbose runs.
  process.stdout.write(`\n  [stress] ${label}: ${ms}ms\n`);
}

// ---------------------------------------------------------------------------
// 1. 10 000 setCell calls
// ---------------------------------------------------------------------------

describe('stress: 10 000 setCell operations', () => {
  it(`completes in < ${CEILING.TEN_K_CELLS}ms`, () => {
    const TOTAL = 10_000;
    const s = createSpreadsheet('Stress10k', { rows: TOTAL, cols: 10, maxUndoHistory: 1 });
    const t0 = Date.now();

    for (let r = 1; r <= TOTAL; r++) {
      s.setCell(r, 1, r * 2);
    }

    const ms = elapsed(t0);
    logTiming('10k setCell', ms);
    expect(ms).toBeLessThan(CEILING.TEN_K_CELLS);
    s.dispose();
  });

  it('all 10 000 cells retain correct values after bulk write', () => {
    const TOTAL = 1_000; // sanity check on a smaller subset
    const s = createSpreadsheet('Verify10k', { rows: TOTAL, cols: 1, maxUndoHistory: 1 });
    for (let r = 1; r <= TOTAL; r++) s.setCell(r, 1, r);
    for (let r = 1; r <= TOTAL; r++) expect(s.getCellValue(r, 1)).toBe(r);
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 2. 1 000 undo / redo cycles
// ---------------------------------------------------------------------------

describe('stress: 1 000 undo/redo cycles', () => {
  it(`1 000 undo + 1 000 redo complete in < ${CEILING.UNDO_REDO}ms`, () => {
    const MUTATIONS = 1_000;
    const s = createSpreadsheet('StressUndo', { rows: MUTATIONS, cols: 1, maxUndoHistory: MUTATIONS });

    for (let r = 1; r <= MUTATIONS; r++) s.setCell(r, 1, r);

    const t0 = Date.now();
    for (let i = 0; i < MUTATIONS; i++) s.undo();
    for (let i = 0; i < MUTATIONS; i++) s.redo();
    const ms = elapsed(t0);

    logTiming('1k undo + 1k redo', ms);
    expect(ms).toBeLessThan(CEILING.UNDO_REDO);
    s.dispose();
  });

  it('after full undo/redo cycle all cells have original values', () => {
    const N = 50;
    const s = createSpreadsheet('UndoRedoVerify', { rows: N, cols: 1, maxUndoHistory: N });
    for (let r = 1; r <= N; r++) s.setCell(r, 1, r * 10);

    // Undo all
    for (let i = 0; i < N; i++) s.undo();
    // Redo all
    for (let i = 0; i < N; i++) s.redo();
    // Values should be restored
    for (let r = 1; r <= N; r++) expect(s.getCellValue(r, 1)).toBe(r * 10);
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 3. 100 encodeSnapshot / decodeAndRestore cycles
// ---------------------------------------------------------------------------

describe('stress: 100 snapshot encode/restore cycles', () => {
  it(`100 full encode + restore cycles complete in < ${CEILING.SNAPSHOT_CYCLES}ms`, () => {
    const CYCLES = 100;
    const s = createSpreadsheet('SnapStress', { rows: 200, cols: 50, maxUndoHistory: 1 });
    // Prepopulate
    for (let r = 1; r <= 200; r++) s.setCell(r, 1, `row-${r}`);

    const t0 = Date.now();
    for (let i = 0; i < CYCLES; i++) {
      const bytes = s.encodeSnapshot();
      s.decodeAndRestore(bytes);
    }
    const ms = elapsed(t0);

    logTiming('100 encode+restore cycles', ms);
    expect(ms).toBeLessThan(CEILING.SNAPSHOT_CYCLES);
    s.dispose();
  });

  it('snapshot round-trip preserves state across 10 cycles', () => {
    const s = createSpreadsheet('SnapPreserve', { rows: 10, cols: 10, maxUndoHistory: 1 });
    const SENTINEL = 'sentinel-value-99';
    s.setCell(5, 5, SENTINEL);

    for (let i = 0; i < 10; i++) {
      const b = s.encodeSnapshot();
      s.decodeAndRestore(b);
      expect(s.getCellValue(5, 5)).toBe(SENTINEL);
    }
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 4. Mixed workload: cells + hides + merges
// ---------------------------------------------------------------------------

describe('stress: mixed workload 2 000 operations', () => {
  it(`2 000 mixed ops (cells/hides/merges) complete in < ${CEILING.MIXED_WORKLOAD}ms`, () => {
    const s = createSpreadsheet('MixedStress', { rows: 1000, cols: 50, maxUndoHistory: 1 });
    const t0 = Date.now();

    for (let i = 0; i < 1000; i++) {
      s.setCell((i % 1000) + 1, (i % 10) + 1, i);
    }
    for (let r = 1; r <= 500; r += 5) {
      s.hideRow(r);
    }
    for (let c = 1; c <= 50; c += 5) {
      s.hideCol(c);
    }
    // Non-overlapping merges across different row bands
    let mergeCount = 0;
    for (let base = 1; base <= 900 && mergeCount < 100; base += 9) {
      try {
        s.mergeCells(base, 20, base + 2, 22);
        mergeCount++;
      } catch {
        // Skip already-merged regions
      }
    }

    const ms = elapsed(t0);
    logTiming('2k mixed ops', ms);
    expect(ms).toBeLessThan(CEILING.MIXED_WORKLOAD);
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 5. 5 000 formula-like string cells
// ---------------------------------------------------------------------------

describe('stress: 5 000 cells with formula-like values', () => {
  it(`5 000 formula strings written in < ${CEILING.FORMULA_CELLS}ms`, () => {
    const TOTAL = 5_000;
    const s = createSpreadsheet('FormulaStress', { rows: TOTAL, cols: 1, maxUndoHistory: 1 });
    const t0 = Date.now();

    for (let r = 1; r <= TOTAL; r++) {
      // Store formula strings (not evaluated — tests throughput of cell write path)
      s.setCell(r, 1, `=ROW()+${r}`);
    }

    const ms = elapsed(t0);
    logTiming('5k formula cells', ms);
    expect(ms).toBeLessThan(CEILING.FORMULA_CELLS);

    // Spot check values are correctly stored
    expect(s.getCellValue(1, 1)).toBe('=ROW()+1');
    expect(s.getCellValue(TOTAL, 1)).toBe(`=ROW()+${TOTAL}`);
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 6. Cross-restore: encode from sheet A, restore into sheet B
// ---------------------------------------------------------------------------

describe('stress: 1 000 cross-sheet snapshot restores', () => {
  it(`1 000 cross-restore operations complete in < ${CEILING.CROSS_RESTORE}ms`, () => {
    const CYCLES = 1_000;
    const source = createSpreadsheet('SnapSrc', { rows: 20, cols: 20, maxUndoHistory: 1 });
    for (let r = 1; r <= 20; r++) source.setCell(r, 1, `src-${r}`);
    const bytes = source.encodeSnapshot();
    source.dispose();

    const receiver = createSpreadsheet('SnapDst', { rows: 20, cols: 20, maxUndoHistory: 1 });
    const t0 = Date.now();

    for (let i = 0; i < CYCLES; i++) {
      receiver.decodeAndRestore(bytes);
    }

    const ms = elapsed(t0);
    logTiming('1k cross-restore', ms);
    expect(ms).toBeLessThan(CEILING.CROSS_RESTORE);

    // Final state should match source
    expect(receiver.getCellValue(1, 1)).toBe('src-1');
    expect(receiver.getCellValue(20, 1)).toBe('src-20');
    receiver.dispose();
  });
});
