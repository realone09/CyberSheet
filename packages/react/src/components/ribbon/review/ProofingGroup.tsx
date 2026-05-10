/**
 * ProofingGroup.tsx
 *
 * Review Tab - Proofing Group
 * Contains: Spelling, Thesaurus, Research
 */

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
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginBottom: 4 }}>
          {/* ABC with checkmark icon */}
          <text
            x="2"
            y="14"
            fill="#0078D4"
            fontSize="12"
            fontWeight="bold"
            fontFamily="Segoe UI"
          >
            ABC
          </text>
          <path
            d="M14 4 L16 6 L19 3"
            stroke="#107C10"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginBottom: 4 }}>
          {/* Book icon */}
          <rect x="4" y="3" width="12" height="14" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" />
          <line x1="10" y1="3" x2="10" y2="17" stroke="#0078D4" strokeWidth="1.5" />
          <line x1="7" y1="7" x2="8" y2="7" stroke="#0078D4" strokeWidth="1" />
          <line x1="7" y1="10" x2="8" y2="10" stroke="#0078D4" strokeWidth="1" />
          <line x1="12" y1="7" x2="13" y2="7" stroke="#0078D4" strokeWidth="1" />
          <line x1="12" y1="10" x2="13" y2="10" stroke="#0078D4" strokeWidth="1" />
        </svg>
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
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginBottom: 4 }}>
          {/* Magnifying glass over document icon */}
          <rect x="3" y="2" width="10" height="13" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" />
          <line x1="5" y1="5" x2="11" y2="5" stroke="#0078D4" strokeWidth="1" />
          <line x1="5" y1="8" x2="9" y2="8" stroke="#0078D4" strokeWidth="1" />
          <circle cx="13" cy="11" r="3" fill="none" stroke="#0078D4" strokeWidth="1.5" />
          <line x1="15" y1="13" x2="17.5" y2="15.5" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
