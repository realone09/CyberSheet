/**
 * NumberFormatDropdown - Categorized Format Selector
 * 
 * Critical architectural test: First hierarchical dropdown (not flat grid)
 * 
 * Layout matches Excel 365 exactly:
 * 1. Primary (General, Number)
 * 2. Financial (Currency, Accounting)
 * 3. Date/Time (Short Date, Long Date, Time)
 * 4. Scientific (Percentage, Fraction, Scientific)
 * 5. Other (Text)
 * 6. More Formats... (future: custom format dialog)
 */

import React, { useRef, useEffect } from 'react';
import { DropdownList, DropdownListItem } from './DropdownList';
import type { NumberFormatValue } from './numberFormatTypes';
import {
  NUMBER_FORMAT_PRESETS,
  NUMBER_FORMAT_CATEGORIES,
  numberFormatEquals,
} from './numberFormatTypes';

export interface NumberFormatDropdownProps {
  /**
   * Currently applied format
   */
  value: NumberFormatValue | undefined;

  /**
   * Format selection callback
   */
  onSelect: (format: NumberFormatValue) => void;

  /**
   * Close dropdown callback
   */
  onClose: () => void;
}

/**
 * Number format dropdown with Excel-accurate category layout
 */
export function NumberFormatDropdown({
  value,
  onSelect,
  onClose,
}: NumberFormatDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside dropdown (supports shadow DOM)
      const path = event.composedPath?.() || [];
      const clickedInside = path.some(
        (el) => el === dropdownRef.current
      ) || dropdownRef.current?.contains(target);

      if (!clickedInside) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ESC key handling
  const handleEscape = () => {
    onClose();
  };

  // Convert presets to DropdownListItem format
  const createListItems = (
    presetIds: readonly string[]
  ): DropdownListItem<NumberFormatValue>[] => {
    return presetIds
      .map((id) => {
        const preset = NUMBER_FORMAT_PRESETS.find((p) => p.id === id);
        if (!preset) return null;

        return {
          value: {
            type: preset.type,
            formatString: preset.formatString,
            label: preset.label,
          },
          label: preset.label,
          description: preset.description,
        } as DropdownListItem<NumberFormatValue>;
      })
      .filter((item) => item !== null) as DropdownListItem<NumberFormatValue>[];
  };

  // Category items
  const primaryItems = createListItems(NUMBER_FORMAT_CATEGORIES.primary);
  const financialItems = createListItems(NUMBER_FORMAT_CATEGORIES.financial);
  const dateTimeItems = createListItems(NUMBER_FORMAT_CATEGORIES.dateTime);
  const scientificItems = createListItems(NUMBER_FORMAT_CATEGORIES.scientific);
  const otherItems = createListItems(NUMBER_FORMAT_CATEGORIES.other);

  // "More Formats" item (future: opens custom format dialog)
  const moreFormatsItem: DropdownListItem<NumberFormatValue> = {
    value: { type: 'custom', formatString: '', label: 'More Formats...' },
    label: 'More Number Formats...',
    description: 'Custom format dialog',
    disabled: true, // TODO: Enable when dialog is implemented
  };

  return (
    <div ref={dropdownRef} className="cs-number-format-dropdown">
      {/* Primary Formats */}
      <DropdownList
        items={primaryItems}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />

      <div className="cs-dropdown-separator" />

      {/* Financial Formats */}
      <DropdownList
        items={financialItems}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />

      <div className="cs-dropdown-separator" />

      {/* Date/Time Formats */}
      <DropdownList
        items={dateTimeItems}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />

      <div className="cs-dropdown-separator" />

      {/* Scientific Formats */}
      <DropdownList
        items={scientificItems}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />

      <div className="cs-dropdown-separator" />

      {/* Other Formats */}
      <DropdownList
        items={otherItems}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />

      <div className="cs-dropdown-separator" />

      {/* More Formats (future) */}
      <DropdownList
        items={[moreFormatsItem]}
        value={value}
        onSelect={onSelect}
        onEscape={handleEscape}
        isEqual={numberFormatEquals}
      />
    </div>
  );
}
