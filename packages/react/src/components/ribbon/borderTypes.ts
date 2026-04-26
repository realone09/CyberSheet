/**
 * Border Type System for Excel 365 UI
 * 
 * Defines all border styles, positions, and values matching Excel behavior.
 * Part of the UI scaling validation (3rd complex implementation after Font/Fill Color).
 */

/**
 * Excel border line styles (14 types)
 * Matches Excel 365 exactly - order matters for UI grid
 */
export type BorderStyle =
  | "none"
  | "thin"
  | "medium"
  | "thick"
  | "dashed"
  | "dotted"
  | "double"
  | "hair"
  | "dashDot"
  | "dashDotDot"
  | "mediumDashed"
  | "mediumDashDot"
  | "mediumDashDotDot"
  | "slantDashDot";

/**
 * Border application positions
 * Handles single edges, compound presets, and clear operations
 */
export type BorderPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "all"
  | "outer"
  | "inner"
  | "horizontal"
  | "vertical"
  | "clear";

/**
 * Border preset identifiers (matches Excel preset menu)
 * These are the common operations users perform
 */
export type BorderPreset =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "none"
  | "all"
  | "outer"
  | "thickBox"
  | "doubleBottom"
  | "thickBottom"
  | "topBottom"
  | "topThickBottom"
  | "topDoubleBottom";

/**
 * Complete border value (style + color)
 * Used for command execution and state tracking
 */
export interface BorderValue {
  style: BorderStyle;
  color: string;
}

/**
 * Border preset configuration (for UI grid)
 * Defines how each preset translates to border operations
 */
export interface BorderPresetConfig {
  id: BorderPreset;
  label: string;
  icon: string; // FluentUI icon name
  positions: BorderPosition[]; // Which edges to apply
  style: BorderStyle; // Line style for this preset
}

/**
 * Border command payload
 * What gets sent to the backend when applying borders
 */
export interface BorderPayload {
  style: BorderStyle;
  color: string;
  position: BorderPosition;
}

// ============================================================================
// METADATA ARRAYS (UI configuration)
// ============================================================================

/**
 * Line style metadata for UI grid (13 styles, excluding "none")
 * Rendered as visual previews with SVG strokes
 */
export const LINE_STYLES: Array<{
  style: BorderStyle;
  label: string;
  strokeDasharray?: string; // SVG stroke pattern
  strokeWidth: number;
}> = [
  { style: "thin", label: "Thin", strokeWidth: 1 },
  { style: "medium", label: "Medium", strokeWidth: 2 },
  { style: "thick", label: "Thick", strokeWidth: 3 },
  { style: "dashed", label: "Dashed", strokeDasharray: "4 2", strokeWidth: 1 },
  { style: "dotted", label: "Dotted", strokeDasharray: "1 1", strokeWidth: 1 },
  { style: "double", label: "Double", strokeWidth: 1 }, // Special rendering
  { style: "hair", label: "Hair", strokeWidth: 0.5 },
  { style: "dashDot", label: "Dash Dot", strokeDasharray: "4 2 1 2", strokeWidth: 1 },
  { style: "dashDotDot", label: "Dash Dot Dot", strokeDasharray: "4 2 1 2 1 2", strokeWidth: 1 },
  { style: "mediumDashed", label: "Medium Dashed", strokeDasharray: "6 3", strokeWidth: 2 },
  { style: "mediumDashDot", label: "Medium Dash Dot", strokeDasharray: "6 3 2 3", strokeWidth: 2 },
  { style: "mediumDashDotDot", label: "Medium Dash Dot Dot", strokeDasharray: "6 3 2 3 2 3", strokeWidth: 2 },
  { style: "slantDashDot", label: "Slant Dash Dot", strokeDasharray: "6 2 2 2", strokeWidth: 1 },
];

/**
 * Border preset configurations (13 common Excel presets)
 * Order matches Excel 365 preset menu exactly
 */
export const BORDER_PRESETS: BorderPresetConfig[] = [
  // Single edges
  {
    id: "bottom",
    label: "Bottom Border",
    icon: "BorderBottomRegular",
    positions: ["bottom"],
    style: "thin",
  },
  {
    id: "top",
    label: "Top Border",
    icon: "BorderTopRegular",
    positions: ["top"],
    style: "thin",
  },
  {
    id: "left",
    label: "Left Border",
    icon: "BorderLeftRegular",
    positions: ["left"],
    style: "thin",
  },
  {
    id: "right",
    label: "Right Border",
    icon: "BorderRightRegular",
    positions: ["right"],
    style: "thin",
  },

  // Clear
  {
    id: "none",
    label: "No Border",
    icon: "BorderNoneRegular",
    positions: ["clear"],
    style: "none",
  },

  // Common compound presets
  {
    id: "all",
    label: "All Borders",
    icon: "BorderAllRegular",
    positions: ["all"],
    style: "thin",
  },
  {
    id: "outer",
    label: "Outside Borders",
    icon: "BorderOuterRegular",
    positions: ["outer"],
    style: "thin",
  },
  {
    id: "thickBox",
    label: "Thick Box Border",
    icon: "BorderOuterRegular",
    positions: ["outer"],
    style: "thick",
  },

  // Special bottom styles
  {
    id: "doubleBottom",
    label: "Bottom Double Border",
    icon: "BorderBottomDoubleRegular",
    positions: ["bottom"],
    style: "double",
  },
  {
    id: "thickBottom",
    label: "Thick Bottom Border",
    icon: "BorderBottomThickRegular",
    positions: ["bottom"],
    style: "thick",
  },

  // Top + bottom combinations
  {
    id: "topBottom",
    label: "Top and Bottom Border",
    icon: "BorderTopBottomRegular",
    positions: ["top", "bottom"],
    style: "thin",
  },
  {
    id: "topThickBottom",
    label: "Top and Thick Bottom Border",
    icon: "BorderTopBottomRegular",
    positions: ["top", "bottom"],
    style: "thin", // Top thin, bottom thick (handled in command)
  },
  {
    id: "topDoubleBottom",
    label: "Top and Double Bottom Border",
    icon: "BorderTopBottomDoubleRegular",
    positions: ["top", "bottom"],
    style: "thin", // Top thin, bottom double (handled in command)
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a BorderValue object
 */
export function borderValue(style: BorderStyle, color: string): BorderValue {
  return { style, color };
}

/**
 * Check if a value is a valid BorderValue object
 */
export function isBorderValue(value: unknown): value is BorderValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "style" in value &&
    "color" in value &&
    typeof (value as BorderValue).style === "string" &&
    typeof (value as BorderValue).color === "string"
  );
}

/**
 * Get default border value (thin black line)
 */
export function getDefaultBorder(): BorderValue {
  return { style: "thin", color: "#000000" };
}

/**
 * Check if a border style has visible content
 */
export function isVisibleBorder(style: BorderStyle): boolean {
  return style !== "none";
}

/**
 * Get a preset configuration by ID
 */
export function getPresetById(id: BorderPreset): BorderPresetConfig | undefined {
  return BORDER_PRESETS.find((p) => p.id === id);
}

/**
 * Resolve a preset to border payload(s)
 * Some presets need multiple operations (e.g., topThickBottom = top thin + bottom thick)
 */
export function resolvePreset(
  preset: BorderPreset,
  color: string,
  customStyle?: BorderStyle
): BorderPayload[] {
  const config = getPresetById(preset);
  if (!config) return [];

  const style = customStyle ?? config.style;

  // Special cases with mixed styles
  if (preset === "topThickBottom") {
    return [
      { style: "thin", color, position: "top" },
      { style: "thick", color, position: "bottom" },
    ];
  }

  if (preset === "topDoubleBottom") {
    return [
      { style: "thin", color, position: "top" },
      { style: "double", color, position: "bottom" },
    ];
  }

  // Standard presets (single style, multiple positions)
  return config.positions.map((position) => ({
    style,
    color,
    position,
  }));
}

/**
 * Get line style metadata by style value
 */
export function getLineStyleMetadata(style: BorderStyle) {
  return LINE_STYLES.find((s) => s.style === style);
}
