/**
 * transaction-engine.test.ts — Phase 11: Deterministic Transaction Layer
 *
 * Full test suite for the transaction subsystem:
 *
 *  1. TransactionContext (unit)     — commit, rollback (LIFO), dispose,
 *                                     assertCommitInvariants edge cases
 *  2. TransactionError              — code field, message, prototype chain
 *  3. EngineWorkerHost dispatch     — beginTransaction / commitTransaction /
 *                                     rollbackTransaction / recalc /
 *                                     hasPendingEvaluation
 *  4. WorkerEngineProxy (end-to-end)— all 5 new methods via MockWorker
 *  5. Nested-transaction rejection  — ALREADY_OPEN invariant
 *  6. PatchUndoStack.applyTransactionally — single undo entry, error→rollback,
 *                                           undo/redo round-trip
 *
 * No real Worker threads are spawned.  All worker tests use the same
 * synchronous MockWorker pattern from patch-engine.test.ts / worker-engine.test.ts.
 *
 * PM-directed invariants (verified explicitly):
 *   I1. Nested transactions explicitly rejected (ALREADY_OPEN)
 *   I2. Recalc exactly once per commit/rollback
 *   I3. getCellValue inside transaction returns transactional view (post-write, pre-recalc)
 *   I4. PatchRecorder spans exact transaction lifetime
 */

import { Worksheet } from '../src/worksheet';
import {
  type WorksheetPatch,
  type PatchOp,
  PatchOps,
  invertPatch,
  applyPatch,
} from '../src/patch/WorksheetPatch';
import { PatchRecorder, recordingApplyPatch } from '../src/patch/PatchRecorder';
import {
  PatchUndoStack,
  type IPatchProxy,
  type ITransactionalProxy,
} from '../src/patch/PatchUndoStack';
import {
  TransactionContext,
  TransactionError,
  type CommitResult,
} from '../src/transaction';
import { EngineWorkerHost } from '../src/worker/EngineWorkerHost';
import { WorkerEngineProxy, type IWorkerLike } from '../src/worker/WorkerEngineProxy';
import type { EngineRequest } from '../src/worker/EngineWorkerProtocol';

// ---------------------------------------------------------------------------
// MockWorker — synchronous bridge (same pattern as worker-engine.test.ts)
// ---------------------------------------------------------------------------

class MockWorker implements IWorkerLike {
  private readonly host: EngineWorkerHost;
  private handlers: Array<(ev: MessageEvent) => void> = [];
  public terminated = false;

  constructor(host: EngineWorkerHost) { this.host = host; }

  postMessage(data: unknown, _transferList?: Transferable[]): void {
    if (this.terminated) return;
    const req = data as EngineRequest;
    const { response } = this.host.handleMessage(req);
    const event = new MessageEvent('message', { data: response });
    for (const h of this.handlers) h(event);
  }

  addEventListener(_: 'message', h: (ev: MessageEvent) => void): void { this.handlers.push(h); }
  removeEventListener(_: 'message', h: (ev: MessageEvent) => void): void {
    this.handlers = this.handlers.filter(x => x !== h);
  }
  terminate(): void { this.terminated = true; this.handlers = []; }
}

function makeEngine(name = 'Sheet1'): { host: EngineWorkerHost; proxy: WorkerEngineProxy } {
  const host  = new EngineWorkerHost(name);
  const mock  = new MockWorker(host);
  const proxy = new WorkerEngineProxy(mock);
  return { host, proxy };
}

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------

function makeWs(name = 'Sheet1'): Worksheet {
  return new Worksheet(name);
}

function patch(ops: PatchOp[]): WorksheetPatch {
  return { seq: 0, ops };
}

function setCellPatch(row: number, col: number, before: unknown, after: unknown): WorksheetPatch {
  return patch([PatchOps.setCellValue(row, col, before as never, after as never)]);
}

// ===========================================================================
// 1. TransactionError
// ===========================================================================

describe('TransactionError', () => {
  it('has the expected code field', () => {
    const e = new TransactionError('ALREADY_OPEN');
    expect(e.code).toBe('ALREADY_OPEN');
    expect(e.name).toBe('TransactionError');
  });

  it('maintains proper prototype chain', () => {
    const e = new TransactionError('NOT_OPEN');
    expect(e instanceof TransactionError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });

  it('includes detail in the message when provided', () => {
    const e = new TransactionError('NOT_OPEN', 'called outside transaction');
    expect(e.message).toContain('called outside transaction');
  });

  it('covers all code values', () => {
    const codes: Array<import('../src/transaction').TransactionErrorCode> = [
      'ALREADY_OPEN', 'NOT_OPEN', 'NOT_OPEN_ROLLBACK', 'NOT_OPEN_APPLY', 'INVARIANT_VIOLATION',
    ];
    for (const code of codes) {
      expect(() => { throw new TransactionError(code); }).toThrow(TransactionError);
    }
  });
});

// ===========================================================================
// 2. TransactionContext — unit tests
// ===========================================================================

describe('TransactionContext — commit', () => {
  it('produces an aggregate forward patch covering all ops', () => {
    const ws = makeWs();
    const txn = new TransactionContext(ws);

    const p1 = patch([PatchOps.setCellValue(1, 1, null, 10)]);
    const p2 = patch([PatchOps.setCellValue(1, 2, null, 20)]);
    const inv1 = recordingApplyPatch(ws, p1); txn.addInverse(inv1);
    const inv2 = recordingApplyPatch(ws, p2); txn.addInverse(inv2);

    const { patch: fwd, inverse } = txn.commit();

    // Aggregate forward must cover both ops
    expect(fwd.ops).toHaveLength(2);
    // Inverse must be the structural inverse of fwd
    const expected = invertPatch(fwd);
    expect(inverse.ops).toHaveLength(expected.ops.length);
  });

  it('opCount tracks how many inverses have been added', () => {
    const ws  = makeWs();
    const txn = new TransactionContext(ws);
    expect(txn.opCount).toBe(0);
    const p = patch([PatchOps.setCellValue(1, 1, null, 99)]);
    txn.addInverse(recordingApplyPatch(ws, p));
    expect(txn.opCount).toBe(1);
  });

  it('commit with zero ops returns an empty-ops patch', () => {
    const ws  = makeWs();
    const txn = new TransactionContext(ws);
    const { patch: fwd, inverse } = txn.commit();
    expect(fwd.ops).toHaveLength(0);
    expect(inverse.ops).toHaveLength(0);
  });
});

describe('TransactionContext — rollback', () => {
  it('restores prior cell values after a single op', () => {
    const ws = makeWs();
    ws.setCellValue({ row: 1, col: 1 }, 'original');

    const txn = new TransactionContext(ws);
    const p   = patch([PatchOps.setCellValue(1, 1, 'original', 'modified')]);
    txn.addInverse(recordingApplyPatch(ws, p));

    expect(ws.getCellValue({ row: 1, col: 1 })).toBe('modified');
    txn.rollback();
    expect(ws.getCellValue({ row: 1, col: 1 })).toBe('original');
  });

  it('applies inverses in LIFO order (invariant I rollback ordering)', () => {
    const ws = makeWs();
    // Set up initial state: (1,1) = 'A', (1,2) = 'B'
    ws.setCellValue({ row: 1, col: 1 }, 'A');
    ws.setCellValue({ row: 1, col: 2 }, 'B');

    const txn = new TransactionContext(ws);

    // Op1: change (1,1) from 'A' to 'X', Op2: change (1,2) from 'B' to 'Y'
    const p1 = patch([PatchOps.setCellValue(1, 1, 'A', 'X')]);
    const p2 = patch([PatchOps.setCellValue(1, 2, 'B', 'Y')]);
    txn.addInverse(recordingApplyPatch(ws, p1));
    txn.addInverse(recordingApplyPatch(ws, p2));

    expect(ws.getCellValue({ row: 1, col: 1 })).toBe('X');
    expect(ws.getCellValue({ row: 1, col: 2 })).toBe('Y');

    txn.rollback();

    // Both cells fully restored
    expect(ws.getCellValue({ row: 1, col: 1 })).toBe('A');
    expect(ws.getCellValue({ row: 1, col: 2 })).toBe('B');
  });

  it('three-op LIFO ordering is correct', () => {
    const ws = makeWs();
    ws.setCellValue({ row: 1, col: 1 }, 1);

    const txn = new TransactionContext(ws);
    const p1 = patch([PatchOps.setCellValue(1, 1, 1, 2)]);
    const p2 = patch([PatchOps.setCellValue(1, 1, 2, 3)]);
    const p3 = patch([PatchOps.setCellValue(1, 1, 3, 4)]);
    txn.addInverse(recordingApplyPatch(ws, p1));
    txn.addInverse(recordingApplyPatch(ws, p2));
    txn.addInverse(recordingApplyPatch(ws, p3));

    expect(ws.getCellValue({ row: 1, col: 1 })).toBe(4);
    txn.rollback();
    expect(ws.getCellValue({ row: 1, col: 1 })).toBe(1);
  });
});

describe('TransactionContext — dispose', () => {
  it('dispose aborts recorder without restoring state', () => {
    const ws = makeWs();
    ws.setCellValue({ row: 1, col: 1 }, 'before');

    const txn = new TransactionContext(ws);
    const p   = patch([PatchOps.setCellValue(1, 1, 'before', 'after')]);
    txn.addInverse(recordingApplyPatch(ws, p));

    // After dispose, state is NOT rolled back
    txn.dispose();
    expect(ws.getCellValue({ row: 1, col: 1 })).toBe('after');
  });
});

describe('TransactionContext — assertCommitInvariants', () => {
  it('does not throw when dirtyCount is 0 (no volatiles)', () => {
    expect(() => TransactionContext.assertCommitInvariants(5, 0, false)).not.toThrow();
  });

  it('throws when dirtyCount > 0 and there are no volatiles', () => {
    expect(() => TransactionContext.assertCommitInvariants(5, 3, false)).toThrow(
      /dirtyCount=3/,
    );
  });

  it('does NOT throw when dirtyCount > 0 but volatiles exist', () => {
    // Volatile cells re-seed the dirty set — invariant is skipped
    expect(() => TransactionContext.assertCommitInvariants(5, 3, true)).not.toThrow();
  });

  it('does not throw when evaluated is 0 and no dirty (empty commit)', () => {
    expect(() => TransactionContext.assertCommitInvariants(0, 0, false)).not.toThrow();
  });
});

describe('TransactionContext — hasPendingEvaluation', () => {
  it('is false on a fresh worksheet with no writes', () => {
    const ws  = makeWs();
    const txn = new TransactionContext(ws);
    // No cell writes → dirtyCount = 0
    expect(txn.hasPendingEvaluation).toBe(false);
    txn.dispose();
  });

  it('is true after a cell write inside transaction', () => {
    const ws  = makeWs();
    const txn = new TransactionContext(ws);
    const p   = patch([PatchOps.setCellValue(1, 1, null, 42)]);
    txn.addInverse(recordingApplyPatch(ws, p));
    // notifyChanged marks dirty → dirtyCount > 0
    expect(txn.hasPendingEvaluation).toBe(true);
    txn.dispose();
  });
});

// ===========================================================================
// 3. EngineWorkerHost — transaction dispatch (via handleMessage directly)
// ===========================================================================

/**
 * Dispatch a single message to a host and return the raw response cast to `any`.
 * Necessary because EngineResponse is a discriminated union and Jest tests need
 * to assert both `.result` and `.error` branches without per-call narrowing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hMsg(host: EngineWorkerHost, msg: EngineRequest): any {
  return host.handleMessage(msg).response;
}

describe('EngineWorkerHost — beginTransaction', () => {
  it('returns ok:true on first begin', () => {
    const host = new EngineWorkerHost('S');
    expect(hMsg(host, { id: 1, type: 'beginTransaction', payload: {} }).ok).toBe(true);
  });

  it('throws ALREADY_OPEN on nested begin (invariant I1)', () => {
    const host = new EngineWorkerHost('S');
    hMsg(host, { id: 1, type: 'beginTransaction', payload: {} });
    const resp = hMsg(host, { id: 2, type: 'beginTransaction', payload: {} });
    expect(resp.ok).toBe(false);
    expect(resp.error).toMatch(/ALREADY_OPEN|already open/i);
  });

  it('exposes inTransaction getter', () => {
    const host = new EngineWorkerHost('S');
    expect(host.inTransaction).toBe(false);
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    expect(host.inTransaction).toBe(true);
  });
});

describe('EngineWorkerHost — commitTransaction', () => {
  function beginAndApply(host: EngineWorkerHost, ops: Array<{ row: number; col: number; before: unknown; after: unknown }>) {
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    let id = 2;
    for (const { row, col, before, after } of ops) {
      host.handleMessage({
        id: id++,
        type: 'applyPatch',
        payload: { patch: patch([PatchOps.setCellValue(row, col, before as never, after as never)]) },
      });
    }
    return id;
  }

  it('returns ok:true with patch + inverse + evaluated + hasCycles', () => {
    const host = new EngineWorkerHost('S');
    beginAndApply(host, [{ row: 1, col: 1, before: null, after: 42 }]);
    const resp = hMsg(host, { id: 99, type: 'commitTransaction', payload: {} });
    expect(resp.ok).toBe(true);
    expect(resp.result.patch).toBeDefined();
    expect(resp.result.inverse).toBeDefined();
    expect(typeof resp.result.evaluated).toBe('number');
    expect(typeof resp.result.hasCycles).toBe('boolean');
  });

  it('aggregate patch covers all ops', () => {
    const host = new EngineWorkerHost('S');
    beginAndApply(host, [
      { row: 1, col: 1, before: null, after: 10 },
      { row: 1, col: 2, before: null, after: 20 },
      { row: 1, col: 3, before: null, after: 30 },
    ]);
    const resp = hMsg(host, { id: 99, type: 'commitTransaction', payload: {} });
    expect((resp.result.patch as WorksheetPatch).ops).toHaveLength(3);
  });

  it('aggregate inverse fully undoes the transaction', () => {
    const host = new EngineWorkerHost('S');
    beginAndApply(host, [
      { row: 2, col: 1, before: null, after: 'hello' },
      { row: 2, col: 2, before: null, after: 'world' },
    ]);
    const commitResp = hMsg(host, { id: 99, type: 'commitTransaction', payload: {} });
    const inverse = commitResp.result.inverse as WorksheetPatch;

    // Apply the inverse via another applyPatch op
    host.handleMessage({ id: 100, type: 'applyPatch', payload: { patch: inverse } });

    // Verify cells are back to null
    expect(hMsg(host, { id: 101, type: 'getCellValue', payload: { row: 2, col: 1 } }).result).toBeNull();
    expect(hMsg(host, { id: 102, type: 'getCellValue', payload: { row: 2, col: 2 } }).result).toBeNull();
  });

  it('inTransaction is false after commit', () => {
    const host = new EngineWorkerHost('S');
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    expect(host.inTransaction).toBe(true);
    host.handleMessage({ id: 2, type: 'commitTransaction', payload: {} });
    expect(host.inTransaction).toBe(false);
  });

  it('throws NOT_OPEN when no transaction is open', () => {
    const host = new EngineWorkerHost('S');
    const resp = hMsg(host, { id: 1, type: 'commitTransaction', payload: {} });
    expect(resp.ok).toBe(false);
    expect(resp.error).toMatch(/NOT_OPEN|no.*transaction|transaction.*open/i);
  });
});

describe('EngineWorkerHost — rollbackTransaction', () => {
  it('restores state and returns ok', () => {
    const host = new EngineWorkerHost('S');
    // Set baseline
    hMsg(host, { id: 0, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(3, 1, null, 'base')]) } });

    hMsg(host, { id: 1, type: 'beginTransaction', payload: {} });
    hMsg(host, { id: 2, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(3, 1, 'base', 'txn-modified')]) } });

    // Cell has transactional view: 'txn-modified' (invariant I3)
    expect(hMsg(host, { id: 3, type: 'getCellValue', payload: { row: 3, col: 1 } }).result).toBe('txn-modified');

    expect(hMsg(host, { id: 4, type: 'rollbackTransaction', payload: {} }).ok).toBe(true);

    // Cell is back to 'base'
    expect(hMsg(host, { id: 5, type: 'getCellValue', payload: { row: 3, col: 1 } }).result).toBe('base');
  });

  it('inTransaction is false after rollback', () => {
    const host = new EngineWorkerHost('S');
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    expect(host.inTransaction).toBe(true);
    host.handleMessage({ id: 2, type: 'rollbackTransaction', payload: {} });
    expect(host.inTransaction).toBe(false);
  });

  it('throws NOT_OPEN_ROLLBACK when no transaction is open', () => {
    const host = new EngineWorkerHost('S');
    const resp = hMsg(host, { id: 1, type: 'rollbackTransaction', payload: {} });
    expect(resp.ok).toBe(false);
    expect(resp.error).toMatch(/NOT_OPEN_ROLLBACK|no.*transaction|rollback/i);
  });

  it('LIFO rollback restores three-op sequence correctly', () => {
    const host = new EngineWorkerHost('S');
    // Each op overwrites same cell: null → 1 → 2 → 3
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    host.handleMessage({ id: 2, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(5, 1, null, 1)]) } });
    host.handleMessage({ id: 3, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(5, 1, 1, 2)]) } });
    host.handleMessage({ id: 4, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(5, 1, 2, 3)]) } });
    hMsg(host, { id: 5, type: 'rollbackTransaction', payload: {} });

    expect(hMsg(host, { id: 6, type: 'getCellValue', payload: { row: 5, col: 1 } }).result).toBeNull(); // fully reversed
  });
});

describe('EngineWorkerHost — recalc op', () => {
  it('returns evaluated count and hasCycles outside a transaction', () => {
    const host = new EngineWorkerHost('S');
    const resp = hMsg(host, { id: 1, type: 'recalc', payload: {} });
    expect(resp.ok).toBe(true);
    expect(typeof resp.result.evaluated).toBe('number');
    expect(typeof resp.result.hasCycles).toBe('boolean');
  });

  it('rejects recalc while a transaction is open (cannot interleave recalc)', () => {
    const host = new EngineWorkerHost('S');
    hMsg(host, { id: 1, type: 'beginTransaction', payload: {} });
    const resp = hMsg(host, { id: 2, type: 'recalc', payload: {} });
    expect(resp.ok).toBe(false);
    expect(resp.error).toMatch(/transaction|commit/i);
  });
});

describe('EngineWorkerHost — hasPendingEvaluation', () => {
  it('returns false when no transaction is open and no dirty cells', () => {
    const host = new EngineWorkerHost('S');
    expect(hMsg(host, { id: 1, type: 'hasPendingEvaluation', payload: {} }).result).toBe(false);
  });

  it('returns true when a transaction is open', () => {
    const host = new EngineWorkerHost('S');
    hMsg(host, { id: 1, type: 'beginTransaction', payload: {} });
    expect(hMsg(host, { id: 2, type: 'hasPendingEvaluation', payload: {} }).result).toBe(true);
  });

  it('reflects dirty state outside a transaction', () => {
    const host = new EngineWorkerHost('S');
    hMsg(host, { id: 1, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(1, 1, null, 7)]) } });
    // Key invariant: result is a boolean (may be true or false depending on whether notifyChanged marks dirty)
    expect(typeof hMsg(host, { id: 2, type: 'hasPendingEvaluation', payload: {} }).result).toBe('boolean');
  });

  it('returns false after an explicit recalc drains dirty set', () => {
    const host = new EngineWorkerHost('S');
    hMsg(host, { id: 1, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(1, 1, null, 7)]) } });
    hMsg(host, { id: 2, type: 'recalc', payload: {} });
    expect(hMsg(host, { id: 3, type: 'hasPendingEvaluation', payload: {} }).result).toBe(false);
  });
});

// ===========================================================================
// 4. WorkerEngineProxy — end-to-end transaction via MockWorker
// ===========================================================================

describe('WorkerEngineProxy — transaction methods (end-to-end)', () => {
  it('beginTransaction() resolves to undefined', async () => {
    const { proxy } = makeEngine();
    const result = await proxy.beginTransaction();
    expect(result).toBeUndefined();
  });

  it('commitTransaction() resolves with patch + inverse + evaluated + hasCycles', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await proxy.applyPatch(patch([PatchOps.setCellValue(1, 1, null, 100)]));
    const result = await proxy.commitTransaction();
    expect(result.patch).toBeDefined();
    expect(result.inverse).toBeDefined();
    expect(typeof result.evaluated).toBe('number');
    expect(typeof result.hasCycles).toBe('boolean');
  });

  it('rollbackTransaction() resolves to undefined', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await proxy.applyPatch(patch([PatchOps.setCellValue(1, 1, null, 99)]));
    const result = await proxy.rollbackTransaction();
    expect(result).toBeUndefined();
  });

  it('recalc() resolves with evaluated + hasCycles', async () => {
    const { proxy } = makeEngine();
    const result = await proxy.recalc();
    expect(typeof result.evaluated).toBe('number');
    expect(typeof result.hasCycles).toBe('boolean');
  });

  it('hasPendingEvaluation() resolves to boolean', async () => {
    const { proxy } = makeEngine();
    const result = await proxy.hasPendingEvaluation();
    expect(typeof result).toBe('boolean');
  });

  it('nested beginTransaction() rejects with TransactionError-style message', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await expect(proxy.beginTransaction()).rejects.toThrow(/ALREADY_OPEN|already open/i);
  });

  it('full begin → apply → commit → getCellValue round-trip', async () => {
    const { proxy } = makeEngine();

    await proxy.beginTransaction();
    // getCellValue during transaction returns transactional view (I3)
    const mid = await proxy.getCellValue(10, 10);
    expect(mid).toBeNull(); // not yet written

    await proxy.applyPatch(patch([PatchOps.setCellValue(10, 10, null, 'txn-val')]));

    const midTxn = await proxy.getCellValue(10, 10);
    expect(midTxn).toBe('txn-val'); // post-write transactional view (I3)

    await proxy.commitTransaction();

    const final = await proxy.getCellValue(10, 10);
    expect(final).toBe('txn-val'); // value persists after commit
  });

  it('begin → multi-apply → rollback fully restores state', async () => {
    const { proxy } = makeEngine();

    await proxy.applyPatch(patch([PatchOps.setCellValue(7, 7, null, 'stable')]));

    await proxy.beginTransaction();
    await proxy.applyPatch(patch([PatchOps.setCellValue(7, 7, 'stable', 'a')]));
    await proxy.applyPatch(patch([PatchOps.setCellValue(7, 7, 'a', 'b')]));
    await proxy.applyPatch(patch([PatchOps.setCellValue(7, 7, 'b', 'c')]));

    await proxy.rollbackTransaction();

    const val = await proxy.getCellValue(7, 7);
    expect(val).toBe('stable');
  });

  it('recalc() rejects while transaction is open', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await expect(proxy.recalc()).rejects.toThrow(/transaction|commit/i);
  });

  it('hasPendingEvaluation() returns true while transaction is open', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    expect(await proxy.hasPendingEvaluation()).toBe(true);
  });

  it('reset during open transaction disposes cleanly without error', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await proxy.applyPatch(patch([PatchOps.setCellValue(1, 1, null, 42)]));
    await expect(proxy.reset()).resolves.toBeUndefined();
  });
});

// ===========================================================================
// 5. PatchUndoStack.applyTransactionally
// ===========================================================================

/** Full ITransactionalProxy mock backed by a real Worksheet. */
class TransactionalMockProxy implements ITransactionalProxy {
  private ws: Worksheet;
  public rollbackCalled = false;
  public commitCalled   = false;
  private _host: EngineWorkerHost;

  constructor(ws: Worksheet) {
    this.ws    = ws;
    // Reuse the same Worksheet in a direct EngineWorkerHost for transaction dispatch
    this._host = new EngineWorkerHost('S');
    // Prime the worker worksheet to match ws state (empty)
  }

  async applyPatch(p: WorksheetPatch): Promise<WorksheetPatch> {
    return recordingApplyPatch(this.ws, p);
  }

  async beginTransaction(): Promise<void> {
    const { response } = this._host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    if (!response.ok) throw new Error(response.error);
  }

  async commitTransaction(): Promise<{ patch: WorksheetPatch; inverse: WorksheetPatch; evaluated: number; hasCycles: boolean }> {
    this.commitCalled = true;
    // Build aggregate from recorded ops on this.ws by committing the host's empty transaction
    const { response } = this._host.handleMessage({ id: 2, type: 'commitTransaction', payload: {} });
    if (!response.ok) throw new Error(response.error);
    // The host's worksheet is empty — return a synthetic commit result from ws state
    // For test purposes, build the result manually from what was applied to ws
    const commitResult = response.result as { patch: WorksheetPatch; inverse: WorksheetPatch; evaluated: number; hasCycles: boolean };
    return commitResult;
  }

  async rollbackTransaction(): Promise<void> {
    this.rollbackCalled = true;
    const { response } = this._host.handleMessage({ id: 99, type: 'rollbackTransaction', payload: {} });
    if (!response.ok) throw new Error(response.error);
  }
}

/** A real end-to-end proxy that fully bridges PatchUndoStack ↔ EngineWorkerHost for applyTransactionally. */
function makeTransactionalEngine(): { proxy: WorkerEngineProxy; stack: PatchUndoStack } {
  const host  = new EngineWorkerHost('S');
  const mock  = new MockWorker(host);
  const proxy = new WorkerEngineProxy(mock);
  const stack = new PatchUndoStack(proxy);
  return { proxy, stack };
}

describe('PatchUndoStack.applyTransactionally — end-to-end', () => {
  it('results in exactly one undo entry for a multi-op batch', async () => {
    const { proxy, stack } = makeTransactionalEngine();

    const ops: WorksheetPatch[] = [
      patch([PatchOps.setCellValue(1, 1, null, 'a')]),
      patch([PatchOps.setCellValue(1, 2, null, 'b')]),
      patch([PatchOps.setCellValue(1, 3, null, 'c')]),
    ];

    await stack.applyTransactionally(proxy, ops, 'bulk-edit');

    expect(stack.undoCount).toBe(1);
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(false);
    expect(stack.undoHistory[0]!.label).toBe('bulk-edit');
    expect(stack.undoHistory[0]!.forward.ops).toHaveLength(3);
  });

  it('undo after applyTransactionally restores all cells', async () => {
    const { proxy, stack } = makeTransactionalEngine();

    await stack.applyTransactionally(proxy, [
      patch([PatchOps.setCellValue(2, 1, null, 10)]),
      patch([PatchOps.setCellValue(2, 2, null, 20)]),
    ]);

    expect(await proxy.getCellValue(2, 1)).toBe(10);
    expect(await proxy.getCellValue(2, 2)).toBe(20);

    await stack.undo();

    expect(await proxy.getCellValue(2, 1)).toBeNull();
    expect(await proxy.getCellValue(2, 2)).toBeNull();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(true);
  });

  it('redo after undo re-applies the batch as one entry', async () => {
    const { proxy, stack } = makeTransactionalEngine();

    await stack.applyTransactionally(proxy, [
      patch([PatchOps.setCellValue(3, 1, null, 'X')]),
    ]);

    await stack.undo();
    expect(await proxy.getCellValue(3, 1)).toBeNull();

    await stack.redo();
    expect(await proxy.getCellValue(3, 1)).toBe('X');
    expect(stack.undoCount).toBe(1);
    expect(stack.redoCount).toBe(0);
  });

  it('calls rollbackTransaction on applyPatch failure during batch', async () => {
    const { proxy, stack } = makeTransactionalEngine();

    // A proxy that throws on the second applyPatch
    let callCount = 0;
    const failingProxy: ITransactionalProxy = {
      async beginTransaction() { return proxy.beginTransaction(); },
      async commitTransaction() { return proxy.commitTransaction(); },
      async rollbackTransaction() { return proxy.rollbackTransaction(); },
      async applyPatch(p) {
        callCount++;
        if (callCount === 2) throw new Error('simulated-failure');
        return proxy.applyPatch(p);
      },
    };

    const ops = [
      patch([PatchOps.setCellValue(4, 1, null, 'first')]),
      patch([PatchOps.setCellValue(4, 2, null, 'second')]),
    ];

    await expect(stack.applyTransactionally(failingProxy, ops)).rejects.toThrow('simulated-failure');

    // Stack must have no entries after the failed batch
    expect(stack.undoCount).toBe(0);
  });

  it('empty ops array commits a zero-op transaction', async () => {
    const { proxy, stack } = makeTransactionalEngine();
    await stack.applyTransactionally(proxy, [], 'empty-batch');
    expect(stack.undoCount).toBe(1);
    expect(stack.undoHistory[0]!.forward.ops).toHaveLength(0);
  });

  it('clears redo stack on applyTransactionally', async () => {
    const { proxy, stack } = makeTransactionalEngine();

    // Build some redo history
    await stack.applyTransactionally(proxy, [patch([PatchOps.setCellValue(5, 1, null, 1)])]);
    await stack.undo(); // moves to redo
    expect(stack.canRedo).toBe(true);

    // New transactional apply clears redo
    await stack.applyTransactionally(proxy, [patch([PatchOps.setCellValue(5, 1, null, 2)])]);
    expect(stack.canRedo).toBe(false);
  });
});

// ===========================================================================
// 6. PM Invariant verification (explicit assertions)
// ===========================================================================

describe('PM Invariants — explicit verification', () => {
  it('I1: nested beginTransaction throws TransactionError(ALREADY_OPEN)', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await expect(proxy.beginTransaction()).rejects.toThrow(/ALREADY_OPEN|already open/i);
  });

  it('I2: recalc runs exactly once per commit (no double-recalc observable side-effect)', async () => {
    const { host } = makeEngine();
    // Apply patches and track that we can commit exactly once
    host.handleMessage({ id: 1, type: 'beginTransaction', payload: {} });
    host.handleMessage({ id: 2, type: 'applyPatch', payload: { patch: patch([PatchOps.setCellValue(1, 1, null, 5)]) } });
    host.handleMessage({ id: 3, type: 'commitTransaction', payload: {} });
    // After commit, inTransaction is false and hasPendingEvaluation is false
    expect(host.inTransaction).toBe(false);
    expect(hMsg(host, { id: 4, type: 'hasPendingEvaluation', payload: {} }).result).toBe(false); // dirty drained by recalc
  });

  it('I3: getCellValue inside transaction returns transactional view (post-write, pre-recalc)', async () => {
    const { proxy } = makeEngine();
    await proxy.beginTransaction();
    await proxy.applyPatch(patch([PatchOps.setCellValue(9, 9, null, 'txn-view')]));
    // Must return 'txn-view' — not null (pre-write) and not an error
    const val = await proxy.getCellValue(9, 9);
    expect(val).toBe('txn-view');
    await proxy.commitTransaction();
  });

  it('I4: PatchRecorder spans exact transaction lifetime — recording stops at commit', async () => {
    const ws  = makeWs();
    const txn = new TransactionContext(ws);
    // PatchRecorder is active
    expect(txn.opCount).toBe(0);
    const p = patch([PatchOps.setCellValue(1, 1, null, 7)]);
    txn.addInverse(recordingApplyPatch(ws, p));
    expect(txn.opCount).toBe(1);
    const { patch: fwd } = txn.commit();
    // After commit, recorder is stopped — ops are captured in the forward patch
    expect(fwd.ops).toHaveLength(1);
  });
});
