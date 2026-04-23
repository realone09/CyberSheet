/**
 * AddressTransform.ts
 * 
 * Formal interface for coordinate space transformations.
 * 
 * CRITICAL DISTINCTION:
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
 */

import type { Address } from '../types';

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
   * @param formula - Formula string (e.g., "=A1+B2")
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
  shiftFormula(formula: string): string;
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

  shiftFormula(formula: string): string {
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

  shiftFormula(formula: string): string {
    // TODO: Delegate to FormulaShiftingService with column offset
    // This is placeholder—real implementation in Phase 2
    return formula;
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

  shiftFormula(formula: string): string {
    // TODO: Delegate to FormulaShiftingService with column offset
    // Deleted refs should map to #REF!
    return formula;
  }
}
