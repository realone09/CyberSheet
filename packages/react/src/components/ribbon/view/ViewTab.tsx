/**
 * ViewTab.tsx
 *
 * View Tab - Main shell integrating all view groups
 * Groups: Workbook Views | Show | Zoom | Window
 */

import React from 'react';
import type { Workbook, Address } from '@cyber-sheet/core';
import { WorkbookViewsGroup } from './WorkbookViewsGroup';
import { ShowGroup } from './ShowGroup';
import { ZoomGroup } from './ZoomGroup';
import { WindowGroup } from './WindowGroup';

interface ViewTabProps {
  workbook: Workbook;
  selectedCells: Address[];
  currentView?: 'normal' | 'pageBreak' | 'pageLayout';
  currentZoom?: number;
  showRuler?: boolean;
  showGridlines?: boolean;
  showFormulaBar?: boolean;
  showHeadings?: boolean;
  onViewChange?: (view: 'normal' | 'pageBreak' | 'pageLayout') => void;
  onZoomChange?: (zoom: number) => void;
  onToggleShow?: (option: 'ruler' | 'gridlines' | 'formulaBar' | 'headings', value: boolean) => void;
  onZoomToSelection?: () => void;
  onCustomViews?: () => void;
  onCommand?: (command: any) => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({
  workbook,
  selectedCells,
  currentView = 'normal',
  currentZoom = 100,
  showRuler = false,
  showGridlines = true,
  showFormulaBar = true,
  showHeadings = true,
  onViewChange,
  onZoomChange,
  onToggleShow,
  onZoomToSelection,
  onCustomViews,
  onCommand,
}) => {
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
      {/* Workbook Views Group */}
      <WorkbookViewsGroup
        workbook={workbook}
        currentView={currentView}
        onViewChange={onViewChange}
        onCustomViews={onCustomViews}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Show Group */}
      <ShowGroup
        workbook={workbook}
        showRuler={showRuler}
        showGridlines={showGridlines}
        showFormulaBar={showFormulaBar}
        showHeadings={showHeadings}
        onToggle={onToggleShow}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Zoom Group */}
      <ZoomGroup
        workbook={workbook}
        currentZoom={currentZoom}
        onZoomChange={onZoomChange}
        onZoomToSelection={onZoomToSelection}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Window Group */}
      <WindowGroup
        workbook={workbook}
        selectedCells={selectedCells}
        onCommand={onCommand}
      />
    </div>
  );
};
