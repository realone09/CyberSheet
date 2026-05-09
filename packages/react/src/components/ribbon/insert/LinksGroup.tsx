/**
 * LinksGroup.tsx
 *
 * Insert Tab - Links Group
 * Contains: Hyperlink (Ctrl+K)
 */

import React from 'react';

export interface LinksGroupProps {
  onInsertHyperlink?: () => void;
}

export const LinksGroup: React.FC<LinksGroupProps> = ({
  onInsertHyperlink,
}) => {
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
  };

  const buttonStyle: React.CSSProperties = {
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

  return (
    <div style={groupStyle}>
      <button
        style={buttonStyle}
        onClick={() => onInsertHyperlink?.()}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D1D1';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
        }}
        title="Insert Hyperlink (Ctrl+K)"
      >
        <span style={iconStyle}>🔗</span>
        <span>Link</span>
      </button>

      <div style={labelStyle}>Links</div>
    </div>
  );
};
