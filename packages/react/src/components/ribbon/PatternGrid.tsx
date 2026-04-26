import React, { useRef, useEffect, useState } from 'react';
import type { PatternType, PatternMetadata } from './fillTypes';
import { PATTERN_TYPES } from './fillTypes';
import './ribbon.css';

export interface PatternGridProps {
  /**
   * Currently selected pattern type
   */
  selectedPattern?: PatternType;
  
  /**
   * Foreground color for pattern preview
   */
  foregroundColor: string;
  
  /**
   * Background color for pattern preview
   */
  backgroundColor: string;
  
  /**
   * Called when user selects a pattern
   */
  onSelect: (pattern: PatternType) => void;
}

/**
 * PatternGrid - Grid of pattern swatches for fill patterns
 * 
 * Displays Excel's 18 standard fill patterns with live preview using
 * foreground and background colors.
 * 
 * Layout:
 * - 6 columns × 3 rows (18 patterns)
 * - 24×24px cells (larger than color cells for pattern visibility)
 * - 4px gap between cells
 * - Hover state: border highlight
 * - Selected state: thick border
 * - Keyboard navigation: arrow keys
 * 
 * Reuses keyboard navigation pattern from ColorGrid
 * 
 * @example
 * <PatternGrid 
 *   selectedPattern="gray50"
 *   foregroundColor="#000000"
 *   backgroundColor="#FFFFFF"
 *   onSelect={(pattern) => applyPattern(pattern)}
 * />
 */
export const PatternGrid: React.FC<PatternGridProps> = ({
  selectedPattern,
  foregroundColor,
  backgroundColor,
  onSelect,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Keyboard navigation (arrow keys) - same pattern as ColorGrid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusedIdx === null) return;

      const cols = 6; // 6 columns
      const rows = Math.ceil(PATTERN_TYPES.length / cols);
      const currentRow = Math.floor(focusedIdx / cols);
      const currentCol = focusedIdx % cols;

      let newIdx = focusedIdx;

      switch (e.key) {
        case 'ArrowRight':
          newIdx = Math.min(focusedIdx + 1, PATTERN_TYPES.length - 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newIdx = Math.max(focusedIdx - 1, 0);
          e.preventDefault();
          break;
        case 'ArrowDown':
          newIdx = Math.min(focusedIdx + cols, PATTERN_TYPES.length - 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          newIdx = Math.max(focusedIdx - cols, 0);
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(PATTERN_TYPES[focusedIdx].type);
          return;
        default:
          return;
      }

      setFocusedIdx(newIdx);

      // Focus the new cell
      const button = gridRef.current?.querySelector(
        `[data-idx="${newIdx}"]`
      ) as HTMLButtonElement;
      button?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIdx, onSelect]);

  /**
   * Render pattern preview using SVG
   * 
   * Creates inline SVG with pattern definition matching Excel's rendering
   */
  const renderPatternPreview = (pattern: PatternMetadata) => {
    if (pattern.type === 'solid' || pattern.type === 'none') {
      // Solid = just background color
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: pattern.type === 'solid' ? foregroundColor : 'transparent',
          }}
        />
      );
    }

    // Pattern with SVG
    return (
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`pattern-${pattern.type}`}
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={backgroundColor} />
            <path d={pattern.svgPattern} stroke={foregroundColor} fill="none" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="24" height="24" fill={`url(#pattern-${pattern.type})`} />
      </svg>
    );
  };

  return (
    <div
      ref={gridRef}
      className="cs-pattern-grid"
      role="grid"
      aria-label="Pattern grid"
    >
      {PATTERN_TYPES.map((pattern, idx) => {
        const isSelected = pattern.type === selectedPattern;
        const isFocused = focusedIdx === idx;

        return (
          <button
            key={pattern.type}
            data-idx={idx}
            className={`cs-pattern-cell ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
            onClick={() => onSelect(pattern.type)}
            onFocus={() => setFocusedIdx(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(pattern.type);
              }
            }}
            aria-label={pattern.label}
            title={pattern.label}
            type="button"
            role="gridcell"
            tabIndex={isFocused ? 0 : -1}
          >
            {renderPatternPreview(pattern)}
          </button>
        );
      })}
    </div>
  );
};
