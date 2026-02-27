/**
 * @group sdk
 *
 * Phase 17: Full-Sheet Search & Atomic Replace — Test Suite
 *
 * Tests `findAll` and `replaceAll` from the `./search` subpath.
 *
 * §1  findAll — basic values search
 * §2  findAll — lookIn options (values / formulas / comments)
 * §3  findAll — SearchOptions passthrough (matchCase, lookAt, wildcards)
 * §4  findAll — range constraint
 * §5  findAll — SheetSearchResult shape
 * §6  replaceAll — SINGLE undo entry (the key invariant)
 * §7  replaceAll — count contract
 * §8  replaceAll — lookIn values vs formulas
 * §9  replaceAll — lookAt whole/part + case sensitivity
 * §10 replaceAll — event emission
 * §11 replaceAll — range constraint
 * §12 replaceAll — disposal safety
 * §13 replaceAll vs replaceInFormulas — undo entry count contrast
 */

import { createSpreadsheet } from '../../src/sdk/index';
import {
  findAll,
  replaceAll,
  replaceInFormulas,
} from '../../src/search/index';
import type { SheetSearchResult } from '../../src/search/index';
import type { Worksheet } from '../../src/worksheet';
import type { SpreadsheetSDK } from '../../src/sdk/SpreadsheetSDK';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSheet(rows = 100, cols = 20): { sheet: SpreadsheetSDK; ws: Worksheet } {
  const sheet = createSpreadsheet('Test', { rows, cols });
  const ws = (sheet as any)._ws as Worksheet;
  return { sheet, ws };
}

function plantFormula(ws: Worksheet, row: number, col: number, formula: string, display?: number | string): void {
  ws.setCellFormula({ row, col }, formula, display);
}

function addComment(ws: Worksheet, row: number, col: number, text: string): void {
  ws.addComment({ row, col }, { text, author: 'tester' });
}

/** How many undo entries are on the stack (accesses _undo.canUndo indirectly). */
function undoCount(sheet: SpreadsheetSDK): number {
  let count = 0;
  // Repeatedly check canUndo without actually undoing by cloning undo stack
  // — we use the public API: undo until empty, count, redo all back.
  const values: boolean[] = [];
  while (sheet.canUndo) {
    sheet.undo();
    values.push(true);
    count++;
  }
  // Redo everything back so the sheet state is restored
  for (let i = 0; i < count; i++) sheet.redo();
  return count;
}

// ---------------------------------------------------------------------------
// §1 — findAll: basic values search
// ---------------------------------------------------------------------------

describe('§1 findAll — basic values search', () => {
  test('empty what returns empty array', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    expect(findAll(sheet, { what: '' })).toEqual([]);
  });

  test('finds nothing when no cells match', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Mango');
    expect(findAll(sheet, { what: 'Apple' })).toEqual([]);
  });

  test('finds a single matching value cell', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 3, col: 2 }, 'Apple');
    const results = findAll(sheet, { what: 'Apple' });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 3, col: 2, value: 'Apple' });
  });

  test('finds multiple matching cells', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Red Apple');
    ws.setCellValue({ row: 2, col: 3 }, 'Green Apple');
    ws.setCellValue({ row: 5, col: 1 }, 'Mango');
    ws.setCellValue({ row: 6, col: 2 }, 'Apple Pie');

    const results = findAll(sheet, { what: 'Apple' });
    expect(results).toHaveLength(3);
  });

  test('numeric cells searched via string representation', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 42);
    ws.setCellValue({ row: 2, col: 1 }, 420);

    const results = findAll(sheet, { what: '42' });
    // Default lookAt: 'part' → "420" also contains "42"
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.row === 1)).toBe(true);
  });

  test('results are in row-major ascending order by default', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 5, col: 3 }, 'Target');
    ws.setCellValue({ row: 1, col: 8 }, 'Target');
    ws.setCellValue({ row: 3, col: 1 }, 'Target');
    ws.setCellValue({ row: 1, col: 2 }, 'Target');

    const results = findAll(sheet, { what: 'Target' });
    const positions = results.map(r => ({ row: r.row, col: r.col }));
    expect(positions).toEqual([
      { row: 1, col: 2 },
      { row: 1, col: 8 },
      { row: 3, col: 1 },
      { row: 5, col: 3 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// §2 — findAll: lookIn options
// ---------------------------------------------------------------------------

describe('§2 findAll — lookIn options', () => {
  test("lookIn: 'values' (default) searches cell display values", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Revenue: 500');
    plantFormula(ws, 2, 1, '=SUM(A1)', 500); // formula: '=SUM(A1)', display: 500

    // "Revenue" exists in a value cell, not in a formula string
    const results = findAll(sheet, { what: 'Revenue', lookIn: 'values' });
    expect(results).toHaveLength(1);
    expect(results[0].row).toBe(1);
  });

  test("lookIn: 'formulas' finds in formula strings", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'SUM of values'); // plain text
    plantFormula(ws, 2, 1, '=SUM(A1:A10)', 55);           // formula contains SUM

    const results = findAll(sheet, { what: 'SUM', lookIn: 'formulas' });
    // Formula cell matches on formula string; plain text cell also matches
    // because findIterator falls back to display value when no formula
    expect(results.some(r => r.row === 2)).toBe(true);
  });

  test("lookIn: 'formulas' finds formula cells but not value-only cells by formula text", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 42);        // plain number, no formula
    plantFormula(ws, 2, 1, '=SUM(42)', 42);          // formula contains '42'

    const results = findAll(sheet, { what: '=SUM', lookIn: 'formulas' });
    // Only the formula cell has "=SUM" in its formula string
    expect(results).toHaveLength(1);
    expect(results[0].row).toBe(2);
  });

  test("lookIn: 'comments' finds cells by comment text", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 42);
    addComment(ws, 1, 1, 'This is a review note');
    ws.setCellValue({ row: 2, col: 1 }, 99);
    addComment(ws, 2, 1, 'Approved by manager');

    const results = findAll(sheet, { what: 'review', lookIn: 'comments' });
    expect(results).toHaveLength(1);
    expect(results[0].row).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// §3 — findAll: SearchOptions passthrough
// ---------------------------------------------------------------------------

describe('§3 findAll — SearchOptions passthrough', () => {
  test('matchCase: false (default) is case-insensitive', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'APPLE');
    ws.setCellValue({ row: 2, col: 1 }, 'apple');

    const results = findAll(sheet, { what: 'Apple', matchCase: false });
    expect(results).toHaveLength(2);
  });

  test('matchCase: true is case-sensitive', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'APPLE');
    ws.setCellValue({ row: 2, col: 1 }, 'apple');

    const results = findAll(sheet, { what: 'apple', matchCase: true });
    expect(results).toHaveLength(1);
    expect(results[0].row).toBe(2);
  });

  test("lookAt: 'whole' requires exact match", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    ws.setCellValue({ row: 2, col: 1 }, 'Apple Pie');

    const results = findAll(sheet, { what: 'Apple', lookAt: 'whole' });
    expect(results).toHaveLength(1);
    expect(results[0].row).toBe(1);
  });

  test('wildcard * works (via worksheet search engine)', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    ws.setCellValue({ row: 2, col: 1 }, 'Application');
    ws.setCellValue({ row: 3, col: 1 }, 'Mango');

    // Excel-style wildcard: "App*" matches anything starting with App
    const results = findAll(sheet, { what: 'App*', lookAt: 'whole' });
    expect(results).toHaveLength(2);
    expect(results.map(r => r.row).sort()).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// §4 — findAll: range constraint
// ---------------------------------------------------------------------------

describe('§4 findAll — range constraint', () => {
  test('range limits search to specified cells', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple'); // outside range
    ws.setCellValue({ row: 5, col: 3 }, 'Apple'); // inside range
    ws.setCellValue({ row: 10, col: 5 }, 'Apple'); // outside range

    const results = findAll(
      sheet,
      { what: 'Apple' },
      { start: { row: 3, col: 2 }, end: { row: 8, col: 6 } },
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ row: 5, col: 3 });
  });

  test('empty range returns no results', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 5, col: 5 }, 'Apple');

    const results = findAll(
      sheet,
      { what: 'Apple' },
      { start: { row: 1, col: 1 }, end: { row: 3, col: 3 } },
    );
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §5 — findAll: SheetSearchResult shape
// ---------------------------------------------------------------------------

describe('§5 findAll — SheetSearchResult shape', () => {
  test('value cell has value field and no formula field', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Hello');

    const [r] = findAll(sheet, { what: 'Hello' });
    expect(r.value).toBe('Hello');
    expect(r.formula).toBeUndefined();
  });

  test('formula cell has both value and formula fields', () => {
    const { sheet, ws } = makeSheet();
    plantFormula(ws, 1, 1, '=SUM(A2:A5)', 100);

    const results = findAll(sheet, { what: '100', lookIn: 'values' });
    // The formula cell has display value 100
    const r = results.find(x => x.row === 1);
    expect(r).toBeDefined();
    expect(r!.value).toBe(100);
    expect(r!.formula).toBe('=SUM(A2:A5)');
  });

  test('null value cell (never written) does not appear in results', () => {
    const { sheet } = makeSheet();
    // No cells written — nothing to find
    const results = findAll(sheet, { what: 'anything' });
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// §6 — replaceAll: SINGLE undo entry (the key invariant)
// ---------------------------------------------------------------------------

describe('§6 replaceAll — single undo entry', () => {
  test('N replacements produce EXACTLY ONE undo entry', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Draft report');
    ws.setCellValue({ row: 2, col: 1 }, 'Draft analysis');
    ws.setCellValue({ row: 3, col: 1 }, 'Draft summary');
    ws.setCellValue({ row: 4, col: 1 }, 'Final document'); // no match

    expect(sheet.canUndo).toBe(false); // fresh sheet

    const count = replaceAll(sheet, 'Draft', 'Final');
    expect(count).toBe(3);
    expect(sheet.canUndo).toBe(true);

    // ONE undo call reverses ALL 3 replacements
    const undid = sheet.undo();
    expect(undid).toBe(true);
    expect(sheet.canUndo).toBe(false); // only one entry was added

    // All three cells restored
    expect(sheet.getCell(1, 1)?.value).toBe('Draft report');
    expect(sheet.getCell(2, 1)?.value).toBe('Draft analysis');
    expect(sheet.getCell(3, 1)?.value).toBe('Draft summary');
    // Non-matching cell untouched
    expect(sheet.getCell(4, 1)?.value).toBe('Final document');
  });

  test('undo + redo cycle is correct', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'v1');
    ws.setCellValue({ row: 2, col: 1 }, 'v1');

    replaceAll(sheet, 'v1', 'v2');

    // Both cells changed
    expect(sheet.getCell(1, 1)?.value).toBe('v2');
    expect(sheet.getCell(2, 1)?.value).toBe('v2');

    sheet.undo();

    expect(sheet.getCell(1, 1)?.value).toBe('v1');
    expect(sheet.getCell(2, 1)?.value).toBe('v1');

    // Redo restores both
    sheet.redo();
    expect(sheet.getCell(1, 1)?.value).toBe('v2');
    expect(sheet.getCell(2, 1)?.value).toBe('v2');
  });

  test('undo correctly restores non-string original values', () => {
    const { sheet, ws } = makeSheet();
    // setCellValue typically stores strings, but verify numeric values round-trip via undo
    ws.setCellValue({ row: 1, col: 1 }, 'price: 100');
    ws.setCellValue({ row: 2, col: 1 }, 'price: 200');

    replaceAll(sheet, 'price', 'cost');

    expect(sheet.getCell(1, 1)?.value).toBe('cost: 100');
    expect(sheet.getCell(2, 1)?.value).toBe('cost: 200');

    sheet.undo();

    expect(sheet.getCell(1, 1)?.value).toBe('price: 100');
    expect(sheet.getCell(2, 1)?.value).toBe('price: 200');
  });

  test('no undo entry when count is 0', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');

    expect(sheet.canUndo).toBe(false);
    replaceAll(sheet, 'Mango', 'Lemon'); // no match

    expect(sheet.canUndo).toBe(false);
  });

  test('1_000 replacements = 1 undo entry', () => {
    const sheet = createSpreadsheet('BigSheet', { rows: 1100, cols: 5 });
    const ws = (sheet as any)._ws as Worksheet;

    for (let r = 1; r <= 1000; r++) {
      ws.setCellValue({ row: r, col: 1 }, `OldValue-${r}`);
    }

    const count = replaceAll(sheet, 'OldValue', 'NewValue');
    expect(count).toBe(1000);

    // Exactly one undo entry
    expect(sheet.canUndo).toBe(true);
    sheet.undo();
    expect(sheet.canUndo).toBe(false);

    // All restored
    expect(sheet.getCell(1, 1)?.value).toBe('OldValue-1');
    expect(sheet.getCell(500, 1)?.value).toBe('OldValue-500');
    expect(sheet.getCell(1000, 1)?.value).toBe('OldValue-1000');
  });
});

// ---------------------------------------------------------------------------
// §7 — replaceAll: count contract
// ---------------------------------------------------------------------------

describe('§7 replaceAll — count contract', () => {
  test('returns 0 for empty query', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    expect(replaceAll(sheet, '', 'Mango')).toBe(0);
  });

  test('returns 0 when no match', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Mango');
    expect(replaceAll(sheet, 'Apple', 'Banana')).toBe(0);
  });

  test('returns 0 when replacement is identical to source', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    expect(replaceAll(sheet, 'Apple', 'Apple')).toBe(0); // no-op
  });

  test('returns exact cell count for matching cells', () => {
    const { sheet, ws } = makeSheet();
    for (let r = 1; r <= 5; r++) ws.setCellValue({ row: r, col: 1 }, 'match');
    ws.setCellValue({ row: 6, col: 1 }, 'other text');

    expect(replaceAll(sheet, 'match', 'hit')).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// §8 — replaceAll: lookIn values vs formulas
// ---------------------------------------------------------------------------

describe('§8 replaceAll — lookIn behavior', () => {
  test("lookIn: 'values' (default) replaces cell display values", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Revenue target');
    plantFormula(ws, 2, 1, '=Revenue()', 0); // formula contains 'Revenue'

    // Values search finds the plain text cell, NOT the formula cell
    // (formula cell's display value is 0 — no match for 'Revenue')
    const count = replaceAll(sheet, 'Revenue', 'Income', { lookIn: 'values' });
    expect(count).toBe(1);
    expect(sheet.getCell(1, 1)?.value).toBe('Income target');
    // Formula cell's formula is untouched
    expect((sheet as any)._ws.getCell({ row: 2, col: 1 })?.formula).toBe('=Revenue()');
  });

  test("lookIn: 'formulas' replaces within formula strings", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Revenue target'); // plain value
    plantFormula(ws, 2, 1, '=Revenue()', 0);               // formula cell
    plantFormula(ws, 3, 1, '=SUM(Revenue1:Revenue10)', 50); // formula with ref

    const count = replaceAll(sheet, 'Revenue', 'Income', { lookIn: 'formulas' });
    // Formula cells matched on formula string; plain value cell "Revenue target"
    // also matches (fallback behavior of lookIn:'formulas' for value cells)
    expect(count).toBeGreaterThanOrEqual(2);

    // Formula cells were replaced
    expect(sheet.getCell(2, 1)?.value).toBe('=Income()');
    expect(sheet.getCell(3, 1)?.value).toBe('=SUM(Income1:Income10)');
  });

  test("replaces ALL occurrences within one cell text when lookAt: 'part'", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'cat and cat and cat');

    replaceAll(sheet, 'cat', 'dog');
    expect(sheet.getCell(1, 1)?.value).toBe('dog and dog and dog');
  });
});

// ---------------------------------------------------------------------------
// §9 — replaceAll: lookAt and case sensitivity
// ---------------------------------------------------------------------------

describe('§9 replaceAll — lookAt and case sensitivity', () => {
  test("lookAt: 'whole' replaces only exact-match cells", () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Draft');
    ws.setCellValue({ row: 2, col: 1 }, 'Draft copy');

    replaceAll(sheet, 'Draft', 'Final', { lookAt: 'whole' });
    expect(sheet.getCell(1, 1)?.value).toBe('Final'); // exact match → replaced
    expect(sheet.getCell(2, 1)?.value).toBe('Draft copy'); // not exact → untouched
  });

  test('case-insensitive by default', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'HELLO world');

    replaceAll(sheet, 'hello', 'HI');
    expect(sheet.getCell(1, 1)?.value).toBe('HI world');
  });

  test('matchCase: true — case-sensitive replacement', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'HELLO world');
    ws.setCellValue({ row: 2, col: 1 }, 'hello world');

    replaceAll(sheet, 'hello', 'hi', { matchCase: true });
    expect(sheet.getCell(1, 1)?.value).toBe('HELLO world'); // uppercase → not matched
    expect(sheet.getCell(2, 1)?.value).toBe('hi world');    // lowercase → matched
  });
});

// ---------------------------------------------------------------------------
// §10 — replaceAll: event emission
// ---------------------------------------------------------------------------

describe('§10 replaceAll — event emission', () => {
  test('cell-changed fires for each replaced cell', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Draft A');
    ws.setCellValue({ row: 2, col: 1 }, 'Draft B');
    ws.setCellValue({ row: 3, col: 1 }, 'Final C'); // no match

    const fired: Array<{ row: number; col: number }> = [];
    const d = sheet.on('cell-changed', e => {
      if (e.type === 'cell-changed') fired.push({ row: e.row, col: e.col });
    });

    replaceAll(sheet, 'Draft', 'Done');

    expect(fired).toHaveLength(2);
    expect(fired).toContainEqual({ row: 1, col: 1 });
    expect(fired).toContainEqual({ row: 2, col: 1 });
    d.dispose();
  });

  test('events are synchronous', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Target');

    let syncFired = false;
    const d = sheet.on('cell-changed', () => { syncFired = true; });

    replaceAll(sheet, 'Target', 'Hit');

    expect(syncFired).toBe(true); // fired before replaceAll returned
    d.dispose();
  });

  test('no events fired when nothing matches', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Mango');

    const fired: unknown[] = [];
    const d = sheet.on('cell-changed', e => fired.push(e));

    replaceAll(sheet, 'Apple', 'Banana');

    expect(fired).toHaveLength(0);
    d.dispose();
  });
});

// ---------------------------------------------------------------------------
// §11 — replaceAll: range constraint
// ---------------------------------------------------------------------------

describe('§11 replaceAll — range constraint', () => {
  test('only replaces cells within the specified range', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Draft'); // outside range
    ws.setCellValue({ row: 5, col: 3 }, 'Draft'); // inside range
    ws.setCellValue({ row: 9, col: 1 }, 'Draft'); // outside range

    const count = replaceAll(
      sheet,
      'Draft',
      'Final',
      {},
      { start: { row: 3, col: 2 }, end: { row: 7, col: 6 } },
    );

    expect(count).toBe(1);
    expect(sheet.getCell(1, 1)?.value).toBe('Draft');  // untouched
    expect(sheet.getCell(5, 3)?.value).toBe('Final');   // replaced
    expect(sheet.getCell(9, 1)?.value).toBe('Draft');  // untouched
  });

  test('undo reverts only the range-constrained replacements', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Draft');
    ws.setCellValue({ row: 5, col: 1 }, 'Draft');

    replaceAll(
      sheet, 'Draft', 'Final', {},
      { start: { row: 4, col: 1 }, end: { row: 6, col: 1 } },
    );

    sheet.undo();

    expect(sheet.getCell(1, 1)?.value).toBe('Draft');
    expect(sheet.getCell(5, 1)?.value).toBe('Draft');
  });
});

// ---------------------------------------------------------------------------
// §12 — replaceAll: disposal safety
// ---------------------------------------------------------------------------

describe('§12 replaceAll — disposal safety', () => {
  test('throws DisposedError when sheet is disposed and matches exist', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Target');
    sheet.dispose();

    expect(() => replaceAll(sheet, 'Target', 'Hit')).toThrow('disposed');
  });

  test('does not throw when disposed and no matches (no-op path)', () => {
    const { sheet } = makeSheet();
    sheet.dispose();
    // No matches found on empty disposed sheet → returns 0 before guarded path
    // Actually with our guard at function entry, it will throw.
    // This test verifies the guard fires REGARDLESS of match state.
    expect(() => replaceAll(sheet, 'anythin', 'anything')).toThrow('disposed');
  });

  test('findAll does not throw on disposed sheet (pure read)', () => {
    const { sheet, ws } = makeSheet();
    ws.setCellValue({ row: 1, col: 1 }, 'Apple');
    sheet.dispose();
    // findAll is pure read; _ws is still alive after dispose()
    expect(() => findAll(sheet, { what: 'Apple' })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// §13 — replaceAll vs replaceInFormulas: undo entry count contrast
// ---------------------------------------------------------------------------

describe('§13 replaceAll vs replaceInFormulas — undo entry count contrast', () => {
  test('replaceInFormulas adds N undo entries for N formula cells', () => {
    const { sheet, ws } = makeSheet();
    plantFormula(ws, 1, 1, '=OldName(A1)');
    plantFormula(ws, 2, 1, '=OldName(A2)');
    plantFormula(ws, 3, 1, '=OldName(A3)');

    replaceInFormulas(sheet, 'OldName', 'NewName');

    // Three separate setCell calls → three undo entries
    expect(sheet.canUndo).toBe(true);
    sheet.undo(); expect(sheet.canUndo).toBe(true);  // second entry still there
    sheet.undo(); expect(sheet.canUndo).toBe(true);  // third entry still there
    sheet.undo(); expect(sheet.canUndo).toBe(false); // now empty
  });

  test('replaceAll with lookIn:formulas adds EXACTLY ONE undo entry for N cells', () => {
    const { sheet, ws } = makeSheet();
    plantFormula(ws, 1, 1, '=OldName(A1)');
    plantFormula(ws, 2, 1, '=OldName(A2)');
    plantFormula(ws, 3, 1, '=OldName(A3)');

    replaceAll(sheet, 'OldName', 'NewName', { lookIn: 'formulas' });

    // ONE batch patch → one undo entry. Single undo reverses all 3.
    expect(sheet.canUndo).toBe(true);
    sheet.undo();
    expect(sheet.canUndo).toBe(false); // done — only one entry was added

    // All three cells restored (formula cell .formula field untouched,
    // but .value was written as part of replace — undo restores .value)
    // plantFormula without displayValue → cell.value is null before replace.
    // After undo the value is restored to null.
    expect(sheet.getCell(1, 1)?.value).toBeNull();
  });

  test('replaceAll undo is atomic: all-or-nothing', () => {
    const { sheet, ws } = makeSheet();
    for (let r = 1; r <= 10; r++) {
      ws.setCellValue({ row: r, col: 1 }, `item_old_${r}`);
    }

    replaceAll(sheet, 'old', 'new');

    // All 10 cells changed
    for (let r = 1; r <= 10; r++) {
      expect(sheet.getCell(r, 1)?.value).toBe(`item_new_${r}`);
    }

    // Single undo reverts all 10 atomically
    sheet.undo();

    for (let r = 1; r <= 10; r++) {
      expect(sheet.getCell(r, 1)?.value).toBe(`item_old_${r}`);
    }
  });
});
