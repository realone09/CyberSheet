/**
 * cell-value-normalizer.ts
 *
 * Value normalization layer: Storage → Display/Computation boundary.
 *
 * Architectural Rule (enforced here):
 *   Storage type (ExtendedCellValue) ≠ Computation type ≠ Display type
 *
 * When types get richer, boundaries must get stricter.
 *
 * This normalizer is the ONLY place that converts rich storage values
 * to primitive display values for:
 *   - Slicer filtering / grouping
 *   - Find / Search
 *   - Sorting
 *   - Clipboard value comparison
 *   - Export / serialization
 *
 * DO NOT use this inside formula evaluation (entities have special display
 * semantics handled by cellValueToFormulaValue in FormulaEngine.ts).
 */

import type { ExtendedCellValue, RichTextValue, RichTextRun } from '../types';
import type { EntityValue } from '../types/entity-types';

/** Normalized primitive type — what slicers / filters / sort operate on */
export type Primitive = string | number | boolean | null;

/**
 * Type guard: RichTextValue
 */
function isRichTextValue(v: ExtendedCellValue): v is RichTextValue {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'runs' in v &&
    Array.isArray((v as RichTextValue).runs)
  );
}

/**
 * Type guard: EntityValue
 */
function isEntityValue(v: ExtendedCellValue): v is EntityValue {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    (v as EntityValue).kind === 'entity'
  );
}

/**
 * toDisplayValue — normalize any cell value to a comparable primitive.
 *
 * Rules:
 *   null           → null
 *   string         → string  (passthrough)
 *   number         → number  (passthrough)
 *   boolean        → boolean (passthrough)
 *   RichTextValue  → concatenated text of all runs
 *   EntityValue    → entity.display (which is itself a primitive CellValue)
 *
 * This function NEVER returns EntityValue or RichTextValue.
 * This function NEVER throws — unknown structures fall back to null.
 *
 * Identity is NOT preserved (this is explicitly a lossy boundary).
 */
export function toDisplayValue(value: ExtendedCellValue): Primitive {
  if (value === null || value === undefined) {
    return null;
  }

  // Primitive passthrough (string, number, boolean)
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return value as Primitive;
  }

  // EntityValue → use the display field (designed to be a primitive)
  if (isEntityValue(value)) {
    const display = (value as EntityValue).display;
    // display is CellValue (string | number | boolean | null) — safe cast
    if (display === null || display === undefined) return null;
    const dt = typeof display;
    if (dt === 'string' || dt === 'number' || dt === 'boolean') {
      return display as Primitive;
    }
    // display is itself complex (shouldn't happen, but guard)
    return String(display);
  }

  // RichTextValue → concatenate all run texts
  if (isRichTextValue(value)) {
    return (value as RichTextValue).runs
      .map((run: RichTextRun) => run.text ?? '')
      .join('');
  }

  // Unknown structure — safe fallback
  return null;
}
