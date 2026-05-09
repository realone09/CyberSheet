/**
 * DefinedNamesGroup.tsx
 *
 * Formulas Tab - Defined Names Group
 * Contains: Name Manager, Define Name, Use in Formula, Create from Selection
 */

import React, { useState } from 'react';

export interface DefinedNamesGroupProps {
  onNameManager?: () => void;
  onDefineName?: () => void;
  onApplyNames?: () => void;
  onUseInFormula?: (name: string) => void;
  onCreateFromSelection?: () => void;
  definedNames?: string[]; // List of existing defined names
}

export const DefinedNamesGroup: React.FC<DefinedNamesGroupProps> = ({
  onNameManager,
  onDefineName,
  onApplyNames,
  onUseInFormula,
  onCreateFromSelection,
  definedNames = ['SalesData', 'TaxRate', 'Quarter1', 'Quarter2'],
}) => {
  const [showDefineNameDropdown, setShowDefineNameDropdown] = useState(false);
  const [showUseInFormulaDropdown, setShowUseInFormulaDropdown] = useState(false);

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
    minWidth: 180,
    maxHeight: 300,
    overflowY: 'auto',
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  const defineNameOptions = [
    { label: 'Define Name...', value: 'define' },
    { label: 'Apply Names...', value: 'apply' },
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
        {/* Name Manager */}
        <button
          style={buttonStyle}
          onClick={() => onNameManager?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Name Manager"
        >
          <span style={iconStyle}>🏷️</span>
          <span>Name<br/>Manager</span>
        </button>

        {/* Define Name - Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowDefineNameDropdown(!showDefineNameDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
            title="Define Name"
          >
            <span style={iconStyle}>🏷️</span>
            <span>Define<br/>Name ▾</span>
          </button>

          {showDefineNameDropdown && (
            <div style={dropdownStyle}>
              {defineNameOptions.map((option, index) => (
                <div
                  key={option.value}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === defineNameOptions.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowDefineNameDropdown(false);
                    if (option.value === 'define') {
                      onDefineName?.();
                    } else {
                      onApplyNames?.();
                    }
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Use in Formula - Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowUseInFormulaDropdown(!showUseInFormulaDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
            title="Use in Formula"
          >
            <span style={iconStyle}>⬇️</span>
            <span>Use in<br/>Formula ▾</span>
          </button>

          {showUseInFormulaDropdown && (
            <div style={dropdownStyle}>
              {definedNames.length === 0 ? (
                <div style={{ ...dropdownItemStyle, color: '#888', cursor: 'default' }}>
                  No defined names
                </div>
              ) : (
                definedNames.map((name, index) => (
                  <div
                    key={name}
                    style={{
                      ...dropdownItemStyle,
                      borderBottom: index === definedNames.length - 1 ? 'none' : '1px solid #F0F0F0',
                    }}
                    onClick={() => {
                      setShowUseInFormulaDropdown(false);
                      onUseInFormula?.(name);
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                    {name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Create from Selection */}
        <button
          style={buttonStyle}
          onClick={() => onCreateFromSelection?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Create from Selection"
        >
          <span style={iconStyle}>🏷️</span>
          <span>Create from<br/>Selection</span>
        </button>
      </div>

      <div style={labelStyle}>Defined Names</div>
    </div>
  );
};
