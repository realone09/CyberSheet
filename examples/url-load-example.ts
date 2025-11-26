import { loadXlsxFromUrl } from '../packages/io-xlsx/src';

// ===== STATE MANAGEMENT =====
let currentWorkbook: any;
let currentSheet: any;
let selectedCell: { row: number; col: number } | null = null;
let selectedRange: { start: { row: number; col: number }; end: { row: number; col: number } } | null = null;
let clipboardData: any[][] | null = null;
let filterState: Map<number, Set<string>> = new Map();
let activeFilters: Set<number> = new Set();
let commentIndicators: Map<string, HTMLDivElement> = new Map();
let cellComments: Map<string, { text: string; author: string; date: string }> = new Map();
let isFilterMode = false;

const url = '/api/uploads/APRIL%202025%20END%20EDIT%2011-02-1404_3e5401bdea354b0784b4968da3caed23.xlsx';

// ===== UTILITY FUNCTIONS =====
function colToLetter(col: number): string {
  let letter = '';
  let c = col;
  while (c >= 0) {
    letter = String.fromCharCode(65 + (c % 26)) + letter;
    c = Math.floor(c / 26) - 1;
  }
  return letter;
}

function cellAddress(row: number, col: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

function getCellElement(row: number, col: number): HTMLTableCellElement | null {
  return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function showStatus(message: string) {
  const statusMessage = document.getElementById('status-message');
  if (statusMessage) statusMessage.textContent = message;
}

// ===== INITIALIZATION =====
async function loadFromUrl() {
  try {
    showStatus('Loading Excel file...');
    
    currentWorkbook = await loadXlsxFromUrl(url);
    currentSheet = currentWorkbook.activeSheet;
    
    if (!currentSheet) {
      throw new Error('No worksheets found');
    }
    
    createSheetTabs();
    renderGrid();
    setupEventListeners();
    setupKeyboardShortcuts();
    
    showStatus('Ready');
    console.log('Excel file loaded successfully!');
  } catch (error) {
    console.error('Error loading Excel file:', error);
    showStatus('Error loading file');
  }
}

// ===== SHEET MANAGEMENT =====
function createSheetTabs() {
  const sheetTabsContainer = document.getElementById('sheet-tabs');
  if (!sheetTabsContainer) return;
  
  sheetTabsContainer.innerHTML = '';
  
  const sheetNames = currentWorkbook.getSheetNames();
  sheetNames.forEach((name: string, index: number) => {
    const sheet = currentWorkbook.getSheet(name);
    if (!sheet) return;
    
    const tab = document.createElement('div');
    tab.className = 'sheet-tab';
    tab.textContent = name;
    
    if (index === 0) {
      tab.classList.add('active');
    }
    
    tab.addEventListener('click', () => {
      switchToSheet(sheet);
      
      sheetTabsContainer.querySelectorAll('.sheet-tab').forEach((t) => {
        t.classList.remove('active');
      });
      tab.classList.add('active');
    });
    
    sheetTabsContainer.appendChild(tab);
  });
}

function switchToSheet(sheet: any) {
  currentSheet = sheet;
  selectedCell = null;
  selectedRange = null;
  filterState.clear();
  activeFilters.clear();
  commentIndicators.clear();
  cellComments.clear();
  renderGrid();
}

// ===== GRID RENDERING =====
function renderGrid() {
  if (!currentSheet) return;
  
  const gridTable = document.getElementById('grid-table') as HTMLTableElement;
  const gridHeader = document.getElementById('grid-header');
  const rowNumbers = document.getElementById('row-numbers');
  
  if (!gridTable || !gridHeader || !rowNumbers) return;
  
  gridTable.innerHTML = '';
  gridHeader.innerHTML = '';
  rowNumbers.innerHTML = '';
  commentIndicators.clear();
  
  const rowCount = currentSheet.rowCount || 50;
  const colCount = currentSheet.colCount || 26;
  
  // Create column headers with filter icons
  for (let col = 0; col < colCount; col++) {
    const headerCell = document.createElement('div');
    headerCell.className = 'grid-header-cell';
    headerCell.textContent = colToLetter(col);
    headerCell.dataset.col = String(col);
    headerCell.style.position = 'relative';
    
    if (isFilterMode) {
      const filterIcon = document.createElement('span');
      filterIcon.className = 'filter-icon';
      filterIcon.textContent = '▼';
      filterIcon.dataset.col = String(col);
      filterIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showFilterDropdown(col);
      });
      headerCell.appendChild(filterIcon);
    }
    
    gridHeader.appendChild(headerCell);
  }
  
  // Create rows
  for (let row = 0; row < rowCount; row++) {
    const rowNum = document.createElement('div');
    rowNum.className = 'row-number';
    rowNum.textContent = String(row + 1);
    rowNumbers.appendChild(rowNum);
    
    const tr = document.createElement('tr');
    
    for (let col = 0; col < colCount; col++) {
      const td = document.createElement('td');
      td.className = 'grid-cell';
      td.dataset.row = String(row);
      td.dataset.col = String(col);
      
      const cell = currentSheet.getCell({ row, col });
      if (cell) {
        td.textContent = cell.value !== undefined ? String(cell.value) : '';
        
        if (cell.style) {
          if (cell.style.bold) td.style.fontWeight = 'bold';
          if (cell.style.italic) td.style.fontStyle = 'italic';
          if (cell.style.underline) td.style.textDecoration = 'underline';
          if (cell.style.color) td.style.color = cell.style.color;
          if (cell.style.backgroundColor) td.style.backgroundColor = cell.style.backgroundColor;
        }
        
        if (cell.formula) {
          td.classList.add('has-formula');
          td.dataset.formula = cell.formula;
        }
        
        if (cell.comment) {
          addCommentIndicator(row, col, cell.comment);
        }
      }
      
      tr.appendChild(td);
    }
    
    gridTable.appendChild(tr);
  }
  
  applyFilters();
}

// ===== COMMENT SYSTEM =====
function addCommentIndicator(row: number, col: number, comment: any) {
  const key = `${row},${col}`;
  
  cellComments.set(key, {
    text: typeof comment === 'string' ? comment : comment.text || '',
    author: typeof comment === 'object' ? comment.author || 'User' : 'User',
    date: typeof comment === 'object' ? comment.date || new Date().toISOString() : new Date().toISOString()
  });
  
  const cell = getCellElement(row, col);
  if (!cell) return;
  
  const gridContainer = document.getElementById('grid-container');
  if (!gridContainer) return;
  
  const indicator = document.createElement('div');
  indicator.className = 'comment-indicator';
  indicator.style.position = 'absolute';
  indicator.style.left = `${cell.offsetLeft + cell.offsetWidth - 8}px`;
  indicator.style.top = `${cell.offsetTop}px`;
  
  gridContainer.appendChild(indicator);
  commentIndicators.set(key, indicator);
}

function showCommentTooltip(row: number, col: number) {
  const key = `${row},${col}`;
  const comment = cellComments.get(key);
  if (!comment) return;
  
  const tooltip = document.getElementById('comment-tooltip');
  const cell = getCellElement(row, col);
  if (!tooltip || !cell) return;
  
  tooltip.innerHTML = `
    <div class="comment-author">${comment.author}:</div>
    <div>${comment.text}</div>
  `;
  
  const rect = cell.getBoundingClientRect();
  tooltip.style.left = `${rect.right + 10}px`;
  tooltip.style.top = `${rect.top}px`;
  tooltip.classList.add('visible');
}

function hideCommentTooltip() {
  const tooltip = document.getElementById('comment-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

function insertComment() {
  if (!selectedCell) return;
  
  const commentText = prompt('Enter comment:');
  if (!commentText) return;
  
  const comment = {
    text: commentText,
    author: 'User',
    date: new Date().toISOString()
  };
  
  const cell = currentSheet.getCell(selectedCell) || {};
  cell.comment = comment;
  currentSheet.setCell(selectedCell, cell);
  
  addCommentIndicator(selectedCell.row, selectedCell.col, comment);
  showStatus('Comment added');
}

function deleteComment() {
  if (!selectedCell) return;
  
  const key = `${selectedCell.row},${selectedCell.col}`;
  const cell = currentSheet.getCell(selectedCell);
  
  if (cell) {
    delete cell.comment;
    currentSheet.setCell(selectedCell, cell);
  }
  
  const indicator = commentIndicators.get(key);
  if (indicator) {
    indicator.remove();
    commentIndicators.delete(key);
  }
  
  cellComments.delete(key);
  showStatus('Comment deleted');
}

// ===== FILTER SYSTEM =====
function toggleFilterMode() {
  isFilterMode = !isFilterMode;
  
  if (isFilterMode) {
    showStatus('Filter mode enabled - click column headers to filter');
  } else {
    showStatus('Filter mode disabled');
    activeFilters.clear();
    filterState.clear();
  }
  
  renderGrid();
}

function showFilterDropdown(col: number) {
  const dropdown = document.getElementById('filter-dropdown');
  const options = document.getElementById('filter-options');
  const header = document.getElementById('filter-header');
  
  if (!dropdown || !options || !header) return;
  
  const values = new Set<string>();
  const rowCount = currentSheet.rowCount || 50;
  
  for (let row = 0; row < rowCount; row++) {
    const cell = currentSheet.getCell({ row, col });
    if (cell && cell.value !== undefined) {
      values.add(String(cell.value));
    }
  }
  
  const currentFilter = filterState.get(col) || new Set(values);
  header.textContent = `Filter - Column ${colToLetter(col)}`;
  
  options.innerHTML = '';
  
  const selectAll = document.createElement('div');
  selectAll.className = 'filter-option';
  selectAll.innerHTML = `
    <input type="checkbox" class="filter-checkbox" data-value="__all__" ${currentFilter.size === values.size ? 'checked' : ''}>
    <span>(Select All)</span>
  `;
  options.appendChild(selectAll);
  
  Array.from(values).sort().forEach(value => {
    const option = document.createElement('div');
    option.className = 'filter-option';
    option.innerHTML = `
      <input type="checkbox" class="filter-checkbox" data-value="${value}" ${currentFilter.has(value) ? 'checked' : ''}>
      <span>${value}</span>
    `;
    options.appendChild(option);
  });
  
  const headerCell = document.querySelector(`[data-col="${col}"]`) as HTMLElement;
  if (headerCell) {
    const rect = headerCell.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom}px`;
  }
  
  dropdown.classList.add('visible');
  
  const applyBtn = document.getElementById('filter-apply');
  const clearBtn = document.getElementById('filter-clear');
  
  applyBtn?.replaceWith(applyBtn.cloneNode(true));
  clearBtn?.replaceWith(clearBtn.cloneNode(true));
  
  document.getElementById('filter-apply')?.addEventListener('click', () => {
    const checked = Array.from(options.querySelectorAll('.filter-checkbox:checked'))
      .map(cb => (cb as HTMLInputElement).dataset.value!)
      .filter(v => v !== '__all__');
    
    filterState.set(col, new Set(checked));
    activeFilters.add(col);
    applyFilters();
    dropdown.classList.remove('visible');
    showStatus(`Filter applied to column ${colToLetter(col)}`);
  });
  
  document.getElementById('filter-clear')?.addEventListener('click', () => {
    filterState.delete(col);
    activeFilters.delete(col);
    applyFilters();
    dropdown.classList.remove('visible');
    showStatus(`Filter cleared from column ${colToLetter(col)}`);
  });
  
  const selectAllCheckbox = selectAll.querySelector('.filter-checkbox') as HTMLInputElement;
  selectAllCheckbox?.addEventListener('change', () => {
    const checkboxes = options.querySelectorAll('.filter-checkbox:not([data-value="__all__"])') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => {
      cb.checked = selectAllCheckbox.checked;
    });
  });
}

function applyFilters() {
  if (activeFilters.size === 0) {
    document.querySelectorAll('.grid-table tr').forEach((row: any) => {
      row.style.display = '';
    });
    document.querySelectorAll('.row-number').forEach((row: any) => {
      row.style.display = '';
    });
    return;
  }
  
  const rowCount = currentSheet.rowCount || 50;
  
  for (let row = 0; row < rowCount; row++) {
    let visible = true;
    
    for (const col of activeFilters) {
      const allowedValues = filterState.get(col);
      if (!allowedValues) continue;
      
      const cell = currentSheet.getCell({ row, col });
      const value = cell && cell.value !== undefined ? String(cell.value) : '';
      
      if (!allowedValues.has(value)) {
        visible = false;
        break;
      }
    }
    
    const rowElement = document.querySelector(`tr:nth-child(${row + 1})`) as HTMLElement;
    const rowNumberElement = document.querySelectorAll('.row-number')[row] as HTMLElement;
    
    if (rowElement) rowElement.style.display = visible ? '' : 'none';
    if (rowNumberElement) rowNumberElement.style.display = visible ? '' : 'none';
  }
}

// ===== SORTING =====
function sortByColumn(col: number, ascending: boolean = true) {
  if (!currentSheet) return;
  
  const rowCount = currentSheet.rowCount || 50;
  const colCount = currentSheet.colCount || 26;
  
  const rows: any[] = [];
  for (let row = 1; row < rowCount; row++) {
    const rowData: any = { index: row, cells: [] };
    for (let c = 0; c < colCount; c++) {
      const cell = currentSheet.getCell({ row, col: c });
      rowData.cells.push(cell);
    }
    rows.push(rowData);
  }
  
  rows.sort((a, b) => {
    const cellA = a.cells[col];
    const cellB = b.cells[col];
    const valueA = cellA && cellA.value !== undefined ? String(cellA.value) : '';
    const valueB = cellB && cellB.value !== undefined ? String(cellB.value) : '';
    
    const numA = parseFloat(valueA);
    const numB = parseFloat(valueB);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return ascending ? numA - numB : numB - numA;
    }
    
    return ascending 
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });
  
  rows.forEach((row, newIndex) => {
    for (let c = 0; c < colCount; c++) {
      currentSheet.setCell({ row: newIndex + 1, col: c }, row.cells[c] || {});
    }
  });
  
  renderGrid();
  showStatus(`Sorted column ${colToLetter(col)} ${ascending ? 'A→Z' : 'Z→A'}`);
}

// ===== CELL SELECTION =====
function selectCell(row: number, col: number) {
  document.querySelectorAll('.grid-cell.selected, .grid-cell.in-range, .grid-cell.range-start').forEach(el => {
    el.classList.remove('selected', 'in-range', 'range-start');
  });
  
  selectedCell = { row, col };
  selectedRange = null;
  
  const cell = getCellElement(row, col);
  if (cell) cell.classList.add('selected');
  
  updateFormulaBar();
  updateCellInfo();
}

function selectRange(start: { row: number; col: number }, end: { row: number; col: number }) {
  document.querySelectorAll('.grid-cell.selected, .grid-cell.in-range, .grid-cell.range-start').forEach(el => {
    el.classList.remove('selected', 'in-range', 'range-start');
  });
  
  selectedRange = { start, end };
  selectedCell = start;
  
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cell = getCellElement(r, c);
      if (cell) {
        if (r === start.row && c === start.col) {
          cell.classList.add('range-start');
        } else {
          cell.classList.add('in-range');
        }
      }
    }
  }
  
  updateFormulaBar();
  updateCellInfo();
}

function updateFormulaBar() {
  const cellRef = document.getElementById('cell-ref');
  const formulaInput = document.getElementById('formula-input') as HTMLInputElement;
  
  if (!cellRef || !formulaInput || !selectedCell) return;
  
  cellRef.textContent = cellAddress(selectedCell.row, selectedCell.col);
  
  const cell = currentSheet.getCell(selectedCell);
  formulaInput.value = cell ? (cell.formula || cell.value || '') : '';
}

function updateCellInfo() {
  if (!selectedRange) return;
  
  const cellInfo = document.getElementById('cell-info');
  if (!cellInfo) return;
  
  const { start, end } = selectedRange;
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  
  let sum = 0;
  let count = 0;
  let numCount = 0;
  
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cell = currentSheet.getCell({ row: r, col: c });
      if (cell && cell.value !== undefined) {
        count++;
        const num = parseFloat(String(cell.value));
        if (!isNaN(num)) {
          sum += num;
          numCount++;
        }
      }
    }
  }
  
  const avg = numCount > 0 ? sum / numCount : 0;
  cellInfo.textContent = `Count: ${count} | Sum: ${sum.toFixed(2)} | Average: ${avg.toFixed(2)}`;
}

// ===== CELL EDITING =====
function setCellValue(row: number, col: number, value: string) {
  const cell = currentSheet.getCell({ row, col }) || {};
  
  if (value.startsWith('=')) {
    cell.formula = value;
    cell.value = value;
  } else {
    cell.value = value;
    delete cell.formula;
  }
  
  currentSheet.setCell({ row, col }, cell);
  
  const cellElement = getCellElement(row, col);
  if (cellElement) {
    cellElement.textContent = value;
    if (value.startsWith('=')) {
      cellElement.classList.add('has-formula');
      cellElement.dataset.formula = value;
    } else {
      cellElement.classList.remove('has-formula');
      delete cellElement.dataset.formula;
    }
  }
}

// ===== FORMATTING =====
function applyFormatting(property: string, value: any) {
  if (!selectedCell && !selectedRange) return;
  
  const cells = selectedRange 
    ? getRangeCells(selectedRange.start, selectedRange.end)
    : [selectedCell!];
  
  cells.forEach(addr => {
    const cell = currentSheet.getCell(addr) || {};
    cell.style = cell.style || {};
    cell.style[property] = value;
    currentSheet.setCell(addr, cell);
    
    const cellElement = getCellElement(addr.row, addr.col);
    if (cellElement) {
      if (property === 'bold') cellElement.style.fontWeight = value ? 'bold' : 'normal';
      if (property === 'italic') cellElement.style.fontStyle = value ? 'italic' : 'normal';
      if (property === 'underline') cellElement.style.textDecoration = value ? 'underline' : 'none';
    }
  });
  
  showStatus('Formatting applied');
}

function getRangeCells(start: { row: number; col: number }, end: { row: number; col: number }) {
  const cells: { row: number; col: number }[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push({ row: r, col: c });
    }
  }
  
  return cells;
}

// ===== CLIPBOARD =====
function copyCells() {
  if (!selectedCell && !selectedRange) return;
  
  const cells = selectedRange 
    ? getRangeCells(selectedRange.start, selectedRange.end)
    : [selectedCell!];
  
  const minRow = Math.min(...cells.map(c => c.row));
  const maxRow = Math.max(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const maxCol = Math.max(...cells.map(c => c.col));
  
  clipboardData = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row: any[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const cell = currentSheet.getCell({ row: r, col: c });
      row.push(cell ? { ...cell } : {});
    }
    clipboardData.push(row);
  }
  
  showStatus(`Copied ${cells.length} cell(s)`);
}

function cutCells() {
  copyCells();
  clearCellContents();
}

function pasteCells() {
  if (!clipboardData || !selectedCell) return;
  
  clipboardData.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const targetRow = selectedCell!.row + rIdx;
      const targetCol = selectedCell!.col + cIdx;
      
      if (cell.value !== undefined || cell.formula !== undefined) {
        currentSheet.setCell({ row: targetRow, col: targetCol }, { ...cell });
        setCellValue(targetRow, targetCol, cell.formula || cell.value || '');
      }
    });
  });
  
  showStatus(`Pasted ${clipboardData.length} row(s)`);
}

function clearCellContents() {
  if (!selectedCell && !selectedRange) return;
  
  const cells = selectedRange 
    ? getRangeCells(selectedRange.start, selectedRange.end)
    : [selectedCell!];
  
  cells.forEach(addr => {
    currentSheet.setCell(addr, {});
    setCellValue(addr.row, addr.col, '');
  });
  
  showStatus(`Cleared ${cells.length} cell(s)`);
}

// ===== CONTEXT MENU =====
function showContextMenu(x: number, y: number) {
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.add('visible');
  }
}

function hideContextMenu() {
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu) contextMenu.classList.remove('visible');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('grid-cell')) {
      const row = parseInt(target.dataset.row || '0');
      const col = parseInt(target.dataset.col || '0');
      
      if (e.shiftKey && selectedCell) {
        selectRange(selectedCell, { row, col });
      } else {
        selectCell(row, col);
      }
    }
    
    if (!target.closest('.filter-dropdown') && !target.closest('.filter-icon')) {
      const filterDropdown = document.getElementById('filter-dropdown');
      if (filterDropdown) filterDropdown.classList.remove('visible');
    }
    
    if (!target.closest('.context-menu')) {
      hideContextMenu();
    }
  });
  
  document.addEventListener('dblclick', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('grid-cell')) {
      const formulaInput = document.getElementById('formula-input') as HTMLInputElement;
      if (formulaInput) {
        formulaInput.focus();
        formulaInput.select();
      }
    }
  });
  
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('grid-cell')) {
      const row = parseInt(target.dataset.row || '0');
      const col = parseInt(target.dataset.col || '0');
      const key = `${row},${col}`;
      
      if (cellComments.has(key)) {
        showCommentTooltip(row, col);
      }
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('grid-cell')) {
      hideCommentTooltip();
    }
  });
  
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('grid-cell')) {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    }
  });
  
  document.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = (item as HTMLElement).dataset.action;
      
      switch (action) {
        case 'cut': cutCells(); break;
        case 'copy': copyCells(); break;
        case 'paste': pasteCells(); break;
        case 'insert-comment': insertComment(); break;
        case 'delete-comment': deleteComment(); break;
        case 'clear-contents': clearCellContents(); break;
      }
      
      hideContextMenu();
    });
  });
  
  const formulaInput = document.getElementById('formula-input') as HTMLInputElement;
  formulaInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && selectedCell) {
      e.preventDefault();
      setCellValue(selectedCell.row, selectedCell.col, formulaInput.value);
      formulaInput.blur();
      
      if (selectedCell.row < (currentSheet.rowCount || 50) - 1) {
        selectCell(selectedCell.row + 1, selectedCell.col);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      updateFormulaBar();
      formulaInput.blur();
    }
  });
  
  const ribbonButtons = document.querySelectorAll('.ribbon-btn');
  ribbonButtons.forEach((btn) => {
    const text = btn.textContent || '';
    
    if (text.includes('𝐁')) {
      btn.addEventListener('click', () => {
        const cell = selectedCell ? currentSheet.getCell(selectedCell) : null;
        const isBold = cell?.style?.bold;
        applyFormatting('bold', !isBold);
      });
    } else if (text.includes('I') && !text.includes('Insert')) {
      btn.addEventListener('click', () => {
        const cell = selectedCell ? currentSheet.getCell(selectedCell) : null;
        const isItalic = cell?.style?.italic;
        applyFormatting('italic', !isItalic);
      });
    } else if (text.includes('U')) {
      btn.addEventListener('click', () => {
        const cell = selectedCell ? currentSheet.getCell(selectedCell) : null;
        const isUnderline = cell?.style?.underline;
        applyFormatting('underline', !isUnderline);
      });
    }
  });
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          copyCells();
          break;
        case 'x':
          e.preventDefault();
          cutCells();
          break;
        case 'v':
          e.preventDefault();
          pasteCells();
          break;
        case 'b':
          e.preventDefault();
          const cellB = selectedCell ? currentSheet.getCell(selectedCell) : null;
          applyFormatting('bold', !cellB?.style?.bold);
          break;
        case 'i':
          e.preventDefault();
          const cellI = selectedCell ? currentSheet.getCell(selectedCell) : null;
          applyFormatting('italic', !cellI?.style?.italic);
          break;
        case 'u':
          e.preventDefault();
          const cellU = selectedCell ? currentSheet.getCell(selectedCell) : null;
          applyFormatting('underline', !cellU?.style?.underline);
          break;
      }
    }
    
    if (e.key === 'Delete') {
      clearCellContents();
    }
    
    if (e.key === 'F2') {
      e.preventDefault();
      const formulaInput = document.getElementById('formula-input') as HTMLInputElement;
      formulaInput?.focus();
    }
    
    const formulaInput = document.getElementById('formula-input') as HTMLInputElement;
    if (document.activeElement !== formulaInput && selectedCell) {
      const rowCount = currentSheet.rowCount || 50;
      const colCount = currentSheet.colCount || 26;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (selectedCell.row > 0) selectCell(selectedCell.row - 1, selectedCell.col);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (selectedCell.row < rowCount - 1) selectCell(selectedCell.row + 1, selectedCell.col);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (selectedCell.col > 0) selectCell(selectedCell.row, selectedCell.col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (selectedCell.col < colCount - 1) selectCell(selectedCell.row, selectedCell.col + 1);
          break;
        case 'Tab':
          e.preventDefault();
          if (selectedCell.col < colCount - 1) selectCell(selectedCell.row, selectedCell.col + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedCell.row < rowCount - 1) selectCell(selectedCell.row + 1, selectedCell.col);
          break;
      }
    }
  });
}

// ===== INITIALIZE =====
loadFromUrl();
