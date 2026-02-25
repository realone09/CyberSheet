/**
 * ThrottlePolicy: Rate limiting interface for provider requests
 * 
 * Generic throttle abstraction - no domain logic, no entity type hardcoding.
 * Each provider can have its own throttle policy configured externally.
 */
export interface ThrottlePolicy {
  /**
   * Acquire permission to make a request.
   * Blocks if rate limit would be exceeded.
   * 
   * @returns Promise that resolves when request is allowed
   */
  acquire(): Promise<void>;
}

/**
 * WindowThrottle: Sliding window rate limiter
 * 
 * Generic implementation - works for any provider.
 * Limits N requests per time window (e.g., 5 requests per 60 seconds).
 * 
 * Example usage:
 *   new WindowThrottle(5, 60_000)  // Alpha Vantage: 5 requests/minute
 *   new WindowThrottle(10, 1000)   // Geography API: 10 requests/second
 */
export class WindowThrottle implements ThrottlePolicy {
  private requestTimestamps: number[] = [];

  constructor(
    private maxRequests: number,    // Max requests allowed in window
    private windowMs: number         // Time window in milliseconds
  ) {
    if (maxRequests <= 0) {
      throw new Error('WindowThrottle: maxRequests must be positive');
    }
    if (windowMs <= 0) {
      throw new Error('WindowThrottle: windowMs must be positive');
    }
  }

  async acquire(): Promise<void> {
    const now = Date.now();

    // Remove timestamps outside current sliding window
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.windowMs
    );

    // If at capacity, wait for window to slide
    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldestTs = this.requestTimestamps[0];
      const waitMs = this.windowMs - (now - oldestTs) + 10;  // +10ms buffer
      
      if (waitMs > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, waitMs));
      }
      
      // Recursive acquire after waiting (window has slid)
      return this.acquire();
    }

    // Record this request timestamp
    this.requestTimestamps.push(now);
  }

  /**
   * Get current request count within window (for testing/monitoring)
   */
  getCurrentCount(): number {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.windowMs
    );
    return this.requestTimestamps.length;
  }

  /**
   * Reset throttle state (for testing)
   */
  reset(): void {
    this.requestTimestamps = [];
  }
}
