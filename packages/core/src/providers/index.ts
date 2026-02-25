/**
 * External data type provider system.
 * 
 * Week 3 Phase 2 (v2.3-provider-layer)
 * PR #3 - Batch resolution layer (Feb 25, 2026)
 * PR #4 - HTTP driver layer (Feb 25, 2026)
 */

export { IDataTypeProvider } from './IDataTypeProvider';
export { ProviderRegistry } from './ProviderRegistry';
export { StockProvider } from './StockProvider';
export { GeographyProvider } from './GeographyProvider';
export { HttpProviderAdapter } from './HttpProviderAdapter';

// Async provider resolution primitives (PR #1)
export { ProviderResolutionContext, ProviderRef, ProviderError, MockBatchResolver } from './ProviderResolution';

// Batch resolution layer (PR #3)
export { BatchResolver, BatchResolverOptions } from './BatchResolver';
export { ThrottlePolicy, WindowThrottle } from './ThrottlePolicy';

// HTTP driver layer (PR #4)
export { QuotaManager } from './QuotaManager';
export { HttpObservability } from './HttpObservability';
export { AlphaVantageDriver, AlphaVantageQuote } from './AlphaVantageDriver';
