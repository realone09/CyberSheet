/**
 * ChangesGroup.tsx
 *
 * Changes and History group for Review tab
 * - Track Changes dropdown (Highlight Changes, Accept/Reject Changes)
 * - Version History button
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Workbook, Address } from '@cyber-sheet/core';

interface ChangesGroupProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const ChangesGroup: React.FC<ChangesGroupProps> = ({ workbook, selectedCells, onCommand }) => {
  const [showTrackChangesDropdown, setShowTrackChangesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTrackChangesDropdown(false);
      }
    };

    if (showTrackChangesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTrackChangesDropdown]);

  const handleHighlightChanges = () => {
    setShowTrackChangesDropdown(false);
    onCommand?.({ type: 'highlightChanges' });
    console.log('Highlight Changes dialog');
  };

  const handleAcceptRejectChanges = () => {
    setShowTrackChangesDropdown(false);
    onCommand?.({ type: 'acceptRejectChanges' });
    console.log('Accept/Reject Changes dialog');
  };

  const handleToggleTrackChanges = () => {
    setShowTrackChangesDropdown(false);
    const trackingEnabled = (workbook as any).trackChangesEnabled || false;
    onCommand?.({ type: 'trackChanges', enabled: !trackingEnabled });
    console.log('Track Changes:', !trackingEnabled ? 'enabled' : 'disabled');
  };

  const handleVersionHistory = () => {
    onCommand?.({ type: 'versionHistory' });
    console.log('Version History panel');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px', position: 'relative' }}>
      {/* Track Changes Dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setShowTrackChangesDropdown(!showTrackChangesDropdown)}
          title="Track Changes"
          style={{
            width: 56,
            height: 48,
            border: 'none',
            background: showTrackChangesDropdown ? '#E8E8E8' : '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontFamily: 'Segoe UI, sans-serif',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (!showTrackChangesDropdown) e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (!showTrackChangesDropdown) e.currentTarget.style.background = '#F0F0F0';
          }}
        >
          {/* Track Changes icon: Document with pencil */}
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
            {/* Document */}
            <rect x="4" y="2" width="12" height="16" fill="none" stroke="#0078D4" strokeWidth="1.5" rx="1"/>
            <line x1="7" y1="6" x2="13" y2="6" stroke="#0078D4" strokeWidth="1"/>
            <line x1="7" y1="9" x2="13" y2="9" stroke="#0078D4" strokeWidth="1"/>
            <line x1="7" y1="12" x2="11" y2="12" stroke="#0078D4" strokeWidth="1"/>
            {/* Pencil overlay */}
            <path d="M15 10 L18 7 L20 9 L17 12 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/>
            <path d="M15 10 L14 13 L17 12 Z" fill="#FFE699"/>
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 8 }}>
            <span style={{ textAlign: 'center', lineHeight: 1.2 }}>Track<br/>Changes</span>
            <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
              <path d="M0,0 L3,3 L6,0" stroke="#333" strokeWidth="1" fill="none"/>
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showTrackChangesDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 2,
              background: '#FFFFFF',
              border: '1px solid #D9D9D9',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              borderRadius: 2,
              zIndex: 1000,
              minWidth: 200,
            }}
          >
            {/* Toggle Track Changes */}
            <div
              onClick={handleToggleTrackChanges}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Segoe UI, sans-serif',
                background: 'transparent',
                borderBottom: '1px solid #E8E8E8',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'transparent'}
            >
              Track Changes
            </div>

            {/* Highlight Changes */}
            <div
              onClick={handleHighlightChanges}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Segoe UI, sans-serif',
                background: 'transparent',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'transparent'}
            >
              Highlight Changes...
            </div>

            {/* Accept/Reject Changes */}
            <div
              onClick={handleAcceptRejectChanges}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Segoe UI, sans-serif',
                background: 'transparent',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'transparent'}
            >
              Accept/Reject Changes...
            </div>
          </div>
        )}
      </div>

      {/* Version History Button */}
      <button
        onClick={handleVersionHistory}
        title="Version History"
        style={{
          width: 56,
          height: 48,
          border: 'none',
          background: '#F0F0F0',
          cursor: 'pointer',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontFamily: 'Segoe UI, sans-serif',
          marginTop: 4,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E8E8E8'}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
      >
        {/* Version History icon: Clock with arrows */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" fill="none" stroke="#0078D4" strokeWidth="1.5"/>
          <path d="M10 6 L10 10 L13 13" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M3 8 L1 10 L3 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>Version<br/>History</span>
      </button>

      {/* Group Label */}
      <div style={{ fontSize: 10, color: '#666', marginTop: 4, fontFamily: 'Segoe UI, sans-serif' }}>
        Changes
      </div>
    </div>
  );
};
