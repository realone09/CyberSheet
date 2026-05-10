import React from 'react';
import type { Workbook, Address } from '@cyber-sheet/core';
import { GetTransformDataGroup } from './GetTransformDataGroup';
import { SortFilterGroup } from './SortFilterGroup';
import { DataToolsGroup } from './DataToolsGroup';
import { OutlineGroup } from './OutlineGroup';

interface DataTabProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const DataTab: React.FC<DataTabProps> = ({ workbook, selectedCells, onCommand }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        background: '#F0F0F0',
        padding: '8px 12px',
        borderBottom: '1px solid #D9D9D9',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* Get & Transform Data Group */}
      <GetTransformDataGroup workbook={workbook} onCommand={onCommand} />

      {/* Divider */}
      <div style={{ width: 1, height: 48, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Queries & Connections Group (Placeholder - could expand) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px' }}>
        <button
          onClick={() => console.log('Open Workbook Links')}
          title="Workbook Links"
          style={{
            width: 56,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M6 8 L8 6 C9 5 11 5 12 6 L14 8 M14 8 L12 10 C11 11 9 11 8 10 L6 8" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
            <circle cx="6" cy="8" r="2" fill="#0078D4"/>
            <circle cx="14" cy="8" r="2" fill="#0078D4"/>
          </svg>
          <span style={{ fontSize: 8, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>Workbook<br/>Links</span>
        </button>
        <div style={{ fontSize: 10, color: '#666', marginTop: 2, fontFamily: 'Segoe UI, sans-serif' }}>
          Queries & Connections
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 48, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Sort & Filter Group */}
      <SortFilterGroup workbook={workbook} selectedCells={selectedCells} onCommand={onCommand} />

      {/* Divider */}
      <div style={{ width: 1, height: 48, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Data Tools Group */}
      <DataToolsGroup workbook={workbook} selectedCells={selectedCells} onCommand={onCommand} />

      {/* Divider */}
      <div style={{ width: 1, height: 48, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Outline Group */}
      <OutlineGroup workbook={workbook} selectedCells={selectedCells} onCommand={onCommand} />
    </div>
  );
};
