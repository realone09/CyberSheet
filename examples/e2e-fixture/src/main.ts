import { Workbook } from '@cyber-sheet/core';
import { CanvasRenderer } from '@cyber-sheet/renderer-canvas';
import { FormulaEngine } from '@cyber-sheet/core';

// Initialize workbook and sheet
const workbook = new Workbook();
const sheet = workbook.addSheet('Sheet1', 1000, 26);

// Set up formula engine
const formulaEngine = new FormulaEngine();

// Populate test data
sheet.setCellValue({ row: 1, col: 1 }, 'Product'); // A1
sheet.setCellValue({ row: 1, col: 2 }, 'Price');   // B1

sheet.setCellValue({ row: 2, col: 1 }, 'Widget');  // A2
sheet.setCellValue({ row: 2, col: 2 }, 100);       // B2

sheet.setCellValue({ row: 3, col: 1 }, 'Gadget');  // A3
sheet.setCellValue({ row: 3, col: 2 }, 200);       // B3

// Add formula cell - evaluate and store result
const sumResult = formulaEngine.evaluate('=SUM(B2:B3)', {
  worksheet: sheet as any,
  currentCell: { row: 4, col: 2 }
});
sheet.setCellValue({ row: 4, col: 2 }, typeof sumResult === 'number' ? sumResult : 0);

// Style header row
sheet.setCellStyle({ row: 1, col: 1 }, {
  bold: true,
  fill: '#2196F3',
  color: '#ffffff',
  align: 'center'
});
sheet.setCellStyle({ row: 1, col: 2 }, {
  bold: true,
  fill: '#2196F3',
  color: '#ffffff',
  align: 'center'
});

// Style formula cell
sheet.setCellStyle({ row: 4, col: 2 }, {
  bold: true,
  fill: '#f0f0f0'
});

// Initialize renderer
const container = document.getElementById('sheet-container');
if (container) {
  const renderer = new CanvasRenderer(container, sheet, {
    debug: false
  });
  
  // Expose for testing
  (window as any).cyberSheet = {
    workbook,
    sheet,
    renderer,
    formulaEngine
  };
  
  console.log('CyberSheet initialized successfully');
}
