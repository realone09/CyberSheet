/**
 * Number Format Type System
 * 
 * Critical architectural decision: Number formats are SEMANTIC state, not visual.
 * They are DSL strings that control value interpretation and display.
 * 
 * ⚠️ NEVER pass raw format strings to commands—always use NumberFormatValue.
 */

/**
 * Excel-compatible number format categories
 */
export type NumberFormatType =
  | 'general'
  | 'number'
  | 'currency'
  | 'accounting'
  | 'date'
  | 'time'
  | 'percentage'
  | 'fraction'
  | 'scientific'
  | 'text'
  | 'custom';

/**
 * Structured number format value
 * 
 * Prevents raw string drift and enables:
 * - Type safety
 * - Locale support (future)
 * - Custom format validation
 * - Undo/redo serialization
 */
export interface NumberFormatValue {
  /**
   * Format category (determines UI grouping + validation rules)
   */
  type: NumberFormatType;

  /**
   * Excel-compatible format string (e.g., "$#,##0.00", "0%", "dd/mm/yyyy")
   * 
   * This is the DSL that controls display, NOT the cell value
   */
  formatString: string;

  /**
   * Optional display label for UI (if different from formatString)
   * Example: "Currency" instead of showing "$#,##0.00"
   */
  label?: string;
}

/**
 * Preset number format configuration
 */
export interface NumberFormatPreset {
  id: string;
  type: NumberFormatType;
  label: string;
  formatString: string;
  description?: string;
}

/**
 * Excel standard format presets (matching Excel 365 exactly)
 * 
 * Layout categories:
 * 1. Primary: General, Number
 * 2. Financial: Currency, Accounting
 * 3. Date/Time: Short Date, Long Date, Time
 * 4. Scientific: Percentage, Fraction, Scientific
 * 5. Other: Text
 */
export const NUMBER_FORMAT_PRESETS: NumberFormatPreset[] = [
  // Primary
  {
    id: 'general',
    type: 'general',
    label: 'General',
    formatString: 'General',
    description: 'No specific format',
  },
  {
    id: 'number',
    type: 'number',
    label: 'Number',
    formatString: '0.00',
    description: 'Decimal number with 2 places',
  },

  // Financial
  {
    id: 'currency',
    type: 'currency',
    label: 'Currency',
    formatString: '$#,##0.00',
    description: 'Currency with symbol',
  },
  {
    id: 'accounting',
    type: 'accounting',
    label: 'Accounting',
    formatString: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)',
    description: 'Accounting format with aligned symbols',
  },

  // Date/Time
  {
    id: 'short-date',
    type: 'date',
    label: 'Short Date',
    formatString: 'm/d/yyyy',
    description: 'Short date format',
  },
  {
    id: 'long-date',
    type: 'date',
    label: 'Long Date',
    formatString: 'dddd, mmmm dd, yyyy',
    description: 'Long date format',
  },
  {
    id: 'time',
    type: 'time',
    label: 'Time',
    formatString: 'h:mm:ss AM/PM',
    description: '12-hour time',
  },

  // Scientific/Mathematical
  {
    id: 'percentage',
    type: 'percentage',
    label: 'Percentage',
    formatString: '0%',
    description: 'Percentage with no decimals',
  },
  {
    id: 'fraction',
    type: 'fraction',
    label: 'Fraction',
    formatString: '# ?/?',
    description: 'Fraction with auto denominator',
  },
  {
    id: 'scientific',
    type: 'scientific',
    label: 'Scientific',
    formatString: '0.00E+00',
    description: 'Scientific notation',
  },

  // Other
  {
    id: 'text',
    type: 'text',
    label: 'Text',
    formatString: '@',
    description: 'Treat as text',
  },
];

/**
 * Group presets by category for UI organization
 */
export const NUMBER_FORMAT_CATEGORIES = {
  primary: ['general', 'number'],
  financial: ['currency', 'accounting'],
  dateTime: ['short-date', 'long-date', 'time'],
  scientific: ['percentage', 'fraction', 'scientific'],
  other: ['text'],
} as const;

/**
 * Factory: Create NumberFormatValue from preset ID
 */
export function numberFormatValue(
  type: NumberFormatType,
  formatString: string,
  label?: string
): NumberFormatValue {
  return { type, formatString, label };
}

/**
 * Get default number format (General)
 */
export function getDefaultNumberFormat(): NumberFormatValue {
  return {
    type: 'general',
    formatString: 'General',
    label: 'General',
  };
}

/**
 * Find preset by ID
 */
export function getPresetById(id: string): NumberFormatPreset | undefined {
  return NUMBER_FORMAT_PRESETS.find((p) => p.id === id);
}

/**
 * Find preset by format string (exact match)
 */
export function getPresetByFormatString(
  formatString: string
): NumberFormatPreset | undefined {
  return NUMBER_FORMAT_PRESETS.find((p) => p.formatString === formatString);
}

/**
 * Check if format is a standard preset
 */
export function isStandardFormat(format: NumberFormatValue): boolean {
  return NUMBER_FORMAT_PRESETS.some(
    (p) => p.formatString === format.formatString
  );
}

/**
 * Get display label for format (for UI)
 */
export function getDisplayLabel(format: NumberFormatValue): string {
  if (format.label) {
    return format.label;
  }

  // Try to find matching preset
  const preset = getPresetByFormatString(format.formatString);
  if (preset) {
    return preset.label;
  }

  // Fallback: show format string (custom format)
  return format.formatString;
}

/**
 * Validate format string (basic validation)
 * 
 * Full validation requires Excel format parser (future)
 */
export function validateFormatString(formatString: string): boolean {
  if (!formatString || formatString.trim() === '') {
    return false;
  }

  // 'General' is always valid
  if (formatString === 'General') {
    return true;
  }

  // Basic check: format strings should not contain certain invalid chars
  const invalidChars = ['<', '>'];
  return !invalidChars.some((char) => formatString.includes(char));
}

/**
 * Get category for format type
 */
export function getCategoryForType(
  type: NumberFormatType
): keyof typeof NUMBER_FORMAT_CATEGORIES {
  if (NUMBER_FORMAT_CATEGORIES.primary.includes(type as any)) {
    return 'primary';
  }
  if (NUMBER_FORMAT_CATEGORIES.financial.includes(type as any)) {
    return 'financial';
  }
  if (NUMBER_FORMAT_CATEGORIES.dateTime.includes(type as any)) {
    return 'dateTime';
  }
  if (NUMBER_FORMAT_CATEGORIES.scientific.includes(type as any)) {
    return 'scientific';
  }
  return 'other';
}

/**
 * Create custom format value
 */
export function createCustomFormat(formatString: string): NumberFormatValue {
  return {
    type: 'custom',
    formatString,
    label: formatString, // Show format string for custom formats
  };
}

/**
 * Equality check for NumberFormatValue
 */
export function numberFormatEquals(
  a: NumberFormatValue | undefined,
  b: NumberFormatValue | undefined
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  // Format strings are the source of truth
  return a.formatString === b.formatString;
}
