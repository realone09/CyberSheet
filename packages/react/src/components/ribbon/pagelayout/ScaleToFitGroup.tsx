/**
 * ScaleToFitGroup.tsx
 *
 * Page Layout Tab - Scale to Fit Group
 * Contains: Width, Height, Scale numeric inputs
 */

import React from 'react';

export interface ScaleToFitGroupProps {
  onWidthChange?: (width: number | 'auto') => void;
  onHeightChange?: (height: number | 'auto') => void;
  onScaleChange?: (scale: number) => void;
}

export const ScaleToFitGroup: React.FC<ScaleToFitGroupProps> = ({
  onWidthChange,
  onHeightChange,
  onScaleChange,
}) => {
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
  };

  const fieldContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const fieldRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333',
    minWidth: 40,
  };

  const inputStyle: React.CSSProperties = {
    width: 60,
    padding: '2px 6px',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    border: '1px solid #CCC',
    borderRadius: 2,
    textAlign: 'right',
  };

  const unitStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#888',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  return (
    <div style={groupStyle}>
      <div style={fieldContainerStyle}>
        {/* Width */}
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Width:</span>
          <input
            type="text"
            style={inputStyle}
            defaultValue="Automatic"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value.toLowerCase();
              if (val === 'automatic' || val === 'auto' || val === '') {
                onWidthChange?.('auto');
              } else {
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 1 && num <= 999) {
                  onWidthChange?.(num);
                }
              }
            }}
          />
          <span style={unitStyle}>page(s)</span>
        </div>

        {/* Height */}
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Height:</span>
          <input
            type="text"
            style={inputStyle}
            defaultValue="Automatic"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value.toLowerCase();
              if (val === 'automatic' || val === 'auto' || val === '') {
                onHeightChange?.('auto');
              } else {
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 1 && num <= 999) {
                  onHeightChange?.(num);
                }
              }
            }}
          />
          <span style={unitStyle}>page(s)</span>
        </div>

        {/* Scale */}
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Scale:</span>
          <input
            type="text"
            style={inputStyle}
            defaultValue="100"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const num = parseInt(e.target.value, 10);
              if (!isNaN(num) && num >= 10 && num <= 400) {
                onScaleChange?.(num);
              }
            }}
          />
          <span style={unitStyle}>%</span>
        </div>
      </div>

      <div style={labelStyle}>Scale to Fit</div>
    </div>
  );
};
