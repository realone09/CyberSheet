/**
 * Number Format Utilities
 * 
 * Uses generic styleStateUtils to avoid duplication with color/fill/border/alignment
 */

import { StyleState } from './types';
import { resolveStyleState, isMixedState } from './styleStateUtils';
import type {
  NumberFormatValue,
  NumberFormatType,
} from './numberFormatTypes';
import {
  getDefaultNumberFormat,
  numberFormatEquals,
  getDisplayLabel,
  validateFormatString,
  getPresetByFormatString,
  isStandardFormat,
} from './numberFormatTypes';

/**
 * Resolve number format from StyleState<NumberFormatValue>
 * 
 * Uses generic resolveStyleState<T> to maintain architectural consistency
 */
export function resolveNumberFormat(
  selection: StyleState<NumberFormatValue>
): NumberFormatValue {
  return resolveStyleState(
    selection,
    getDefaultNumberFormat()
  );
}

/**
 * Check if number format is in mixed state
 */
export function isMixedNumberFormat(
  selection: StyleState<NumberFormatValue>
): boolean {
  return isMixedState(selection);
}

/**
 * Get display value for number format (for UI button)
 * 
 * Returns label or format string, NOT "Mixed" (handled by caller)
 */
export function getDisplayNumberFormat(
  format: NumberFormatValue | undefined
): string {
  if (!format) {
    return 'General';
  }
  return getDisplayLabel(format);
}

/**
 * Serialize NumberFormatValue for storage/undo/redo
 * 
 * Only stores formatString (source of truth)
 * Type is optional metadata (can be re-inferred)
 */
export function serializeNumberFormat(
  format: NumberFormatValue
): string {
  return JSON.stringify({
    formatString: format.formatString,
    type: format.type, // Optional, for performance
  });
}

/**
 * Deserialize NumberFormatValue from storage
 * 
 * Validates formatString (required)
 * Type is optional (will be inferred if missing)
 */
export function deserializeNumberFormat(
  data: string
): NumberFormatValue | null {
  try {
    const parsed = JSON.parse(data);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'formatString' in parsed
    ) {
      // Validate format string
      if (!validateFormatString(parsed.formatString)) {
        return null;
      }

      return {
        formatString: parsed.formatString,
        type: parsed.type as NumberFormatType | undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create NumberFormatValue from preset selection
 * 
 * Type is stored (known preset), but label is never stored
 */
export function createNumberFormatFromPreset(
  presetId: string
): NumberFormatValue | null {
  const { getPresetById } = require('./numberFormatTypes');
  const preset = getPresetById(presetId);

  if (!preset) {
    return null;
  }

  return {
    formatString: preset.formatString,
    type: preset.type,
  };
}

/**
 * Check if two format values are functionally equivalent
 * (same format string, even if type/label differ)
 */
export function isSameFormat(
  a: NumberFormatValue | undefined,
  b: NumberFormatValue | undefined
): boolean {
  return numberFormatEquals(a, b);
}

/**
 * Infer format type from format string (heuristic)
 * 
 * Used when:
 * - Importing formats from Excel (no type metadata)
 * - User enters custom format
 * - Clipboard paste
 * 
 * ⚠️ This is a HINT, not source of truth
 */
export function inferFormatType(
  formatString: string
): NumberFormatType {
  // Check standard presets first
  const preset = getPresetByFormatString(formatString);
  if (preset) {
    return preset.type;
  }

  // Heuristic detection for custom formats
  if (formatString === 'General') return 'general';
  if (formatString.includes('$') || formatString.includes('€')) return 'currency';
  if (formatString.includes('%')) return 'percentage';
  if (formatString.includes('E+') || formatString.includes('E-')) return 'scientific';
  if (formatString.includes('/') && formatString.includes('?')) return 'fraction';
  if (formatString.includes('yyyy') || formatString.includes('mm') || formatString.includes('dd')) return 'date';
  if (formatString.includes('h:') || formatString.includes('AM/PM')) return 'time';
  if (formatString === '@') return 'text';

  // Default to custom if can't infer
  return 'custom';
}

/**
 * Validate NumberFormatValue structure
 * 
 * Only formatString is required
 * Type is optional metadata
 */
export function validateNumberFormatValue(
  value: unknown
): value is NumberFormatValue {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const format = value as Partial<NumberFormatValue>;

  // Required: formatString
  if (typeof format.formatString !== 'string') return false;
  if (!validateFormatString(format.formatString)) return false;

  // Optional: type
  if (format.type !== undefined && typeof format.type !== 'string') {
    return false;
  }

  return true;
}

/**
 * Get user-friendly description of number format operation
 * (for undo/redo descriptions)
 */
export function getNumberFormatDescription(
  format: NumberFormatValue
): string {
  const label = getDisplayLabel(format);

  if (isStandardFormat(format)) {
    return `Apply ${label} format`;
  }

  return `Apply custom format: ${format.formatString}`;
}

/**
 * Check if format is suitable for numeric values
 * 
 * Uses type if available, otherwise infers from formatString
 */
export function isNumericFormat(format: NumberFormatValue): boolean {
  const type = format.type || inferFormatType(format.formatString);
  return (
    type === 'general' ||
    type === 'number' ||
    type === 'currency' ||
    type === 'accounting' ||
    type === 'percentage' ||
    type === 'fraction' ||
    type === 'scientific'
  );
}

/**
 * Check if format is suitable for date/time values
 * 
 * Uses type if available, otherwise infers from formatString
 */
export function isDateTimeFormat(format: NumberFormatValue): boolean {
  const type = format.type || inferFormatType(format.formatString);
  return type === 'date' || type === 'time';
}

/**
 * Get suggested format for value type
 */
export function getSuggestedFormat(
  value: unknown
): NumberFormatValue {
  if (typeof value === 'number') {
    if (value >= 0 && value <= 1) {
      // Likely percentage
      return createNumberFormatFromPreset('percentage') || getDefaultNumberFormat();
    }
    if (Number.isInteger(value)) {
      return createNumberFormatFromPreset('number') || getDefaultNumberFormat();
    }
    return createNumberFormatFromPreset('number') || getDefaultNumberFormat();
  }

  if (value instanceof Date) {
    return createNumberFormatFromPreset('short-date') || getDefaultNumberFormat();
  }

  // Default: general
  return getDefaultNumberFormat();
}
