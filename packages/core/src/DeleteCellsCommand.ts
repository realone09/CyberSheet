/**
 * DeleteCellsCommand.ts
 * 
 * Command for deleting cells with shift up/left, with full undo/redo support.
 */

import type { Command } from './CommandManager';
import type { Address, ExtendedCellValue, CellStyle } from './types';
import type { Worksheet } from './worksheet';

interface CellSnapshot {
  addr: Address;
  value: ExtendedCellValue;
  formula: string | undefined;
  style: CellStyle | undefined;
}

export class DeleteCellsCommand implements Command {
  private worksheet: Worksheet;
  private range: { start: Address; end: Address };
  private snapshots: CellSnapshot[] = [];
  
  readonly description: string;
  
  constructor(worksheet: Worksheet, range: { start: Address; end: Address }) {
    this.worksheet = worksheet;
    this.range = range;
    
    const r1 = Math.min(range.start.row, range.end.row);
    const r2 = Math.max(range.start.row, range.end.row);
    const c1 = Math.min(range.start.col, range.end.col);
    const c2 = Math.max(range.start.col, range.end.col);
    
    this.description = `Delete cells (${r1},${c1}) to (${r2},${c2}) and shift up`;
    
    // Capture current state of ALL affected cells for undo (from deletion point to end)
    const lastRow = this.worksheet.rowCount - 1;
    for (let row = r1; row <= lastRow; row++) {
      for (let col = c1; col <= c2; col++) {
        const addr: Address = { row, col };
        const cell = this.worksheet.getCell(addr);
        
        this.snapshots.push({
          addr: { row, col },
          value: cell?.value ?? null,
          formula: cell?.formula,
          style: cell?.style
        });
      }
    }
  }
  
  execute(): void {
    const r1 = Math.min(this.range.start.row, this.range.end.row);
    const r2 = Math.max(this.range.start.row, this.range.end.row);
    const c1 = Math.min(this.range.start.col, this.range.end.col);
    const c2 = Math.max(this.range.start.col, this.range.end.col);
    
    const rowCount = r2 - r1 + 1;
    const lastRow = this.worksheet.rowCount - 1;
    
    // Shift cells up by copying from top to bottom
    for (let row = r1; row <= lastRow - rowCount; row++) {
      for (let col = c1; col <= c2; col++) {
        const sourceAddr = { row: row + rowCount, col };
        const targetAddr = { row, col };
        const sourceCell = this.worksheet.getCell(sourceAddr);
        
        if (sourceCell) {
          if (sourceCell.value !== null && sourceCell.value !== undefined) {
            this.worksheet.setCellValue(targetAddr, sourceCell.value);
          } else {
            this.worksheet.setCellValue(targetAddr, null);
          }
          if (sourceCell.formula) {
            this.worksheet.setCellFormula(targetAddr, sourceCell.formula);
          } else {
            this.worksheet.setCellFormula(targetAddr, '');
          }
          if (sourceCell.style) {
            this.worksheet.setCellStyle(targetAddr, sourceCell.style);
          } else {
            this.worksheet.setCellStyle(targetAddr, undefined);
          }
        } else {
          this.worksheet.setCellValue(targetAddr, null);
          this.worksheet.setCellFormula(targetAddr, '');
          this.worksheet.setCellStyle(targetAddr, undefined);
        }
      }
    }
    
    // Clear the bottom cells that were shifted up
    for (let row = lastRow - rowCount + 1; row <= lastRow; row++) {
      for (let col = c1; col <= c2; col++) {
        this.worksheet.setCellValue({ row, col }, null);
        this.worksheet.setCellFormula({ row, col }, '');
      }
    }
  }
  
  undo(): void {
    // Restore all cells to their original state
    for (const snapshot of this.snapshots) {
      if (snapshot.formula) {
        this.worksheet.setCellFormula(snapshot.addr, snapshot.formula);
      } else {
        this.worksheet.setCellValue(snapshot.addr, snapshot.value);
      }
      
      if (snapshot.style !== undefined) {
        this.worksheet.setCellStyle(snapshot.addr, snapshot.style);
      }
    }
  }
}
