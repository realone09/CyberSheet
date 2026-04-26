import React, { useRef, useEffect, useState } from 'react';
import './ribbon.css';

export interface ColorGridProps {
  /**
   * 2D array of hex colors
   * - Each sub-array is a column
   * - Rendered left-to-right, top-to-bottom
   */
  colors: string[][];
  
  /**
   * Called when user selects a color
   */
  onSelect: (color: string) => void;
  
  /**
   * Currently selected color (shows border)
   */
  selectedColor?: string;
}

/**
 * ColorGrid - Grid of color swatches for theme colors
 * 
 * Displays Excel-like theme color grid with tint/shade variations.
 * Each column represents a theme color with 6 tint/shade variations.
 * 
 * Layout:
 * - 10 columns (theme colors)
 * - 6 rows per column (tint/shade variations)
 * - 16×16px cells
 * - 2px gap between cells
 * - Hover state: border highlight
 * - Selected state: thick border
 * 
 * @example
 * <ColorGrid 
 *   colors={THEME_COLORS} 
 *   onSelect={(color) => applyColor(color)}
 *   selectedColor="#4472C4"
 * />
 */
export const ColorGrid: React.FC<ColorGridProps> = ({
  colors,
  onSelect,
  selectedColor,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ col: number; row: number } | null>(null);

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const { col, row } = focusedCell;
      let newCol = col;
      let newRow = row;

      switch (e.key) {
        case 'ArrowRight':
          newCol = Math.min(col + 1, colors.length - 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newCol = Math.max(col - 1, 0);
          e.preventDefault();
          break;
        case 'ArrowDown':
          newRow = Math.min(row + 1, colors[col].length - 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          newRow = Math.max(row - 1, 0);
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(colors[col][row]);
          return;
        default:
          return;
      }

      setFocusedCell({ col: newCol, row: newRow });

      // Focus the new cell
      const button = gridRef.current?.querySelector(
        `[data-col="${newCol}"][data-row="${newRow}"]`
      ) as HTMLButtonElement;
      button?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, colors, onSelect]);

  return (
    <div ref={gridRef} className="cs-color-grid" role="grid" aria-label="Color grid">
      {colors.map((column, colIdx) => (
        <div key={colIdx} className="cs-color-column" role="row">
          {column.map((color, rowIdx) => {
            const isSelected = color === selectedColor;
            const isFocused = focusedCell?.col === colIdx && focusedCell?.row === rowIdx;
            
            return (
              <button
                key={`${colIdx}-${rowIdx}`}
                data-col={colIdx}
                data-row={rowIdx}
                className={`cs-color-cell ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onSelect(color)}
                onFocus={() => setFocusedCell({ col: colIdx, row: rowIdx })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(color);
                  }
                }}
                aria-label={`Color ${color}`}
                title={color}
                type="button"
                role="gridcell"
                tabIndex={isFocused ? 0 : -1}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
