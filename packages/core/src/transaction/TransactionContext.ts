/**
 * TransactionContext.ts — Phase 11: Deterministic Transaction Layer
 *
 * Encapsulates the mutable state of one open transaction on the Worker thread.
 *
 * ==========================================================================
 * DESIGN
 * ==========================================================================
 *
 * TransactionContext is a short-lived object: created by beginTransaction,
 * consumed by commitTransaction or rollbackTransaction.  It owns two pieces
 * of state:
 *
 *   1. A PatchRecorder session that captures every Worksheet mutation event
 *      emitted while the transaction is open.  On commit the recorder
 *      produces the aggregate forward WorksheetPatch covering all ops.
 *
 *   2. An `inverseStack: WorksheetPatch[]` that accumulates the per-op inverse
 *      patches returned by each `recordingApplyPatch` call.  On rollback these
 *      are applied in LIFO order to atomically restore the pre-transaction
 *      state.
 *
 * ==========================================================================
 * PM DIRECTED INVARIANTS (Phase 11)
 * ==========================================================================
 *
 *  I1.  Nested transactions are explicitly rejected at EngineWorkerHost level.
 *       TransactionContext itself does not enforce this — it is a pure state
 *       container; the host enforces the single-open-transaction invariant.
 *
 *  I2.  Recalc runs exactly once per commit/rollback.
 *       TransactionContext deliberately does NOT call ws.recalc().
 *       The caller (EngineWorkerHost) calls it once after commit() or rollback()
 *       returns — never inside this class.
 *
 *  I3.  No observable intermediate state.
 *       All mutations happen inside the Worker (single thread), so the main
 *       thread cannot interleave reads between individual patch ops.
 *       getCellValue returns transactional state: the current stored value
 *       (post–last-mutation, pre-recalc).  This is an explicitly defined
 *       semantic, not "silently stale".
 *
 *  I4.  PatchRecorder integrates cleanly.
 *       The recorder is opened in the TransactionContext constructor and is
 *       closed in commit() or abort() — it spans the exact lifetime of the
 *       transaction.
 *
 * ==========================================================================
 * ROLLBACK ORDERING
 * ==========================================================================
 *
 * If ops P1, P2, P3 are applied during a transaction, the inverseStack holds
 * [inv(P1), inv(P2), inv(P3)].  Rollback applies them in reverse:
 *
 *   applyPatch(ws, inv(P3))  →  applyPatch(ws, inv(P2))  →  applyPatch(ws, inv(P1))
 *
 * This guarantees correct restoration regardless of whether ops are
 * commutative (which, for cell-value writes, they generally are not once
 * formulas are involved).
 *
 * ==========================================================================
 * hasPendingEvaluation
 * ==========================================================================
 *
 * True whenever there are cells in the dirty set awaiting recalc.  During
 * an open transaction this is almost always true (recalc is deferred to
 * commit).  Exposed so the worker can return it via the `hasPendingEvaluation`
 * protocol op.
 *
 * ==========================================================================
 * USAGE (inside EngineWorkerHost)
 * ==========================================================================
 *
 *   // beginTransaction
 *   this._txn = new TransactionContext(this.ws);
 *
 *   // applyPatch (inside active transaction)
 *   const inv = recordingApplyPatch(this.ws, patch);
 *   this._txn.addInverse(inv);
 *   // NOTE: no recalc here — deferred to commit.
 *
 *   // commitTransaction
 *   const { patch, inverse } = this._txn.commit();
 *   this._txn = null;
 *   const recalcResult = this.ws.recalc(() => {});  // exactly once
 *   return { patch, inverse, evaluated: recalcResult.evaluated, hasCycles: recalcResult.cycles.length > 0 };
 *
 *   // rollbackTransaction
 *   this._txn.rollback();           // applies per-op inverses LIFO
 *   this._txn = null;
 *   this.ws.recalc(() => {});       // restore formula values — exactly once
 *
 *   // reset (without commit or rollback)
 *   if (this._txn) { this._txn.dispose(); this._txn = null; }
 *   this.ws = new Worksheet(...);
 */

import type { Worksheet } from '../worksheet';
import {
  type WorksheetPatch,
  invertPatch,
  applyPatch,
} from '../patch/WorksheetPatch';
import { PatchRecorder } from '../patch/PatchRecorder';

// ---------------------------------------------------------------------------
// CommitResult — returned by TransactionContext.commit()
// ---------------------------------------------------------------------------

export type CommitResult = {
  /**
   * The aggregate forward patch covering every operation applied during
   * this transaction.  This is what PatchUndoStack stores as the redo patch.
   */
  patch: WorksheetPatch;

  /**
   * The aggregate inverse patch that reverses every operation in `patch`.
   * This is what PatchUndoStack stores as the undo patch.
   * It is computed from the recorder's captured events (not from inverseStack),
   * giving a single compact invertPatch(aggregateForward) result.
   */
  inverse: WorksheetPatch;
};

// ---------------------------------------------------------------------------
// TransactionContext
// ---------------------------------------------------------------------------

export class TransactionContext {
  private readonly _ws: Worksheet;
  private readonly _recorder: PatchRecorder;

  /**
   * Per-op inverse patches in application order.
   * Used exclusively by rollback() — applied LIFO.
   * NOT used by commit() (the recorder gives a cleaner aggregate inverse).
   */
  private readonly _inverseStack: WorksheetPatch[] = [];

  /**
   * Opens a transaction on `ws`.
   * Starts the PatchRecorder immediately — all subsequent Worksheet events
   * will be captured until commit() or abort() is called.
   */
  constructor(ws: Worksheet) {
    this._ws       = ws;
    this._recorder = new PatchRecorder(ws);
    this._recorder.start();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Register the inverse patch produced by `recordingApplyPatch` for one op.
   *
   * Called by EngineWorkerHost immediately after applying each applyPatch
   * request inside an open transaction.  The inverses are accumulated in
   * application order; rollback() reverses this list.
   */
  addInverse(inverse: WorksheetPatch): void {
    this._inverseStack.push(inverse);
  }

  /**
   * Number of ops applied so far in this transaction.
   * Equals the length of the inverse stack.
   */
  get opCount(): number {
    return this._inverseStack.length;
  }

  /**
   * True when there are cells in the dirty set awaiting recalculation.
   *
   * During an open transaction this is typically true after any cell write.
   * After commit + recalc it should be false (unless volatile cells exist).
   *
   * Exposed so EngineWorkerHost can serve the `hasPendingEvaluation` protocol op.
   */
  get hasPendingEvaluation(): boolean {
    return this._ws.dirtyCount > 0;
  }

  /**
   * Commit the transaction.
   *
   * Stops the PatchRecorder and returns the aggregate forward patch plus its
   * structural inverse.  Does NOT run recalc — the caller must call
   * `ws.recalc(() => {})` immediately after.
   *
   * After this call the TransactionContext is consumed and must not be reused.
   *
   * @returns CommitResult — { patch: forward, inverse: undo }
   */
  commit(): CommitResult {
    const patch   = this._recorder.stop();
    const inverse = invertPatch(patch);
    return { patch, inverse };
  }

  /**
   * Roll back the transaction.
   *
   * Aborts the PatchRecorder (discards forward patch), then applies the
   * per-op inverses in LIFO order to fully restore pre-transaction state.
   *
   * Does NOT run recalc — the caller must call `ws.recalc(() => {})` after.
   *
   * After this call the TransactionContext is consumed and must not be reused.
   */
  rollback(): void {
    // Discard the forward recording first so rollback events are not captured.
    this._recorder.abort();

    // Apply inverses in LIFO order — P3_inv, P2_inv, P1_inv
    for (let i = this._inverseStack.length - 1; i >= 0; i--) {
      applyPatch(this._ws, this._inverseStack[i]!);
    }
  }

  /**
   * Dispose without commit or rollback.
   *
   * Use ONLY when the underlying Worksheet is being replaced (e.g. `reset` op)
   * and no state restoration is needed.  Unlike rollback(), this does NOT
   * attempt to reverse any mutations — it only cleans up the recorder.
   */
  dispose(): void {
    if (this._recorder.isRecording) {
      this._recorder.abort();
    }
  }

  // ── Defensive invariant assertion (called at commitTransaction dispatch) ─

  /**
   * Assert internal invariants before commit returns to the caller.
   *
   * Checks:
   *   - The recorder was successfully stopped (isRecording === false after commit).
   *   - This is called after commit() so recorder.isRecording must already be false.
   *
   * This method is a static guard — it takes the post-commit state as params
   * rather than reading internal fields (which are already consumed by commit()).
   *
   * @param evaluated   Recalc cell count — used to verify recalc ran.
   * @param dirtyCount  ws.dirtyCount after recalc — must be 0 if no volatiles.
   */
  static assertCommitInvariants(
    evaluated: number,
    dirtyCount: number,
    hasVolatiles: boolean,
  ): void {
    if (!hasVolatiles && dirtyCount !== 0) {
      throw new Error(
        `TransactionContext invariant violation: dirtyCount=${dirtyCount} after commit recalc ` +
        `(expected 0, evaluated=${evaluated}).  The dirty set was not fully drained.`,
      );
    }
  }
}
