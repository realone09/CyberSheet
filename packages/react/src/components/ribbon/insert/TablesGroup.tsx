/**
 * TablesGroup.tsx
 *
 * Insert Tab - Tables Group
 * Contains: PivotTable, Table commands
 */

import React, { useState } from 'react';

export interface TablesGroupProps {
  onInsertTable?: () => void;
  onInsertPivotTable?: () => void;
}

export const TablesGroup: React.FC<TablesGroupProps> = ({
  onInsertTable,
  onInsertPivotTable,
}) => {
  const [showPivotDropdown, setShowPivotDropdown] = useState(false);

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
    position: 'relative',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
  };

  const bigButtonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333',
    minWidth: 50,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 24,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#FFFFFF',
    border: '1px solid #D1D1D1',
    borderRadius: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 200,
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  return (
    <div style={groupStyle}>
      <div style={buttonContainerStyle}>
        {/* PivotTable Button */}
        <div style={{ position: 'relative' }}>
          <button
            style={bigButtonStyle}
            onClick={() => {
              setShowPivotDropdown(!showPivotDropdown);
              if (onInsertPivotTable && !showPivotDropdown) {
                onInsertPivotTable();
              }
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D1D1';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
          >
            <span style={iconStyle}>📊</span>
            <span>PivotTable</span>
          </button>

          {showPivotDropdown && (
            <div style={dropdownStyle}>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  setShowPivotDropdown(false);
                  onInsertPivotTable?.();
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                PivotTable
              </div>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  setShowPivotDropdown(false);
                  console.log('PivotChart');
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                PivotChart
              </div>
              <div
                style={{ ...dropdownItemStyle, borderBottom: 'none' }}
                onClick={() => {
                  setShowPivotDropdown(false);
                  console.log('Recommended PivotTables');
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                Recommended PivotTables
              </div>
            </div>
          )}
        </div>

        {/* Table Button */}
        <button
          style={bigButtonStyle}
          onClick={() => onInsertTable?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D1D1';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          }}
        >
          <span style={iconStyle}>📋</span>
          <span>Table</span>
        </button>
      </div>

      <div style={labelStyle}>Tables</div>
    </div>
  );
};
