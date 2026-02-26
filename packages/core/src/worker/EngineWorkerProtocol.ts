/**
 * EngineWorkerProtocol.ts — Phase 9: Worker Isolation + Snapshot Transfer
 *
 * Defines the strictly-typed postMessage protocol between the main thread
 * (WorkerEngineProxy) and the computation worker (EngineWorkerHost).
 *
 * Design goals:
 *  1. Single source of truth — EngineOpMap ties together every operation's
 *     request payload and response result type.
 *  2. Zero runtime overhead — all extra types are erased by TypeScript.
 *  3. Transferable snapshots — snapshot/applySnapshot use ArrayBuffer so the
 *     binary blob moves between threads without copying (structured-clone
 *     transfer list).
 *  4. Correlation by id — every request carries a monotonic id; every
 *     response echoes it so the proxy can resolve the correct Promise.
 *
 * ==========================================================================
 * MESSAGE FLOW
 * ==========================================================================
 *
 *  Main thread          │    Worker thread
 *  ─────────────────────┼───────────────────────────────────────────
 *  WorkerEngineProxy    │    EngineWorkerHost
 *    proxy.setCellValue() ──[EngineRequest{type:'setCellValue'}]──>
 *    Promise<void>       <──[EngineResponse{ok:true,result:void}]──
 *
 *    proxy.snapshot()    ──[EngineRequest{type:'snapshot'}]──────>
 *    Promise<ArrayBuffer> <──[EngineResponse{result:ArrayBuffer}]──
 *                           (ArrayBuffer transferred, zero-copy)
 *
 * ==========================================================================
 * SUPPORTED OPERATIONS
 * ==========================================================================
 *
 *  ping              Health check. Returns 'pong'.
 *  reset             Replace the worksheet with a fresh empty instance.
 *  setCellValue      Set a cell's value.
 *  getCellValue      Read a cell's value (null if empty).
 *  registerDeps      Register a formula's dependency list in the DAG.
 *  mergeCells        Merge a rectangular range.
 *  hideRow / showRow Toggle row visibility.
 *  hideCol / showCol Toggle column visibility.
 *  snapshot          Encode and transfer current state as ArrayBuffer.
 *  applySnapshot     Decode and apply a transferred ArrayBuffer snapshot.
 *  applyPatch        Apply a WorksheetPatch; returns the inverse patch.
 */

import type { ExtendedCellValue } from '../types';
import type { WorksheetPatch } from '../patch/WorksheetPatch';

// ---------------------------------------------------------------------------
// Core operation map
// ---------------------------------------------------------------------------

/** Row/col pair — matches Address but avoids a cross-module import here. */
export type RC = { row: number; col: number };

/**
 * Single source of truth for every engine operation.
 * Each key maps to `{ payload, result }` where:
 *   payload — the data sent with the request (main → worker)
 *   result  — the data returned in the response (worker → main)
 *
 * `result: void` means the operation has no return value (success only).
 * `result: ArrayBuffer` marks a field that will be listed in postMessage's
 *   transfer list for zero-copy ownership transfer.
 */
export type EngineOpMap = {
  /** Health check — worker replies 'pong'. */
  ping: {
    payload: Record<never, never>;
    result:  'pong';
  };

  /** Reset the worksheet to empty state (replaces the internal Worksheet). */
  reset: {
    payload: Record<never, never>;
    result:  void;
  };

  /** Set a cell value (string | number | boolean | null). */
  setCellValue: {
    payload: { row: number; col: number; value: ExtendedCellValue };
    result:  void;
  };

  /** Read a cell value; null if the cell is empty. */
  getCellValue: {
    payload: { row: number; col: number };
    result:  ExtendedCellValue;
  };

  /**
   * Register formula dependency edges in the DAG.
   * `deps` is the predecessor list (cells whose values this formula reads).
   */
  registerDeps: {
    payload: { row: number; col: number; deps: RC[] };
    result:  void;
  };

  /** Merge a rectangular range of cells. */
  mergeCells: {
    payload: { startRow: number; startCol: number; endRow: number; endCol: number };
    result:  void;
  };

  /** Hide a row by 1-based index. */
  hideRow: {
    payload: { row: number };
    result:  void;
  };

  /** Restore a previously hidden row. */
  showRow: {
    payload: { row: number };
    result:  void;
  };

  /** Hide a column by 1-based index. */
  hideCol: {
    payload: { col: number };
    result:  void;
  };

  /** Restore a previously hidden column. */
  showCol: {
    payload: { col: number };
    result:  void;
  };

  /**
   * Encode the current worksheet state and return it as an ArrayBuffer.
   * The buffer is placed in the postMessage transfer list — the caller
   * receives sole ownership (zero-copy).
   */
  snapshot: {
    payload: Record<never, never>;
    result:  ArrayBuffer;
  };

  /**
   * Decode and apply a snapshot.
   * The `buf` ArrayBuffer should be transferred (listed in the transfer list
   * of the calling postMessage) so the worker gains sole ownership.
   */
  applySnapshot: {
    payload: { buf: ArrayBuffer };
    result:  void;
  };

  /**
   * Apply a WorksheetPatch to the worker's Worksheet and return the inverse
   * patch so the caller can undo the operation without an extra round-trip.
   *
   * The inverse is computed on the Worker thread (which owns the authoritative
   * Worksheet state) using recordingApplyPatch.  The returned WorksheetPatch
   * is a plain serialisable object — no transfer list required.
   *
   * When called inside an open transaction the Worker additionally accumulates
   * the per-op inverse in TransactionContext.inverseStack for rollback use.
   */
  applyPatch: {
    payload: { patch: WorksheetPatch };
    result:  WorksheetPatch;   // inverse patch for undo / per-op rollback
  };

  // ── Phase 11: Transaction layer ────────────────────────────────────────

  /**
   * Open a transaction on the Worker's Worksheet.
   *
   * While a transaction is open:
   *   - applyPatch ops are accepted and accumulated (no recalc between ops).
   *   - Nested beginTransaction calls are rejected with TransactionError.
   *   - getCellValue returns transactional state (post-write, pre-recalc).
   *
   * Throws TransactionError(ALREADY_OPEN) if a transaction is already open.
   */
  beginTransaction: {
    payload: Record<never, never>;
    result:  void;
  };

  /**
   * Commit the open transaction.
   *
   * Actions (in order):
   *   1. Stop PatchRecorder — produces aggregate forward patch.
   *   2. Compute aggregate inverse from forward patch.
   *   3. Run recalc exactly once — evaluates the full dirty subgraph.
   *   4. Assert post-commit invariants.
   *   5. Return aggregate patch + inverse + recalc stats.
   *
   * Throws TransactionError(NOT_OPEN) if no transaction is active.
   */
  commitTransaction: {
    payload: Record<never, never>;
    result:  {
      patch:      WorksheetPatch;  // aggregate forward patch (all ops combined)
      inverse:    WorksheetPatch;  // aggregate inverse  (single undo entry)
      evaluated:  number;          // cells recalculated at commit
      hasCycles:  boolean;         // true if circular references detected
    };
  };

  /**
   * Roll back the open transaction.
   *
   * Actions (in order):
   *   1. Abort PatchRecorder (discard forward recording).
   *   2. Apply per-op inverses LIFO — restores pre-transaction state.
   *   3. Run recalc exactly once — formula values restored.
   *
   * Throws TransactionError(NOT_OPEN_ROLLBACK) if no transaction is active.
   */
  rollbackTransaction: {
    payload: Record<never, never>;
    result:  void;
  };

  /**
   * Run a full recalculation pass outside a transaction.
   *
   * Evaluates the dirty subgraph in topological order and clears the dirty
   * set.  Returns the number of cells evaluated and whether cycles were found.
   *
   * This op is exposed standalone so Phase 13+ collaborative sync can apply
   * a batch of remote patches (each via applyPatch) and then trigger a single
   * recalc pass, decoupling mutation acceptance from formula evaluation.
   *
   * Throws if called while a transaction is open (recalc is deferred to commit).
   */
  recalc: {
    payload: Record<never, never>;
    result:  { evaluated: number; hasCycles: boolean };
  };

  /**
   * Query whether the Worker has cells awaiting evaluation.
   *
   * Returns true when:
   *   - A transaction is open (recalc is deferred); or
   *   - Cells have been mutated since the last recalc pass.
   *
   * Useful in dev mode to surface pending evaluation to the UI.
   */
  hasPendingEvaluation: {
    payload: Record<never, never>;
    result:  boolean;
  };
};

/** All supported operation names. */
export type EngineOpName = keyof EngineOpMap;

// ---------------------------------------------------------------------------
// Convenience shorthand types
// ---------------------------------------------------------------------------

/** Payload type for a given operation. */
export type RequestPayload<K extends EngineOpName> = EngineOpMap[K]['payload'];

/** Result type for a given operation. */
export type ResponseResult<K extends EngineOpName> = EngineOpMap[K]['result'];

// ---------------------------------------------------------------------------
// Wire types — sent over postMessage
// ---------------------------------------------------------------------------

/**
 * Request message sent from WorkerEngineProxy → EngineWorkerHost.
 * The `id` is a monotonically increasing counter used to correlate responses.
 */
export type EngineRequest<K extends EngineOpName = EngineOpName> = {
  id:      number;
  type:    K;
  payload: RequestPayload<K>;
};

/**
 * Response message sent from EngineWorkerHost → WorkerEngineProxy.
 *   ok: true  — operation succeeded; `result` carries the return value.
 *   ok: false — operation threw; `error` carries the message string.
 */
export type EngineResponse<K extends EngineOpName = EngineOpName> =
  | { id: number; type: K; ok: true;  result: ResponseResult<K> }
  | { id: number; type: K; ok: false; error:  string            };

// ---------------------------------------------------------------------------
// Transferable detection helper
// ---------------------------------------------------------------------------

/**
 * Extract the ArrayBuffer transfer list from an EngineResponse.
 * Returns a non-empty array only for the `snapshot` response (where
 * `result` IS the ArrayBuffer to be transferred).
 */
export function getResponseTransferList(resp: EngineResponse): Transferable[] {
  if (resp.ok && resp.type === 'snapshot') {
    return [resp.result as ArrayBuffer];
  }
  return [];
}

/**
 * Extract the ArrayBuffer transfer list from an EngineRequest.
 * Returns a non-empty array only for the `applySnapshot` request (where
 * `buf` inside the payload is the ArrayBuffer to be transferred).
 */
export function getRequestTransferList(req: EngineRequest): Transferable[] {
  if (req.type === 'applySnapshot') {
    return [(req.payload as RequestPayload<'applySnapshot'>).buf];
  }
  return [];
}
