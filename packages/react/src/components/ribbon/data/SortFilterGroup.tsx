import React, { useState, useCallback } from 'react';
import type { Workbook, Address, Range } from '@cyber-sheet/core';

interface SortFilterGroupProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const SortFilterGroup: React.FC<SortFilterGroupProps> = ({ workbook, selectedCells, onCommand }) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const handleSortAscending = useCallback(() => {
    const sheet = workbook.activeSheet;
    if (!sheet || selectedCells.length === 0) {
      console.warn('No column selected for sorting');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    // Get the column to sort (first column of selection)
    const columnIndex = selection.start.col;
    
    // Determine data range (expand selection to include all data in column)
    const dataRange = sheet.getUsedRange();
    if (!dataRange) return;

    // Create sort command
    const sortCommand = {
      type: 'sort',
      range: {
        start: { row: selection.start.row, col: columnIndex },
        end: { row: dataRange.end.row, col: selection.end.col },
      },
      sortBy: [{ columnIndex, ascending: true }],
    };

    onCommand?.(sortCommand);
    console.log('Sort Ascending:', columnIndex);
  }, [workbook, selectedCells, onCommand]);

  const handleSortDescending = useCallback(() => {
    const sheet = workbook.activeSheet;
    if (!sheet || selectedCells.length === 0) {
      console.warn('No column selected for sorting');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    const columnIndex = selection.start.col;
    const dataRange = sheet.getUsedRange();
    if (!dataRange) return;

    const sortCommand = {
      type: 'sort',
      range: {
        start: { row: selection.start.row, col: columnIndex },
        end: { row: dataRange.end.row, col: selection.end.col },
      },
      sortBy: [{ columnIndex, ascending: false }],
    };

    onCommand?.(sortCommand);
    console.log('Sort Descending:', columnIndex);
  }, [workbook, selectedCells, onCommand]);

  const handleCustomSort = useCallback(() => {
    setShowSortDialog(true);
  }, []);

  const handleToggleFilter = useCallback(() => {
    const sheet = workbook.activeSheet;
    if (!sheet || selectedCells.length === 0) {
      console.warn('No range selected for filtering');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    const newFilterState = !filterActive;
    setFilterActive(newFilterState);

    const filterCommand = {
      type: 'toggleAutoFilter',
      range: selection,
      enabled: newFilterState,
    };

    onCommand?.(filterCommand);
    console.log('Toggle Filter:', newFilterState);
  }, [workbook, selectedCells, filterActive, onCommand]);

  const handleClearFilter = useCallback(() => {
    const filterCommand = {
      type: 'clearFilter',
    };
    onCommand?.(filterCommand);
    console.log('Clear Filter');
  }, [onCommand]);

  const handleReapplyFilter = useCallback(() => {
    const filterCommand = {
      type: 'reapplyFilter',
    };
    onCommand?.(filterCommand);
    console.log('Reapply Filter');
  }, [onCommand]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px' }}>
      {/* Group Label */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
        {/* Sort Ascending Button */}
        <button
          onClick={handleSortAscending}
          title="Sort A to Z (Ascending)"
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* A→Z icon with up arrow */}
            <text x="2" y="14" fontSize="10" fontWeight="bold" fill="#333">A</text>
            <text x="2" y="6" fontSize="8" fill="#666">Z</text>
            <path d="M15 12 L12 15 L15 12 L18 15 M15 5 L15 15" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>

        {/* Sort Descending Button */}
        <button
          onClick={handleSortDescending}
          title="Sort Z to A (Descending)"
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* Z→A icon with down arrow */}
            <text x="2" y="6" fontSize="10" fontWeight="bold" fill="#333">Z</text>
            <text x="2" y="14" fontSize="8" fill="#666">A</text>
            <path d="M15 8 L12 5 L15 8 L18 5 M15 15 L15 5" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>

        {/* Custom Sort Button */}
        <button
          onClick={handleCustomSort}
          title="Custom Sort..."
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* Multi-level sort icon */}
            <rect x="3" y="3" width="14" height="2" fill="#333"/>
            <rect x="5" y="7" width="12" height="2" fill="#666"/>
            <rect x="7" y="11" width="10" height="2" fill="#999"/>
            <rect x="9" y="15" width="8" height="2" fill="#BBB"/>
          </svg>
        </button>
      </div>

      {/* Filter Button with Dropdown */}
      <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
        <button
          onClick={handleToggleFilter}
          title="Toggle Filter"
          style={{
            width: 68,
            height: 24,
            border: `1px solid ${filterActive ? '#0078D4' : '#D9D9D9'}`,
            background: filterActive ? '#D3E3FD' : '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
            position: 'relative',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (!filterActive) e.currentTarget.style.background = '#E0E0E0';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (!filterActive) e.currentTarget.style.background = '#F0F0F0';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 2 L6 8 L6 12 L8 13 L8 8 L13 2 Z" stroke="#333" strokeWidth="1" fill="none"/>
          </svg>
          <span>Filter</span>
          {/* Dropdown Arrow */}
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setShowFilterDropdown(!showFilterDropdown);
            }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 16,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="8" height="5" viewBox="0 0 8 5">
              <path d="M0 0 L4 5 L8 0" fill="#333"/>
            </svg>
          </button>
        </button>

        {/* Filter Dropdown Menu */}
        {showFilterDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 2,
              background: '#FFFFFF',
              border: '1px solid #D9D9D9',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: 160,
            }}
          >
            <button
              onClick={() => {
                handleClearFilter();
                setShowFilterDropdown(false);
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Segoe UI, sans-serif',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = 'transparent'}
            >
              Clear Filter
            </button>
            <button
              onClick={() => {
                handleReapplyFilter();
                setShowFilterDropdown(false);
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Segoe UI, sans-serif',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = 'transparent'}
            >
              Reapply Filter
            </button>
            <div style={{ height: 1, background: '#E0E0E0', margin: '4px 0' }} />
            <button
              style={{
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Segoe UI, sans-serif',
                color: '#888',
              }}
            >
              Filter by Color...
            </button>
            <button
              style={{
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Segoe UI, sans-serif',
                color: '#888',
              }}
            >
              Text Filters ▶
            </button>
            <button
              style={{
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Segoe UI, sans-serif',
                color: '#888',
              }}
            >
              Number Filters ▶
            </button>
          </div>
        )}
      </div>

      {/* Group Label */}
      <div style={{ fontSize: 10, color: '#666', marginTop: 2, fontFamily: 'Segoe UI, sans-serif' }}>
        Sort & Filter
      </div>

      {/* Custom Sort Dialog */}
      {showSortDialog && (
        <CustomSortDialog
          workbook={workbook}
          selectedCells={selectedCells}
          onClose={() => setShowSortDialog(false)}
          onSort={(levels) => {
            const sheet = workbook.activeSheet;
            if (!sheet || selectedCells.length === 0) return;

            const selection: Range = {
              start: selectedCells[0],
              end: selectedCells[selectedCells.length - 1],
            };

            const sortCommand = {
              type: 'multiSort',
              range: selection,
              sortBy: levels,
            };
            onCommand?.(sortCommand);
            setShowSortDialog(false);
          }}
        />
      )}
    </div>
  );
};

// Custom Sort Dialog Component
interface CustomSortDialogProps {
  workbook: Workbook;
  selectedCells: Address[];
  onClose: () => void;
  onSort: (levels: Array<{ columnIndex: number; ascending: boolean }>) => void;
}

const CustomSortDialog: React.FC<CustomSortDialogProps> = ({ workbook, selectedCells, onClose, onSort }) => {
  const [sortLevels, setSortLevels] = useState<Array<{ columnIndex: number; ascending: boolean }>>([
    { columnIndex: 0, ascending: true },
  ]);

  const sheet = workbook.activeSheet;
  
  // Calculate column count from selection
  let columnCount = 26; // default
  if (sheet && selectedCells.length > 0) {
    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };
    columnCount = selection.end.col - selection.start.col + 1;
  }

  const addLevel = () => {
    setSortLevels([...sortLevels, { columnIndex: 0, ascending: true }]);
  };

  const removeLevel = (index: number) => {
    if (sortLevels.length === 1) return; // Keep at least one level
    setSortLevels(sortLevels.filter((_, i) => i !== index));
  };

  const updateLevel = (index: number, field: 'columnIndex' | 'ascending', value: any) => {
    const newLevels = [...sortLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setSortLevels(newLevels);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          width: 480,
          maxHeight: '80vh',
          overflow: 'auto',
          fontFamily: 'Segoe UI, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Sort</h3>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 18,
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {/* Sort Levels */}
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 12, fontSize: 11, color: '#666' }}>
            Add or delete sort levels, and then specify the column and sort order for each level.
          </div>

          {sortLevels.map((level, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, minWidth: 60 }}>
                {index === 0 ? 'Sort by:' : 'Then by:'}
              </span>
              <select
                value={level.columnIndex}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateLevel(index, 'columnIndex', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  border: '1px solid #D9D9D9',
                  borderRadius: 2,
                  fontSize: 11,
                }}
              >
                {Array.from({ length: columnCount }, (_, i) => (
                  <option key={i} value={i}>
                    Column {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
              <select
                value={level.ascending ? 'asc' : 'desc'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateLevel(index, 'ascending', e.target.value === 'asc')}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #D9D9D9',
                  borderRadius: 2,
                  fontSize: 11,
                }}
              >
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
              {sortLevels.length > 1 && (
                <button
                  onClick={() => removeLevel(index)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #D9D9D9',
                    background: '#F0F0F0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addLevel}
            style={{
              padding: '6px 12px',
              border: '1px solid #D9D9D9',
              background: '#F0F0F0',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
              marginTop: 8,
            }}
          >
            + Add Level
          </button>

          <div style={{ marginTop: 16, padding: 12, background: '#F8F8F8', borderRadius: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <input type="checkbox" defaultChecked />
              My data has headers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginTop: 8 }}>
              <input type="checkbox" />
              Case sensitive
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              border: '1px solid #D9D9D9',
              background: '#F0F0F0',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSort(sortLevels)}
            style={{
              padding: '6px 16px',
              border: '1px solid #0078D4',
              background: '#0078D4',
              color: '#FFFFFF',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
