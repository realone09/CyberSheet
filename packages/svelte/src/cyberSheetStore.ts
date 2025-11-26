/**
 * cyberSheetStore.ts
 * 
 * Svelte store for Cyber Sheet state management
 */

import { writable, type Writable } from 'svelte/store';
import type { Worksheet, FormulaEngine, CollaborationEngine } from '@cyber-sheet/core';
import type { CanvasRenderer } from '@cyber-sheet/renderer-canvas';

export interface CyberSheetState {
  worksheet: Worksheet | null;
  renderer: CanvasRenderer | null;
  formulaEngine: FormulaEngine | null;
  collaboration: CollaborationEngine | null;
}

export function createCyberSheetStore(): Writable<CyberSheetState> {
  const initialState: CyberSheetState = {
    worksheet: null,
    renderer: null,
    formulaEngine: null,
    collaboration: null
  };

  return writable(initialState);
}

export async function initializeCyberSheet(
  container: HTMLElement,
  store: Writable<CyberSheetState>,
  options: {
    data?: any[][];
    enableFormulas?: boolean;
    enableCollaboration?: boolean;
    collaborationUrl?: string;
  } = {}
) {
  const { Workbook, FormulaEngine, CollaborationEngine } = await import('@cyber-sheet/core');
  const { CanvasRenderer } = await import('@cyber-sheet/renderer-canvas');

  const workbook = new Workbook();
  const worksheet = workbook.addSheet('Sheet1');

  // Load initial data
  if (options.data) {
    options.data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        worksheet.setCellValue({ row: rowIndex, col: colIndex }, value);
      });
    });
  }

  const renderer = new CanvasRenderer(container, worksheet, {
    debug: false
  });

  const state: CyberSheetState = {
    worksheet,
    renderer,
    formulaEngine: null,
    collaboration: null
  };

  // Enable formulas
  if (options.enableFormulas) {
    const formulaEngine = new FormulaEngine();
    state.formulaEngine = formulaEngine;
  }

  // Enable collaboration
  if (options.enableCollaboration && options.collaborationUrl) {
    const collaboration = new CollaborationEngine(worksheet);
    collaboration.connect(options.collaborationUrl);
    state.collaboration = collaboration;
  }

  store.set(state);

  return state;
}
