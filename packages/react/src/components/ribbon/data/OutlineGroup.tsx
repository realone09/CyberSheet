import React, { useState, useCallback } from 'react';
import type { Workbook, Address, Range } from '@cyber-sheet/core';

interface OutlineGroupProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const OutlineGroup: React.FC<OutlineGroupProps> = ({ workbook, selectedCells, onCommand }) => {
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showUngroupDropdown, setShowUngroupDropdown] = useState(false);

  const handleGroup = useCallback(() => {
    const sheet = workbook.activeSheet;
    if (!sheet || selectedCells.length === 0) {
      console.warn('No range selected for grouping');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    // Determine if rows or columns selected
    const isRows = selection.end.row > selection.start.row;
    const isColumns = selection.end.col > selection.start.col;

    const command = {
      type: 'groupOutline',
      range: selection,
      axis: isRows ? 'rows' : 'columns',
    };

    onCommand?.(command);
    setShowGroupDropdown(false);
    console.log('Group:', isRows ? 'rows' : 'columns');
  }, [workbook, selectedCells, onCommand]);

  const handleAutoOutline = useCallback(() => {
    const command = {
      type: 'autoOutline',
    };
    onCommand?.(command);
    setShowGroupDropdown(false);
    console.log('Auto Outline');
  }, [onCommand]);

  const handleUngroup = useCallback(() => {
    const sheet = workbook.activeSheet;
    if (!sheet || selectedCells.length === 0) {
      console.warn('No range selected for ungrouping');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    const isRows = selection.end.row > selection.start.row;

    const command = {
      type: 'ungroupOutline',
      range: selection,
      axis: isRows ? 'rows' : 'columns',
    };

    onCommand?.(command);
    setShowUngroupDropdown(false);
    console.log('Ungroup:', isRows ? 'rows' : 'columns');
  }, [workbook, selectedCells, onCommand]);

  const handleClearOutline = useCallback(() => {
    const command = {
      type: 'clearOutline',
    };
    onCommand?.(command);
    setShowUngroupDropdown(false);
    console.log('Clear Outline');
  }, [workbook, onCommand]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
        {/* Group Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
            title="Group"
            style={{
              width: 48,
              height: 32,
              border: 'none',
              background: '#F0F0F0',
              cursor: 'pointer',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontFamily: 'Segoe UI, sans-serif',
              color: '#333',
              position: 'relative',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
          >
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              {/* Group icon - bracket with lines */}
              <path d="M4 3 L2 3 L2 13 L4 13" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
              <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/>
              <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/>
              <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/>
              <circle cx="16" cy="8" r="2" fill="#0078D4"/>
              <text x="15" y="10" fontSize="4" fill="#FFF" fontWeight="bold">-</text>
            </svg>
            <span style={{ fontSize: 9, marginTop: 2 }}>Group</span>
            <div style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <svg width="6" height="4" viewBox="0 0 6 4">
                <path d="M0 0 L3 4 L6 0" fill="#333"/>
              </svg>
            </div>
          </button>

          {/* Group Dropdown */}
          {showGroupDropdown && (
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
                minWidth: 140,
              }}
            >
              <button
                onClick={handleGroup}
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
                Group...
              </button>
              <button
                onClick={handleAutoOutline}
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
                Auto Outline
              </button>
            </div>
          )}
        </div>

        {/* Ungroup Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUngroupDropdown(!showUngroupDropdown)}
            title="Ungroup"
            style={{
              width: 48,
              height: 32,
              border: 'none',
              background: '#F0F0F0',
              cursor: 'pointer',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontFamily: 'Segoe UI, sans-serif',
              color: '#333',
              position: 'relative',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
          >
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              {/* Ungroup icon - open bracket */}
              <path d="M4 3 L2 3 L2 13 L4 13" stroke="#999" strokeWidth="1.5" fill="none" strokeDasharray="2,1"/>
              <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/>
              <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/>
              <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/>
              <circle cx="16" cy="8" r="2" fill="#E83E3E"/>
              <text x="14.5" y="10" fontSize="4" fill="#FFF" fontWeight="bold">+</text>
            </svg>
            <span style={{ fontSize: 9, marginTop: 2 }}>Ungroup</span>
            <div style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <svg width="6" height="4" viewBox="0 0 6 4">
                <path d="M0 0 L3 4 L6 0" fill="#333"/>
              </svg>
            </div>
          </button>

          {/* Ungroup Dropdown */}
          {showUngroupDropdown && (
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
                minWidth: 140,
              }}
            >
              <button
                onClick={handleUngroup}
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
                Ungroup...
              </button>
              <button
                onClick={handleClearOutline}
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
                Clear Outline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Group Label */}
      <div style={{ fontSize: 10, color: '#666', marginTop: 2, fontFamily: 'Segoe UI, sans-serif' }}>
        Outline
      </div>
    </div>
  );
};
