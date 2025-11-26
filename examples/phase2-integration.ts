/**
 * Phase 2 Integration Example
 * 
 * Complete demonstration of all Phase 2 features:
 * - Formula Engine
 * - Advanced Editing (clipboard, undo/redo, fill handle)
 * - Sorting, Filtering, Grouping
 * - Custom Cell Editors and Validation
 */

import { Workbook, FormulaEngine } from '@cyber-sheet/core';
import { 
  CanvasRenderer, 
  EditingManager, 
  DataManager, 
  EditorFactory,
  ValidationManager
} from '@cyber-sheet/renderer-canvas';

// Create workbook and worksheet
const workbook = new Workbook();
const worksheet = workbook.createWorksheet('Sales Data');

// Initialize managers
const renderer = new CanvasRenderer(worksheet, {
  container: document.getElementById('spreadsheet')!,
  width: 1200,
  height: 800
});

const formulaEngine = new FormulaEngine();
const editingManager = new EditingManager(worksheet);
const dataManager = new DataManager(worksheet);
const editorFactory = new EditorFactory();

// ============================================================================
// EXAMPLE 1: Formula Engine
// ============================================================================

// Set up sample data
worksheet.setCellValue({ row: 0, col: 0 }, 'Product');
worksheet.setCellValue({ row: 0, col: 1 }, 'Price');
worksheet.setCellValue({ row: 0, col: 2 }, 'Quantity');
worksheet.setCellValue({ row: 0, col: 3 }, 'Total');

worksheet.setCellValue({ row: 1, col: 0 }, 'Laptop');
worksheet.setCellValue({ row: 1, col: 1 }, 1200);
worksheet.setCellValue({ row: 1, col: 2 }, 5);

worksheet.setCellValue({ row: 2, col: 0 }, 'Mouse');
worksheet.setCellValue({ row: 2, col: 1 }, 25);
worksheet.setCellValue({ row: 2, col: 2 }, 10);

worksheet.setCellValue({ row: 3, col: 0 }, 'Keyboard');
worksheet.setCellValue({ row: 3, col: 1 }, 75);
worksheet.setCellValue({ row: 3, col: 2 }, 8);

// Add formulas for total calculation
const row1Total = { row: 1, col: 3 };
const cell1 = worksheet.getCell(row1Total);
if (cell1) {
  cell1.formula = '=B2*C2'; // Price * Quantity
  const result = formulaEngine.evaluate(cell1.formula, {
    worksheet,
    currentCell: row1Total
  });
  worksheet.setCellValue(row1Total, result);
}

const row2Total = { row: 2, col: 3 };
const cell2 = worksheet.getCell(row2Total);
if (cell2) {
  cell2.formula = '=B3*C3';
  const result = formulaEngine.evaluate(cell2.formula, {
    worksheet,
    currentCell: row2Total
  });
  worksheet.setCellValue(row2Total, result);
}

const row3Total = { row: 3, col: 3 };
const cell3 = worksheet.getCell(row3Total);
if (cell3) {
  cell3.formula = '=B4*C4';
  const result = formulaEngine.evaluate(cell3.formula, {
    worksheet,
    currentCell: row3Total
  });
  worksheet.setCellValue(row3Total, result);
}

// Add SUM formula for grand total
worksheet.setCellValue({ row: 4, col: 0 }, 'Grand Total');
const grandTotalCell = worksheet.getCell({ row: 4, col: 3 });
if (grandTotalCell) {
  grandTotalCell.formula = '=SUM(D2:D4)';
  const result = formulaEngine.evaluate(grandTotalCell.formula, {
    worksheet,
    currentCell: { row: 4, col: 3 }
  });
  worksheet.setCellValue({ row: 4, col: 3 }, result);
}

// Auto-recalculation demo: Change price and recalculate dependents
worksheet.setCellValue({ row: 1, col: 1 }, 1500);
const recalculated = formulaEngine.recalculate(worksheet, { row: 1, col: 1 });
console.log('Recalculated cells:', recalculated);

// ============================================================================
// EXAMPLE 2: Advanced Editing - Clipboard
// ============================================================================

// Select a range
editingManager.setSelection({ row: 1, col: 0 }, { row: 3, col: 3 });

// Programmatic copy
document.dispatchEvent(new ClipboardEvent('copy', {
  clipboardData: new DataTransfer()
}));

// Paste to another location
editingManager.setSelection({ row: 6, col: 0 });
document.dispatchEvent(new ClipboardEvent('paste', {
  clipboardData: new DataTransfer()
}));

// ============================================================================
// EXAMPLE 3: Advanced Editing - Undo/Redo
// ============================================================================

// Make changes
worksheet.setCellValue({ row: 1, col: 2 }, 10); // Change quantity

// Undo
const undone = editingManager.undo();
console.log('Undo successful:', undone);

// Redo
const redone = editingManager.redo();
console.log('Redo successful:', redone);

// Get history stats
const stats = editingManager.getHistoryStats();
console.log('History:', stats);

// ============================================================================
// EXAMPLE 4: Advanced Editing - Fill Handle
// ============================================================================

// Fill numbers: 1, 2, 3, ...
worksheet.setCellValue({ row: 0, col: 5 }, 1);
editingManager.fillCells(
  { row: 0, col: 5 },
  { start: { row: 1, col: 5 }, end: { row: 5, col: 5 } }
);

// Fill dates
worksheet.setCellValue({ row: 0, col: 6 }, '2025-01-01');
editingManager.fillCells(
  { row: 0, col: 6 },
  { start: { row: 1, col: 6 }, end: { row: 5, col: 6 } }
);

// ============================================================================
// EXAMPLE 5: Sorting
// ============================================================================

// Sort by price (column 1) ascending
dataManager.sort([
  { column: 1, order: 'asc' }
]);

// Multi-column sort: by price descending, then by quantity ascending
dataManager.sort([
  { column: 1, order: 'desc' },
  { column: 2, order: 'asc' }
]);

// Custom comparator
dataManager.sort([{
  column: 0,
  order: 'asc',
  comparator: (a, b) => {
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
  }
}]);

// ============================================================================
// EXAMPLE 6: Filtering
// ============================================================================

// Filter products with price > 50
dataManager.filter([
  { column: 1, operator: 'greaterThan', value: 50 }
]);

// Multiple filters: price > 50 AND quantity >= 5
dataManager.filter([
  { column: 1, operator: 'greaterThan', value: 50 },
  { column: 2, operator: 'greaterOrEqual', value: 5 }
]);

// Custom predicate
dataManager.filter([{
  column: 0,
  predicate: (value) => String(value).startsWith('L')
}]);

// Get visible rows
const visibleRows = dataManager.getVisibleRows();
console.log('Visible rows:', visibleRows);

// Get statistics
const dataStats = dataManager.getStats();
console.log('Data stats:', dataStats);

// ============================================================================
// EXAMPLE 7: Grouping
// ============================================================================

// Group by product category (assuming column 0)
dataManager.group({ columns: [0] });

// Toggle group
const groups = dataManager.getGroups();
const firstGroupKey = Array.from(groups.keys())[0];
dataManager.toggleGroup(firstGroupKey);

// Collapse all groups
dataManager.collapseAllGroups();

// Expand all groups
dataManager.expandAllGroups();

// ============================================================================
// EXAMPLE 8: Custom Cell Editors
// ============================================================================

// Register dropdown editor for product column
editorFactory.registerEditor({ row: 1, col: 0 }, {
  type: 'dropdown',
  options: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones']
});

// Register number editor with validation for price column
editorFactory.registerEditor({ row: 1, col: 1 }, {
  type: 'number',
  validation: [
    { rule: 'required', message: 'Price is required' },
    { rule: 'range', min: 0, max: 10000, message: 'Price must be between $0 and $10,000' }
  ]
});

// Register custom editor
editorFactory.registerEditor({ row: 5, col: 0 }, {
  type: 'custom',
  customRender: (container, value, commit, cancel) => {
    const button = document.createElement('button');
    button.textContent = String(value ?? 'Click me');
    button.onclick = () => {
      const newValue = prompt('Enter new value:', String(value ?? ''));
      if (newValue !== null) {
        commit(newValue);
      } else {
        cancel();
      }
    };
    container.appendChild(button);
  }
});

// ============================================================================
// EXAMPLE 9: Validation
// ============================================================================

const validationManager = editorFactory.getValidationManager();

// Add email validation
validationManager.addValidation({ row: 0, col: 7 }, [
  { rule: 'required' },
  { rule: 'email', message: 'Please enter a valid email address' }
]);

// Validate a value
const emailValidation = validationManager.validate(
  { row: 0, col: 7 },
  'test@example.com'
);
console.log('Email validation:', emailValidation);

// Custom validation
validationManager.addValidation({ row: 0, col: 8 }, [{
  rule: 'custom',
  validator: (value) => {
    if (typeof value !== 'number') return 'Must be a number';
    if (value % 2 !== 0) return 'Must be an even number';
    return true;
  }
}]);

// ============================================================================
// EXAMPLE 10: Event Listeners
// ============================================================================

// Listen to data events
document.addEventListener('cyber-sheet-data-sort', (e) => {
  console.log('Data sorted:', (e as CustomEvent).detail);
});

document.addEventListener('cyber-sheet-data-filter', (e) => {
  console.log('Data filtered:', (e as CustomEvent).detail);
});

document.addEventListener('cyber-sheet-data-group', (e) => {
  console.log('Data grouped:', (e as CustomEvent).detail);
});

// ============================================================================
// EXAMPLE 11: Complete Workflow
// ============================================================================

async function completeWorkflow() {
  // 1. Load data
  worksheet.setCellValue({ row: 0, col: 0 }, 'Name');
  worksheet.setCellValue({ row: 0, col: 1 }, 'Score');
  worksheet.setCellValue({ row: 1, col: 0 }, 'Alice');
  worksheet.setCellValue({ row: 1, col: 1 }, 85);
  worksheet.setCellValue({ row: 2, col: 0 }, 'Bob');
  worksheet.setCellValue({ row: 2, col: 1 }, 92);
  
  // 2. Add formula
  worksheet.setCellValue({ row: 3, col: 0 }, 'Average');
  const avgCell = worksheet.getCell({ row: 3, col: 1 });
  if (avgCell) {
    avgCell.formula = '=AVERAGE(B2:B3)';
    const result = formulaEngine.evaluate(avgCell.formula, {
      worksheet,
      currentCell: { row: 3, col: 1 }
    });
    worksheet.setCellValue({ row: 3, col: 1 }, result);
  }
  
  // 3. Validate input
  validationManager.addValidation({ row: 1, col: 1 }, [
    { rule: 'range', min: 0, max: 100, message: 'Score must be 0-100' }
  ]);
  
  // 4. Sort by score
  dataManager.sort([{ column: 1, order: 'desc' }]);
  
  // 5. Filter high scorers
  dataManager.filter([{ column: 1, operator: 'greaterOrEqual', value: 90 }]);
  
  // 6. Render
  renderer.render();
  
  console.log('Workflow complete!');
}

completeWorkflow();

// ============================================================================
// Performance Monitoring
// ============================================================================

console.log('Phase 2 Features Ready!');
console.log('- Formula Engine: 40+ functions, dependency tracking');
console.log('- Editing: Clipboard, undo/redo, fill handle');
console.log('- Data: Sort, filter, group with virtual indices');
console.log('- Editors: 5 built-in + custom, 11 validation rules');
