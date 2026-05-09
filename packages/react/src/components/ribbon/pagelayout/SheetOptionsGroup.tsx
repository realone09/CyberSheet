/**
 * SheetOptionsGroup.tsx
 *
 * Page Layout Tab - Sheet Options Group
 * Contains: Gridlines (View/Print), Headings (View/Print) checkboxes
 */

import React from 'react';

export interface SheetOptionsGroupProps {
  onGridlinesViewChange?: (visible: boolean) => void;
  onGridlinesPrintChange?: (print: boolean) => void;
  onHeadingsViewChange?: (visible: boolean) => void;
  onHeadingsPrintChange?: (print: boolean) => void;
}

export const SheetOptionsGroup: React.FC<SheetOptionsGroupProps> = ({
  onGridlinesViewChange,
  onGridlinesPrintChange,
  onHeadingsViewChange,
  onHeadingsPrintChange,
}) => {
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
  };

  const gridContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'auto 60px 60px',
    gap: '8px 12px',
    alignItems: 'center',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#888',
    fontWeight: 600,
    textAlign: 'center',
  };

  const rowLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333',
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
  };

  const checkboxStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  return (
    <div style={groupStyle}>
      <div style={gridContainerStyle}>
        {/* Headers */}
        <div />
        <div style={headerStyle}>View</div>
        <div style={headerStyle}>Print</div>

        {/* Gridlines Row */}
        <div style={rowLabelStyle}>Gridlines</div>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            style={checkboxStyle}
            defaultChecked={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onGridlinesViewChange?.(e.target.checked);
            }}
          />
        </div>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            style={checkboxStyle}
            defaultChecked={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onGridlinesPrintChange?.(e.target.checked);
            }}
          />
        </div>

        {/* Headings Row */}
        <div style={rowLabelStyle}>Headings</div>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            style={checkboxStyle}
            defaultChecked={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onHeadingsViewChange?.(e.target.checked);
            }}
          />
        </div>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            style={checkboxStyle}
            defaultChecked={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onHeadingsPrintChange?.(e.target.checked);
            }}
          />
        </div>
      </div>

      <div style={labelStyle}>Sheet Options</div>
    </div>
  );
};
