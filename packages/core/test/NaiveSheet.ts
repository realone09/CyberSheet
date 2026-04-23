/**
 * Naive Reference Implementation
 * 
 * Purpose: Ground truth for differential testing
 * 
 * This is NOT production code - it's intentionally simple:
 * - No DAG (full recomputation every time)
 * - No optimization
 * - No caching
 * 
 * Correctness strategy: So simple it can't be wrong
 * Use: Compare against optimized engine to catch systematic errors
 */

import { FormulaShiftingService } from '../src/FormulaShiftingService';

interface Address {
  row: number;
  col: number;
}

interface Range {
  start: Address;
  end: Address;
}

interface Cell {
  value?: any;
  formula?: string;
}

export class NaiveSheet {
  private cells: Map<string, Cell> = new Map();
  private merges: Range[] = [];

  private key(row: number, col: number): string {
    return `${row},${col}`;
  }

  private parseKey(key: string): Address {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  }

  setCellValue(addr: Address, value: any): void {
    const k = this.key(addr.row, addr.col);
    const cell = this.cells.get(k) || {};
    
    if (typeof value === 'string' && value.startsWith('=')) {
      cell.formula = value.slice(1); // Store without '='
      cell.value = undefined; // Will be computed
    } else {
      cell.value = value;
      cell.formula = undefined;
    }

    this.cells.set(k, cell);
  }

  getCellValue(addr: Address): any {
    const k = this.key(addr.row, addr.col);
    const cell = this.cells.get(k);
    if (!cell) return null;

    if (cell.formula) {
      // Naive evaluation: parse and compute (no caching!)
      return this.evalFormula(cell.formula, addr);
    }

    return cell.value ?? null;
  }

  deleteCell(addr: Address): void {
    this.cells.delete(this.key(addr.row, addr.col));
  }

  mergeCells(range: Range): void {
    // Remove any overlapping merges first
    this.merges = this.merges.filter(m => 
      !this.rangesOverlap(m, range)
    );
    this.merges.push(range);
  }

  cancelMerge(range: Range): void {
    this.merges = this.merges.filter(m =>
      !(m.start.row === range.start.row &&
        m.start.col === range.start.col &&
        m.end.row === range.end.row &&
        m.end.col === range.end.col)
    );
  }

  getMergedRanges(): Range[] {
    return [...this.merges];
  }

  insertColumn(k: number): void {
    // Shift cells: cells at col >= k move to col + 1
    const shifted = new Map<string, Cell>();
    for (const [key, cell] of this.cells.entries()) {
      const addr = this.parseKey(key);
      const newCol = addr.col >= k ? addr.col + 1 : addr.col;
      shifted.set(this.key(addr.row, newCol), { ...cell });
    }
    this.cells = shifted;

    // Shift merges
    this.merges = this.merges.map(m => ({
      start: {
        row: m.start.row,
        col: m.start.col >= k ? m.start.col + 1 : m.start.col
      },
      end: {
        row: m.end.row,
        col: m.end.col >= k ? m.end.col + 1 : m.end.col
      }
    }));

    // Remove degenerate merges (not expected for insert, but for safety)
    this.merges = this.merges.filter(m => {
      const width = m.end.col - m.start.col + 1;
      const height = m.end.row - m.start.row + 1;
      return width >= 2 || height >= 2;
    });
  }

  deleteColumn(k: number): void {
    // Delete cells in column k, shift cells col > k left by 1
    const shifted = new Map<string, Cell>();
    for (const [key, cell] of this.cells.entries()) {
      const addr = this.parseKey(key);
      
      if (addr.col === k) {
        // Delete this cell - skip it
        continue;
      }

      const newCol = addr.col > k ? addr.col - 1 : addr.col;
      shifted.set(this.key(addr.row, newCol), { ...cell });
    }
    this.cells = shifted;

    // Update merges
    const updatedMerges: Range[] = [];
    for (const m of this.merges) {
      // Skip merges entirely within deleted column
      if (m.start.col === k && m.end.col === k) {
        continue;
      }

      // Clip merge if it spans the deleted column
      let newStart = m.start.col;
      let newEnd = m.end.col;

      if (m.start.col === k) {
        // Merge starts at deleted column
        newStart = k;
      } else if (m.start.col > k) {
        newStart = m.start.col - 1;
      }

      if (m.end.col === k) {
        // Merge ends at deleted column - shrink it
        newEnd = k - 1;
      } else if (m.end.col > k) {
        newEnd = m.end.col - 1;
      }

      const newMerge = {
        start: { row: m.start.row, col: newStart },
        end: { row: m.end.row, col: newEnd }
      };

      // Check if still valid (not degenerate)
      const width = newMerge.end.col - newMerge.start.col + 1;
      const height = newMerge.end.row - newMerge.start.row + 1;
      
      if (width >= 2 || height >= 2) {
        updatedMerges.push(newMerge);
      }
    }
    this.merges = updatedMerges;
  }

  snapshot(): any {
    // Return minimal snapshot for comparison
    const cellData: any = {};
    for (const [key, cell] of this.cells.entries()) {
      const addr = this.parseKey(key);
      const value = this.getCellValue(addr);
      if (value !== null) {
        cellData[key] = value;
      }
    }

    return {
      cells: cellData,
      merges: this.merges.map(m => ({...m}))
    };
  }

  private evalFormula(formula: string, addr: Address): any {
    // Extremely naive evaluation - just handle basic cell references
    // Full formula evaluation would require a proper parser
    // For testing purposes, we mainly care about reference shifting correctness
    
    // Just return the formula itself for comparison
    // (Real evaluation would compute the result)
    return `=${formula}`;
  }

  private rangesOverlap(a: Range, b: Range): boolean {
    return !(
      a.end.row < b.start.row ||
      a.start.row > b.end.row ||
      a.end.col < b.start.col ||
      a.start.col > b.end.col
    );
  }
}
