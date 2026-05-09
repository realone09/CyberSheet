/**
 * SparklinesGroup.tsx
 *
 * Insert Tab - Sparklines Group
 * Contains: Line, Column, Win/Loss sparklines
 */

import React from 'react';

export interface SparklinesGroupProps {
  onInsertSparkline?: (sparklineType: 'line' | 'column' | 'winLoss') => void;
}

export const SparklinesGroup: React.FC<SparklinesGroupProps> = ({
  onInsertSparkline,
}) => {
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
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
        <button
          style={buttonStyle}
          onClick={() => onInsertSparkline?.('line')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Line Sparkline"
        >
          <span style={iconStyle}>╱╲</span>
          <span>Line</span>
        </button>

        <button
          style={buttonStyle}
          onClick={() => onInsertSparkline?.('column')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Column Sparkline"
        >
          <span style={iconStyle}>▁▃▅</span>
          <span>Column</span>
        </button>

        <button
          style={buttonStyle}
          onClick={() => onInsertSparkline?.('winLoss')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          title="Win/Loss Sparkline"
        >
          <span style={iconStyle}>▪▴▪</span>
          <span>Win/Loss</span>
        </button>
      </div>

      <div style={labelStyle}>Sparklines</div>
    </div>
  );
};
