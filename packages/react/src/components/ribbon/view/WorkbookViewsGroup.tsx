/**
 * WorkbookViewsGroup.tsx
 *
 * View Tab - Workbook Views Group
 * Contains: Normal, Page Break Preview, Page Layout, Custom Views
 */

import React, { useState, useCallback } from 'react';
import type { Workbook } from '@cyber-sheet/core';

interface WorkbookViewsGroupProps {
  workbook: Workbook;
  currentView?: 'normal' | 'pageBreak' | 'pageLayout';
  onViewChange?: (view: 'normal' | 'pageBreak' | 'pageLayout') => void;
  onCustomViews?: () => void;
}

export const WorkbookViewsGroup: React.FC<WorkbookViewsGroupProps> = ({
  workbook,
  currentView = 'normal',
  onViewChange,
  onCustomViews,
}) => {
  const [activeView, setActiveView] = useState(currentView);

  const handleViewChange = useCallback((view: 'normal' | 'pageBreak' | 'pageLayout') => {
    setActiveView(view);
    onViewChange?.(view);
    console.log('View changed:', view);
  }, [onViewChange]);

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    border: '1px solid transparent',
    background: isActive ? '#E0E0E0' : 'transparent',
    cursor: 'pointer',
    borderRadius: 2,
    fontSize: 11,
    color: '#333',
    fontFamily: 'Segoe UI, sans-serif',
    minWidth: 60,
    transition: 'background 150ms',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 8px' }}>
      <div style={{ fontSize: 10, color: '#666', marginBottom: 2, fontFamily: 'Segoe UI, sans-serif' }}>
        Workbook Views
      </div>
      
      <div style={{ display: 'flex', gap: 4 }}>
        {/* Normal View */}
        <button
          style={buttonStyle(activeView === 'normal')}
          onClick={() => handleViewChange('normal')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'normal') {
              e.currentTarget.style.background = '#E8E8E8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'normal') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title="Normal View"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/>
            <line x1="4" y1="10" x2="20" y2="10" stroke="#0078D4" strokeWidth="1"/>
            <line x1="10" y1="4" x2="10" y2="20" stroke="#0078D4" strokeWidth="1"/>
          </svg>
          <span>Normal</span>
        </button>

        {/* Page Break Preview */}
        <button
          style={buttonStyle(activeView === 'pageBreak')}
          onClick={() => handleViewChange('pageBreak')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'pageBreak') {
              e.currentTarget.style.background = '#E8E8E8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'pageBreak') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title="Page Break Preview"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" stroke="#0078D4" strokeWidth="2" fill="none"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
            <line x1="12" y1="3" x2="12" y2="21" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Page Break<br/>Preview</span>
        </button>

        {/* Page Layout View */}
        <button
          style={buttonStyle(activeView === 'pageLayout')}
          onClick={() => handleViewChange('pageLayout')}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'pageLayout') {
              e.currentTarget.style.background = '#E8E8E8';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (activeView !== 'pageLayout') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title="Page Layout View"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="2" width="16" height="20" stroke="#0078D4" strokeWidth="2" fill="none"/>
            <rect x="6" y="4" width="12" height="14" fill="#E3F2FD"/>
            <line x1="4" y1="18" x2="20" y2="18" stroke="#0078D4" strokeWidth="1"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Page<br/>Layout</span>
        </button>

        {/* Custom Views */}
        <button
          style={buttonStyle(false)}
          onClick={() => {
            onCustomViews?.();
            console.log('Custom Views dialog');
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#E8E8E8';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Custom Views"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="13" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="3" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <rect x="13" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
          </svg>
          <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.2 }}>Custom<br/>Views</span>
        </button>
      </div>
    </div>
  );
};
