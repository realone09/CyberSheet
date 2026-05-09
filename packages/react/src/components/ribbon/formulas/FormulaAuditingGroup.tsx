/**
 * FormulaAuditingGroup.tsx
 *
 * Formulas Tab - Formula Auditing Group
 * Contains: Trace Precedents, Trace Dependents, Remove Arrows, Show Formulas,
 * Error Checking, Evaluate Formula, Watch Window
 */

import React, { useState } from 'react';

export interface FormulaAuditingGroupProps {
  onTracePrecedents?: () => void;
  onTraceDependents?: () => void;
  onRemoveArrows?: (type: 'precedents' | 'dependents' | 'all') => void;
  onShowFormulas?: (show: boolean) => void;
  onErrorChecking?: () => void;
  onTraceError?: () => void;
  onCircularReferences?: () => void;
  onEvaluateFormula?: () => void;
  onWatchWindow?: () => void;
  showFormulas?: boolean;
}

export const FormulaAuditingGroup: React.FC<FormulaAuditingGroupProps> = ({
  onTracePrecedents,
  onTraceDependents,
  onRemoveArrows,
  onShowFormulas,
  onErrorChecking,
  onTraceError,
  onCircularReferences,
  onEvaluateFormula,
  onWatchWindow,
  showFormulas = false,
}) => {
  const [showRemoveArrowsDropdown, setShowRemoveArrowsDropdown] = useState(false);
  const [showErrorCheckingDropdown, setShowErrorCheckingDropdown] = useState(false);

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

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#E8F4FD',
    borderColor: '#0078D4',
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
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  const removeArrowsOptions = [
    { label: 'Remove Precedent Arrows', value: 'precedents' as const },
    { label: 'Remove Dependent Arrows', value: 'dependents' as const },
    { label: 'Remove All Arrows', value: 'all' as const },
  ];

  const errorCheckingOptions = [
    { label: 'Error Checking...', value: 'checking' },
    { label: 'Trace Error', value: 'trace' },
    { label: 'Circular References', value: 'circular' },
  ];

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean): void => {
    const btn = e.currentTarget as HTMLButtonElement;
    const isActive = btn.style.background === 'rgb(232, 244, 253)' || btn.style.background === '#E8F4FD';
    
    if (!isActive) {
      if (isEnter) {
        btn.style.background = '#E8E8E8';
        btn.style.borderColor = '#D1D1D1';
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'transparent';
      }
    }
  };

  return (
    <div style={groupStyle}>
      <div style={buttonContainerStyle}>
        {/* Trace Precedents */}
        <button
          style={buttonStyle}
          onClick={() => onTracePrecedents?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Trace Precedents"
        >
          <span style={iconStyle}>⬅️</span>
          <span>Trace<br/>Precedents</span>
        </button>

        {/* Trace Dependents */}
        <button
          style={buttonStyle}
          onClick={() => onTraceDependents?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Trace Dependents"
        >
          <span style={iconStyle}>➡️</span>
          <span>Trace<br/>Dependents</span>
        </button>

        {/* Remove Arrows - Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowRemoveArrowsDropdown(!showRemoveArrowsDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
            title="Remove Arrows"
          >
            <span style={iconStyle}>❌</span>
            <span>Remove<br/>Arrows ▾</span>
          </button>

          {showRemoveArrowsDropdown && (
            <div style={dropdownStyle}>
              {removeArrowsOptions.map((option, index) => (
                <div
                  key={option.value}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === removeArrowsOptions.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowRemoveArrowsDropdown(false);
                    onRemoveArrows?.(option.value);
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

        {/* Show Formulas - Toggle */}
        <button
          style={showFormulas ? activeButtonStyle : buttonStyle}
          onClick={() => onShowFormulas?.(!showFormulas)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Show Formulas (Ctrl+`)"
        >
          <span style={iconStyle}>𝑓ₓ</span>
          <span>Show<br/>Formulas</span>
        </button>

        {/* Error Checking - Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => setShowErrorCheckingDropdown(!showErrorCheckingDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
            title="Error Checking"
          >
            <span style={iconStyle}>⚠️</span>
            <span>Error<br/>Checking ▾</span>
          </button>

          {showErrorCheckingDropdown && (
            <div style={dropdownStyle}>
              {errorCheckingOptions.map((option, index) => (
                <div
                  key={option.value}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === errorCheckingOptions.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowErrorCheckingDropdown(false);
                    if (option.value === 'checking') {
                      onErrorChecking?.();
                    } else if (option.value === 'trace') {
                      onTraceError?.();
                    } else {
                      onCircularReferences?.();
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

        {/* Evaluate Formula */}
        <button
          style={buttonStyle}
          onClick={() => onEvaluateFormula?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Evaluate Formula"
        >
          <span style={iconStyle}>🔬</span>
          <span>Evaluate<br/>Formula</span>
        </button>

        {/* Watch Window */}
        <button
          style={buttonStyle}
          onClick={() => onWatchWindow?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Watch Window"
        >
          <span style={iconStyle}>👁️</span>
          <span>Watch<br/>Window</span>
        </button>
      </div>

      <div style={labelStyle}>Formula Auditing</div>
    </div>
  );
};
