import { ProviderRef, ProviderResolutionContext } from './ProviderResolution';
import { ProviderRegistry } from './ProviderRegistry';
import { HttpProviderAdapter } from './HttpProviderAdapter';
import { ThrottlePolicy } from './ThrottlePolicy';

/**
 * BatchResolver: Request deduplication + concurrency control + throttling
 * 
 * Lifecycle (4 deterministic phases):
 * 1. COLLECT: Extract ProviderRefs from formulas
 * 2. ENQUEUE: Call enqueue(ref) for each (pure, synchronous)
 * 3. RESOLVE: Call resolveAll() - ONLY async boundary
 * 4. EVALUATE: Read from ProviderRegistry cache
 * 
 * Guarantees:
 * - enqueue() is synchronous and idempotent
 * - resolveAll() is the ONLY async operation
 * - No late writes after resolveAll() completes
 * - Registry is single source of truth for resolution state
 * 
 * PR #3 - Batch resolution layer with concurrency control
 */

export interface BatchResolverOptions {
  /**
   * Maximum concurrent requests allowed.
   * Controls worker pool size.
   */
  maxConcurrent: number;

  /**
   * Throttle policies per provider type (optional).
   * Example: { Stock: new WindowThrottle(5, 60_000) }
   */
  throttlePolicies?: Record<string, ThrottlePolicy>;
}

export class BatchResolver {
  // State (reset per evaluation cycle)
  private pendingQueue: ProviderRef[] = [];
  private inFlightMap: Map<string, Promise<void>> = new Map();
  private pendingKeys: Set<string> = new Set();  // O(1) duplicate check

  constructor(
    private registry: ProviderRegistry,
    private adapter: HttpProviderAdapter,
    private opts: BatchResolverOptions
  ) {
    if (opts.maxConcurrent <= 0) {
      throw new Error('BatchResolver: maxConcurrent must be positive');
    }
  }

  //
  // PUBLIC API
  //

  /**
   * Enqueue a provider reference for resolution (synchronous).
   * 
   * Deduplication: Calling enqueue(ref) multiple times queues ref once.
   * State check: If registry already has value, ref is not queued.
   * 
   * @param ref - Provider reference (type + id + field)
   */
  enqueue(ref: ProviderRef): void {
    const key = this.refKey(ref);

    // Authority check: registry knows if resolved
    if (this.registry.hasCachedValue(ref)) {
      return;  // Already cached, skip
    }

    // Duplicate check: O(1) via Set
    if (this.pendingKeys.has(key)) {
      return;  // Already queued
    }

    // In-flight check: currently being fetched
    if (this.inFlightMap.has(key)) {
      return;  // Will be resolved by worker
    }

    // Enqueue (pure operation, no side effects)
    this.pendingQueue.push(ref);
    this.pendingKeys.add(key);
  }

  /**
   * Resolve all enqueued references with concurrency + throttling.
   * 
   * This is the ONLY async boundary in the resolver lifecycle.
   * 
   * Guarantees:
   * - Returns when all enqueued refs resolved OR permanently failed
   * - No in-flight requests remain (verified by invariant check)
   * - Registry contains result (value or error) for every ref
   * - Respects maxConcurrent limit throughout
   * - Applies per-provider throttle policies
   * 
   * @returns Promise that resolves when batch complete
   * @throws Never throws - individual failures stored in registry as errors
   */
  async resolveAll(): Promise<void> {
    // Worker pool pattern (not race loop)
    const workers = Array.from(
      { length: this.opts.maxConcurrent },
      () => this.worker()
    );

    await Promise.all(workers);

    // INVARIANT: No in-flight requests after completion
    if (this.inFlightMap.size !== 0) {
      throw new Error(
        `BatchResolver invariant violation: ${this.inFlightMap.size} requests still in-flight after resolveAll()`
      );
    }

    // INVARIANT: No pending refs after completion
    if (this.pendingQueue.length !== 0) {
      throw new Error(
        `BatchResolver invariant violation: ${this.pendingQueue.length} refs still pending after resolveAll()`
      );
    }
  }

  /**
   * Reset for next evaluation cycle.
   * Clears pending queue and in-flight map.
   * Config (maxConcurrent, throttle) persists.
   */
  reset(): void {
    this.pendingQueue = [];
    this.pendingKeys.clear();
    this.inFlightMap.clear();
  }

  //
  // INTERNAL IMPLEMENTATION
  //

  /**
   * Worker: Fetch refs until queue empty
   * Bounded by maxConcurrent (number of workers spawned)
   */
  private async worker(): Promise<void> {
    while (true) {
      const ref = this.dequeue();
      if (!ref) return;  // Queue empty, worker exits

      const key = this.refKey(ref);

      // Apply throttle policy for this provider (if configured)
      const throttle = this.opts.throttlePolicies?.[ref.type];
      if (throttle) {
        await throttle.acquire();
      }

      // Mark in-flight
      const promise = this.fetchRef(ref)
        .finally(() => {
          this.inFlightMap.delete(key);
        });

      this.inFlightMap.set(key, promise);
      await promise;
    }
  }

  /**
   * Dequeue next ref from pending queue (thread-safe for single-threaded JS)
   */
  private dequeue(): ProviderRef | undefined {
    const ref = this.pendingQueue.shift();
    if (ref) {
      this.pendingKeys.delete(this.refKey(ref));
    }
    return ref;
  }

  /**
   * Fetch single ref via provider.prefetch()
   * 
   * Future optimization: Group refs by provider+entity for batch prefetch
   * Current: 1 ref per call (simple, correct, extensible)
   */
  private async fetchRef(ref: ProviderRef): Promise<void> {
    try {
      const provider = this.registry.getProvider(ref.type);
      if (!provider) {
        // No provider registered - store error in registry
        const error = new Error('#REF!');
        this.registry.setCachedValue(ref, error);
        return;
      }

      // Check if provider has prefetch method
      if (!provider.prefetch) {
        // Provider doesn't support prefetch - store error
        const error = new Error('#N/A');
        this.registry.setCachedValue(ref, error);
        return;
      }

      // Provider handles: adapter.request() + normalize + setCachedValue()
      // Pass entity refs as array of ids (provider extracts what it needs)
      // Use minimal FormulaContext (providers may not need full context)
      await provider.prefetch([ref.id], {} as any);
    } catch (err) {
      // Errors are stored in registry by provider's setCachedValue(error)
      // Catch here to prevent worker from crashing
      console.error(`BatchResolver: Failed to fetch ${this.refKey(ref)}`, err);
      
      // Fallback: Ensure registry has an error entry
      if (!this.registry.hasCachedValue(ref)) {
        this.registry.setCachedValue(ref, new Error('#N/A'));
      }
    }
  }

  /**
   * Deduplication key: "type:id:field"
   * Example: "stock:AAPL:Price"
   */
  private refKey(ref: ProviderRef): string {
    return `${ref.type}:${ref.id}:${ref.field}`;
  }
}
