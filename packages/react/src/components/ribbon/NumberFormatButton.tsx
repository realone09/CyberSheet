/**
 * NumberFormatButton - Dropdown Button (Not Split Button)
 * 
 * UI Pattern: Simple dropdown trigger (different from Font/Fill/Border split buttons)
 * 
 * Shows:
 * - Selected format label (e.g., "General", "Currency", "0.00")
 * - "Mixed" if multiple formats selected
 * - Dropdown opens on click
 * 
 * Architectural note: Number format is SEMANTIC state, not instant-apply visual.
 * User expects to see format label, not preview of formatted value.
 */

import React, { useState } from 'react';
import { ChevronDown20Regular } from '@fluentui/react-icons';
import { NumberFormatDropdown } from './NumberFormatDropdown';
import type { NumberFormatValue } from './numberFormatTypes';
import type { StyleState } from './types';
import {
  resolveNumberFormat,
  isMixedNumberFormat,
  getDisplayNumberFormat,
} from './numberFormatUtils';

export interface NumberFormatButtonProps {
  /**
   * Current number format state (supports mixed selection)
   */
  numberFormat: StyleState<NumberFormatValue>;

  /**
   * Format selection callback
   */
  onApply: (format: NumberFormatValue) => void;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Number format dropdown button
 * 
 * Displays current format label or "Mixed"
 */
export function NumberFormatButton({
  numberFormat,
  onApply,
  disabled = false,
}: NumberFormatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Resolve current format
  const currentFormat = resolveNumberFormat(numberFormat);
  const isMixed = isMixedNumberFormat(numberFormat);

  // Display label
  const displayLabel = isMixed
    ? 'Mixed'
    : getDisplayNumberFormat(currentFormat);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (format: NumberFormatValue) => {
    onApply(format);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="cs-number-format-button-container">
      {/* Dropdown Button */}
      <button
        className={`cs-number-format-button ${isOpen ? 'active' : ''} ${
          disabled ? 'disabled' : ''
        }`}
        onClick={handleToggle}
        disabled={disabled}
        aria-label="Number Format"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span
          className="cs-number-format-button-label"
          style={{ opacity: isMixed ? 0.5 : 1 }}
        >
          {displayLabel}
        </span>
        <ChevronDown20Regular className="cs-number-format-button-icon" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <NumberFormatDropdown
          value={isMixed ? undefined : currentFormat}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
