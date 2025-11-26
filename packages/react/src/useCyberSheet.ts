/**
 * useCyberSheet.ts
 * 
 * React hook for Cyber Sheet integration
 */

import * as React from 'react';
import type { Worksheet, FormulaEngine, CollaborationEngine } from '@cyber-sheet/core';
import type { CanvasRenderer } from '@cyber-sheet/renderer-canvas';

export interface UseCyberSheetOptions {
  data?: any[][];
  enableFormulas?: boolean;
  enableCollaboration?: boolean;
  collaborationUrl?: string;
  onCellChange?: (row: number, col: number, value: any) => void;
  onSelectionChange?: (selection: { start: { row: number; col: number }; end: { row: number; col: number } }) => void;
}

export interface UseCyberSheetReturn {
  containerRef: { current: HTMLDivElement | null };
  worksheet: Worksheet | null;
  renderer: CanvasRenderer | null;
  formulaEngine: FormulaEngine | null;
  collaboration: CollaborationEngine | null;
  setCell: (row: number, col: number, value: any) => void;
  getCell: (row: number, col: number) => any;
  refresh: () => void;
}

export function useCyberSheet(options: UseCyberSheetOptions = {}): UseCyberSheetReturn {
  const containerRef = React.useRef(null as HTMLDivElement | null);
  const [worksheet, setWorksheet] = React.useState<Worksheet | null>(null);
  const [renderer, setRenderer] = React.useState<CanvasRenderer | null>(null);
  const [formulaEngine, setFormulaEngine] = React.useState<FormulaEngine | null>(null);
  const [collaboration, setCollaboration] = React.useState<CollaborationEngine | null>(null);

  // Initialize
  React.useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic imports to avoid SSR issues
    import('@cyber-sheet/core').then(({ Workbook, FormulaEngine, CollaborationEngine }) => {
      import('@cyber-sheet/renderer-canvas').then(({ CanvasRenderer }) => {
        const workbook = new Workbook();
        const ws = workbook.addSheet('Sheet1');
        
        // Load initial data
        if (options.data) {
          options.data.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
              ws.setCellValue({ row: rowIndex, col: colIndex }, value);
            });
          });
        }

        const r = new CanvasRenderer(containerRef.current!, ws, {
          debug: false
        });

        setWorksheet(ws);
        setRenderer(r);

        // Enable formulas
        if (options.enableFormulas) {
          const fe = new FormulaEngine();
          setFormulaEngine(fe);
        }

        // Enable collaboration
        if (options.enableCollaboration && options.collaborationUrl) {
          const collab = new CollaborationEngine(ws);
          collab.connect(options.collaborationUrl);
          setCollaboration(collab);
        }
      });
    });

    return () => {
      collaboration?.disconnect();
    };
  }, []);

  // Handle cell changes
  React.useEffect(() => {
    if (!worksheet || !options.onCellChange) return;

    const handler = ((e: CustomEvent) => {
      const { row, col, value } = e.detail;
      options.onCellChange?.(row, col, value);
    }) as EventListener;

    document.addEventListener('cyber-sheet-cell-change', handler);
    return () => document.removeEventListener('cyber-sheet-cell-change', handler);
  }, [worksheet, options.onCellChange]);

  // API methods
  const setCell = function(row: number, col: number, value: any) {
    if (!worksheet) return;
    worksheet.setCellValue({ row, col }, value);
  };

  const getCell = function(row: number, col: number) {
    if (!worksheet) return null;
    return worksheet.getCell({ row, col })?.value;
  };

  const refresh = function() {
    if (renderer) {
      // Trigger re-render via canvas update
      const container = containerRef.current;
      if (container) {
        container.dispatchEvent(new CustomEvent('cyber-sheet-refresh'));
      }
    }
  };

  return {
    containerRef,
    worksheet,
    renderer,
    formulaEngine,
    collaboration,
    setCell,
    getCell,
    refresh
  };
}
