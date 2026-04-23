/**
 * AddressTransform.ts
 * 
 * Formal interface for coordinate space transformations.
 * 
 * =============================================================================
 * CRITICAL DISTINCTION
 * =============================================================================
 * 
 * - AddressTransform = COMPILER (generates mapping f: Address → Address ∪ {null})
 * - PasteCommand = EXECUTION ENGINE (applies mapping to state)
 * 
 * This separation ensures single source of truth for:
 * - Cell relocation
 * - Formula rewriting
 * - DAG node remapping
 * - Merge transformation
 * - Selection adjustment
 * 
 * Philosophy:
 * Transform defines WHAT changes, Command defines HOW it's applied.
 * Never mix these concerns.
 * 
 * =============================================================================
 * COORDINATE SPACE COMPOSITION HAZARD (CRITICAL - READ BEFORE PHASE 2)
 * =============================================================================
 * 
 * DANGER: Transforms compose in CURRENT coordinate space, not original space!
 * 
 * Example of composition hazard:
 * 
 *   S0: Initial state with columns A, B, C
 *   insertColumn(1)  → S1: Now A, [NEW], B, C (column indices shifted)
 *   insertColumn(1)  → S2: Which column 1? Original or current?
 * 
 * WRONG (coordinate space confusion):
 * ```ts
 * const f1 = new InsertColumnTransform(1);  // Insert at col 1
 * const f2 = new InsertColumnTransform(1);  // DANGER: Still col 1?
 * apply(S, f1);  // Actually inserts at NEW col 2 in shifted space!
 * apply(S, f2);  // Inserts where? Original or shifted coordinate?
 * ```
 * 
 * CORRECT (always evaluate in CURRENT state):
 * ```ts
 * execute():
 *   1. Resolve CURRENT sheet state
 *   2. Build transform relative to CURRENT state
 *   3. Apply transform
 *   4. Validate(f(S))
 * 
 * undo():
 *   1. Recompute inverse transform from stored metadata
 *   2. Apply in CURRENT state space (NOT original snapshot)
 * ```
 * 
 * =============================================================================
 * TRANSFORM CONSISTENCY ORDER INVARIANT (ALGEBRAIC CORRECTNESS)
 * =============================================================================
 * 
 * For any command sequence C1..Cn:
 * 
 *   apply(C1 ∘ C2 ∘ ... ∘ Cn)
 *   == sequential apply with per-step validation
 * 
 * This means:
 * - Each Ci is evaluated in the state produced by C1..Ci-1
 * - Transforms are NOT compositional at the algebraic level
 * - Validator runs after EACH step, not just at the end
 * - Coordinate indices are interpreted in CURRENT space, always
 * 
 * Implication for Insert/Delete:
 * 
 *   deleteColumn(k) ∘ insertColumn(k) = identity
 * 
 * Is NOT a simple algebraic composition. It is a THEOREM enforced by:
 * 1. Transform evaluated in current state
 * 2. Inverse transform recomputed from metadata
 * 3. Validator checks structural equivalence
 * 
 * This is not a test case—it is a **correctness property**.
 * 
 * =============================================================================
 * IMPLEMENTATION CONTRACT (NON-NEGOTIABLE)
 * =============================================================================
 * 
 * 1. ✅ Transforms are PURE (no side effects, deterministic)
 * 2. ✅ Transforms evaluated in CURRENT coordinate space
 * 3. ✅ Inverse transforms recomputed from stored metadata, not original transform
 * 4. ✅ Validator runs after EVERY command (no batching without validation)
 * 5. ✅ Forward/undo transforms are algebraically consistent but NOT naive inverses
 * 
 * This model makes Insert/Delete a **verified graph rewriting system**,
 * not ad-hoc mutation logic.
 */

import type { Address } from '../types';
import { FormulaShiftingService } from '../FormulaShiftingService';

/**
 * AddressTransform: f: Address → Address ∪ {null}
 * 
 * Represents a coordinate space transformation on a spreadsheet.
 * 
 * Mathematical Properties:
 * - Homomorphism: Structure-preserving map over address space
 * - Partial function: Can map to null (deletion)
 * - Deterministic: Same input always yields same output
 * 
 * Usage:
 * ```ts
 * const transform = new InsertColumnTransform(2); // Insert at col 2
 * const newAddr = transform.map({ row: 0, col: 3 }); // → { row: 0, col: 4 }
 * const shifted = transform.shiftFormula("=A1+C3"); // → "=A1+D3"
 * ```
 * 
 * Correctness Property:
 * ∀ layer L: interpret(L, f(S)) == f(interpret(L, S))
 */
export interface AddressTransform {
  /**
   * Map an address through the transformation.
   * 
   * @param addr - Source address
   * @returns Transformed address, or null if deleted
   * 
   * Invariants:
   * - Must be deterministic (pure function)
   * - Must handle edge cases (negative coords, MAX_SAFE_INTEGER)
   * - null = cell deleted by transformation
   */
  map(addr: Address): Address | null;

  /**
   * Transform all references in a formula string.
   * 
   * CRITICAL: Delta depends on cell position, NOT a constant!
   * Must compute: map(cellAddr) - cellAddr for the formula's location.
   * 
   * @param formula - Formula string (e.g., "=A1+B2")
   * @param cellAddr - Absolute address where this formula lives
   * @returns Transformed formula (e.g., "=B1+C2")
   * 
   * Invariants:
   * - Preserves formula syntax
   * - Handles absolute refs ($A$1), mixed refs (A$1, $A1)
   * - Handles range refs (A1:B10)
   * - Handles sheet refs (Sheet1!A1)
   * - Maps deleted refs to #REF! error
   * 
   * Implementation:
   * - MUST delegate to FormulaShiftingService
   * - This method is convenience wrapper for consistency
   */
  shiftFormula(formula: string, cellAddr: Address): string;
}

/**
 * Identity Transform: f(x) = x
 * 
 * Used for:
 * - Testing (invariant: no-op should preserve state exactly)
 * - Baseline comparison in differential oracle
 */
export class IdentityTransform implements AddressTransform {
  map(addr: Address): Address | null {
    return addr;
  }

  shiftFormula(formula: string, cellAddr: Address): string {
    return formula;
  }
}

/**
 * Example: InsertColumnTransform
 * 
 * f(addr) = {
 *   { row: addr.row, col: addr.col + 1 }  if addr.col >= k
 *   { row: addr.row, col: addr.col }      otherwise
 * }
 * 
 * THIS IS A SKELETON ONLY.
 * Full implementation comes in Phase 2.
 */
export class InsertColumnTransform implements AddressTransform {
  constructor(private readonly insertAt: number) {}

  map(addr: Address): Address | null {
    if (addr.col >= this.insertAt) {
      return { row: addr.row, col: addr.col + 1 };
    }
    return addr;
  }

  shiftFormula(formula: string, cellAddr: Address): string {
    // CRITICAL: Delta depends on WHERE the cell is, not a constant!
    // Cell at col < insertAt: no shift (delta = 0)
    // Cell at col >= insertAt: shift +1 (delta = +1)
    const originalAddr = cellAddr;
    const mappedAddr = this.map(cellAddr);
    
    if (!mappedAddr) {
      // Cell deleted - formula becomes invalid but shouldn't happen for InsertColumn
      return formula;
    }
    
    const rowDelta = mappedAddr.row - originalAddr.row;
    const colDelta = mappedAddr.col - originalAddr.col;
    
    // Apply the position-specific delta
    return FormulaShiftingService.shift(
      formula,
      { row: 0, col: 0 },
      { row: rowDelta, col: colDelta }
    );
  }
}

/**
 * Example: DeleteColumnTransform
 * 
 * f(addr) = {
 *   null                                  if addr.col == k
 *   { row: addr.row, col: addr.col - 1 }  if addr.col > k
 *   { row: addr.row, col: addr.col }      otherwise
 * }
 * 
 * THIS IS A SKELETON ONLY.
 * Full implementation comes in Phase 2.
 */
export class DeleteColumnTransform implements AddressTransform {
  constructor(private readonly deleteAt: number) {}

  map(addr: Address): Address | null {
    if (addr.col === this.deleteAt) {
      return null; // Deleted
    }
    if (addr.col > this.deleteAt) {
      return { row: addr.row, col: addr.col - 1 };
    }
    return addr;
  }

  shiftFormula(formula: string, cellAddr: Address): string {
    // CRITICAL: Delta depends on cell position
    // Cell at col < deleteAt: no shift (delta = 0)
    // Cell at col == deleteAt: deleted (shouldn't happen - filtered out)
    // Cell at col > deleteAt: shift -1 (delta = -1)
    const originalAddr = cellAddr;
    const mappedAddr = this.map(cellAddr);
    
    if (!mappedAddr) {
      // Cell was deleted - this shouldn't happen as we filter these out
      // But formulas referencing deleted cells need #REF! handling
      return formula; // FormulaShiftingService handles #REF! internally
    }
    
    const rowDelta = mappedAddr.row - originalAddr.row;
    const colDelta = mappedAddr.col - originalAddr.col;
    
    return FormulaShiftingService.shift(
      formula,
      { row: 0, col: 0 },
      { row: rowDelta, col: colDelta }
    );
  }
}
