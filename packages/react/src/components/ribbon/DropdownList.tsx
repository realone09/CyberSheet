/**
 * DropdownList - Generic List Selector Primitive
 * 
 * New interaction pattern: vertical list (not grid)
 * 
 * Extends dropdown system with list-based selection:
 * - ColorGrid: 2D grid
 * - PatternGrid: 2D grid
 * - LineStyleGrid: 1D vertical list
 * - BorderPresetGrid: 2D grid
 * - DropdownList: 1D vertical list (GENERIC)
 * 
 * Keyboard: ↑↓ to navigate, Enter to select, Escape to close
 */

import React, { useRef, useCallback } from 'react';
import { useListNavigation } from './hooks/useGridNavigation';

export interface DropdownListItem<T> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface DropdownListProps<T> {
  /**
   * List of items to display
   */
  items: DropdownListItem<T>[];

  /**
   * Currently selected value
   */
  value?: T;

  /**
   * Selection callback
   */
  onSelect: (value: T) => void;

  /**
   * Escape callback (close dropdown)
   */
  onEscape?: () => void;

  /**
   * Custom equality check
   */
  isEqual?: (a: T, b: T) => boolean;

  /**
   * Optional custom CSS class
   */
  className?: string;
}

/**
 * Generic list selector for dropdowns
 * 
 * Reuses useListNavigation (columns=1 variant of useGridNavigation)
 */
export function DropdownList<T>({
  items,
  value,
  onSelect,
  onEscape,
  isEqual = (a, b) => a === b,
  className = '',
}: DropdownListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  // Get index of currently selected item
  const selectedIndex = value !== undefined
    ? items.findIndex((item) => isEqual(item.value, value))
    : -1;

  // Keyboard navigation (1D list)
  const { focusedIndex, handleKeyDown, containerProps } = useListNavigation({
    totalItems: items.length,
    onSelect: (index) => {
      const item = items[index];
      if (item && !item.disabled) {
        onSelect(item.value);
      }
    },
    onEscape,
  });

  const handleItemClick = useCallback(
    (item: DropdownListItem<T>) => {
      if (!item.disabled) {
        onSelect(item.value);
      }
    },
    [onSelect]
  );

  return (
    <div
      ref={listRef}
      className={`cs-dropdown-list ${className}`}
      aria-activedescendant={
        focusedIndex >= 0 ? `list-item-${focusedIndex}` : undefined
      }
      {...containerProps}
    >
      {items.map((item, index) => {
        const isSelected = value !== undefined && isEqual(item.value, value);
        const isFocused = index === focusedIndex;

        return (
          <div
            key={index}
            id={`list-item-${index}`}
            role="option"
            aria-selected={isSelected}
            aria-disabled={item.disabled}
            className={`cs-dropdown-list-item ${isSelected ? 'selected' : ''} ${
              isFocused ? 'focused' : ''
            } ${item.disabled ? 'disabled' : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => {
              // Update focus on hover (improves UX)
              if (!item.disabled) {
                // Focus would be set by useListNavigation if we trigger mousemove
              }
            }}
          >
            <div className="cs-dropdown-list-item-content">
              <div className="cs-dropdown-list-item-label">{item.label}</div>
              {item.description && (
                <div className="cs-dropdown-list-item-description">
                  {item.description}
                </div>
              )}
            </div>
            {isSelected && (
              <div className="cs-dropdown-list-item-check" aria-hidden="true">
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Dropdown list with separator after it
 */
export function DropdownListWithSeparator<T>(
  props: DropdownListProps<T>
): React.ReactElement {
  return (
    <>
      <DropdownList {...props} />
      <div className="cs-dropdown-separator" />
    </>
  );
}
