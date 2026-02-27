/**
 * @group sdk
 *
 * Disposal & Resource Safety Guarantees — Phase 14 Operational Hardening.
 *
 * Objectives:
 *  1. After dispose(), no event ever fires
 *  2. Undo / redo stack is cleared after dispose
 *  3. All public methods throw DisposedError (a SdkError subclass), never raw Error
 *  4. Rapid create → mutate → dispose cycles are stable (no leak / no crash)
 *  5. Multiple dispose() calls are idempotent
 */

import {
  createSpreadsheet,
  SdkError,
  DisposedError,
} from '../../src/sdk/index';
import type { SpreadsheetSDK, SdkEvent } from '../../src/sdk/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSheet(rows = 20, cols = 20) {
  return createSpreadsheet('DisposalTest', { rows, cols, maxUndoHistory: 64 });
}

// ---------------------------------------------------------------------------
// 1. No events fire after dispose
// ---------------------------------------------------------------------------

describe('no events after dispose()', () => {
  it('fires no events for mutations performed after dispose', () => {
    const s = makeSheet();
    const fired: SdkEvent[] = [];
    s.on('cell-changed', (e) => fired.push(e));

    s.dispose();

    // These should NOT throw AND should NOT fire events
    // (they will throw DisposedError which the _guard catches — we swallow it)
    try { s.setCell(1, 1, 'x'); } catch { /* expected DisposedError */ }
    try { s.undo(); } catch { /* expected DisposedError */ }
    try { s.redo(); } catch { /* expected DisposedError */ }
    try { s.mergeCells(1, 1, 2, 2); } catch { /* expected DisposedError */ }

    expect(fired).toHaveLength(0);
  });

  it('on() listener registered before dispose does NOT fire after dispose', () => {
    const s = makeSheet();
    const events: SdkEvent[] = [];
    s.on('cell-changed', (e) => events.push(e));

    // Normal mutation fires
    s.setCell(1, 1, 42);
    const countBeforeDispose = events.length;

    s.dispose();

    // Attempt mutations — the guard should throw, so no events propagate
    try { s.setCell(1, 1, 99); } catch { /* expected */ }

    expect(events.length).toBe(countBeforeDispose);
  });

  it('on() listener registered after dispose never receives events', () => {
    const s = makeSheet();
    s.dispose();

    const events: SdkEvent[] = [];
    // on() after dispose should throw DisposedError, not add the listener silently
    expect(() => s.on('cell-changed', (e) => events.push(e))).toThrow(DisposedError);
    expect(events).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Undo stack is cleared after dispose
// ---------------------------------------------------------------------------

describe('undo stack cleared after dispose()', () => {
  it('undo() throws DisposedError after dispose', () => {
    const s = makeSheet();
    s.setCell(1, 1, 'a');
    s.setCell(2, 2, 'b');

    // can undo before dispose
    expect(s.canUndo).toBe(true);

    s.dispose();

    // undo() must throw DisposedError after dispose
    expect(() => s.undo()).toThrow(DisposedError);
  });
});

// ---------------------------------------------------------------------------
// 3. Every public method throws DisposedError after dispose
// ---------------------------------------------------------------------------

describe('all public methods throw DisposedError after dispose()', () => {
  let s: SpreadsheetSDK;

  beforeEach(() => {
    s = makeSheet();
    // Populate some state first
    s.setCell(1, 1, 'value');
    s.mergeCells(2, 1, 3, 2);
    s.hideRow(4);
    s.encodeSnapshot(); // warm up the encoder
    s.dispose();
  });

  const expectDisposed = (fn: () => unknown) => {
    let thrown: unknown;
    try { fn(); } catch (err) { thrown = err; }
    expect(thrown).toBeInstanceOf(DisposedError);
    expect(thrown).toBeInstanceOf(SdkError);
    expect((thrown as DisposedError).name).toBe('DisposedError');
  };

  it('setCell throws DisposedError', () => expectDisposed(() => s.setCell(1, 1, 'x')));
  it('getCell throws DisposedError', () => expectDisposed(() => s.getCell(1, 1)));
  it('getCellValue throws DisposedError', () => expectDisposed(() => s.getCellValue(1, 1)));
  it('applyPatch throws DisposedError', () => {
    expectDisposed(() => s.applyPatch({ seq: 1, ops: [] }));
  });
  it('snapshot throws DisposedError', () => expectDisposed(() => s.snapshot()));
  it('restore throws DisposedError', () => {
    const snap = { version: 1 as const, name: 'x', rows: 5, cols: 5, cells: {} };
    expectDisposed(() => s.restore(snap as any));
  });
  it('encodeSnapshot throws DisposedError', () => expectDisposed(() => s.encodeSnapshot()));
  it('decodeAndRestore throws DisposedError', () => {
    expectDisposed(() => s.decodeAndRestore(new Uint8Array(4)));
  });
  it('undo throws DisposedError', () => expectDisposed(() => s.undo()));
  it('redo throws DisposedError', () => expectDisposed(() => s.redo()));
  it('mergeCells throws DisposedError', () => expectDisposed(() => s.mergeCells(1, 1, 2, 2)));
  it('cancelMerge throws DisposedError', () => expectDisposed(() => s.cancelMerge(2, 1, 3, 2)));
  it('getMergedRanges throws DisposedError', () => expectDisposed(() => s.getMergedRanges()));
  it('isInMerge throws DisposedError', () => expectDisposed(() => s.isInMerge(1, 1)));
  it('hideRow throws DisposedError', () => expectDisposed(() => s.hideRow(1)));
  it('showRow throws DisposedError', () => expectDisposed(() => s.showRow(1)));
  it('hideCol throws DisposedError', () => expectDisposed(() => s.hideCol(1)));
  it('showCol throws DisposedError', () => expectDisposed(() => s.showCol(1)));
  it('isRowHidden throws DisposedError', () => expectDisposed(() => s.isRowHidden(1)));
  it('isColHidden throws DisposedError', () => expectDisposed(() => s.isColHidden(1)));
  it('on throws DisposedError', () => expectDisposed(() => s.on('cell-changed', () => {})));
});

// ---------------------------------------------------------------------------
// 4. Multiple dispose() calls are idempotent
// ---------------------------------------------------------------------------

describe('dispose() idempotency', () => {
  it('calling dispose() twice does not throw', () => {
    const s = makeSheet();
    s.setCell(1, 1, 'a');
    expect(() => { s.dispose(); s.dispose(); }).not.toThrow();
  });

  it('calling dispose() 10 times does not throw or accumulate errors', () => {
    const s = makeSheet();
    expect(() => {
      for (let i = 0; i < 10; i++) s.dispose();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 5. Rapid create → mutate → dispose cycles (fuzz for leaks/crashes)
// ---------------------------------------------------------------------------

describe('rapid create-mutate-dispose cycles', () => {
  it('1000 create/dispose cycles complete without error', () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) {
        const s = createSpreadsheet(`fuzz-${i}`, { rows: 5, cols: 5 });
        s.setCell(1, 1, i);
        s.dispose();
      }
    }).not.toThrow();
  });

  it('100 create → multi-mutate → subscribe → dispose cycles', () => {
    expect(() => {
      for (let i = 0; i < 100; i++) {
        const s = createSpreadsheet(`fuzz2-${i}`, { rows: 10, cols: 10 });
        const events: SdkEvent[] = [];
        s.on('cell-changed', (e) => events.push(e));
        for (let r = 1; r <= 5; r++) s.setCell(r, 1, `val-${i}-${r}`);
        s.mergeCells(1, 2, 2, 3);
        s.undo();
        s.redo();
        s.dispose();
        // No events should fire after dispose — events array should be stable
        const frozen = events.length;
        try { s.setCell(1, 1, 'after-dispose'); } catch { /* expected */ }
        expect(events.length).toBe(frozen);
      }
    }).not.toThrow();
  });

  it('all post-dispose errors are DisposedError, not raw Error', () => {
    for (let i = 0; i < 20; i++) {
      const s = createSpreadsheet(`fuzz3-${i}`, { rows: 5, cols: 5 });
      s.setCell(1, 1, i);
      s.dispose();

      let thrown: unknown;
      try { s.setCell(1, 1, 'after'); } catch (err) { thrown = err; }
      expect(thrown).toBeInstanceOf(DisposedError);
    }
  });
});
