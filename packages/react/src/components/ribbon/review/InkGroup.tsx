/**
 * InkGroup.tsx
 *
 * Review Tab - Ink Group
 * Contains: Hide Ink button (placeholder for digital pen annotations)
 */

import { InkGroupIcon1 } from '@cyber-sheet/icons/react';
import React from 'react';
import type { Workbook } from '@cyber-sheet/core';

interface InkGroupProps {
  workbook: Workbook;
  onCommand?: (command: any) => void;
}

export const InkGroup: React.FC<InkGroupProps> = ({
  workbook,
  onCommand,
}) => {
  const handleHideInk = () => {
    console.log('Hide Ink annotations');
    onCommand?.({ type: 'hideInk' });
  };

  return (
    <div style={groupStyle}>
      {/* Hide Ink Button */}
      <button
        onClick={handleHideInk}
        style={buttonStyle}
        title="Hide Ink"
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = '#E8E8E8';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <InkGroupIcon1 />
        <span style={labelStyle}>Hide Ink</span>
      </button>

      {/* Group Label */}
      <div style={groupLabelStyle}>Ink</div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────

const groupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  position: 'relative',
  paddingBottom: 18,
};

const buttonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  padding: '4px 8px',
  border: '1px solid transparent',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: 2,
  fontSize: 10,
  color: '#333',
  fontFamily: 'Segoe UI, sans-serif',
  minWidth: 50,
  height: 56,
  transition: 'background 0.1s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#333',
  textAlign: 'center',
  lineHeight: '12px',
};

const groupLabelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 2,
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 10,
  color: '#666',
  fontFamily: 'Segoe UI, sans-serif',
  pointerEvents: 'none',
};
