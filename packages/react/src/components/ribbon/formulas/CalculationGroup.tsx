/**
 * CalculationGroup.tsx
 *
 * Formulas Tab - Calculation Group
 * Contains: Calculation Options, Calculate Now (F9), Calculate Sheet (Shift+F9)
 */

import React, { useState } from 'react';

export interface CalculationGroupProps {
  onCalculationModeChange?: (mode: 'automatic' | 'automaticExceptTables' | 'manual') => void;
  onCalculateNow?: () => void;
  onCalculateSheet?: () => void;
  calculationMode?: 'automatic' | 'automaticExceptTables' | 'manual';
}

export const CalculationGroup: React.FC<CalculationGroupProps> = ({
  onCalculationModeChange,
  onCalculateNow,
  onCalculateSheet,
  calculationMode = 'automatic',
}) => {
  const [showCalculationOptionsDropdown, setShowCalculationOptionsDropdown] = useState(false);

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
    minWidth: 220,
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const checkmarkStyle: React.CSSProperties = {
    width: 16,
    fontSize: 12,
    color: '#0078D4',
  };

  const calculationOptions = [
    { label: 'Automatic', value: 'automatic' as const, description: 'Recalculate after every change' },
    { label: 'Automatic Except Data Tables', value: 'automaticExceptTables' as const, description: 'Recalculate except data tables' },
    { label: 'Manual', value: 'manual' as const, description: 'Recalculate only on F9' },
  ];

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
        {/* Calculation Options - Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowCalculationOptionsDropdown(!showCalculationOptionsDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
            title="Calculation Options"
          >
            <span style={iconStyle}>⚙️</span>
            <span>Calculation<br/>Options ▾</span>
          </button>

          {showCalculationOptionsDropdown && (
            <div style={dropdownStyle}>
              {calculationOptions.map((option, index) => (
                <div
                  key={option.value}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === calculationOptions.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowCalculationOptionsDropdown(false);
                    onCalculationModeChange?.(option.value);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <span style={checkmarkStyle}>
                    {calculationMode === option.value ? '✓' : ' '}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                      {option.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculate Now (F9) */}
        <button
          style={buttonStyle}
          onClick={() => onCalculateNow?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Calculate Now (F9)"
        >
          <span style={iconStyle}>🔄</span>
          <span>Calculate<br/>Now (F9)</span>
        </button>

        {/* Calculate Sheet (Shift+F9) */}
        <button
          style={buttonStyle}
          onClick={() => onCalculateSheet?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Calculate Sheet (Shift+F9)"
        >
          <span style={iconStyle}>📄</span>
          <span>Calculate<br/>Sheet</span>
        </button>
      </div>

      <div style={labelStyle}>Calculation</div>
    </div>
  );
};
