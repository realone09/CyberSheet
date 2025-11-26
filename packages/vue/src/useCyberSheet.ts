/**
 * useCyberSheet.ts
 * 
 * Vue 3 composable for Cyber Sheet integration using Composition API
 */

import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';
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
  containerRef: Ref<HTMLDivElement | null>;
  worksheet: Ref<Worksheet | null>;
  renderer: Ref<CanvasRenderer | null>;
  formulaEngine: Ref<FormulaEngine | null>;
  collaboration: Ref<CollaborationEngine | null>;
  setCell: (row: number, col: number, value: any) => void;
  getCell: (row: number, col: number) => any;
  refresh: () => void;
}

export function useCyberSheet(options: UseCyberSheetOptions = {}): UseCyberSheetReturn {
  const containerRef = ref<HTMLDivElement | null>(null);
  const worksheet = ref<Worksheet | null>(null);
  const renderer = ref<CanvasRenderer | null>(null);
  const formulaEngine = ref<FormulaEngine | null>(null);
  const collaboration = ref<CollaborationEngine | null>(null);

  let cellChangeHandler: EventListener | null = null;

  onMounted(async () => {
    if (!containerRef.value) return;

    // Dynamic imports to support tree-shaking
    const { Workbook, FormulaEngine, CollaborationEngine } = await import('@cyber-sheet/core');
    const { CanvasRenderer } = await import('@cyber-sheet/renderer-canvas');

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

    const r = new CanvasRenderer(containerRef.value!, ws, {
      debug: false
    });

    worksheet.value = ws;
    renderer.value = r;

    // Enable formulas
    if (options.enableFormulas) {
      const fe = new FormulaEngine();
      formulaEngine.value = fe;
    }

    // Enable collaboration
    if (options.enableCollaboration && options.collaborationUrl) {
      const collab = new CollaborationEngine(ws);
      collab.connect(options.collaborationUrl);
      collaboration.value = collab;
    }

    // Handle cell changes
    if (options.onCellChange) {
      cellChangeHandler = ((e: CustomEvent) => {
        const { row, col, value } = e.detail;
        options.onCellChange?.(row, col, value);
      }) as EventListener;

      document.addEventListener('cyber-sheet-cell-change', cellChangeHandler);
    }
  });

  onBeforeUnmount(() => {
    collaboration.value?.disconnect();
    if (cellChangeHandler) {
      document.removeEventListener('cyber-sheet-cell-change', cellChangeHandler);
    }
  });

  // API methods
  const setCell = (row: number, col: number, value: any) => {
    if (!worksheet.value) return;
    worksheet.value.setCellValue({ row, col }, value);
  };

  const getCell = (row: number, col: number) => {
    if (!worksheet.value) return null;
    return worksheet.value.getCell({ row, col })?.value;
  };

  const refresh = () => {
    if (renderer.value && containerRef.value) {
      containerRef.value.dispatchEvent(new CustomEvent('cyber-sheet-refresh'));
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
