/**
 * MergeStore.ts — Merged cell region storage
 *
 * STATUS: ✅ ACTIVE — Phase 2 implementation.
 *
 * =============================================================================
 * DESIGN (PM Directive — Phase 2, Feb 2026)
 * =============================================================================
 *
 * Requirements:
 *   - O(1) anchor lookup for any cell (hot path: every getCell call)
 *   - Hard error on overlap (no silent clobber)
 *   - PM-mandated interface: get / set / has / delete / forEach
 *
 * Data structures:
 *   anchorMap: Map<anchorKey, MergedRegion>
 *     Primary store. anchorKey = packKey(startRow, startCol).
 *     O(1) to retrieve full region given anchor coordinates.
 *
 *   memberMap: Map<memberKey, anchorKey>
 *     Reverse index. Every cell in a merged region maps to its anchor key.
 *     Created eagerly on merge; deleted on unmerge.
 *     O(1) to find the anchor for any cell.
 *     O(region_size) to build/tear down (acceptable — merges are rare write ops).
 *
 * =============================================================================
 * COMPLEXITY ANALYSIS
 * =============================================================================
 *
 * | Operation         | Complexity           | Notes                        |
 * |-------------------|----------------------|------------------------------|
 * | add()             | O(r×c)               | r = rows, c = cols in region |
 * | removeByAnchor()  | O(r×c)               | Removes all member entries   |
 * | getRegion()       | O(1)                 | memberMap lookup + anchorMap |
 * | getAnchor()       | O(1)                 | memberMap lookup + unpack    |
 * | isAnchor()        | O(1)                 | memberMap + key equality     |
 * | isNonAnchor()     | O(1)                 | memberMap + key inequality   |
 * | getAll()          | O(n_merges)          | Iterator over anchorMap      |
 *
 * This satisfies the PM constraint: "Anchor resolution must be O(1)."
 * No O(n_merges) scan anywhere in the hot path.
 *
 * =============================================================================
 * OVERLAP SEMANTICS
 * =============================================================================
 *
 * add() throws MergeConflictError when ANY cell in the new region is already
 * registered in memberMap — meaning it's part of an existing merge.
 *
 * Adjacent merges (touching but not overlapping) are ALLOWED.
 * Partial overlaps are REJECTED with a typed error.
 * Full re-merge of an exact existing region is also REJECTED (not idempotent).
 * Callers should removeByAnchor() first if they want to re-merge.
 *
 * =============================================================================
 * ROLLBACK PLAN
 * =============================================================================
 *
 * Worksheet uses IMergeStore. To revert to the legacy Range[] approach, create
 * a MergeStoreLegacy that implements IMergeStore with O(n) linear scan.
 * Swap one line in Worksheet: `private mergeStore: IMergeStore = new MergeStoreV1()`
 * No other code changes required.
 */

import type { Address, MergedRegion } from '../types';
import { packKey, COL_MULT } from './CellStoreV1';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/**
 * Thrown by MergeStoreV1.add() when the new region overlaps any existing merge.
 *
 * Carry `conflictCell` to allow callers to show the user which cell conflicts.
 */
export class MergeConflictError extends Error {
  /** The cell that is already in an existing merge. */
  readonly conflictCell: Address;
  /** The anchor of the existing merge that conflicts. */
  readonly existingAnchor: Address;

  constructor(conflictCell: Address, existingAnchor: Address) {
    super(
      `Cannot merge: cell (${conflictCell.row},${conflictCell.col}) is already ` +
      `in a merge anchored at (${existingAnchor.row},${existingAnchor.col}).`
    );
    this.name = 'MergeConflictError';
    this.conflictCell = conflictCell;
    this.existingAnchor = existingAnchor;
  }
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IMergeStore {
  /**
   * Register a new merged region.
   *
   * @throws MergeConflictError if any cell in the region is already merged.
   * @throws RangeError if the region is a single cell (1×1 — no merge possible).
   */
  add(region: MergedRegion): void;

  /**
   * Remove the merge anchored at (anchorRow, anchorCol).
   * Returns the removed region, or undefined if no merge at that anchor.
   * No-op if the address is not a merge anchor.
   */
  removeByAnchor(anchorRow: number, anchorCol: number): MergedRegion | undefined;

  /**
   * Remove all merges that overlap the given bounding box.
   * Returns the array of removed regions.
   */
  removeOverlapping(startRow: number, startCol: number, endRow: number, endCol: number): MergedRegion[];

  /**
   * O(1) — Return the MergedRegion containing (row, col), or undefined.
   * Works for both anchor cells and non-anchor cells.
   */
  getRegion(row: number, col: number): MergedRegion | undefined;

  /**
   * O(1) — Return the anchor Address of the merge containing (row, col),
   * or null if the cell is not in any merge.
   */
  getAnchor(row: number, col: number): Address | null;

  /**
   * O(1) — True if (row, col) is in ANY merge (anchor or non-anchor).
   */
  isInMerge(row: number, col: number): boolean;

  /**
   * O(1) — True if (row, col) is the anchor (top-left) of a merged region.
   */
  isAnchor(row: number, col: number): boolean;

  /**
   * O(1) — True if (row, col) is in a merge but NOT the anchor.
   * These cells redirect reads/writes to the anchor.
   */
  isNonAnchor(row: number, col: number): boolean;

  /** All regions (for rendering / serialisation). O(n_merges). */
  getAll(): MergedRegion[];

  /** Number of merged regions. */
  readonly size: number;
}

// ---------------------------------------------------------------------------
// Implementation: MergeStoreV1
// ---------------------------------------------------------------------------

/**
 * Phase 2 merge store: dual-map implementation for O(1) anchor resolution.
 *
 * Internal invariant:
 *   For every (r, c) in region [startRow..endRow] × [startCol..endCol]:
 *     memberMap.get(packKey(r, c)) === packKey(region.startRow, region.startCol)
 *
 * This invariant is established by add() and torn down by removeByAnchor().
 */
export class MergeStoreV1 implements IMergeStore {
  /**
   * Primary store: anchor packed key → region.
   * The anchor packed key equals packKey(region.startRow, region.startCol).
   */
  private readonly anchorMap = new Map<number, MergedRegion>();

  /**
   * Reverse index: any member cell's packed key → anchor packed key.
   * Populated for every cell in a merge — both anchor and non-anchor cells.
   */
  private readonly memberMap = new Map<number, number>();

  // ── add ────────────────────────────────────────────────────────────────────

  add(region: MergedRegion): void {
    // Reject 1×1 "merge" — meaningless and would pollute the memberMap.
    if (region.startRow === region.endRow && region.startCol === region.endCol) {
      throw new RangeError(
        `Cannot merge a single cell (${region.startRow},${region.startCol}) with itself.`
      );
    }

    // Phase 1: validate — scan for overlap BEFORE mutating any state.
    // Fail-fast: throw on the first conflict found.
    for (let r = region.startRow; r <= region.endRow; r++) {
      for (let c = region.startCol; c <= region.endCol; c++) {
        const memberKey = packKey(r, c);
        const existingAnchorKey = this.memberMap.get(memberKey);
        if (existingAnchorKey !== undefined) {
          const existingRegion = this.anchorMap.get(existingAnchorKey)!;
          throw new MergeConflictError(
            { row: r, col: c },
            { row: existingRegion.startRow, col: existingRegion.startCol }
          );
        }
      }
    }

    // Phase 2: commit — register anchor and all members.
    const anchorKey = packKey(region.startRow, region.startCol);
    this.anchorMap.set(anchorKey, region);
    for (let r = region.startRow; r <= region.endRow; r++) {
      for (let c = region.startCol; c <= region.endCol; c++) {
        this.memberMap.set(packKey(r, c), anchorKey);
      }
    }
  }

  // ── removeByAnchor ─────────────────────────────────────────────────────────

  removeByAnchor(anchorRow: number, anchorCol: number): MergedRegion | undefined {
    const anchorKey = packKey(anchorRow, anchorCol);
    const region = this.anchorMap.get(anchorKey);
    if (!region) return undefined;

    // Tear down all member entries.
    for (let r = region.startRow; r <= region.endRow; r++) {
      for (let c = region.startCol; c <= region.endCol; c++) {
        this.memberMap.delete(packKey(r, c));
      }
    }
    this.anchorMap.delete(anchorKey);
    return region;
  }

  // ── removeOverlapping ──────────────────────────────────────────────────────

  removeOverlapping(startRow: number, startCol: number, endRow: number, endCol: number): MergedRegion[] {
    const removed: MergedRegion[] = [];
    // Collect anchors that overlap with the bounding box.
    for (const [anchorKey, region] of this.anchorMap) {
      const rOverlap = region.startRow <= endRow && region.endRow >= startRow;
      const cOverlap = region.startCol <= endCol && region.endCol >= startCol;
      if (rOverlap && cOverlap) {
        removed.push(region);
      }
    }
    // Remove each (separate from iteration to avoid mutation-during-iteration).
    for (const region of removed) {
      this.removeByAnchor(region.startRow, region.startCol);
    }
    return removed;
  }

  // ── queries (O(1)) ─────────────────────────────────────────────────────────

  getRegion(row: number, col: number): MergedRegion | undefined {
    const anchorKey = this.memberMap.get(packKey(row, col));
    if (anchorKey === undefined) return undefined;
    return this.anchorMap.get(anchorKey);
  }

  getAnchor(row: number, col: number): Address | null {
    const anchorKey = this.memberMap.get(packKey(row, col));
    if (anchorKey === undefined) return null;
    const anchorCol = anchorKey % COL_MULT;
    const anchorRow = (anchorKey - anchorCol) / COL_MULT;
    return { row: anchorRow, col: anchorCol };
  }

  isInMerge(row: number, col: number): boolean {
    return this.memberMap.has(packKey(row, col));
  }

  isAnchor(row: number, col: number): boolean {
    const k = packKey(row, col);
    const anchorKey = this.memberMap.get(k);
    return anchorKey !== undefined && anchorKey === k;
  }

  isNonAnchor(row: number, col: number): boolean {
    const k = packKey(row, col);
    const anchorKey = this.memberMap.get(k);
    return anchorKey !== undefined && anchorKey !== k;
  }

  getAll(): MergedRegion[] {
    return [...this.anchorMap.values()];
  }

  get size(): number {
    return this.anchorMap.size;
  }
}

// ---------------------------------------------------------------------------
// MergeStoreLegacy — rollback shim (O(n) linear scan)
// ---------------------------------------------------------------------------

/**
 * Rollback shim: wraps the original Range[] approach behind IMergeStore.
 *
 * USAGE: Swap `new MergeStoreV1()` for `new MergeStoreLegacy()` in Worksheet
 * to revert to pre-Phase-2 behaviour if a regression is found.
 *
 * NOT intended for production use — O(n) anchor lookup.
 */
export class MergeStoreLegacy implements IMergeStore {
  private readonly regions: MergedRegion[] = [];

  private overlaps(a: MergedRegion, b: MergedRegion): boolean {
    return a.startRow <= b.endRow && a.endRow >= b.startRow &&
           a.startCol <= b.endCol && a.endCol >= b.startCol;
  }

  add(region: MergedRegion): void {
    for (const existing of this.regions) {
      if (this.overlaps(existing, region)) {
        throw new MergeConflictError(
          { row: region.startRow, col: region.startCol },
          { row: existing.startRow, col: existing.startCol }
        );
      }
    }
    this.regions.push(region);
  }

  removeByAnchor(anchorRow: number, anchorCol: number): MergedRegion | undefined {
    const idx = this.regions.findIndex(r => r.startRow === anchorRow && r.startCol === anchorCol);
    if (idx === -1) return undefined;
    return this.regions.splice(idx, 1)[0];
  }

  removeOverlapping(startRow: number, startCol: number, endRow: number, endCol: number): MergedRegion[] {
    const box: MergedRegion = { startRow, startCol, endRow, endCol };
    const removed = this.regions.filter(r => this.overlaps(r, box));
    for (const r of removed) this.removeByAnchor(r.startRow, r.startCol);
    return removed;
  }

  getRegion(row: number, col: number): MergedRegion | undefined {
    return this.regions.find(r =>
      row >= r.startRow && row <= r.endRow && col >= r.startCol && col <= r.endCol
    );
  }

  getAnchor(row: number, col: number): Address | null {
    const r = this.getRegion(row, col);
    return r ? { row: r.startRow, col: r.startCol } : null;
  }

  isInMerge(row: number, col: number): boolean {
    return this.getRegion(row, col) !== undefined;
  }

  isAnchor(row: number, col: number): boolean {
    return this.regions.some(r => r.startRow === row && r.startCol === col);
  }

  isNonAnchor(row: number, col: number): boolean {
    const r = this.getRegion(row, col);
    return r !== undefined && !(r.startRow === row && r.startCol === col);
  }

  getAll(): MergedRegion[] {
    return [...this.regions];
  }

  get size(): number {
    return this.regions.length;
  }
}
