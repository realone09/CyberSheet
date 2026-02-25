/**
 * HTTP Transport Observability Interface
 *
 * Provides visibility into HTTP driver behavior without coupling to logging implementation.
 * All hooks are optional - drivers must check existence before calling.
 *
 * @remarks
 * Observability enables:
 * - Quota burn rate measurement
 * - Retry frequency analysis
 * - Throttle effectiveness validation
 * - Latency distribution monitoring
 *
 * This is a TELEMETRY interface, not a logging contract.
 * Implementations may batch, sample, or aggregate - drivers must not assume synchronous side effects.
 *
 * @see AlphaVantageDriver for usage example
 */
export interface HttpObservability {
  /**
   * Called when HTTP request dispatch begins (after throttle, before network)
   * @param symbol - Stock symbol being requested
   * @param timestamp - High-resolution timestamp (performance.now() or Date.now())
   */
  requestStarted?(symbol: string, timestamp: number): void;

  /**
   * Called when HTTP request completes (success or cached error)
   * @param symbol - Stock symbol requested
   * @param durationMs - Total time from requestStarted to completion
   * @param cached - True if value served from cache (no network call)
   */
  requestFinished?(symbol: string, durationMs: number, cached: boolean): void;

  /**
   * Called when HttpProviderAdapter triggers retry
   * @param symbol - Symbol being retried
   * @param attempt - Retry attempt number (1-based: 1 = first retry)
   * @param delayMs - Exponential backoff delay before retry
   */
  retryTriggered?(symbol: string, attempt: number, delayMs: number): void;

  /**
   * Called when quota limit reached (before throwing Error)
   * @param used - Current quota consumption
   * @param limit - Daily quota limit
   */
  quotaHit?(used: number, limit: number): void;

  /**
   * Called when throttle policy delays request dispatch
   * @param provider - Provider type being throttled (e.g., 'stock')
   * @param waitMs - Milliseconds until next available slot
   */
  throttleDelayed?(provider: string, waitMs: number): void;
}
