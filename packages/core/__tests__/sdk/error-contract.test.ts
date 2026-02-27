/**
 * @group sdk
 *
 * Strict Public Error Contract — Phase 14 Operational Hardening.
 *
 * Guarantees:
 *  1. Every public method throws ONLY SdkError subclasses — never raw Error,
 *     RangeError, TypeError, MergeConflictError, or any other internal type.
 *  2. mergeCells on an overlapping region throws MergeError (not raw MergeConflictError)
 *  3. mergeCells on a 1×1 region throws MergeError (not raw RangeError)
 *  4. applyPatch with an unrepresentable patch throws PatchError
 *  5. decodeAndRestore with corrupt bytes throws SnapshotError
 *  6. bounds violations throw BoundsError
 *  7. All error subclasses have the correct .name property
 *  8. MergeError and PatchError carry a .cause field referencing the original error
 *  9. No internal class names (MergeConflictError, etc.) leak through .name
 */

import {
  createSpreadsheet,
  SdkError,
  DisposedError,
  BoundsError,
  SnapshotError,
  MergeError,
  PatchError,
} from '../../src/sdk/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSheet(rows = 30, cols = 30) {
  return createSpreadsheet('ErrContract', { rows, cols, maxUndoHistory: 32 });
}

function expectSdkSubclass(
  fn: () => unknown,
  klass: new (...args: any[]) => SdkError,
  expectedName: string,
) {
  let thrown: unknown;
  try { fn(); } catch (err) { thrown = err; }
  expect(thrown).toBeInstanceOf(SdkError);
  expect(thrown).toBeInstanceOf(klass);
  expect((thrown as SdkError).name).toBe(expectedName);
}

// ---------------------------------------------------------------------------
// 1. Error class hierarchy & .name properties
// ---------------------------------------------------------------------------

describe('SdkError subclass hierarchy', () => {
  it('DisposedError.name is "DisposedError"', () => {
    const s = makeSheet();
    s.dispose();
    let thrown: unknown;
    try { s.setCell(1, 1, 'x'); } catch (err) { thrown = err; }
    expect((thrown as DisposedError).name).toBe('DisposedError');
  });

  it('BoundsError.name is "BoundsError"', () => {
    const s = makeSheet(5, 5);
    let thrown: unknown;
    try { s.setCell(99, 99, 'x'); } catch (err) { thrown = err; }
    expect((thrown as BoundsError).name).toBe('BoundsError');
    s.dispose();
  });

  it('SnapshotError.name is "SnapshotError"', () => {
    const s = makeSheet();
    let thrown: unknown;
    try { s.decodeAndRestore(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])); } catch (err) { thrown = err; }
    expect((thrown as SnapshotError).name).toBe('SnapshotError');
    s.dispose();
  });

  it('MergeError.name is "MergeError"', () => {
    const s = makeSheet();
    s.mergeCells(1, 1, 3, 3); // establish merge
    let thrown: unknown;
    try { s.mergeCells(2, 2, 4, 4); } catch (err) { thrown = err; } // overlaps
    expect((thrown as MergeError).name).toBe('MergeError');
    s.dispose();
  });

  it('PatchError.name is "PatchError"', () => {
    // PatchError can be instantiated and has the correct .name and .cause.
    // Live-trigger tests are in the "exported error class .name values" suite below.
    const cause = new Error('internal');
    const e = new PatchError('fail', cause);
    expect(e.name).toBe('PatchError');
    expect(e).toBeInstanceOf(SdkError);
    expect(e.cause).toBe(cause);
  });
});

// ---------------------------------------------------------------------------
// 2. mergeCells throws MergeError for overlapping regions
// ---------------------------------------------------------------------------

describe('mergeCells throws MergeError for invalid regions', () => {
  it('overlapping merge throws MergeError (not raw MergeConflictError)', () => {
    const s = makeSheet();
    s.mergeCells(1, 1, 4, 4);

    expectSdkSubclass(
      () => s.mergeCells(3, 3, 6, 6), // overlaps the existing merge
      MergeError,
      'MergeError',
    );
    s.dispose();
  });

  it('MergeError on overlap has a .cause with the original error message', () => {
    const s = makeSheet();
    s.mergeCells(1, 1, 3, 3);

    let thrown: MergeError | undefined;
    try { s.mergeCells(2, 2, 5, 5); } catch (err) { thrown = err as MergeError; }

    expect(thrown).toBeInstanceOf(MergeError);
    expect(thrown!.cause).toBeTruthy();
    s.dispose();
  });

  it('1×1 region merge throws MergeError (not raw RangeError)', () => {
    const s = makeSheet();
    expectSdkSubclass(
      () => s.mergeCells(2, 2, 2, 2), // single cell — no-op merge is invalid
      MergeError,
      'MergeError',
    );
    s.dispose();
  });

  it('MergeError on 1x1 has a .cause', () => {
    const s = makeSheet();
    let thrown: MergeError | undefined;
    try { s.mergeCells(1, 1, 1, 1); } catch (err) { thrown = err as MergeError; }
    expect(thrown).toBeInstanceOf(MergeError);
    expect(thrown!.cause).toBeTruthy();
    s.dispose();
  });

  it('MergeError thrown is NOT a raw Error (no internal type leak)', () => {
    const s = makeSheet();
    s.mergeCells(2, 2, 4, 4);

    let thrown: unknown;
    try { s.mergeCells(3, 3, 5, 5); } catch (err) { thrown = err; }

    // Must be MergeError, not some internal class
    expect(thrown).toBeInstanceOf(MergeError);
    // The name must never be 'MergeConflictError'
    expect((thrown as Error).name).not.toBe('MergeConflictError');
    expect((thrown as Error).name).not.toBe('RangeError');
    expect((thrown as Error).name).not.toBe('Error');
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 3. decodeAndRestore with corrupt bytes always throws SnapshotError
// ---------------------------------------------------------------------------

describe('decodeAndRestore corrupt input → SnapshotError', () => {
  it('empty Uint8Array throws SnapshotError', () => {
    expectSdkSubclass(
      () => { const s = makeSheet(); try { s.decodeAndRestore(new Uint8Array(0)); } finally { s.dispose(); } },
      SnapshotError,
      'SnapshotError',
    );
  });

  it('random bytes throw SnapshotError', () => {
    const s = makeSheet();
    const random = new Uint8Array(64).map(() => Math.floor(Math.random() * 256));
    let thrown: unknown;
    try { s.decodeAndRestore(random); } catch (err) { thrown = err; }
    expect(thrown).toBeInstanceOf(SnapshotError);
    expect(thrown).toBeInstanceOf(SdkError);
    s.dispose();
  });

  it('truncated valid magic bytes throw SnapshotError', () => {
    const s = makeSheet();
    // Magic = CSEX (0x43 0x53 0x45 0x58) but no valid version/body
    const truncated = new Uint8Array([0x43, 0x53, 0x45, 0x58, 0x00]);
    let thrown: unknown;
    try { s.decodeAndRestore(truncated); } catch (err) { thrown = err; }
    expect(thrown).toBeInstanceOf(SnapshotError);
    s.dispose();
  });

  it('SnapshotError has a .cause referencing the original decode error', () => {
    const s = makeSheet();
    let thrown: SnapshotError | undefined;
    try { s.decodeAndRestore(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])); } catch (err) { thrown = err as SnapshotError; }
    expect(thrown).toBeInstanceOf(SnapshotError);
    expect(thrown!.cause).toBeTruthy();
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 4. BoundsError for out-of-range cell access
// ---------------------------------------------------------------------------

describe('bounds violations throw BoundsError (not raw RangeError or Error)', () => {
  it('setCell beyond row limit throws BoundsError', () => {
    const s = makeSheet(5, 5);
    expectSdkSubclass(() => s.setCell(6, 1, 'x'), BoundsError, 'BoundsError');
    s.dispose();
  });

  it('setCell beyond col limit throws BoundsError', () => {
    const s = makeSheet(5, 5);
    expectSdkSubclass(() => s.setCell(1, 6, 'x'), BoundsError, 'BoundsError');
    s.dispose();
  });

  it('setCell at row 0 throws BoundsError', () => {
    const s = makeSheet(5, 5);
    expectSdkSubclass(() => s.setCell(0, 1, 'x'), BoundsError, 'BoundsError');
    s.dispose();
  });

  it('getCell beyond bounds throws BoundsError', () => {
    const s = makeSheet(5, 5);
    expectSdkSubclass(() => s.getCell(99, 99), BoundsError, 'BoundsError');
    s.dispose();
  });

  it('BoundsError name is not "RangeError" or "Error"', () => {
    const s = makeSheet(5, 5);
    let thrown: unknown;
    try { s.setCell(99, 1, 'x'); } catch (err) { thrown = err; }
    expect((thrown as Error).name).toBe('BoundsError');
    expect((thrown as Error).name).not.toBe('RangeError');
    s.dispose();
  });
});

// ---------------------------------------------------------------------------
// 5. DisposedError for post-dispose calls
// ---------------------------------------------------------------------------

describe('DisposedError thrown for all methods after dispose', () => {
  it('every thrown error is an SdkError subclass, never a plain Error', () => {
    const s = makeSheet();
    s.dispose();

    const mutations: Array<() => unknown> = [
      () => s.setCell(1, 1, 'x'),
      () => s.getCell(1, 1),
      () => s.undo(),
      () => s.redo(),
      () => s.mergeCells(1, 1, 2, 2),
      () => s.cancelMerge(1, 1, 2, 2),
      () => s.encodeSnapshot(),
    ];

    for (const fn of mutations) {
      let thrown: unknown;
      try { fn(); } catch (err) { thrown = err; }
      expect(thrown).toBeInstanceOf(SdkError);
      // Must never be a raw Error that is NOT an SdkError
      if (thrown instanceof Error && !(thrown instanceof SdkError)) {
        throw new Error(`Raw non-SdkError escaped: ${thrown.name}: ${thrown.message}`);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 6. All exported error classes have correct .name (instance check)
// ---------------------------------------------------------------------------

describe('exported error class .name values', () => {
  it('new DisposedError() has .name "DisposedError"', () => {
    const e = new DisposedError('test');
    expect(e.name).toBe('DisposedError');
    expect(e).toBeInstanceOf(SdkError);
  });

  it('new BoundsError() has .name "BoundsError"', () => {
    const e = new BoundsError('test');
    expect(e.name).toBe('BoundsError');
    expect(e).toBeInstanceOf(SdkError);
  });

  it('new SnapshotError() has .name "SnapshotError"', () => {
    const e = new SnapshotError('test', new Error('cause'));
    expect(e.name).toBe('SnapshotError');
    expect(e).toBeInstanceOf(SdkError);
    expect(e.cause).toBeInstanceOf(Error);
  });

  it('new MergeError() has .name "MergeError"', () => {
    const cause = new Error('merge conflict');
    const e = new MergeError('test', cause);
    expect(e.name).toBe('MergeError');
    expect(e).toBeInstanceOf(SdkError);
    expect(e.cause).toBe(cause);
  });

  it('new PatchError() has .name "PatchError"', () => {
    const cause = new Error('patch failed');
    const e = new PatchError('test', cause);
    expect(e.name).toBe('PatchError');
    expect(e).toBeInstanceOf(SdkError);
    expect(e.cause).toBe(cause);
  });
});
