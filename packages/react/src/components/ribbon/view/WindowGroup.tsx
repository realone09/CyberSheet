/**
 * WindowGroup.tsx
 *
 * View Tab - Window Group
 * Contains: Freeze Panes dropdown, Split, Hide/Unhide, View Side by Side, Arrange All, New Window, Switch Windows
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Workbook, Address } from '@cyber-sheet/core';

interface WindowGroupProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const WindowGroup: React.FC<WindowGroupProps> = ({
  workbook,
  selectedCells,
  onCommand,
}) => {
  const [showFreezePanesDropdown, setShowFreezePanesDropdown] = useState(false);
  const [showSwitchWindowsDropdown, setShowSwitchWindowsDropdown] = useState(false);
  const freezePanesRef = useRef<HTMLDivElement>(null);
  const switchWindowsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (freezePanesRef.current && !freezePanesRef.current.contains(event.target as Node)) {
        setShowFreezePanesDropdown(false);
      }
      if (switchWindowsRef.current && !switchWindowsRef.current.contains(event.target as Node)) {
        setShowSwitchWindowsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFreezePanes = useCallback((type: 'topRow' | 'firstColumn' | 'panes' | 'unfreeze') => {
    const command = {
      type: 'freezePanes',
      freezeType: type,
      cell: selectedCells.length > 0 ? selectedCells[0] : undefined,
    };
    onCommand?.(command);
    setShowFreezePanesDropdown(false);
    console.log('Freeze Panes:', type);
  }, [selectedCells, onCommand]);

  const handleSplit = useCallback(() => {
    const command = {
      type: 'splitWindow',
      cell: selectedCells.length > 0 ? selectedCells[0] : undefined,
    };
    onCommand?.(command);
    console.log('Split Window');
  }, [selectedCells, onCommand]);

  const handleHide = useCallback(() => {
    onCommand?.({ type: 'hideWindow' });
    console.log('Hide Window');
  }, [onCommand]);

  const handleUnhide = useCallback(() => {
    onCommand?.({ type: 'unhideWindow' });
    console.log('Unhide Window dialog');
  }, [onCommand]);

  const handleViewSideBySide = useCallback(() => {
    onCommand?.({ type: 'viewSideBySide' });
    console.log('View Side by Side');
  }, [onCommand]);

  const handleArrangeAll = useCallback(() => {
    onCommand?.({ type: 'arrangeAll' });
    console.log('Arrange All dialog');
  }, [onCommand]);

  const handleNewWindow = useCallback(() => {
    onCommand?.({ type: 'newWindow' });
    console.log('New Window');
  }, [onCommand]);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 2,
    fontSize: 11,
    color: '#333',
    fontFamily: 'Segoe UI, sans-serif',
    minWidth: 50,
    transition: 'background 150ms',
  };

  const dropdownButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    position: 'relative',
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#FFFFFF',
    border: '1px solid #D9D9D9',
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 180,
    padding: '4px 0',
    marginTop: 4,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: 11,
    color: '#333',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Segoe UI, sans-serif',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 8px' }}>
      <div style={{ fontSize: 10, color: '#666', marginBottom: 2, fontFamily: 'Segoe UI, sans-serif' }}>
        Window
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Freeze Panes Dropdown */}
        <div ref={freezePanesRef} style={{ position: 'relative' }}>
          <button
            style={dropdownButtonStyle}
            onClick={() => setShowFreezePanesDropdown(!showFreezePanesDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#E8E8E8';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Freeze Panes"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/>
              <line x1="2" y1="8" x2="18" y2="8" stroke="#0078D4" strokeWidth="2.5"/>
              <line x1="8" y1="2" x2="8" y2="18" stroke="#0078D4" strokeWidth="2.5"/>
            </svg>
            <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Freeze<br/>Panes</span>
            <svg width="8" height="5" viewBox="0 0 8 5" style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <path d="M0 0 L4 4 L8 0" fill="#333"/>
            </svg>
          </button>

          {showFreezePanesDropdown && (
            <div style={dropdownMenuStyle}>
              <button
                style={dropdownItemStyle}
                onClick={() => handleFreezePanes('topRow')}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Freeze Top Row
              </button>
              <button
                style={dropdownItemStyle}
                onClick={() => handleFreezePanes('firstColumn')}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Freeze First Column
              </button>
              <button
                style={dropdownItemStyle}
                onClick={() => handleFreezePanes('panes')}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Freeze Panes
              </button>
              <div style={{ height: 1, background: '#D9D9D9', margin: '4px 0' }} />
              <button
                style={dropdownItemStyle}
                onClick={() => handleFreezePanes('unfreeze')}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Unfreeze Panes
              </button>
            </div>
          )}
        </div>

        {/* Split */}
        <button
          style={buttonStyle}
          onClick={handleSplit}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Split Window"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <line x1="2" y1="10" x2="18" y2="10" stroke="#0078D4" strokeWidth="2"/>
            <line x1="10" y1="2" x2="10" y2="18" stroke="#0078D4" strokeWidth="2"/>
            <circle cx="10" cy="10" r="2" fill="#0078D4"/>
          </svg>
          <span>Split</span>
        </button>

        {/* Hide */}
        <button
          style={buttonStyle}
          onClick={handleHide}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Hide Window"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="12" stroke="#888" strokeWidth="1.5" fill="none"/>
            <line x1="2" y1="2" x2="18" y2="18" stroke="#888" strokeWidth="2"/>
          </svg>
          <span>Hide</span>
        </button>

        {/* Unhide */}
        <button
          style={buttonStyle}
          onClick={handleUnhide}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Unhide Window"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <circle cx="10" cy="10" r="3" fill="#E3F2FD" stroke="#0078D4" strokeWidth="1"/>
          </svg>
          <span>Unhide</span>
        </button>

        {/* View Side by Side */}
        <button
          style={buttonStyle}
          onClick={handleViewSideBySide}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="View Side by Side"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="7" height="14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="11" y="3" width="7" height="14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>View Side<br/>by Side</span>
        </button>

        {/* Arrange All */}
        <button
          style={buttonStyle}
          onClick={handleArrangeAll}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Arrange All Windows"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="10" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="2" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="10" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Arrange<br/>All</span>
        </button>

        {/* New Window */}
        <button
          style={buttonStyle}
          onClick={handleNewWindow}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="New Window"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="5" y="5" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>New<br/>Window</span>
        </button>

        {/* Switch Windows */}
        <div ref={switchWindowsRef} style={{ position: 'relative' }}>
          <button
            style={dropdownButtonStyle}
            onClick={() => setShowSwitchWindowsDropdown(!showSwitchWindowsDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#E8E8E8';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Switch Windows"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
              <rect x="8" y="8" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/>
              <path d="M15 10 L17 12 L15 14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            </svg>
            <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Switch<br/>Windows</span>
            <svg width="8" height="5" viewBox="0 0 8 5" style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <path d="M0 0 L4 4 L8 0" fill="#333"/>
            </svg>
          </button>

          {showSwitchWindowsDropdown && (
            <div style={dropdownMenuStyle}>
              <button
                style={dropdownItemStyle}
                onClick={() => {
                  console.log('Switch to Window 1');
                  setShowSwitchWindowsDropdown(false);
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                1. Book1
              </button>
              <button
                style={dropdownItemStyle}
                onClick={() => {
                  console.log('More Windows dialog');
                  setShowSwitchWindowsDropdown(false);
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                More Windows...
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
