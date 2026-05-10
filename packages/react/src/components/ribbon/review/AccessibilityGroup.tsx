/**
 * AccessibilityGroup.tsx
 *
 * Review Tab - Accessibility Group
 * Contains: Check Accessibility dropdown
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Workbook } from '@cyber-sheet/core';

interface AccessibilityGroupProps {
  workbook: Workbook;
  onCommand?: (command: any) => void;
}

export const AccessibilityGroup: React.FC<AccessibilityGroupProps> = ({
  workbook,
  onCommand,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleCheckAccessibility = () => {
    console.log('Check Accessibility');
    onCommand?.({ type: 'checkAccessibility' });
    setShowDropdown(false);
  };

  const handleKeepCheckerOpen = () => {
    console.log('Keep Accessibility Checker open while I work');
    onCommand?.({ type: 'keepAccessibilityCheckerOpen', enabled: true });
    setShowDropdown(false);
  };

  return (
    <div style={groupStyle} ref={dropdownRef}>
      {/* Check Accessibility Button with Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={buttonStyle}
          title="Check Accessibility"
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginBottom: 4 }}>
            {/* Accessibility person icon with checkmark */}
            <circle cx="10" cy="5" r="2" fill="none" stroke="#0078D4" strokeWidth="1.5" />
            <path
              d="M6 9 L10 7 L14 9"
              stroke="#0078D4"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <line x1="10" y1="7" x2="10" y2="12" stroke="#0078D4" strokeWidth="1.5" />
            <path
              d="M7 12 L10 12 L13 12"
              stroke="#0078D4"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <line x1="8" y1="12" x2="7" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="12" x2="13" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
            {/* Checkmark */}
            <path
              d="M14 3 L15.5 4.5 L18 2"
              stroke="#107C10"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={labelStyle}>Check</span>
          <span style={labelStyle}>Accessibility</span>
          <svg width="8" height="5" viewBox="0 0 8 5" style={{ marginTop: 2 }}>
            <path d="M0 0 L4 4 L8 0" fill="#333" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div style={dropdownMenuStyle}>
            <button onClick={handleCheckAccessibility} style={menuItemStyle}>
              Check Accessibility
            </button>
            <button onClick={handleKeepCheckerOpen} style={menuItemStyle}>
              Keep Accessibility Checker open while I work
            </button>
          </div>
        )}
      </div>

      {/* Group Label */}
      <div style={groupLabelStyle}>Accessibility</div>
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
  gap: 0,
  padding: '4px 8px',
  border: '1px solid transparent',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: 2,
  fontSize: 10,
  color: '#333',
  fontFamily: 'Segoe UI, sans-serif',
  minWidth: 70,
  height: 56,
  transition: 'background 0.1s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#333',
  textAlign: 'center',
  lineHeight: '11px',
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

const dropdownMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  background: '#FFFFFF',
  border: '1px solid #D9D9D9',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  borderRadius: 2,
  zIndex: 1000,
  minWidth: 250,
  padding: '4px 0',
};

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 12,
  color: '#333',
  fontFamily: 'Segoe UI, sans-serif',
};
