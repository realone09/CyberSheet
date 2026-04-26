/**
 * Generic Style State Resolution
 * 
 * Eliminates duplication across resolveColor, resolveFill, resolveBorder
 * by providing a single generic resolution function.
 * 
 * Before (duplication):
 * ```ts
 * function resolveColor(selection: StyleState<string>, fallback: string): string { ... }
 * function resolveFill(selection: StyleState<Fill>, fallback: Fill): Fill { ... }
 * function resolveBorder(selection: StyleState<Border>, fallback: Border): Border { ... }
 * ```
 * 
 * After (generic):
 * ```ts
 * function resolveStyleState<T>(selection: StyleState<T>, fallback: T): T { ... }
 * ```
 */

import type { StyleState } from "./types";

/**
 * Generic style state resolution
 * 
 * Resolution logic (same for ALL style properties):
 * 1. If selection has uniform value → use it
 * 2. If selection is "mixed" → use fallback
 * 3. If selection is undefined → use fallback
 * 
 * @param selection - Current selection's style state (may be "mixed")
 * @param fallback - Fallback value when selection is mixed/undefined
 * @returns Resolved value for UI display
 * 
 * @example
 * // Font color
 * const color = resolveStyleState(selection.fontColor, "#000000");
 * 
 * // Fill
 * const fill = resolveStyleState(selection.fillColor, { type: "solid", color: "#FFFFFF" });
 * 
 * // Border
 * const border = resolveStyleState(selection.border, { style: "thin", color: "#000000" });
 * 
 * // Alignment
 * const align = resolveStyleState(selection.horizontalAlign, "left");
 */
export function resolveStyleState<T>(
  selection: StyleState<T>,
  fallback: T
): T {
  // Case 1: Selection has uniform value
  if (selection !== "mixed" && selection !== undefined) {
    return selection;
  }

  // Case 2 & 3: Mixed or undefined → use fallback
  return fallback;
}

/**
 * Check if selection has mixed values
 * Used to determine UI presentation (show mixed indicator or not)
 */
export function isMixedState<T>(selection: StyleState<T>): boolean {
  return selection === "mixed";
}

/**
 * Get display value for UI when state may be mixed
 * 
 * Logic:
 * - If uniform → return value
 * - If mixed → return fallback (UI shows mixed indicator separately)
 * - If undefined → return fallback
 * 
 * This is the same as resolveStyleState but semantically clearer
 * when the intent is "what do I show in the UI?"
 */
export function getDisplayValue<T>(
  selection: StyleState<T>,
  fallback: T
): T {
  return resolveStyleState(selection, fallback);
}

/**
 * Check if value is defined (not mixed, not undefined)
 * Used for conditional logic based on selection state
 */
export function hasDefinedValue<T>(selection: StyleState<T>): selection is T {
  return selection !== "mixed" && selection !== undefined;
}

/**
 * Specialized resolvers (convenience wrappers)
 * These exist only for type clarity and domain naming, not different logic
 */

export function resolveColor(
  selection: StyleState<string>,
  fallback: string
): string {
  return resolveStyleState(selection, fallback);
}

export function resolveAlignment(
  selection: StyleState<"left" | "center" | "right" | "justify">,
  fallback: "left" | "center" | "right" | "justify"
): "left" | "center" | "right" | "justify" {
  return resolveStyleState(selection, fallback);
}

export function resolveBoolean(
  selection: StyleState<boolean>,
  fallback: boolean
): boolean {
  return resolveStyleState(selection, fallback);
}

/**
 * Type-safe state update helper
 * Ensures updates to StyleState maintain type safety
 */
export function updateStyleState<T>(
  current: StyleState<T>,
  newValue: T
): T {
  // Always return the new value (replaces current)
  // Mixed state is only for reading, not writing
  return newValue;
}

/**
 * Merge multiple style states (for undo/redo)
 * Used when applying commands to ranges with different current values
 * 
 * @param states - Array of style states from different cells
 * @returns "mixed" if states differ, otherwise the uniform value
 */
export function mergeStyleStates<T>(
  states: StyleState<T>[],
  equalityFn?: (a: T, b: T) => boolean
): StyleState<T> {
  if (states.length === 0) return undefined;

  // Get first defined, non-mixed value
  const firstDefined = states.find(
    (s) => s !== "mixed" && s !== undefined
  ) as T | undefined;

  if (firstDefined === undefined) return undefined;

  // Check if all defined values match
  const allMatch = states.every((state) => {
    if (state === "mixed" || state === undefined) return false;

    if (equalityFn) {
      return equalityFn(state, firstDefined);
    }

    // Default: reference/primitive equality
    return state === firstDefined;
  });

  return allMatch ? firstDefined : "mixed";
}
