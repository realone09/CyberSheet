/**
 * ThemesGroup.tsx
 *
 * Page Layout Tab - Themes Group
 * Contains: Themes, Colors, Fonts, Effects
 */

import React, { useState } from 'react';

export interface ThemesGroupProps {
  onThemeChange?: (theme: string) => void;
  onColorsChange?: (colors: string) => void;
  onFontsChange?: (fonts: string) => void;
  onEffectsChange?: (effects: string) => void;
}

export const ThemesGroup: React.FC<ThemesGroupProps> = ({
  onThemeChange,
  onColorsChange,
  onFontsChange,
  onEffectsChange,
}) => {
  const [showThemesDropdown, setShowThemesDropdown] = useState(false);
  const [showColorsDropdown, setShowColorsDropdown] = useState(false);

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
    maxWidth: 180,
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
    minWidth: 200,
    maxHeight: 300,
    overflow: 'auto',
    marginTop: 2,
    padding: 8,
  };

  const themeItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  const themes = ['Office', 'Facet', 'Integral', 'Ion', 'Retrospect', 'Slice'];
  const colorThemes = ['Office', 'Grayscale', 'Blue Warm', 'Blue', 'Red', 'Green', 'Violet'];

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
        {/* Themes */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowThemesDropdown(!showThemesDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>🎨</span>
            <span>Themes</span>
          </button>

          {showThemesDropdown && (
            <div style={dropdownStyle}>
              {themes.map((theme, index) => (
                <div
                  key={theme}
                  style={{
                    ...themeItemStyle,
                    borderBottom: index === themes.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowThemesDropdown(false);
                    onThemeChange?.(theme);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {theme}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowColorsDropdown(!showColorsDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>🌈</span>
            <span>Colors</span>
          </button>

          {showColorsDropdown && (
            <div style={dropdownStyle}>
              {colorThemes.map((colorTheme, index) => (
                <div
                  key={colorTheme}
                  style={{
                    ...themeItemStyle,
                    borderBottom: index === colorThemes.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowColorsDropdown(false);
                    onColorsChange?.(colorTheme);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {colorTheme}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fonts */}
        <button
          style={buttonStyle}
          onClick={() => onFontsChange?.('default')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>Aa</span>
          <span>Fonts</span>
        </button>

        {/* Effects */}
        <button
          style={buttonStyle}
          onClick={() => onEffectsChange?.('default')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>✨</span>
          <span>Effects</span>
        </button>
      </div>

      <div style={labelStyle}>Themes</div>
    </div>
  );
};
