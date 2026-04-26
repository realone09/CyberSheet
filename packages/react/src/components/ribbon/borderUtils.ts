/**
 * Border Utility Functions
 * 
 * Mirrors the colorUtils and fillUtils patterns - validates that
 * resolution/serialization/comparison patterns are truly generic.
 */

import type { BorderValue, BorderStyle, BorderPayload } from "./borderTypes";
import { getDefaultBorder, isBorderValue } from "./borderTypes";
import type { StyleState } from "./types";

// ============================================================================
// STATE RESOLUTION (mirrors resolveColor/resolveFill)
// ============================================================================

/**
 * Resolve effective border from selection state
 * 
 * Logic (same pattern as color/fill resolution):
 * 1. If selection has uniform border → use it
 * 2. If selection has mixed borders → use lastUsed
 * 3. If no lastUsed → use default (thin black)
 * 
 * @param selectionBorder - Current selection's border state (may be "mixed")
 * @param lastUsedBorder - Last border applied by user (fallback)
 * @returns Resolved BorderValue for UI display
 */
export function resolveBorder(
  selectionBorder: StyleState<BorderValue>,
  lastUsedBorder: BorderValue | null
): BorderValue {
  // Case 1: Selection has uniform border
  if (selectionBorder !== "mixed" && selectionBorder !== undefined) {
    return selectionBorder;
  }

  // Case 2: Mixed state → use last used
  if (lastUsedBorder) {
    return lastUsedBorder;
  }

  // Case 3: No context → use default
  return getDefaultBorder();
}

// ============================================================================
// COMPARISON (deep equality check)
// ============================================================================

/**
 * Deep equality check for BorderValue objects
 * Used for deduplication and state comparison
 */
export function borderEquals(a: BorderValue, b: BorderValue): boolean {
  return a.style === b.style && a.color === b.color;
}

/**
 * Check if border is effectively "none" (either style is "none" or transparent color)
 */
export function isNoneBorder(border: BorderValue): boolean {
  return border.style === "none" || border.color === "transparent";
}

// ============================================================================
// SERIALIZATION (localStorage compatibility)
// ============================================================================

/**
 * Serialize BorderValue for localStorage
 * Format: "style:color" (e.g., "thin:#000000")
 */
export function serializeBorder(border: BorderValue): string {
  return `${border.style}:${border.color}`;
}

/**
 * Deserialize BorderValue from localStorage
 * Returns null if format is invalid
 */
export function deserializeBorder(serialized: string): BorderValue | null {
  const parts = serialized.split(":");
  if (parts.length !== 2) return null;

  const [style, color] = parts;

  // Validate style
  const validStyles: BorderStyle[] = [
    "none",
    "thin",
    "medium",
    "thick",
    "dashed",
    "dotted",
    "double",
    "hair",
    "dashDot",
    "dashDotDot",
    "mediumDashed",
    "mediumDashDot",
    "mediumDashDotDot",
    "slantDashDot",
  ];

  if (!validStyles.includes(style as BorderStyle)) return null;

  // Basic color validation (must start with # or be a named color)
  if (!color || (!color.startsWith("#") && !color.match(/^[a-z]+$/i))) {
    return null;
  }

  return { style: style as BorderStyle, color };
}

// ============================================================================
// MIXED STATE DETECTION
// ============================================================================

/**
 * Check if selection has mixed border values
 * Used to determine whether to show "mixed" indicator in UI
 */
export function isMixedBorder(
  selectionBorder: StyleState<BorderValue>
): boolean {
  return selectionBorder === "mixed";
}

/**
 * Get border to display in UI when selection is mixed
 * 
 * Logic:
 * - If mixed → use lastUsed
 * - If no lastUsed → use default
 * 
 * Note: The UI won't highlight anything when mixed, but the preview
 * needs to show *something* for the main button icon.
 */
export function getDisplayBorder(
  selectionBorder: StyleState<BorderValue>,
  lastUsedBorder: BorderValue | null
): BorderValue {
  if (isMixedBorder(selectionBorder)) {
    return lastUsedBorder ?? getDefaultBorder();
  }

  if (selectionBorder === undefined || selectionBorder === "mixed") {
    return getDefaultBorder();
  }

  return selectionBorder;
}

// ============================================================================
// COLOR EXTRACTION (for ColorGrid integration)
// ============================================================================

/**
 * Extract color from BorderValue for ColorGrid integration
 * Allows reusing ColorGrid component with border system
 */
export function getBorderColor(border: BorderValue): string {
  return border.color;
}

/**
 * Create new BorderValue with updated color (preserving style)
 * Used when user changes color in ColorGrid
 */
export function withBorderColor(border: BorderValue, color: string): BorderValue {
  return { ...border, color };
}

/**
 * Create new BorderValue with updated style (preserving color)
 * Used when user changes style in LineStyleGrid
 */
export function withBorderStyle(border: BorderValue, style: BorderStyle): BorderValue {
  return { ...border, style };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate BorderPayload before sending to backend
 * Returns error message if invalid, null if valid
 */
export function validateBorderPayload(payload: BorderPayload): string | null {
  if (!payload.style) return "Missing border style";
  if (!payload.color) return "Missing border color";
  if (!payload.position) return "Missing border position";

  // Validate color format (basic check)
  if (!payload.color.startsWith("#") && !payload.color.match(/^[a-z]+$/i)) {
    return "Invalid color format";
  }

  return null;
}

// ============================================================================
// RANGE-AWARE HELPERS (multi-cell logic)
// ============================================================================

/**
 * Determine if border operation affects multiple cells
 * Used to provide user feedback and optimize backend calls
 */
export function isMultiCellBorder(selection: {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}): boolean {
  return (
    selection.startRow !== selection.endRow ||
    selection.startCol !== selection.endCol
  );
}

/**
 * Get description of border operation for UI feedback
 * Examples:
 * - "Apply bottom border"
 * - "Apply all borders to 5x3 range"
 * - "Clear borders"
 */
export function getBorderOperationDescription(
  payload: BorderPayload,
  selection: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  }
): string {
  const rowCount = selection.endRow - selection.startRow + 1;
  const colCount = selection.endCol - selection.startCol + 1;
  const isMulti = isMultiCellBorder(selection);

  const positionLabel = {
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    all: "all",
    outer: "outside",
    inner: "inside",
    horizontal: "horizontal",
    vertical: "vertical",
    clear: "clear",
  }[payload.position];

  if (payload.position === "clear") {
    return isMulti
      ? `Clear borders from ${rowCount}×${colCount} range`
      : "Clear borders";
  }

  const rangeDesc = isMulti ? ` to ${rowCount}×${colCount} range` : "";

  return `Apply ${positionLabel} border${rangeDesc}`;
}

// ============================================================================
// PRESET HELPERS
// ============================================================================

/**
 * Get a human-readable label for a border style
 */
export function getBorderStyleLabel(style: BorderStyle): string {
  const labels: Record<BorderStyle, string> = {
    none: "None",
    thin: "Thin",
    medium: "Medium",
    thick: "Thick",
    dashed: "Dashed",
    dotted: "Dotted",
    double: "Double",
    hair: "Hair",
    dashDot: "Dash Dot",
    dashDotDot: "Dash Dot Dot",
    mediumDashed: "Medium Dashed",
    mediumDashDot: "Medium Dash Dot",
    mediumDashDotDot: "Medium Dash Dot Dot",
    slantDashDot: "Slant Dash Dot",
  };

  return labels[style] ?? style;
}
