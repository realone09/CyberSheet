/**
 * Fill type definitions for Excel-like cell backgrounds
 * 
 * Excel supports 3 fill types:
 * 1. Solid - single color
 * 2. Pattern - foreground + background colors with pattern type (18 types)
 * 3. Gradient - multiple color stops with direction
 */

import type { ColorValue } from './types';

/**
 * Pattern types from Excel (18 standard patterns)
 * 
 * Each pattern has a unique visual texture rendered as:
 * - Foreground color (pattern lines/dots)
 * - Background color (fill behind pattern)
 */
export type PatternType =
  | 'none'
  | 'solid'
  | 'gray50'
  | 'gray75'
  | 'gray25'
  | 'gray125'
  | 'gray0625'
  | 'lightHorizontal'
  | 'lightVertical'
  | 'lightDown'
  | 'lightUp'
  | 'lightGrid'
  | 'lightTrellis'
  | 'darkHorizontal'
  | 'darkVertical'
  | 'darkDown'
  | 'darkUp'
  | 'darkGrid'
  | 'darkTrellis';

/**
 * Gradient stop for multi-color gradients
 */
export interface GradientStop {
  /** Color at this stop */
  color: ColorValue;
  /** Position (0.0 = start, 1.0 = end) */
  position: number;
}

/**
 * Gradient direction
 */
export type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonalDown'
  | 'diagonalUp'
  | 'fromCenter'
  | 'fromCorner';

/**
 * Fill value (union type for solid/pattern/gradient)
 * 
 * This is the core type that enables Fill Color to be different from Font Color
 * while sharing the same picker infrastructure.
 */
export type Fill =
  | { type: 'solid'; color: ColorValue }
  | { type: 'pattern'; foreground: ColorValue; background: ColorValue; pattern: PatternType }
  | { type: 'gradient'; stops: GradientStop[]; direction: GradientDirection };

/**
 * Helper to create solid fill
 */
export function solidFill(color: ColorValue): Fill {
  return { type: 'solid', color };
}

/**
 * Helper to create pattern fill
 */
export function patternFill(
  foreground: ColorValue,
  background: ColorValue,
  pattern: PatternType
): Fill {
  return { type: 'pattern', foreground, background, pattern };
}

/**
 * Helper to create gradient fill
 */
export function gradientFill(stops: GradientStop[], direction: GradientDirection): Fill {
  return { type: 'gradient', stops, direction };
}

/**
 * Check if fill is solid color
 */
export function isSolidFill(fill: Fill): fill is { type: 'solid'; color: ColorValue } {
  return fill.type === 'solid';
}

/**
 * Check if fill is pattern
 */
export function isPatternFill(fill: Fill): fill is {
  type: 'pattern';
  foreground: ColorValue;
  background: ColorValue;
  pattern: PatternType;
} {
  return fill.type === 'pattern';
}

/**
 * Check if fill is gradient
 */
export function isGradientFill(fill: Fill): fill is {
  type: 'gradient';
  stops: GradientStop[];
  direction: GradientDirection;
} {
  return fill.type === 'gradient';
}

/**
 * Default fill (no fill = transparent)
 */
export const NO_FILL: Fill = { type: 'solid', color: 'transparent' };

/**
 * Pattern metadata for UI rendering
 */
export interface PatternMetadata {
  type: PatternType;
  label: string;
  /** SVG pattern definition for preview */
  svgPattern: string;
}

/**
 * All 18 Excel patterns with metadata
 * 
 * Each pattern includes SVG definition for rendering in preview
 */
export const PATTERN_TYPES: PatternMetadata[] = [
  { type: 'solid', label: 'Solid', svgPattern: '' },
  { type: 'gray50', label: '50% Gray', svgPattern: 'M0,0 L1,1 M1,0 L0,1' },
  { type: 'gray75', label: '75% Gray', svgPattern: 'M0,0 h1 v0.75 h-1 z' },
  { type: 'gray25', label: '25% Gray', svgPattern: 'M0,0 h1 v0.25 h-1 z' },
  { type: 'gray125', label: '12.5% Gray', svgPattern: 'M0,0 L0.5,0 L0.5,0.5 L0,0.5 z' },
  { type: 'gray0625', label: '6.25% Gray', svgPattern: 'M0,0 L0.25,0 L0.25,0.25 L0,0.25 z' },
  { type: 'lightHorizontal', label: 'Light Horizontal', svgPattern: 'M0,0.5 h1' },
  { type: 'lightVertical', label: 'Light Vertical', svgPattern: 'M0.5,0 v1' },
  { type: 'lightDown', label: 'Light Down', svgPattern: 'M0,0 L1,1' },
  { type: 'lightUp', label: 'Light Up', svgPattern: 'M0,1 L1,0' },
  { type: 'lightGrid', label: 'Light Grid', svgPattern: 'M0,0.5 h1 M0.5,0 v1' },
  { type: 'lightTrellis', label: 'Light Trellis', svgPattern: 'M0,0 L1,1 M1,0 L0,1' },
  { type: 'darkHorizontal', label: 'Dark Horizontal', svgPattern: 'M0,0.25 h1 M0,0.75 h1' },
  { type: 'darkVertical', label: 'Dark Vertical', svgPattern: 'M0.25,0 v1 M0.75,0 v1' },
  { type: 'darkDown', label: 'Dark Down', svgPattern: 'M0,0 L1,1 M-0.25,0.75 L0.25,1.25 M0.75,-0.25 L1.25,0.25' },
  { type: 'darkUp', label: 'Dark Up', svgPattern: 'M0,1 L1,0 M-0.25,0.25 L0.25,-0.25 M0.75,1.25 L1.25,0.75' },
  { type: 'darkGrid', label: 'Dark Grid', svgPattern: 'M0,0.25 h1 M0,0.75 h1 M0.25,0 v1 M0.75,0 v1' },
  { type: 'darkTrellis', label: 'Dark Trellis', svgPattern: 'M0,0 L1,1 M1,0 L0,1 M0,0.5 h1 M0.5,0 v1' },
];

/**
 * Gradient presets (2-color linear gradients)
 * 
 * Excel provides these as quick-pick options
 */
export const GRADIENT_PRESETS: Array<{
  label: string;
  stops: GradientStop[];
  direction: GradientDirection;
}> = [
  {
    label: 'Linear (horizontal)',
    stops: [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 1 },
    ],
    direction: 'horizontal',
  },
  {
    label: 'Linear (vertical)',
    stops: [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 1 },
    ],
    direction: 'vertical',
  },
  {
    label: 'Diagonal (down)',
    stops: [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 1 },
    ],
    direction: 'diagonalDown',
  },
  {
    label: 'From center',
    stops: [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 1 },
    ],
    direction: 'fromCenter',
  },
];
