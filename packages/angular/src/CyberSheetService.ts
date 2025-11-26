/**
 * CyberSheetService.ts
 * 
 * Angular service for Cyber Sheet management
 */

import { Injectable } from '@angular/core';
import {
  Worksheet,
  CollaborationEngine,
  FormulaEngine
} from '@cyber-sheet/core';
import { CanvasRenderer } from '@cyber-sheet/renderer-canvas';

@Injectable({
  providedIn: 'root'
})
export class CyberSheetService {
  private isLoaded = false;

  async createRenderer(
    container: HTMLElement,
    options: {
      data?: any[][];
      enableFormulas?: boolean;
      enableCollaboration?: boolean;
      collaborationUrl?: string;
    } = {}
  ): Promise<{
    worksheet: Worksheet;
    renderer: CanvasRenderer;
    formulaEngine?: FormulaEngine;
    collaboration?: CollaborationEngine;
  }> {
    const { Workbook } = await import('@cyber-sheet/core');
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

    const result: any = { worksheet, renderer };

    // Enable formulas
    if (options.enableFormulas) {
      const formulaEngine = new FormulaEngine();
      result.formulaEngine = formulaEngine;
    }

    // Enable collaboration
    if (options.enableCollaboration && options.collaborationUrl) {
      const collaboration = new CollaborationEngine(worksheet);
      collaboration.connect(options.collaborationUrl);
      result.collaboration = collaboration;
    }

    return result;
  }
}
