/**
 * ProofingGroup.tsx
 *
 * Review Tab - Proofing Group
 * Contains: Spelling, Thesaurus, Research
 */

import { ProofingGroupIcon3, ProofingGroupIcon2, ProofingGroupIcon1 } from '@cyber-sheet/icons/react';
import React from 'react';
import type { Workbook } from '@cyber-sheet/core';

interface ProofingGroupProps {
  workbook: Workbook;
  onCommand?: (command: any) => void;
}

export const ProofingGroup: React.FC<ProofingGroupProps> = ({
  workbook,
  onCommand,
}) => {
  const handleSpelling = () => {
    console.log('Spelling check (F7)');
    onCommand?.({ type: 'checkSpelling' });
  };

  const handleThesaurus = () => {
    console.log('Thesaurus (Shift+F7)');
    onCommand?.({ type: 'openThesaurus' });
  };

  const handleResearch = () => {
    console.log('Research pane');
    onCommand?.({ type: 'openResearch' });
  };

  return (
    <div style={groupStyle}>
      {/* Spelling Button */}
      <button
        onClick={handleSpelling}
        style={buttonStyle}
        title="Spelling (F7)"
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = '#E8E8E8';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ProofingGroupIcon1 />
        <span style={labelStyle}>Spelling</span>
      </button>

      {/* Thesaurus Button */}
      <button
        onClick={handleThesaurus}
        style={buttonStyle}
        title="Thesaurus (Shift+F7)"
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = '#E8E8E8';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ProofingGroupIcon2 />
        <span style={labelStyle}>Thesaurus</span>
      </button>

      {/* Research Button */}
      <button
        onClick={handleResearch}
        style={buttonStyle}
        title="Research"
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = '#E8E8E8';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ProofingGroupIcon3 />
        <span style={labelStyle}>Research</span>
      </button>

      {/* Group Label */}
      <div style={groupLabelStyle}>Proofing</div>
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
  minWidth: 60,
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
