# Clipboard Architecture V1

**Status**: Design Specification  
**Author**: System Design Phase 0  
**Date**: April 18, 2026  
**Baseline**: `BASELINE_STABLE_V1`

---

## Executive Summary

Clipboard is **NOT** a feature. It is a **transactional graph-aware state transformation system**.

This document defines the complete architecture for copy/paste operations in a deterministic spreadsheet engine with:
- DAG dependency tracking
- Canonical style pointer discipline
- Transactional atomicity
- Full undo/redo support

---

## 1. Clipboard Data Model

### 1.1 Core Type Definition

```typescript
/**
 * ClipboardPayload - Immutable snapshot of copied cell data
 * 
 * Design Constraints:
 * - Never stores references to live worksheet cells (no pointers to mutable state)
 * - Captures display values AND formulas (both needed for paste semantics)
 * - Style pointers are NOT captured (paste will re-intern via StyleCache)
 * - Frozen at copy time, never modified
 */
interface ClipboardPayload {
  /** Snapshot of cell data at copy time */
  cells: CellSnapshot[];
  
  /** Original source range (for relative reference shifting) */
  sourceRange: Range;
  
  /** Cut vs Copy mode (determines source clearing behavior) */
  isCut: boolean;
  
  /** Copy timestamp (for paste conflict detection) */
  timestamp: number;
  
  /** Source worksheet ID (for cross-sheet paste validation) */
  sourceSheetId: string;
}

/**
 * CellSnapshot - Immutable cell state at copy time
 * 
 * Storage Rules:
 * - value: Deep copy (primitives, RichTextValue, EntityValue all serializable)
 * - formula: String copy (formulas are always strings)
 * - style: Serialized object (NOT a canonical pointer - will be re-interned on paste)
 * - position: Relative to sourceRange.start (0-indexed offset)
 */
interface CellSnapshot {
  /** Row offset from sourceRange.start.row */
  rowOffset: number;
  
  /** Column offset from sourceRange.start.col */
  colOffset: number;
  
  /** Cell value (ExtendedCellValue) - deep copy */
  value: ExtendedCellValue;
  
  /** Cell formula (if exists) - will be shifted on paste */
  formula?: string;
  
  /** Serialized style object (will be re-interned via StyleCache on paste) */
  style?: CellStyle;
  
  /** Comment data (threaded comments) */
  comments?: CellComment[];
  
  /** Icon overlay */
  icon?: CellIcon;
  
  /** Merge region metadata (if this cell is merge anchor) */
  mergeRegion?: {
    rowSpan: number;
    colSpan: number;
  };
}

/**
 * Range - Standard spreadsheet range
 */
interface Range {
  start: Address;
  end: Address;
}

/**
 * Address - Standard cell address
 */
interface Address {
  row: number;  // 0-indexed
  col: number;  // 0-indexed
}
```

### 1.2 Design Rationale

**Why offset-based storage?**
- Enables paste to arbitrary location without modifying payload
- Simplifies multi-paste (paste same clipboard multiple times)
- Clear separation: payload is data, target is state

**Why serialize styles instead of storing canonical pointers?**
- Clipboard must work across worksheets (different StyleCache instances)
- Cross-application paste (future: Excel interop) requires serialized format
- **Paste will re-intern via target worksheet's StyleCache (enforces canonical discipline)**

**⚠️ ABSOLUTE RULE - CANONICAL POINTER DISCIPLINE:**
```
Copy  → Serialize style to plain object
Paste → Re-intern via StyleCache → Assign canonical pointer (NEVER create new style object)
```

If paste creates new style objects:
- ❌ Breaks pointer equality (style === style fails)
- ❌ Breaks performance (duplicates in memory)
- ❌ Breaks diffing (temporal identity lost)

**Why store both value AND formula?**
- Paste may target different mode (values-only vs formulas)
- Formula shifting requires original formula string
- Value is needed when pasting to locked/formula-prohibited range

---

## 2. Copy Semantics

### 2.1 Copy Algorithm (Read-Only Operation)

```
FUNCTION copy(worksheet: Worksheet, range: Range): ClipboardPayload
  BEGIN TRANSACTION (read-only snapshot)
    payload = {
      cells: [],
      sourceRange: range,
      isCut: false,
      timestamp: Date.now(),
      sourceSheetId: worksheet.id
    }
    
    FOR each address IN range:
      cell = worksheet.getCell(address)  // Returns Readonly<Cell>
      
      IF cell exists:
        snapshot = {
          rowOffset: address.row - range.start.row,
          colOffset: address.col - range.start.col,
          value: deepClone(cell.value),
          formula: cell.formula,
          style: cell.style ? serializeStyle(cell.style) : undefined,
          comments: cell.comments ? deepClone(cell.comments) : undefined,
          icon: cell.icon ? deepClone(cell.icon) : undefined
        }
        
        // Capture merge region if this is merge anchor
        mergeRegion = worksheet.getMergeRegion(address)
        IF mergeRegion AND mergeRegion.anchor == address:
          snapshot.mergeRegion = {
            rowSpan: mergeRegion.end.row - mergeRegion.start.row + 1,
            colSpan: mergeRegion.end.col - mergeRegion.start.col + 1
          }
        
        payload.cells.push(snapshot)
    
  COMMIT TRANSACTION (snapshot complete)
  
  RETURN payload
```

### 2.2 Cut Semantics

```
FUNCTION cut(worksheet: Worksheet, range: Range): ClipboardPayload
  payload = copy(worksheet, range)
  payload.isCut = true
  
  // NOTE: Source cells are NOT cleared here
  // Clearing happens during paste (atomic: clear source + write target)
  // This prevents zombie state if paste is never executed
  
  RETURN payload
```

**Cut Design Principle:**  
Source cells remain intact until paste executes. This ensures:
- Undo after cut (before paste) restores pre-cut state
- Abandoned cuts (copy over cut) don't leave gaps
- Paste command owns entire state transition atomically

---

## 3. Paste Algorithm (Critical Path)

### 3.1 Paste Transaction Pipeline

```
FUNCTION paste(
  worksheet: Worksheet, 
  targetAddress: Address, 
  payload: ClipboardPayload,
  mode: PasteMode
): PasteCommand

  command = new PasteCommand(worksheet, targetAddress, payload, mode)
  CommandManager.execute(command)
  RETURN command

ENUM PasteMode:
  All,           // Values + Formulas + Styles
  Values,        // Values only (no formulas)
  Formulas,      // Formulas only (no values)
  Formats        // Styles only (no data)
```

### 3.2 PasteCommand Implementation

**⚠️ STRICT ORDERING - LOCKED SEQUENCE:**

```
BEGIN TRANSACTION
  1. Capture old state (for undo) - cells + DAG edges
  2. IF cut: clear source cells + clear source dependencies
  3. Clear target dependencies (only affected range)
  4. Write new cells (shifted formula + value + canonical style)
  5. Register dependencies (new graph edges)
  6. Mark dirty nodes
END TRANSACTION
  7. Recompute (outside mutation phase)
```

**CRITICAL INVARIANT: No graph mutation after recompute begins**

```typescript
class PasteCommand implements Command {
  private worksheet: Worksheet;
  private targetAddress: Address;
  private payload: ClipboardPayload;
  private mode: PasteMode;
  
  // Undo data (captured during execute)
  private previousCells: Map<string, Cell>;  // key: "row:col"
  private previousDependencies: Map<string, Set<string>>;  // DAG edges
  private cutSourceCleared: boolean = false;
  
  execute(): void {
    ASSERT(worksheet._inTransaction === false, "Paste must start fresh transaction")
    
    worksheet.runTransaction(() => {
      // STEP 1: Capture undo state (BEFORE any mutation)
      this.captureUndoState();  // Cells + DAG edges
      
      // STEP 2: Clear cut source (if applicable)
      if (payload.isCut && !cutSourceCleared) {
        this.clearCutSource();  // Cells
        this.clearCutSourceDependencies();  // DAG edges
        cutSourceCleared = true;
      }
      
      // STEP 3: Clear target range dependencies
      this.clearTargetDependencies();
      
      // STEP 4: Write cells to target
      for (snapshot of payload.cells) {
        targetAddr = {
          row: targetAddress.row + snapshot.rowOffset,
          col: targetAddress.col + snapshot.colOffset
        }
        
        this.pasteCell(targetAddr, snapshot);
      }
      
      // STEP 5: Handle merge regions
      this.pasteMergeRegions();
      
      // STEP 6: Register new dependencies (auto via setCellFormula)
      // Dependencies auto-registered by worksheet.setCellFormula()
      
      // STEP 7: Mark dirty nodes
      // Auto-marked by setCellValue/setCellFormula
      
      // Transaction commits here
    });
    
    // STEP 8: Recompute dirty cells (AFTER transaction commit)
    // CRITICAL: No graph mutation beyond this point
    worksheet.recalc();
  }
  
  undo(): void {
    worksheet.runTransaction(() => {
      // Restore previous cells
      for ([key, cell] of previousCells) {
        [row, col] = key.split(':').map(Number)
        worksheet.restoreCell({ row, col }, cell);
      }
      
      // Restore previous dependencies
      for ([targetKey, deps] of previousDependencies) {
        worksheet.getDag().restoreDependencies(targetKey, deps);
      }
      
      // If cut was executed, restore cut source
      if (payload.isCut && cutSourceCleared) {
        this.restoreCutSource();
      }
    });
    
    worksheet.recalc();
  }
  
  private pasteCell(targetAddr: Address, snapshot: CellSnapshot): void {
    // Mode filter
    const shouldPasteValue = mode === PasteMode.All || mode === PasteMode.Values;
    const shouldPasteFormula = mode === PasteMode.All || mode === PasteMode.Formulas;
    const shouldPasteFormat = mode === PasteMode.All || mode === PasteMode.Formats;
    
    // Paste value
    if (shouldPasteValue && !shouldPasteFormula) {
      worksheet.setCellValue(targetAddr, snapshot.value);
    }
    
    // Paste formula (with shifting)
    if (shouldPasteFormula && snapshot.formula) {
      const sourceAddr = {
        row: payload.sourceRange.start.row + snapshot.rowOffset,
        col: payload.sourceRange.start.col + snapshot.colOffset
      };
      
      const shiftedFormula = FormulaShiftingService.shift(
        snapshot.formula,
        sourceAddr,
        targetAddr
      );
      
      worksheet.setCellFormula(targetAddr, shiftedFormula);
      // Note: setCellFormula auto-evaluates and sets value
    }
    
    // Paste format (re-intern via StyleCache)
    if (shouldPasteFormat && snapshot.style) {
      worksheet.setCellStyle(targetAddr, snapshot.style);
      // Note: setCellStyle auto-interns via workbook.getStyleCache()
    }
    
    // Paste comments
    if (shouldPasteValue && snapshot.comments) {
      for (comment of snapshot.comments) {
        worksheet.addComment(targetAddr, comment);
      }
    }
    
    // Paste icon
    if (shouldPasteValue && snapshot.icon) {
      worksheet.setCellIcon(targetAddr, snapshot.icon);
    }
  }
  
  private clearCutSource(): void {
    for (snapshot of payload.cells) {
      sourceAddr = {
        row: payload.sourceRange.start.row + snapshot.rowOffset,
        col: payload.sourceRange.start.col + snapshot.colOffset
      };
      worksheet.clearCell(sourceAddr);
    }
  }
  
  private captureUndoState(): void {
    // Store previous state of all target cells
    for (snapshot of payload.cells) {
      targetAddr = {
        row: targetAddress.row + snapshot.rowOffset,
        col: targetAddress.col + snapshot.colOffset
      };
      
      const cell = worksheet.getCell(targetAddr);
      if (cell) {
        const key = `${targetAddr.row}:${targetAddr.col}`;
        previousCells.set(key, deepClone(cell));
      }
    }
  }
  
  private clearTargetDependencies(): void {
    // Remove old formula dependencies before overwriting
    for (snapshot of payload.cells) {
      targetAddr = {
        row: targetAddress.row + snapshot.rowOffset,
        col: targetAddress.col + snapshot.colOffset
      };
      
      const dag = worksheet.getDag();
      const nodeKey = dag.packKey(targetAddr.row, targetAddr.col);
      
      // Capture for undo
      const deps = dag.getPredecessors(nodeKey);
      if (deps && deps.size > 0) {
        previousDependencies.set(nodeKey.toString(), new Set(deps));
      }
      
      // Clear dependencies (will be re-registered when formula is pasted)
      dag.clearDependencies(nodeKey);
    }
  }
}
```

---

## 4. Formula Shifting Service (NEW)

### 4.1 Core Responsibility

Transform cell references in formulas when copying from source to target address.

### 4.2 Reference Types

| Type | Syntax | Shift Behavior | Example |
|------|--------|----------------|---------|
| Relative | `A1` | Shifts by offset | Copy `B2:=A1` to `D5` → `=C4` |
| Absolute | `$A$1` | Never shifts | Copy `B2:=$A$1` to `D5` → `=$A$1` |
| Mixed Row | `A$1` | Column shifts, row fixed | Copy `B2:=A$1` to `D5` → `C$1` |
| Mixed Col | `$A1` | Row shifts, column fixed | Copy `B2:=$A1` to `D5` → `$A4` |

### 4.3 Algorithm (TOKEN-BASED - NOT REGEX)

**⚠️ CRITICAL**: Regex-based shifting is FORBIDDEN. Must use token-based transformation.

**Why regex fails:**
- Breaks on nested functions: `SUM(A1:B2)`
- Fails on string literals containing cell-like patterns: `"Cell A1"`
- Cannot handle structured references (future)
- Unpredictable performance on complex formulas

**Required Pipeline:**
```
Formula → Tokenize → Transform refs → Rebuild string
```

```typescript
/**
 * Token types for formula parsing
 */
type Token =
  | { type: 'CELL_REF'; value: string; row: number; col: number; rowAbs: boolean; colAbs: boolean }
  | { type: 'RANGE'; start: Token; end: Token }
  | { type: 'SYMBOL'; value: string }  // +, -, *, /, (, ), etc.
  | { type: 'NUMBER'; value: string }
  | { type: 'TEXT'; value: string }    // String literals
  | { type: 'FUNCTION'; value: string } // SUM, IF, etc.
  | { type: 'SHEET_REF'; sheet: string; ref: Token }  // Sheet1!A1

class FormulaShiftingService {
  /**
   * Shift all cell references in a formula
   * 
   * Pipeline:
   * 1. Tokenize formula into structured tokens
   * 2. Transform CELL_REF and RANGE tokens
   * 3. Rebuild formula string from tokens
   * 
   * @param formula - Original formula string (with leading =)
   * @param sourceAddr - Original cell address
   * @param targetAddr - New cell address
   * @returns Shifted formula string
   */
  static shift(
    formula: string, 
    sourceAddr: Address, 
    targetAddr: Address
  ): string {
    const rowOffset = targetAddr.row - sourceAddr.row;
    const colOffset = targetAddr.col - sourceAddr.col;
    
    // Step 1: Tokenize
    const tokens = this.tokenize(formula);
    
    // Step 2: Transform references
    const transformedTokens = tokens.map(token => 
      this.transformToken(token, rowOffset, colOffset)
    );
    
    // Step 3: Rebuild formula
    return this.rebuild(transformedTokens);
  }
  
  /**
   * Tokenize formula into structured tokens
   * O(n) single-pass lexer
   */
  private static tokenize(formula: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    
    // Skip leading '='
    if (formula[0] === '=') i = 1;
    
    while (i < formula.length) {
      const char = formula[i];
      
      // Cell reference pattern: $?[A-Z]+$?[0-9]+
      if (this.isCellRefStart(char, formula, i)) {
        const ref = this.parseCellRef(formula, i);
        tokens.push(ref.token);
        i = ref.endIndex;
        continue;
      }
      
      // Number: [0-9]+\.?[0-9]*
      if (this.isDigit(char)) {
        const num = this.parseNumber(formula, i);
        tokens.push({ type: 'NUMBER', value: num.value });
        i = num.endIndex;
        continue;
      }
      
      // Text literal: "..."
      if (char === '"') {
        const text = this.parseText(formula, i);
        tokens.push({ type: 'TEXT', value: text.value });
        i = text.endIndex;
        continue;
      }
      
      // Function name: [A-Z]+\(
      if (this.isFunctionStart(formula, i)) {
        const func = this.parseFunction(formula, i);
        tokens.push({ type: 'FUNCTION', value: func.value });
        i = func.endIndex;
        continue;
      }
      
      // Range operator ':'
      if (char === ':' && tokens.length > 0) {
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.type === 'CELL_REF') {
          // Look ahead for end reference
          const endRef = this.parseCellRef(formula, i + 1);
          tokens.pop();  // Remove start ref
          tokens.push({
            type: 'RANGE',
            start: lastToken,
            end: endRef.token
          });
          i = endRef.endIndex;
          continue;
        }
      }
      
      // Symbol (operator, parenthesis, comma)
      tokens.push({ type: 'SYMBOL', value: char });
      i++;
    }
    
    return tokens;
  }
  
  /**
   * Transform token by shifting references
   */
  private static transformToken(
    token: Token, 
    rowOffset: number, 
    colOffset: number
  ): Token {
    if (token.type === 'CELL_REF') {
      return this.shiftCellRef(token, rowOffset, colOffset);
    }
    
    if (token.type === 'RANGE') {
      return {
        type: 'RANGE',
        start: this.shiftCellRef(token.start, rowOffset, colOffset),
        end: this.shiftCellRef(token.end, rowOffset, colOffset)
      };
    }
    
    // All other tokens pass through unchanged
    return token;
  }
  
  /**
   * Shift a single cell reference token
   */
  private static shiftCellRef(
    token: Token & { type: 'CELL_REF' },
    rowOffset: number,
    colOffset: number
  ): Token {
    let newRow = token.row;
    let newCol = token.col;
    
    // Shift column if not absolute
    if (!token.colAbs) {
      newCol += colOffset;
      if (newCol < 0) {
        return { type: 'SYMBOL', value: '#REF!' };
      }
    }
    
    // Shift row if not absolute
    if (!token.rowAbs) {
      newRow += rowOffset;
      if (newRow < 0) {
        return { type: 'SYMBOL', value: '#REF!' };
      }
    }
    
    // Rebuild reference string
    const colAbs = token.colAbs ? '$' : '';
    const rowAbs = token.rowAbs ? '$' : '';
    const colStr = this.columnIndexToLetters(newCol);
    const rowStr = (newRow + 1).toString();  // 1-indexed display
    
    return {
      type: 'CELL_REF',
      value: `${colAbs}${colStr}${rowAbs}${rowStr}`,
      row: newRow,
      col: newCol,
      rowAbs: token.rowAbs,
      colAbs: token.colAbs
    };
  }
  
  /**
   * Rebuild formula string from tokens
   */
  private static rebuild(tokens: Token[]): string {
    let formula = '=';
    
    for (const token of tokens) {
      if (token.type === 'RANGE') {
        formula += token.start.value + ':' + token.end.value;
      } else {
        formula += token.value;
      }
    }
    
    return formula;
  }
  
  /**
   * Convert column letters to 0-indexed column number
   * A=0, B=1, ..., Z=25, AA=26, etc.
   */
  private static columnLettersToIndex(letters: string): number {
    let index = 0;
    for (let i = 0; i < letters.length; i++) {
      index = index * 26 + (letters.charCodeAt(i) - 65 + 1);
    }
    return index - 1;  // Convert to 0-indexed
  }
  
  /**
   * Convert 0-indexed column number to letters
   * 0=A, 1=B, ..., 25=Z, 26=AA, etc.
   */
  private static columnIndexToLetters(index: number): string {
    let letters = '';
    let num = index + 1;  // Convert to 1-indexed
    while (num > 0) {
      const remainder = (num - 1) % 26;
      letters = String.fromCharCode(65 + remainder) + letters;
      num = Math.floor((num - 1) / 26);
    }
    return letters;
  }
}
```

### 4.4 Range Handling

Ranges follow same logic: `A1:B2` becomes shifted references for both endpoints.

```typescript
// Extension for range shifting
static shiftRange(range: string, sourceAddr: Address, targetAddr: Address): string {
  const [start, end] = range.split(':');
  const shiftedStart = this.shiftReference(start, sourceAddr, targetAddr);
  const shiftedEnd = this.shiftReference(end, sourceAddr, targetAddr);
  return `${shiftedStart}:${shiftedEnd}`;
}
```

### 4.5 Structured References (Future)

**Not implemented in V1**, but design supports:
- Table references: `Table1[Column]`
- Named ranges: `SalesData`
- Sheet-qualified: `Sheet2!A1`

Algorithm extensibility: Structured refs don't shift, only cell refs shift.

---

## 5. DAG Integration Model

### 5.1 Dependency Lifecycle During Paste

```
BEFORE PASTE:
  Target cell B2 has formula "=A1+A2"
  DAG state:
    A1 → B2 (edge)
    A2 → B2 (edge)
    dirtySet: {}

EXECUTE PASTE (target=B2, formula="=C1+C2"):
  
  STEP 1: Clear old dependencies
    dag.clearDependencies(B2)
    DAG state:
      (A1 → B2 removed)
      (A2 → B2 removed)
  
  STEP 2: Write new formula
    worksheet.setCellFormula(B2, "=C1+C2")
    
  STEP 3: Auto-register new dependencies (inside setCellFormula)
    dag.addEdge(C1, B2)
    dag.addEdge(C2, B2)
    dag.markDirty(B2)
    
  DAG state:
    C1 → B2 (new edge)
    C2 → B2 (new edge)
    dirtySet: {B2}
  
AFTER TRANSACTION COMMIT:
  worksheet.recalc()
    → Topological sort: [B2]
    → Evaluate B2 formula
    → Clear dirtySet
```

### 5.2 Dirty Propagation

**Rule**: Paste marks target cells dirty, NOT their dependents.

**Why?**  
Dirty propagation happens automatically during recalc:
- Target cell evaluates (now clean)
- If value changed → propagate dirty to successors
- Successors recalc in topological order

**Paste does NOT manually propagate dirty** — this is DAG's responsibility.

### 5.3 Edge Cases

#### 5.3.1 Paste Over Formula That References Itself

```
Cell A1: "=A1+1"  (circular reference)

BEFORE: DAG detects cycle, A1 shows #CIRC!

PASTE (target=A1, formula="=B1"):
  clearDependencies(A1)  → Cycle broken
  setCellFormula(A1, "=B1")  → New dependency A1→B1
  recalc()  → No cycle, A1 evaluates cleanly
```

#### 5.3.2 Paste Creates New Cycle

```
A1: "=B1"
B1: "=C1"

PASTE (target=C1, formula="=A1"):
  setCellFormula(C1, "=A1")
  Dependency graph: A1→B1→C1→A1 (cycle!)
  recalc()  → Detects cycle via topological sort
  All three cells → #CIRC! error
```

#### 5.3.3 Multi-Cell Paste With Internal References

```
COPY A1:A2 where:
  A1: "=10"
  A2: "=A1*2"

PASTE to B1:
  B1 formula: "=10" (no shift, it's a constant)
  B2 formula: "=B1*2" (A1→B1 shifted correctly)
  
DAG correctly registers: B1 → B2
```

---

## 6. Undo/Redo Model

### 6.1 Command Structure

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class PasteCommand implements Command {
  // Captured during execute()
  private previousCells: Map<string, Cell>;
  private previousDependencies: Map<Address, Set<Address>>;
  private cutSourceState: Map<string, Cell> | null;
  
  execute() {
    // 1. Capture undo state BEFORE modification
    // 2. Execute paste transaction
    // 3. Recompute
  }
  
  undo() {
    // 1. Restore previousCells to target range
    // 2. Restore previousDependencies to DAG
    // 3. If was cut: restore cutSourceState to source range
    // 4. Recompute
  }
}
```

### 6.2 Undo Invariants

**⚠️ CRITICAL: DAG EDGES MUST BE RESTORED**

Most implementations miss this and get ghost dependencies.

| Invariant | Enforcement | Failure Mode if Missing |
|-----------|-------------|-------------------------|
| Cell values restored | Direct pointer assignment | Wrong calculations |
| Styles restored | Re-intern previous canonical pointer | Pointer identity broken |
| Formulas restored | String assignment + DAG re-registration | Wrong dependencies |
| **DAG structure restored** | **Explicit edge restoration before recalc** | **Ghost deps, nondeterminism** |
| Merge state restored | Re-register merge regions | Visual corruption |
| Hidden state restored | Re-apply visibility (if affected) | Display inconsistency |
| Deterministic result | Undo → Redo → Undo produces identical state | Temporal instability |

**Undo MUST restore:**
```
- cell.value
- cell.formula
- cell.style (canonical pointer)
- cell.mergeRegion
- DAG predecessors (A→B edges)
- DAG successors (B→A inverse)
- Dirty set state
```

### 6.3 Undo After Cut-Paste

```
INITIAL STATE:
  A1: "Hello"
  B1: (empty)

CUT A1:
  clipboard = { cells: [{value: "Hello"}], isCut: true }
  A1: "Hello" (unchanged until paste)

PASTE to B1:
  Transaction:
    1. Clear A1 (cut source)
    2. Write B1 = "Hello"
  
  State:
    A1: (empty)
    B1: "Hello"

UNDO:
  Transaction:
    1. Restore B1 = (empty)
    2. Restore A1 = "Hello"
  
  State:
    A1: "Hello"  ← Cut source restored
    B1: (empty)
```

**Critical**: Undo must restore BOTH target and source ranges atomically.

---

## 7. Edge Cases

### 7.1 Merged Cells

**⚠️ HARD RULE - ANCHOR-ONLY STORAGE:**

```
Clipboard stores ONLY anchor cells of merge regions.
Non-anchor cells in merged range are NOT stored in payload.
```

**Rationale:**
- Only anchor carries data (value/formula/style)
- Non-anchor cells are empty by definition
- Merge region metadata (rowSpan/colSpan) captured in anchor snapshot

#### Scenario 1: Copy Merged Range

```
SOURCE:
  A1:B2 merged (anchor A1, value "Title")

COPY A1:B2:
  payload.cells = [
    { rowOffset: 0, colOffset: 0, value: "Title", mergeRegion: { rowSpan: 2, colSpan: 2 } }
  ]
  // B1, A2, B2 NOT stored (non-anchors)

PASTE to D1:
  1. Paste anchor D1 with value "Title"
  2. Call worksheet.mergeCells({ start: D1, end: E2 })
  3. Non-anchor cells (E1, D2, E2) auto-cleared by merge operation

RESULT:
  D1:E2 merged (anchor D1, value "Title")
```

#### Scenario 2: Paste Over Existing Merge

```
TARGET:
  D1:E2 already merged

PASTE A1 (single cell) to D1:

RESULT:
  Merge region cleared (Excel behavior: paste breaks merge)
  D1 gets pasted value
  
ALGORITHM:
  Before paste: worksheet.unmerge(D1)
  Then paste normally
```

#### Scenario 3: Invalid Overlap (V1 DECISION REQUIRED)

```
TARGET:
  D1:E2 merged

PASTE to D2 (non-anchor, but inside merge):

OPTION A (RECOMMENDED FOR V1):
  THROW error: "Cannot paste into non-anchor cell of merge region"
  
OPTION B (EXCEL BEHAVIOR):
  Auto-unmerge D1:E2, then paste to D2
  
DECISION: OPTION A (throw) for V1
  - Simpler implementation
  - Clear error message
  - Option B can be added in V2
```

### 7.2 Hidden Cells

```
COPY A1:A10 (A5 is hidden)

PASTE to B1:

RESULT:
  B1:B10 all visible (paste ignores hidden state)
  B5 gets data from hidden A5
  
REASONING:
  Hidden is a display property, not data property.
  Clipboard captures ALL cells in range, regardless of visibility.
```

### 7.3 Partial Overlaps

#### Case 1: Copy + Paste Overlap

```
COPY A1:C3

PASTE to B2:

RESULT:
  Overlaps with source range (B2:C3 overlaps A1:C3)
  
BEHAVIOR:
  1. Capture source snapshot BEFORE transaction
  2. Execute paste from snapshot (not live cells)
  3. Snapshot is immutable → no read-modify-write hazard
  
EXAMPLE:
  A1="1", B1="2", C1="3"
  Copy A1:C1, Paste to B1
  After: A1="1", B1="1", C1="2"  ← Shifted correctly from snapshot
```

#### Case 2: Cut + Paste Overlap (CRITICAL EDGE CASE)

**⚠️ MISSING CASE FROM V1 - NOW REQUIRED:**

```
CUT A1:A3
PASTE to A2:

Target A2:A4 intersects source A1:A3

REQUIRED BEHAVIOR:
  1. Snapshot source A1:A3 (immutable)
  2. BEGIN TRANSACTION
  3. Clear source A1:A3
  4. Paste from snapshot to A2:A4
  5. END TRANSACTION
  
RESULT:
  A1: (cleared)
  A2: (value from old A1)
  A3: (value from old A2)
  A4: (value from old A3)
```

**Why this works:**
- Snapshot captured BEFORE source clear
- Source clear happens INSIDE same transaction as paste
- No intermediate observable state
- Undo restores both source and target atomically

**Failure mode if not handled:**
```
Wrong: Clear A1:A3 → try to paste from cleared cells → CORRUPTION
Right: Snapshot → clear → paste from snapshot → CORRECT
```

### 7.4 Cut vs Copy

| Operation | Source After Copy | Source After Paste | Undo Behavior |
|-----------|-------------------|--------------------|-----------------|
| Copy | Unchanged | Unchanged | Restore target only |
| Cut | Unchanged | Cleared | Restore target + source |

**Cut Implementation:**
```typescript
if (payload.isCut) {
  // Clear source IN THE SAME TRANSACTION as paste
  for (snapshot of payload.cells) {
    sourceAddr = computeSourceAddress(snapshot);
    worksheet.clearCell(sourceAddr);
  }
}
```

### 7.5 Empty Cells

```
COPY A1:A3 where A2 is empty

PASTE to B1:

RESULT:
  B1: (value from A1)
  B2: (empty - explicitly cleared)
  B3: (value from A3)
  
ALGORITHM:
  Empty cells ARE included in CellSnapshot with value=null
  On paste: setCellValue(B2, null) → explicitly clears B2
```

### 7.6 Spilled Arrays

**V1 Rule**: Do NOT copy array formulas (requires spill engine integration).

**Future V2**:
- Only copy anchor cell formula
- Paste re-spills at target
- Spill range conflicts handled by spill engine

---

## 8. ClipboardService API

### 8.1 Service Interface

```typescript
class ClipboardService {
  private payload: ClipboardPayload | null = null;
  
  /**
   * Copy range to clipboard
   */
  copy(worksheet: Worksheet, range: Range): void {
    this.payload = this.createPayload(worksheet, range, false);
  }
  
  /**
   * Cut range to clipboard
   */
  cut(worksheet: Worksheet, range: Range): void {
    this.payload = this.createPayload(worksheet, range, true);
  }
  
  /**
   * Paste clipboard to target
   * Returns command for undo/redo
   */
  paste(
    worksheet: Worksheet, 
    targetAddress: Address,
    mode: PasteMode = PasteMode.All
  ): PasteCommand {
    if (!this.payload) {
      throw new Error('Clipboard is empty');
    }
    
    const command = new PasteCommand(
      worksheet, 
      targetAddress, 
      this.payload,
      mode
    );
    
    // Clear cut payload after paste (copy payload remains)
    if (this.payload.isCut) {
      this.payload = null;
    }
    
    return command;
  }
  
  /**
   * Check if clipboard has data
   */
  hasData(): boolean {
    return this.payload !== null;
  }
  
  /**
   * Get clipboard data (read-only)
   */
  getData(): Readonly<ClipboardPayload> | null {
    return this.payload;
  }
  
  /**
   * Clear clipboard
   */
  clear(): void {
    this.payload = null;
  }
  
  private createPayload(
    worksheet: Worksheet, 
    range: Range, 
    isCut: boolean
  ): ClipboardPayload {
    // Implementation per Section 2.1
  }
}
```

### 8.2 Integration with CommandManager

```typescript
// User action: Copy
clipboardService.copy(worksheet, selectedRange);

// User action: Paste
const pasteCommand = clipboardService.paste(worksheet, targetAddress);
commandManager.execute(pasteCommand);

// User action: Undo
commandManager.undo();  // Calls pasteCommand.undo()

// User action: Redo
commandManager.redo();  // Calls pasteCommand.execute()
```

---

## 9. Non-Negotiable Rules

### 9.1 Transaction Discipline

❌ **FORBIDDEN**: Mutate cells outside transaction
```typescript
// BAD
worksheet.setCellValue(addr, value);  // Outside transaction
worksheet.setCellFormula(addr, formula);  // Outside transaction
```

✅ **REQUIRED**: All paste operations inside transaction
```typescript
// GOOD
worksheet.runTransaction(() => {
  worksheet.setCellValue(addr, value);
  worksheet.setCellFormula(addr, formula);
});
```

### 9.2 No Partial Paste States

❌ **FORBIDDEN**: Observable intermediate state
```typescript
// BAD
for (cell of cells) {
  worksheet.setCellValue(cell.addr, cell.value);  // Each is a separate transaction
}
```

✅ **REQUIRED**: Single atomic transaction
```typescript
// GOOD
worksheet.runTransaction(() => {
  for (cell of cells) {
    worksheet.setCellValue(cell.addr, cell.value);
  }
});
```

### 9.3 No Bypassing CommandManager

❌ **FORBIDDEN**: Direct paste without undo support
```typescript
// BAD
function pasteDirectly() {
  worksheet.setCellValue(addr, value);  // No undo
}
```

✅ **REQUIRED**: Execute via CommandManager
```typescript
// GOOD
const command = new PasteCommand(...);
commandManager.execute(command);  // Undo/redo registered
```

### 9.4 No Mid-Transaction Recompute

❌ **FORBIDDEN**: Recompute during paste
```typescript
// BAD
worksheet.runTransaction(() => {
  worksheet.setCellValue(addr, value);
  worksheet.recalc();  // DON'T DO THIS
  worksheet.setCellFormula(addr2, formula);
});
```

✅ **REQUIRED**: Recompute AFTER transaction commit
```typescript
// GOOD
worksheet.runTransaction(() => {
  worksheet.setCellValue(addr, value);
  worksheet.setCellFormula(addr2, formula);
});
worksheet.recalc();  // After transaction
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

- **FormulaShiftingService**:
  - Relative references shift correctly
  - Absolute references don't shift
  - Mixed references shift one dimension
  - Range shifting
  - Invalid references → #REF!

- **ClipboardPayload**:
  - Serialization/deserialization
  - Deep copy of values
  - Style serialization

- **PasteCommand**:
  - Execute sets correct values
  - Execute registers dependencies
  - Undo restores previous state
  - Undo→Redo is deterministic

### 10.2 Integration Tests

- **Copy-Paste Flow**:
  - Copy range → Paste to new location → Verify formulas shifted
  - Copy range → Paste overlapping → Verify no corruption
  - Cut → Paste → Verify source cleared

- **DAG Integration**:
  - Paste formula → Verify dependency registered
  - Paste over formula → Verify old dependency removed
  - Paste creates cycle → Verify #CIRC! error

- **Undo/Redo**:
  - Paste → Undo → Verify full restoration
  - Paste → Undo → Redo → Verify identical to first paste
  - Cut → Paste → Undo → Verify source restored

### 10.3 Edge Case Tests

- Merged cell copy/paste
- Hidden cell preservation
- Empty cell handling
- Partial overlap paste
- Cross-sheet paste (future)

---

## 11. Performance Considerations

### 11.1 Copy Performance

**Target**: < 10ms for 1000 cells

**Optimization**:
- Single-pass iteration over range
- Minimize allocations (reuse objects where possible)
- No deep clone for primitives (immutable by nature)

### 11.2 Paste Performance

**Target**: < 50ms for 1000 cells (including recalc)

**ADDITIONAL CONSTRAINT (MANDATORY):**
```
Paste 10,000 cells → MUST NOT freeze main thread > 100ms
```

**Breakdown**:
- Dependency clearing: O(n) where n = target cells
- Formula shifting: O(n × m) where m = avg formula length (tokenizer is O(n))
- Cell writing: O(n)
- Recompute: O(dirty DAG size)

**Optimization**:
- Batch dependency operations
- Token-based shifting (predictable O(n) performance)
- Transaction batching prevents per-cell events

**Future Hook (not V1):**
- Chunked paste for >10k cells
- Scheduler integration for time-slicing
- Design must NOT block this (no assumptions about synchronous completion)

### 11.3 Memory

**Clipboard size**: ~1KB per 100 cells (serialized)
- 1000 cells ≈ 10KB
- 10,000 cells ≈ 100KB
- Acceptable for in-memory storage

---

## 12. Future Extensions (Out of Scope for V1)

### 12.1 Multi-Range Copy

Excel supports copying non-contiguous ranges. Requires:
- ClipboardPayload.cells becomes grouped by sub-range
- Paste reconstructs spatial relationships

### 12.2 Cross-Sheet Paste

Paste from Sheet1 to Sheet2. Requires:
- Sheet-qualified references: `Sheet1!A1`
- FormulaShiftingService handles sheet prefixes
- StyleCache coordination across worksheets

### 12.3 Cross-Workbook Paste

Paste from one workbook to another. Requires:
- Clipboard serialization format (JSON/binary)
- External reference resolution
- Style de-duplication across workbooks

### 12.4 Clipboard Events

Expose events for UI synchronization:
- `clipboard:copy` → Update UI (show copy feedback)
- `clipboard:cut` → Update UI (show cut feedback)
- `clipboard:paste` → Update UI (flash pasted cells)

### 12.5 Smart Paste

Excel's paste special variants:
- Transpose
- Skip blanks
- Add/Subtract/Multiply/Divide
- Column widths
- Conditional formatting

All follow same architectural pattern (PasteCommand variant).

---

## 13. Open Questions for Implementation

### 13.1 Clipboard Storage Location

**Options**:
- Global singleton (shared across all worksheets/workbooks)
- Per-workbook (each workbook has own clipboard)
- Browser clipboard API integration

**Recommendation**: Global singleton for V1 (matches Excel desktop behavior).

### 13.2 Cross-Sheet Reference Handling

When pasting formula with cross-sheet ref:
```
Copy from Sheet1: "=Sheet2!A1"
Paste to Sheet3: "=Sheet2!A1" (unchanged) or error?
```

**Recommendation**: Preserve cross-sheet refs unchanged (Excel behavior).

### 13.3 Named Range References

```
Copy formula: "=SalesData"
Paste: "=SalesData" (name preserved)
```

**Recommendation**: Don't shift named ranges (Excel behavior).

---

## 14. Architectural Dependencies

### 14.1 Required Systems (Must Exist)

- ✅ `Worksheet` - Core data model
- ✅ `CommandManager` - Undo/redo infrastructure
- ✅ `DependencyGraph` - DAG for formula dependencies
- ✅ `StyleCache` - Canonical style pointer storage
- ✅ `TransactionEngine` - Atomic operation batching

### 14.2 New Systems (Must Implement)

- ❌ `FormulaShiftingService` - Formula reference shifting
- ❌ `ClipboardService` - Clipboard data management
- ❌ `PasteCommand` - Atomic paste operation

### 14.3 Modified Systems (Requires Changes)

- `Worksheet` - Add clipboardCopy/clipboardPaste hooks (maybe not needed if ClipboardService uses existing APIs)
- `CommandManager` - Register PasteCommand type

---

## 15. Success Criteria

Implementation is complete when:

1. ✅ Copy 1000 cells in < 10ms
2. ✅ Paste 1000 cells in < 50ms (including recalc)
3. ✅ Undo → Redo produces identical state (deterministic)
4. ✅ All formula references shift correctly (relative/absolute/mixed)
5. ✅ DAG dependencies update atomically
6. ✅ No observable intermediate paste states
7. ✅ Cut clears source after paste, restores on undo
8. ✅ Merged cells paste correctly
9. ✅ Styles re-intern via StyleCache (canonical discipline preserved)
10. ✅ Zero memory leaks (clipboard cleared after cut-paste)

---

## 16. Summary

**Clipboard is a transactional graph-aware state transformation system.**

Key principles:
- **Immutable snapshots** at copy time
- **Atomic transactions** for paste
- **Formula shifting** preserves relative/absolute semantics
- **DAG integration** for dependency correctness
- **Canonical discipline** for style pointers
- **Full undo/redo** via CommandManager

This design ensures:
- Correctness (no partial states)
- Performance (batched operations)
- Maintainability (clear separation of concerns)
- Extensibility (structured for future features)

Implementation should require **zero architectural decisions** — all edge cases defined, all invariants specified, all algorithms provided.

---

**END OF SPECIFICATION**
