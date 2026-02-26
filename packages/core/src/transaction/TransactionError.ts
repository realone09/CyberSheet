/**
 * TransactionError.ts — Phase 11: Deterministic Transaction Layer
 *
 * A typed error for all transaction protocol violations.
 *
 * Using a distinct error class lets callers discriminate transaction faults
 * from worksheet errors (e.g. MergeConflictError, codec errors) without
 * string-matching the message.
 *
 * The `code` field provides machine-readable categorisation for the proxy and
 * any future error-reporting / telemetry layer.
 */

/** All possible transaction violation codes. */
export type TransactionErrorCode =
  /** beginTransaction called while a transaction is already open. */
  | 'ALREADY_OPEN'
  /** commitTransaction called with no active transaction. */
  | 'NOT_OPEN'
  /** rollbackTransaction called with no active transaction. */
  | 'NOT_OPEN_ROLLBACK'
  /** applyPatch called inside a transaction (protocol misuse from caller). */
  | 'NOT_OPEN_APPLY'
  /** Internal invariant violated at commit time. */
  | 'INVARIANT_VIOLATION';

export class TransactionError extends Error {
  readonly code: TransactionErrorCode;

  constructor(code: TransactionErrorCode, detail?: string) {
    super(TransactionError._message(code, detail));
    this.name  = 'TransactionError';
    this.code  = code;
    // Maintain proper prototype chain in compiled ES5 targets.
    Object.setPrototypeOf(this, TransactionError.prototype);
  }

  private static _message(code: TransactionErrorCode, detail?: string): string {
    const base: Record<TransactionErrorCode, string> = {
      ALREADY_OPEN:          'beginTransaction: a transaction is already open — nested transactions are not supported.',
      NOT_OPEN:              'commitTransaction: no active transaction.',
      NOT_OPEN_ROLLBACK:     'rollbackTransaction: no active transaction.',
      NOT_OPEN_APPLY:        'applyPatch (transactional): no active transaction to receive this patch.',
      INVARIANT_VIOLATION:   'Transaction invariant violated at commit.',
    };
    return detail ? `${base[code]} (${detail})` : base[code];
  }
}
