/**
 * Color utility functions for Ribbon UI
 * 
 * Handles color resolution, validation, and normalization
 */

import type { ColorValue, StyleState } from './types';
import { AUTOMATIC_COLOR } from './colors';

/**
 * Resolve effective color from selection state + fallback
 * 
 * Excel behavior:
 * - Selection state is source of truth
 * - Mixed state → use last user action (deterministic, not undefined)
 * - Undefined → use fallback
 * 
 * @param selectionColor - Color from selection (single | "mixed" | undefined)
 * @param fallback - Last user action or default (never "mixed")
 * @returns Resolved color (never "mixed", never undefined)
 * 
 * @example
 * // Single selection, red text
 * resolveColor("#FF0000", "#000000") // → "#FF0000"
 * 
 * // Mixed selection (some red, some blue)
 * resolveColor("mixed", "#FF0000") // → "#FF0000" (last used)
 * 
 * // No selection color
 * resolveColor(undefined, "#000000") // → "#000000" (fallback)
 */
export function resolveColor(
  selectionColor: StyleState<ColorValue>,
  fallback: ColorValue
): ColorValue {
  if (selectionColor === 'mixed' || selectionColor === undefined) {
    return fallback;
  }
  return selectionColor;
}

/**
 * Validate if color is valid hex format
 * 
 * @param color - Hex color string
 * @returns true if valid (#RGB, #RRGGBB, #RRGGBBAA)
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
}

/**
 * Normalize color to uppercase hex
 * 
 * @param color - Hex color (any case)
 * @returns Uppercase hex color
 * 
 * @example
 * normalizeColor("#ff0000") // → "#FF0000"
 */
export function normalizeColor(color: ColorValue): ColorValue {
  return color.toUpperCase();
}

/**
 * Check if color should show mixed indicator
 * 
 * @param selectionColor - Color state from selection
 * @returns true if mixed indicator should be shown
 */
export function isMixedState(selectionColor: StyleState<ColorValue>): boolean {
  return selectionColor === 'mixed';
}

/**
 * Get display color for preview (handles mixed state)
 * 
 * Mixed state → return undefined (no color preview)
 * Otherwise → return actual color
 * 
 * @param selectionColor - Color state from selection
 * @returns Color to display in preview, or undefined for mixed
 */
export function getDisplayColor(
  selectionColor: StyleState<ColorValue>
): ColorValue | undefined {
  return selectionColor === 'mixed' ? undefined : selectionColor;
}
