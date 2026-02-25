/**
 * QUOTA CONTRACT
 *
 * Formal invariants for API quota management in HTTP drivers.
 * Violations of this contract will cause quota exhaustion, API bans, or rate limit violations.
 *
 * INVARIANTS:
 *
 * 1. CONSUMPTION ACCOUNTING
 *    Every outbound HTTP attempt that reaches the network provider MUST consume quota.
 *    This includes:
 *    - Initial requests
 *    - Retry attempts (each retry consumes quota independently)
 *    - Failed requests (network errors still consume quota)
 *
 *    This does NOT include:
 *    - Cache hits (no network call = no quota consumption)
 *    - Transport-level failures before dispatch (e.g., invalid URL construction)
 *    - Throttle delays (waiting is not consuming)
 *
 * 2. EXHAUSTION ENFORCEMENT
 *    When quota is exhausted, the driver MUST:
 *    - Throw Error("#QUOTA!") immediately
 *    - NOT dispatch any HTTP request
 *    - NOT consume additional quota
 *    - Cache the error in registry for deduplication
 *
 * 3. PRE-DISPATCH VALIDATION
 *    Quota check MUST occur BEFORE making network request.
 *    Correct order:
 *      await throttle.acquire();  // Wait for rate limit slot
 *      assertQuota();              // Check quota availability
 *      consumeQuota();             // Decrement counter
 *      dispatch();                 // Make HTTP request
 *
 *    This prevents quota burn during throttle waits and ensures atomic accounting.
 *
 * 4. OBSERVABILITY REQUIREMENT
 *    Quota state MUST be observable for telemetry.
 *    Drivers must expose:
 *    - Current quota usage
 *    - Quota limit
 *    - Remaining quota
 *    - (Optional) Reset time for daily quotas
 *
 * 5. ATOMICITY GUARANTEE
 *    Quota operations MUST be atomic.
 *    No race conditions allowed between:
 *    - Check and consume
 *    - Multiple concurrent workers
 *    - Retry attempts
 *
 *    In single-threaded JS, this means synchronous quota operations only.
 *
 * RATIONALE:
 *
 * - API quotas are hard limits (500/day for Alpha Vantage free tier)
 * - Exceeding quota can cause IP bans or account suspension
 * - Retry cascades can consume quota exponentially (3 retries × 100 symbols = 300 quota)
 * - Throttle delays must not burn quota (wait 10s, then fail quota check = wasted time)
 * - Quota exhaustion must fail fast (don't queue 1000 requests when 50 quota remains)
 *
 * ENFORCEMENT:
 *
 * This contract is enforced by:
 * - QuotaManager implementation (this file)
 * - Integration tests (quota exhaustion, retry accounting)
 * - HttpProviderAdapter interaction contract
 *
 * EVOLUTION:
 *
 * Future enhancements backward-compatible with this contract:
 * - Persistent quota state (survive process restart)
 * - Quota reset scheduling (daily rollover)
 * - Multi-tier quota (different limits per plan)
 * - Quota pooling (shared across drivers)
 *
 * @see AlphaVantageDriver for reference implementation
 * @see HttpProviderAdapter for retry interaction
 * @see BatchResolver for throttle coordination
 */

/**
 * QuotaManager - Enforces QUOTA CONTRACT for HTTP drivers
 *
 * Provides atomic quota accounting with hard enforcement.
 * All operations are synchronous for atomicity in single-threaded JS.
 */
export class QuotaManager {
  private used = 0;

  /**
   * @param limit - Maximum requests allowed per period (e.g., 500/day)
   * @param resetTime - Optional: when quota resets (future: daily rollover)
   */
  constructor(
    public readonly limit: number,
    public readonly resetTime?: Date
  ) {
    if (limit <= 0) {
      throw new Error('QuotaManager: limit must be positive');
    }
  }

  /**
   * Check if quota available (does NOT consume)
   * @returns true if quota available, false if exhausted
   */
  isAvailable(): boolean {
    return this.used < this.limit;
  }

  /**
   * Assert quota available, throw if exhausted (INVARIANT 2)
   * @throws Error("#QUOTA!") if quota exhausted
   */
  assertAvailable(): void {
    if (!this.isAvailable()) {
      throw new Error('#QUOTA!');
    }
  }

  /**
   * Consume one unit of quota atomically (INVARIANT 5)
   * @throws Error("#QUOTA!") if quota exhausted before consumption
   */
  consume(): void {
    this.assertAvailable();
    this.used++;
  }

  /**
   * Get current usage (INVARIANT 4 - observability)
   */
  getUsed(): number {
    return this.used;
  }

  /**
   * Get remaining quota
   */
  getRemaining(): number {
    return Math.max(0, this.limit - this.used);
  }

  /**
   * Reset quota (for testing or daily rollover)
   */
  reset(): void {
    this.used = 0;
  }
}
