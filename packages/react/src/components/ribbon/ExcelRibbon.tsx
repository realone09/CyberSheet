/**
 * ExcelRibbon.tsx
 *
 * Complete Excel 365-style Ribbon Bar
 * - Tab bar: Home, Insert, Page Layout, Formulas, Data, Review, View
 * - Home tab: Clipboard | Font | Alignment | Number | Styles | Cells | Editing
 * - Exact Excel 365 color tokens and microinteraction specs
 * - Self-contained service instantiation (FormattingController, ClipboardService)
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  FormattingController,
  ClipboardService,
} from '@cyber-sheet/core';
import type {
  Address,
  Worksheet,
  SelectionStyleSummary,
} from '@cyber-sheet/core';

import { ClipboardGroup } from './ClipboardGroup';
import { FontGroup } from './FontGroup';
import { AlignmentGroupV2 } from './AlignmentGroupV2';
import { NumberFormatGroup } from './NumberFormatGroup';
import { StylesGroup } from './StylesGroup';
import { CellsGroup } from './CellsGroup';
import { EditingGroup } from './EditingGroup';
import './ribbon.css';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CommandManager {
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  execute(command: any): void;
}

export interface ExcelRibbonProps {
  worksheet?: Worksheet;
  workbook?: any;
  commandManager?: CommandManager;
  selectedCell?: Address;
  selectedCells?: Address[];
  onFileClick?: () => void;
  onStructureChange?: () => void;
  onStyleChange?: () => void;
}

type RibbonTab = 'home' | 'insert' | 'pageLayout' | 'formulas' | 'data' | 'review' | 'view';

const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
  { id: 'home',       label: 'Home' },
  { id: 'insert',     label: 'Insert' },
  { id: 'pageLayout', label: 'Page Layout' },
  { id: 'formulas',   label: 'Formulas' },
  { id: 'data',       label: 'Data' },
  { id: 'review',     label: 'Review' },
  { id: 'view',       label: 'View' },
];

// ─── Empty style summary fallback ─────────────────────────────────────────

const EMPTY_STYLE: SelectionStyleSummary = {
  fontFamily: { value: 'Calibri', isMixed: false },
  fontSize:   { value: 11,        isMixed: false },
  bold:       { value: false,     isMixed: false },
  italic:     { value: false,     isMixed: false },
  underline:  { value: false,     isMixed: false },
  strikethrough: { value: false,  isMixed: false },
  color:      { value: '#000000', isMixed: false },
  align:      { value: 'left',    isMixed: false },
  valign:     { value: 'bottom',  isMixed: false },
  wrap:       { value: false,     isMixed: false },
  fill:       { value: undefined, isMixed: false },
  border:     { value: undefined, isMixed: false },
  numberFormat: { value: 'General', isMixed: false },
};

// ─── Noop CommandManager ───────────────────────────────────────────────────

const NOOP_COMMAND_MANAGER: CommandManager = {
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,
  execute: () => {},
};

// ─── Component ─────────────────────────────────────────────────────────────

export const ExcelRibbon: React.FC<ExcelRibbonProps> = ({
  worksheet,
  workbook,
  commandManager = NOOP_COMMAND_MANAGER,
  selectedCell = { row: 1, col: 1 },
  selectedCells,
  onFileClick,
  onStructureChange,
  onStyleChange,
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');

  // Derive selected cells list
  const cells = useMemo(
    () => (selectedCells || [selectedCell]) as Address[],
    [selectedCells, selectedCell]
  );

  // ── Services ──────────────────────────────────────────────────────────────

  const formattingController = useMemo(() => {
    if (!worksheet) return null;
    return new FormattingController(worksheet, commandManager as any) as FormattingController | null;
  }, [worksheet, commandManager]);

  const clipboardService = useMemo(() => new ClipboardService(), []);

  // ── Style summary ─────────────────────────────────────────────────────────

  const selectionStyle = useMemo(() => {
    if (!worksheet || cells.length === 0) return EMPTY_STYLE;
    try {
      const cell = worksheet.getCell(selectedCell);
      const style = (cell as any)?.style;
      if (!style) return EMPTY_STYLE;
      return {
        fontFamily:   { value: style.font?.name       ?? 'Calibri',   isMixed: false },
        fontSize:     { value: style.font?.size        ?? 11,          isMixed: false },
        bold:         { value: style.font?.bold        ?? false,       isMixed: false },
        italic:       { value: style.font?.italic      ?? false,       isMixed: false },
        underline:    { value: style.font?.underline   ?? false,       isMixed: false },
        strikethrough:{ value: style.font?.strikethrough ?? false,     isMixed: false },
        color:        { value: style.font?.color       ?? '#000000',   isMixed: false },
        align:        { value: style.alignment?.horizontal ?? 'left',  isMixed: false },
        valign:       { value: style.alignment?.vertical   ?? 'bottom',isMixed: false },
        wrap:         { value: style.alignment?.wrapText   ?? false,   isMixed: false },
        fill:         { value: style.fill,                             isMixed: false },
        border:       { value: style.border,                           isMixed: false },
        numberFormat: { value: style.numFmt ?? 'General',             isMixed: false },
      } as SelectionStyleSummary;
    } catch {
      return EMPTY_STYLE;
    }
  }, [worksheet, selectedCell, cells]);

  // ── Style/Structure change callbacks ──────────────────────────────────────
  const handleStyleChange  = useCallback(() => onStyleChange?.(),    [onStyleChange]);
  const handleStructureCh  = useCallback(() => onStructureChange?.(), [onStructureChange]);

  // ── Styles ────────────────────────────────────────────────────────────────

  const ribbonContainerStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderBottom: '1px solid #D9D9D9',
    userSelect: 'none',
    flexShrink: 0,
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    background: '#F0F0F0',
    borderBottom: '1px solid #D9D9D9',
    height: 30,
    paddingLeft: 4,
    gap: 0,
  };

  const getTabStyle = (tab: RibbonTab): React.CSSProperties => ({
    padding: '0 14px',
    border: 'none',
    background: activeTab === tab ? '#FFFFFF' : 'transparent',
    color: activeTab === tab ? '#000000' : '#444444',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    fontWeight: activeTab === tab ? 600 : 400,
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '2px solid #0078D4' : '2px solid transparent',
    borderTop: '2px solid transparent',
    borderLeft: 'none',
    borderRight: 'none',
    whiteSpace: 'nowrap',
    transition: 'background 80ms, color 80ms',
    marginBottom: -1,
    flexShrink: 0,
  });

  const contentAreaStyle: React.CSSProperties = {
    background: '#F0F0F0',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    minHeight: 66,
    overflowX: 'auto',
  };

  const placeholderStyle: React.CSSProperties = {
    padding: '12px 24px',
    color: '#888',
    fontSize: 12,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    fontStyle: 'italic',
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={ribbonContainerStyle}>
      {/* ── Tab Bar ── */}
      <div style={tabBarStyle}>
        {/* File button - green, opens backstage */}
        {onFileClick && (
          <button
            style={{
              padding: '0 14px',
              border: 'none',
              background: '#217346',
              color: '#FFFFFF',
              fontSize: 11,
              fontFamily: 'Segoe UI, Arial, sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: '2px solid transparent',
              borderTop: '2px solid transparent',
              flexShrink: 0,
              marginBottom: -1,
            }}
            onClick={onFileClick}
          >
            File
          </button>
        )}

        {RIBBON_TABS.map(({ id, label }) => (
          <button
            key={id}
            style={getTabStyle(id)}
            onClick={() => setActiveTab(id)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeTab !== id) {
                (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeTab !== id) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {activeTab === 'home' ? (
        <div style={contentAreaStyle}>
          {/* 1. Clipboard */}
          {formattingController && worksheet ? (
            <ClipboardGroup
              worksheet={worksheet}
              clipboardService={clipboardService}
              formattingController={formattingController}
              commandManager={commandManager as any}
              selectedCells={cells}
              onCut={handleStyleChange}
              onCopy={handleStyleChange}
              onPaste={handleStyleChange}
            />
          ) : (
            <ClipboardPlaceholder />
          )}

          <GroupDivider />

          {/* 2. Font */}
          {formattingController ? (
            <FontGroup
              formattingController={formattingController}
              selectedCells={cells}
              selectionStyle={selectionStyle}
              onStyleChange={handleStyleChange}
            />
          ) : (
            <FontPlaceholder />
          )}

          <GroupDivider />

          {/* 3. Alignment */}
          {formattingController ? (
            <AlignmentGroupV2
              formattingController={formattingController}
              selectedCells={cells}
              selectionStyle={selectionStyle}
              onStyleChange={handleStyleChange}
            />
          ) : null}

          <GroupDivider />

          {/* 4. Number */}
          {formattingController ? (
            <NumberFormatGroup
              formattingController={formattingController}
              selectedCells={cells}
              selectionStyle={selectionStyle}
              onStyleChange={handleStyleChange}
            />
          ) : null}

          <GroupDivider />

          {/* 5. Styles */}
          {formattingController ? (
            <StylesGroup
              formattingController={formattingController}
              selectedCells={cells}
              onStyleChange={handleStyleChange}
            />
          ) : null}

          <GroupDivider />

          {/* 6. Cells */}
          {formattingController ? (
            <CellsGroup
              formattingController={formattingController}
              selectedCells={cells}
              onStructureChange={handleStructureCh}
            />
          ) : null}

          <GroupDivider />

          {/* 7. Editing */}
          {formattingController ? (
            <EditingGroup
              formattingController={formattingController}
              selectedCells={cells}
              onEditOperation={(op, params) => {
                console.log('Edit operation:', op, params);
                handleStyleChange();
              }}
            />
          ) : null}
        </div>
      ) : (
        <div style={placeholderStyle}>
          {RIBBON_TABS.find(t => t.id === activeTab)?.label} tab — coming soon
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────

const GroupDivider: React.FC = () => (
  <div style={{
    width: 1,
    background: '#D9D9D9',
    margin: '4px 6px',
    alignSelf: 'stretch',
    flexShrink: 0,
  }} />
);

/** Lightweight clipboard placeholder when core services aren't available */
const ClipboardPlaceholder: React.FC = () => {
  const btnStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 2, padding: '4px 8px', border: '1px solid transparent',
    background: 'transparent', cursor: 'pointer', borderRadius: 2,
    fontSize: 10, color: '#333', fontFamily: 'Segoe UI, sans-serif',
    minWidth: 44,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 4px' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        <button style={{ ...btnStyle, minWidth: 56, fontSize: 11 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span>Paste</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 1 }}>
        {['✂️ Cut', '📄 Copy', '🖌 Format'].map(label => (
          <button key={label} style={btnStyle}>
            <span style={{ fontSize: 13 }}>{label.split(' ')[0]}</span>
            <span>{label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#888', textAlign: 'center', marginTop: 1 }}>Clipboard</div>
    </div>
  );
};

/** Lightweight font placeholder */
const FontPlaceholder: React.FC = () => {
  const selStyle: React.CSSProperties = {
    height: 22, border: '1px solid #BFBFBF', background: '#fff',
    fontSize: 11, padding: '0 4px', borderRadius: 2, cursor: 'pointer',
    fontFamily: 'Segoe UI, sans-serif',
  };
  const btnStyle: React.CSSProperties = {
    width: 24, height: 22, border: '1px solid transparent',
    background: 'transparent', cursor: 'pointer', borderRadius: 2,
    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 4px' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        <select style={{ ...selStyle, width: 110 }}>
          <option>Calibri</option>
        </select>
        <select style={{ ...selStyle, width: 42 }}>
          <option>11</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 1 }}>
        {[
          { label: <b>B</b>, title: 'Bold' },
          { label: <i>I</i>, title: 'Italic' },
          { label: <u>U</u>, title: 'Underline' },
          { label: '🎨', title: 'Font Color' },
          { label: '🪣', title: 'Fill Color' },
        ].map(({ label, title }) => (
          <button key={title} title={title} style={btnStyle}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#888', textAlign: 'center', marginTop: 1 }}>Font</div>
    </div>
  );
};

export default ExcelRibbon;
