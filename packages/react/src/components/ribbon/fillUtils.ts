/**
 * Fill utility functions (generalized from colorUtils)
 * 
 * These utilities work with Fill type (solid/pattern/gradient)
 * while maintaining the same resolution patterns as colorUtils.
 */

import type { StyleState } from './types';
import type { Fill } from './fillTypes';
import { NO_FILL, solidFill, isSolidFill } from './fillTypes';

/**
 * Resolve effective fill from selection state + fallback
 * 
 * Same pattern as resolveColor but works with Fill objects.
 * 
 * Excel behavior:
 * - Selection state is source of truth
 * - Mixed state → use last user action (deterministic)
 * - Undefined → use fallback
 * 
 * @param selectionFill - Fill from selection (single | "mixed" | undefined)
 * @param fallback - Last user action or default (never "mixed")
 * @returns Resolved fill (never "mixed", never undefined)
 * 
 * @example
 * // Single selection, red fill
 * resolveFill({ type: 'solid', color: '#FF0000' }, NO_FILL) // → red
 * 
 * // Mixed selection (solid + pattern)
 * resolveFill("mixed", { type: 'solid', color: '#FF0000' }) // → last used
 * 
 * // No selection fill
 * resolveFill(undefined, NO_FILL) // → no fill
 */
export function resolveFill(selectionFill: StyleState<Fill>, fallback: Fill): Fill {
  if (selectionFill === 'mixed' || selectionFill === undefined) {
    return fallback;
  }
  return selectionFill;
}

/**
 * Check if fill should show mixed indicator
 * 
 * @param selectionFill - Fill state from selection
 * @returns true if mixed indicator should be shown
 */
export function isMixedFill(selectionFill: StyleState<Fill>): boolean {
  return selectionFill === 'mixed';
}

/**
 * Get display fill for preview (handles mixed state)
 * 
 * Mixed state → return undefined (no fill preview)
 * Otherwise → return actual fill
 * 
 * @param selectionFill - Fill state from selection
 * @returns Fill to display in preview, or undefined for mixed
 */
export function getDisplayFill(selectionFill: StyleState<Fill>): Fill | undefined {
  return selectionFill === 'mixed' ? undefined : selectionFill;
}

/**
 * Compare two fills for equality
 * 
 * Deep comparison for solid/pattern/gradient fills
 * 
 * @param a - First fill
 * @param b - Second fill
 * @returns true if fills are equivalent
 */
export function fillEquals(a: Fill, b: Fill): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case 'solid':
      return a.color === (b as typeof a).color;

    case 'pattern':
      const bPattern = b as typeof a;
      return (
        a.foreground === bPattern.foreground &&
        a.background === bPattern.background &&
        a.pattern === bPattern.pattern
      );

    case 'gradient':
      const bGradient = b as typeof a;
      if (a.direction !== bGradient.direction) return false;
      if (a.stops.length !== bGradient.stops.length) return false;
      return a.stops.every(
        (stop, idx) =>
          stop.color === bGradient.stops[idx].color &&
          stop.position === bGradient.stops[idx].position
      );

    default:
      return false;
  }
}

/**
 * Serialize fill to string for storage/comparison
 * 
 * Used for recent fills localStorage key generation
 * 
 * @param fill - Fill to serialize
 * @returns String representation
 * 
 * @example
 * serializeFill({ type: 'solid', color: '#FF0000' }) // → "solid:#FF0000"
 * serializeFill({ type: 'pattern', ... }) // → "pattern:fg=#FF0000,bg=#FFFFFF,type=gray50"
 */
export function serializeFill(fill: Fill): string {
  switch (fill.type) {
    case 'solid':
      return `solid:${fill.color}`;

    case 'pattern':
      return `pattern:fg=${fill.foreground},bg=${fill.background},type=${fill.pattern}`;

    case 'gradient':
      const stops = fill.stops.map((s) => `${s.color}@${s.position}`).join('|');
      return `gradient:stops=${stops},dir=${fill.direction}`;

    default:
      return 'none';
  }
}

/**
 * Deserialize fill from string
 * 
 * Inverse of serializeFill for restoring from storage
 * 
 * @param str - Serialized fill string
 * @returns Fill object or NO_FILL if invalid
 */
export function deserializeFill(str: string): Fill {
  try {
    if (str.startsWith('solid:')) {
      const color = str.slice(6);
      return solidFill(color);
    }

    if (str.startsWith('pattern:')) {
      const parts = str.slice(8).split(',');
      const fg = parts[0]?.split('=')[1];
      const bg = parts[1]?.split('=')[1];
      const pattern = parts[2]?.split('=')[1] as any;
      if (fg && bg && pattern) {
        return { type: 'pattern', foreground: fg, background: bg, pattern };
      }
    }

    if (str.startsWith('gradient:')) {
      // Simplified gradient deserialization
      // Full implementation would parse stops and direction
      return NO_FILL;
    }

    return NO_FILL;
  } catch {
    return NO_FILL;
  }
}

/**
 * Extract primary color from fill (for recent colors compatibility)
 * 
 * This allows Fill Color's recent fills to coexist with Font Color's recent colors
 * while sharing the same localStorage infrastructure.
 * 
 * @param fill - Fill to extract color from
 * @returns Primary color or undefined
 */
export function getPrimaryColor(fill: Fill): string | undefined {
  if (isSolidFill(fill)) {
    return fill.color;
  }
  // Pattern: use foreground color
  if (fill.type === 'pattern') {
    return fill.foreground;
  }
  // Gradient: use first stop
  if (fill.type === 'gradient' && fill.stops.length > 0) {
    return fill.stops[0].color;
  }
  return undefined;
}
