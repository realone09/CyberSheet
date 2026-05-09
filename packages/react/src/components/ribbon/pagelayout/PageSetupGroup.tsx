/**
 * PageSetupGroup.tsx
 *
 * Page Layout Tab - Page Setup Group
 * Contains: Margins, Orientation, Size, Print Area, Breaks, Background, Print Titles
 */

import React, { useState } from 'react';

export interface PageSetupGroupProps {
  onMarginsChange?: (margins: string) => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onSizeChange?: (size: string) => void;
  onPrintAreaSet?: () => void;
  onBreaksInsert?: (breakType: 'page' | 'remove') => void;
  onBackgroundSet?: () => void;
  onPrintTitlesSet?: () => void;
}

export const PageSetupGroup: React.FC<PageSetupGroupProps> = ({
  onMarginsChange,
  onOrientationChange,
  onSizeChange,
  onPrintAreaSet,
  onBreaksInsert,
  onBackgroundSet,
  onPrintTitlesSet,
}) => {
  const [showMarginsDropdown, setShowMarginsDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showBreaksDropdown, setShowBreaksDropdown] = useState(false);

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
    flexWrap: 'wrap',
    maxWidth: 260,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '4px 8px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 3,
    fontSize: 10,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333',
    minWidth: 45,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 20,
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
    minWidth: 180,
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  const marginPresets = ['Normal', 'Wide', 'Narrow', 'Custom Margins...'];
  const pageSizes = ['Letter (8.5" x 11")', 'Legal (8.5" x 14")', 'Executive (7.25" x 10.5")', 'A4', 'A3', 'B5', 'Custom...'];
  const breakOptions = ['Insert Page Break', 'Remove Page Break'];

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean): void => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (isEnter) {
      btn.style.background = '#E8E8E8';
      btn.style.borderColor = '#D1D1D1';
    } else {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'transparent';
    }
  };

  return (
    <div style={groupStyle}>
      <div style={buttonContainerStyle}>
        {/* Margins */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowMarginsDropdown(!showMarginsDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>📐</span>
            <span>Margins</span>
          </button>

          {showMarginsDropdown && (
            <div style={dropdownStyle}>
              {marginPresets.map((margin, index) => (
                <div
                  key={margin}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === marginPresets.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowMarginsDropdown(false);
                    onMarginsChange?.(margin);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {margin}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orientation */}
        <button
          style={buttonStyle}
          onClick={() => onOrientationChange?.('portrait')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Switch between Portrait and Landscape"
        >
          <span style={iconStyle}>📄</span>
          <span>Orientation</span>
        </button>

        {/* Size */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>📏</span>
            <span>Size</span>
          </button>

          {showSizeDropdown && (
            <div style={dropdownStyle}>
              {pageSizes.map((size, index) => (
                <div
                  key={size}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === pageSizes.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowSizeDropdown(false);
                    onSizeChange?.(size);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {size}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Print Area */}
        <button
          style={buttonStyle}
          onClick={() => onPrintAreaSet?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Set Print Area"
        >
          <span style={iconStyle}>🖨️</span>
          <span>Print<br/>Area</span>
        </button>

        {/* Breaks */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowBreaksDropdown(!showBreaksDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>✂️</span>
            <span>Breaks</span>
          </button>

          {showBreaksDropdown && (
            <div style={dropdownStyle}>
              {breakOptions.map((breakOption, index) => (
                <div
                  key={breakOption}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === breakOptions.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowBreaksDropdown(false);
                    onBreaksInsert?.(index === 0 ? 'page' : 'remove');
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {breakOption}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Background */}
        <button
          style={buttonStyle}
          onClick={() => onBackgroundSet?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Set Background"
        >
          <span style={iconStyle}>🖼️</span>
          <span>Background</span>
        </button>

        {/* Print Titles */}
        <button
          style={buttonStyle}
          onClick={() => onPrintTitlesSet?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Set Print Titles"
        >
          <span style={iconStyle}>📌</span>
          <span>Print<br/>Titles</span>
        </button>
      </div>

      <div style={labelStyle}>Page Setup</div>
    </div>
  );
};
