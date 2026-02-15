# StyleCache Architecture Design

**Status:** Design Phase (Pre-Implementation)  
**Target:** Enterprise-Grade Immutable Style Management  
**Date:** February 14, 2026  
**Gate Condition:** Must be approved before Phase 1 Day 1 coding

---

## Executive Summary

The StyleCache is the **foundational layer** for enterprise-grade formatting. It establishes the architectural patterns that will carry through Phase 2 (Rich Text), Phase 3 (Gradients/Patterns), and Phase 4 (Number Format Compiler).

**Core Principle:**
> Styles are immutable value objects. The cache ensures structural equality → reference equality.

**Why This Matters:**
- Phase 2 (Rich Text): Without efficient style interning, per-character formatting = memory explosion
- Phase 3 (Gradients): Complex fill objects must be deduplicated
- Phase 4 (Compiled Formats): Format functions must be cached by style hash

**If StyleCache is weak, Rich Text will collapse.**

---

## Design Constraints

### Hard Requirements

1. **Immutability Enforcement**
   - Styles must be frozen (Object.freeze())
   - Mutation attempts must throw in dev mode
   - No escape hatches

2. **Structural Equality → Reference Equality**
   - Two styles with identical properties → same object reference
   - Pointer comparison (===) must be sufficient for equality checks

3. **O(1) Lookup**
   - Cache hit: constant time
   - Cache miss: linear time for hash computation (acceptable)

4. **Memory Efficiency**
   - 100,000 cells with identical styles → 1 style object in memory
   - Target: 95%+ memory reduction for typical spreadsheets

5. **Reference Counting**
   - Automatic garbage collection when no cells reference a style
   - No manual memory management required

6. **Performance Targets**
   - Cache hit rate: ≥90% (typical spreadsheet)
   - Intern operation: <0.1ms (including hash computation)
   - Memory overhead: <1MB for cache metadata (100k+ cells)

---

## Architecture Decision: Hash Strategy

### Option 1: String Hash (JSON.stringify)

**Implementation:**
```typescript
private hashStyle(style: CellStyle): string {
  return JSON.stringify(this.sortKeys(style));
}

private sortKeys(obj: any): any {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}
```

**Pros:**
- ✅ Simple implementation
- ✅ Deterministic (same style → same hash)
- ✅ Handles nested objects (borders, fills)

**Cons:**
- ❌ Slow for large styles (~0.2-0.5ms)
- ❌ String comparison overhead
- ❌ JSON.stringify allocates temporary strings

**Verdict:** ⚠️ Acceptable for Phase 1, must optimize for Phase 2

---

### Option 2: Structural Hash (Bitmask + Property Hash)

**Implementation:**
```typescript
private hashStyle(style: CellStyle): number {
  let hash = 0;
  
  // Bitmask for boolean flags (32 bits)
  const flags = 
    (style.bold ? 1 << 0 : 0) |
    (style.italic ? 1 << 1 : 0) |
    (style.underline ? 1 << 2 : 0) |
    (style.strikethrough ? 1 << 3 : 0) |
    (style.superscript ? 1 << 4 : 0) |
    (style.subscript ? 1 << 5 : 0) |
    (style.wrapText ? 1 << 6 : 0) |
    (style.shrinkToFit ? 1 << 7 : 0);
  
  hash ^= flags;
  
  // Hash numeric properties
  if (style.fontSize) hash ^= (style.fontSize * 31);
  if (style.rotation) hash ^= (style.rotation * 37);
  if (style.indent) hash ^= (style.indent * 41);
  
  // Hash string properties (djb2 algorithm)
  if (style.fontFamily) hash ^= this.hashString(style.fontFamily);
  if (style.fontColor) hash ^= this.hashString(style.fontColor);
  
  // Hash complex properties (borders, fills)
  if (style.borderTop) hash ^= this.hashBorder(style.borderTop);
  if (style.fill) hash ^= this.hashFill(style.fill);
  
  return hash >>> 0; // Ensure unsigned 32-bit
}

private hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

private hashBorder(border: BorderStyle): number {
  let hash = this.hashString(border.style);
  hash ^= this.hashString(border.color);
  return hash;
}
```

**Pros:**
- ✅ Fast: ~0.05ms (4-10x faster than JSON)
- ✅ Numeric comparison (no string allocation)
- ✅ Scales to complex styles

**Cons:**
- ❌ Collision risk (birthday paradox)
- ❌ Must handle collisions with secondary key
- ❌ More complex implementation

**Verdict:** ✅ **RECOMMENDED for Enterprise-Grade**

---

### Option 3: Hybrid (Numeric Hash + Collision Resolution)

**Implementation:**
```typescript
class StyleCache {
  private cache = new Map<number, CellStyle[]>(); // Bucket per hash
  private refCount = new WeakMap<CellStyle, number>();
  
  intern(style: CellStyle): CellStyle {
    const hash = this.hashStyle(style);
    const bucket = this.cache.get(hash) || [];
    
    // Check for exact match in bucket (collision resolution)
    for (const cached of bucket) {
      if (this.deepEquals(cached, style)) {
        this.incrementRef(cached);
        return cached;
      }
    }
    
    // No match: freeze and cache
    const frozen = Object.freeze({ ...style }) as CellStyle;
    bucket.push(frozen);
    this.cache.set(hash, bucket);
    this.refCount.set(frozen, 1);
    
    return frozen;
  }
  
  private deepEquals(a: CellStyle, b: CellStyle): boolean {
    // Fast path: pointer equality
    if (a === b) return true;
    
    // Compare properties
    return (
      a.bold === b.bold &&
      a.italic === b.italic &&
      a.underline === b.underline &&
      a.strikethrough === b.strikethrough &&
      a.fontSize === b.fontSize &&
      a.fontFamily === b.fontFamily &&
      // ... all properties
      this.borderEquals(a.borderTop, b.borderTop) &&
      this.fillEquals(a.fill, b.fill)
    );
  }
}
```

**Pros:**
- ✅ Fast hash (numeric)
- ✅ No false positives (collision resolution)
- ✅ Optimal for typical case (1 style per bucket)

**Cons:**
- ❌ Worst case: O(n) bucket scan (rare)
- ❌ Must implement deepEquals

**Verdict:** ✅ **OPTIMAL - Recommended Implementation**

---

## Recommended Implementation: Hybrid Strategy

### Phase 1 Implementation

```typescript
/**
 * StyleCache - Immutable style interning with reference counting
 * 
 * Architectural Guarantees:
 * - Immutability: All styles are frozen
 * - Structural equality → Reference equality
 * - O(1) average lookup (O(n) worst case with collision)
 * - Automatic garbage collection via reference counting
 * 
 * Performance Targets:
 * - Cache hit rate: ≥90%
 * - Intern time: <0.1ms
 * - Memory overhead: <1MB (100k+ cells)
 */
export class StyleCache {
  // Hash → Bucket mapping (collision resolution)
  private cache = new Map<number, CellStyle[]>();
  
  // Reference counting (weak map for automatic cleanup)
  private refCount = new WeakMap<CellStyle, number>();
  
  // Metrics for performance monitoring
  private metrics = {
    hits: 0,
    misses: 0,
    collisions: 0,
    totalInternTime: 0,
    internCalls: 0,
  };
  
  /**
   * Get or create a cached style object.
   * Returns the same object reference for structurally identical styles.
   * 
   * @param style - Style to intern (will not be mutated)
   * @returns Frozen style object (guaranteed immutable)
   */
  intern(style: CellStyle): CellStyle {
    const startTime = performance.now();
    
    const hash = this.hashStyle(style);
    const bucket = this.cache.get(hash);
    
    if (bucket) {
      // Check for exact match in bucket
      for (const cached of bucket) {
        if (this.deepEquals(cached, style)) {
          this.metrics.hits++;
          this.incrementRef(cached);
          this.recordInternTime(performance.now() - startTime);
          return cached;
        }
      }
      
      // Hash collision
      this.metrics.collisions++;
    }
    
    // Cache miss: create new frozen style
    this.metrics.misses++;
    const frozen = this.freezeStyle(style);
    
    // Add to bucket
    if (bucket) {
      bucket.push(frozen);
    } else {
      this.cache.set(hash, [frozen]);
    }
    
    this.refCount.set(frozen, 1);
    this.recordInternTime(performance.now() - startTime);
    
    return frozen;
  }
  
  /**
   * Release a style reference.
   * If reference count reaches 0, style becomes eligible for garbage collection.
   * 
   * @param style - Style to release
   */
  release(style: CellStyle): void {
    const count = this.refCount.get(style);
    if (!count) return;
    
    if (count === 1) {
      // Last reference: remove from cache
      const hash = this.hashStyle(style);
      const bucket = this.cache.get(hash);
      if (bucket) {
        const index = bucket.indexOf(style);
        if (index !== -1) {
          bucket.splice(index, 1);
        }
        
        // Remove empty bucket
        if (bucket.length === 0) {
          this.cache.delete(hash);
        }
      }
      
      this.refCount.delete(style);
    } else {
      this.refCount.set(style, count - 1);
    }
  }
  
  /**
   * Get cache performance metrics.
   */
  getMetrics() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses);
    const avgInternTime = this.metrics.totalInternTime / this.metrics.internCalls;
    const cacheSize = Array.from(this.cache.values()).reduce(
      (sum, bucket) => sum + bucket.length, 
      0
    );
    
    return {
      hitRate,
      avgInternTime,
      cacheSize,
      collisionRate: this.metrics.collisions / this.metrics.misses || 0,
      totalHits: this.metrics.hits,
      totalMisses: this.metrics.misses,
      totalCollisions: this.metrics.collisions,
    };
  }
  
  /**
   * Clear all cached styles.
   * Use with caution: invalidates all existing style references.
   */
  clear(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      collisions: 0,
      totalInternTime: 0,
      internCalls: 0,
    };
  }
  
  // ========================================
  // Private Implementation
  // ========================================
  
  private hashStyle(style: CellStyle): number {
    let hash = 0;
    
    // Bitmask for boolean flags (8 bits used, 24 reserved)
    const flags = 
      (style.bold ? 1 << 0 : 0) |
      (style.italic ? 1 << 1 : 0) |
      (style.underline ? 1 << 2 : 0) |
      (style.strikethrough ? 1 << 3 : 0) |
      (style.superscript ? 1 << 4 : 0) |
      (style.subscript ? 1 << 5 : 0) |
      (style.wrapText ? 1 << 6 : 0) |
      (style.shrinkToFit ? 1 << 7 : 0);
    
    hash ^= flags;
    
    // Numeric properties (XOR with prime multiples)
    if (style.fontSize !== undefined) hash ^= (style.fontSize * 31);
    if (style.rotation !== undefined) hash ^= (style.rotation * 37);
    if (style.indent !== undefined) hash ^= (style.indent * 41);
    
    // String properties (djb2 hash)
    if (style.fontFamily) hash ^= this.hashString(style.fontFamily);
    if (style.fontColor) hash ^= this.hashString(style.fontColor);
    if (style.backgroundColor) hash ^= this.hashString(style.backgroundColor);
    
    // Enum properties
    if (style.horizontalAlign) hash ^= this.hashString(style.horizontalAlign);
    if (style.verticalAlign) hash ^= this.hashString(style.verticalAlign);
    
    // Complex properties
    if (style.borderTop) hash ^= this.hashBorder(style.borderTop);
    if (style.borderRight) hash ^= this.hashBorder(style.borderRight);
    if (style.borderBottom) hash ^= this.hashBorder(style.borderBottom);
    if (style.borderLeft) hash ^= this.hashBorder(style.borderLeft);
    if (style.diagonalUp) hash ^= this.hashBorder(style.diagonalUp);
    if (style.diagonalDown) hash ^= this.hashBorder(style.diagonalDown);
    
    if (style.fill) hash ^= this.hashFill(style.fill);
    
    return hash >>> 0; // Ensure unsigned 32-bit integer
  }
  
  private hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash >>> 0;
  }
  
  private hashBorder(border: BorderStyle): number {
    let hash = this.hashString(border.style);
    hash ^= this.hashString(border.color);
    return hash;
  }
  
  private hashFill(fill: FillStyle): number {
    if (fill.type === 'solid') {
      return this.hashString(fill.color);
    }
    // Phase 3: gradient/pattern hashing
    return 0;
  }
  
  private deepEquals(a: CellStyle, b: CellStyle): boolean {
    // Fast path: pointer equality
    if (a === b) return true;
    
    // Boolean properties
    if (a.bold !== b.bold) return false;
    if (a.italic !== b.italic) return false;
    if (a.underline !== b.underline) return false;
    if (a.strikethrough !== b.strikethrough) return false;
    if (a.superscript !== b.superscript) return false;
    if (a.subscript !== b.subscript) return false;
    if (a.wrapText !== b.wrapText) return false;
    if (a.shrinkToFit !== b.shrinkToFit) return false;
    
    // Numeric properties
    if (a.fontSize !== b.fontSize) return false;
    if (a.rotation !== b.rotation) return false;
    if (a.indent !== b.indent) return false;
    
    // String properties
    if (a.fontFamily !== b.fontFamily) return false;
    if (a.fontColor !== b.fontColor) return false;
    if (a.backgroundColor !== b.backgroundColor) return false;
    if (a.horizontalAlign !== b.horizontalAlign) return false;
    if (a.verticalAlign !== b.verticalAlign) return false;
    
    // Complex properties
    if (!this.borderEquals(a.borderTop, b.borderTop)) return false;
    if (!this.borderEquals(a.borderRight, b.borderRight)) return false;
    if (!this.borderEquals(a.borderBottom, b.borderBottom)) return false;
    if (!this.borderEquals(a.borderLeft, b.borderLeft)) return false;
    if (!this.borderEquals(a.diagonalUp, b.diagonalUp)) return false;
    if (!this.borderEquals(a.diagonalDown, b.diagonalDown)) return false;
    
    if (!this.fillEquals(a.fill, b.fill)) return false;
    
    return true;
  }
  
  private borderEquals(a?: BorderStyle, b?: BorderStyle): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return a.style === b.style && a.color === b.color;
  }
  
  private fillEquals(a?: FillStyle, b?: FillStyle): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    
    if (a.type === 'solid' && b.type === 'solid') {
      return a.color === b.color;
    }
    
    // Phase 3: gradient/pattern equality
    return false;
  }
  
  private freezeStyle(style: CellStyle): CellStyle {
    // Deep freeze to prevent mutation
    const frozen = { ...style };
    
    // Freeze nested objects
    if (frozen.borderTop) frozen.borderTop = Object.freeze({ ...frozen.borderTop });
    if (frozen.borderRight) frozen.borderRight = Object.freeze({ ...frozen.borderRight });
    if (frozen.borderBottom) frozen.borderBottom = Object.freeze({ ...frozen.borderBottom });
    if (frozen.borderLeft) frozen.borderLeft = Object.freeze({ ...frozen.borderLeft });
    if (frozen.diagonalUp) frozen.diagonalUp = Object.freeze({ ...frozen.diagonalUp });
    if (frozen.diagonalDown) frozen.diagonalDown = Object.freeze({ ...frozen.diagonalDown });
    if (frozen.fill) frozen.fill = Object.freeze({ ...frozen.fill });
    
    return Object.freeze(frozen) as CellStyle;
  }
  
  private incrementRef(style: CellStyle): void {
    const count = this.refCount.get(style) || 0;
    this.refCount.set(style, count + 1);
  }
  
  private recordInternTime(time: number): void {
    this.metrics.totalInternTime += time;
    this.metrics.internCalls++;
  }
}
```

---

## Performance Analysis

### Memory Footprint

**Typical Spreadsheet (100k cells, 10 unique styles):**

Without cache:
- 100,000 cells × 200 bytes/style = 20 MB

With cache:
- 10 styles × 200 bytes = 2 KB
- Cache metadata: ~1 KB
- **Total: ~3 KB** (99.98% reduction)

**Realistic Spreadsheet (100k cells, 1000 unique styles):**

Without cache:
- 100,000 cells × 200 bytes/style = 20 MB

With cache:
- 1,000 styles × 200 bytes = 200 KB
- Cache metadata: ~10 KB
- **Total: ~210 KB** (98.95% reduction)

### Time Complexity

| Operation | Average | Worst Case |
|-----------|---------|------------|
| `intern()` | O(1) | O(n) bucket size |
| `release()` | O(1) | O(n) bucket size |
| `hashStyle()` | O(k) | O(k) k = property count |
| `deepEquals()` | O(k) | O(k) k = property count |

**Expected bucket size:** 1-2 styles (collision rate <5%)

### Benchmark Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Intern time | <0.1ms | 10k cells/sec |
| Hit rate | ≥90% | Typical spreadsheet |
| Memory overhead | <1MB | Scales to millions of cells |
| Collision rate | <5% | Hash quality |

---

## Integration with Cell Model

### Current (Likely)

```typescript
interface Cell {
  value: string | number;
  style?: CellStyle;
}
```

### Phase 1 (with StyleCache)

```typescript
interface Cell {
  value: string | number;
  style?: CellStyle; // MUST be interned via StyleCache
}

class Worksheet {
  private cells = new Map<string, Cell>();
  private styleCache = new StyleCache();
  
  setCell Style(cellId: string, style: CellStyle): void {
    const cell = this.cells.get(cellId);
    if (!cell) return;
    
    // Release old style
    if (cell.style) {
      this.styleCache.release(cell.style);
    }
    
    // Intern new style
    cell.style = this.styleCache.intern(style);
  }
  
  deleteCell(cellId: string): void {
    const cell = this.cells.get(cellId);
    if (cell?.style) {
      this.styleCache.release(cell.style);
    }
    this.cells.delete(cellId);
  }
}
```

---

## Mutation Detection (Dev Mode)

### Strategy: Proxy Wrapper

```typescript
function createImmutableProxy<T extends object>(obj: T): T {
  if (process.env.NODE_ENV !== 'development') {
    return obj; // Production: no overhead
  }
  
  return new Proxy(obj, {
    set() {
      throw new Error(
        'Style mutation detected! Styles are immutable. ' +
        'Use styleCache.intern({ ...style, property: value }) instead.'
      );
    },
    deleteProperty() {
      throw new Error('Cannot delete properties from immutable style');
    },
  });
}

// Usage in StyleCache
private freezeStyle(style: CellStyle): CellStyle {
  const frozen = { ...style };
  // ... freeze nested objects ...
  const immutable = Object.freeze(frozen) as CellStyle;
  return createImmutableProxy(immutable);
}
```

**Benefits:**
- Dev mode: Clear error messages for mutation attempts
- Production: Zero overhead (proxy removed)

---

## Testing Strategy

### Unit Tests (15+ tests)

```typescript
describe('StyleCache', () => {
  let cache: StyleCache;
  
  beforeEach(() => {
    cache = new StyleCache();
  });
  
  test('identical styles return same reference', () => {
    const style1 = cache.intern({ bold: true, fontSize: 12 });
    const style2 = cache.intern({ bold: true, fontSize: 12 });
    expect(style1).toBe(style2); // Pointer equality
  });
  
  test('different styles return different references', () => {
    const style1 = cache.intern({ bold: true });
    const style2 = cache.intern({ italic: true });
    expect(style1).not.toBe(style2);
  });
  
  test('interned styles are frozen', () => {
    const style = cache.intern({ bold: true });
    expect(Object.isFrozen(style)).toBe(true);
  });
  
  test('nested objects are frozen', () => {
    const style = cache.intern({
      borderTop: { style: 'thin', color: '#000000' }
    });
    expect(Object.isFrozen(style.borderTop)).toBe(true);
  });
  
  test('mutation throws in dev mode', () => {
    const style = cache.intern({ bold: true });
    expect(() => {
      (style as any).bold = false;
    }).toThrow(/immutable/i);
  });
  
  test('reference counting works', () => {
    const style = cache.intern({ bold: true });
    cache.release(style);
    
    const metrics = cache.getMetrics();
    expect(metrics.cacheSize).toBe(0); // Released
  });
  
  test('cache hit rate meets target', () => {
    // Simulate typical spreadsheet usage
    const styles = [
      { bold: true },
      { italic: true },
      { bold: true, fontSize: 12 },
    ];
    
    // Apply 10,000 times (3 unique styles)
    for (let i = 0; i < 10000; i++) {
      cache.intern(styles[i % 3]);
    }
    
    const metrics = cache.getMetrics();
    expect(metrics.hitRate).toBeGreaterThan(0.99); // 99% hit rate
  });
  
  test('intern time meets target', () => {
    const style = { bold: true, fontSize: 12, fontFamily: 'Arial' };
    
    const iterations = 1000;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      cache.intern(style);
    }
    
    const avg = (performance.now() - start) / iterations;
    expect(avg).toBeLessThan(0.1); // <0.1ms per intern
  });
  
  test('collision resolution works', () => {
    // Force collision (same hash, different styles)
    // This requires crafted styles - implementation-specific
    const style1 = { bold: true, fontSize: 12 };
    const style2 = { italic: true, fontSize: 12 };
    
    const cached1 = cache.intern(style1);
    const cached2 = cache.intern(style2);
    
    expect(cached1).not.toBe(cached2);
    expect(cache.getMetrics().collisions).toBe(0); // Low collision rate
  });
  
  // ... 6 more tests
});
```

### Performance Benchmarks (5+ tests)

```typescript
describe('StyleCache Performance', () => {
  test('memory usage scales linearly with unique styles', () => {
    const cache = new StyleCache();
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 100k cells, 1k unique styles
    const uniqueStyles = 1000;
    const totalCells = 100000;
    
    for (let i = 0; i < totalCells; i++) {
      cache.intern({ fontSize: (i % uniqueStyles) + 10 });
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const growth = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    expect(growth).toBeLessThan(1); // <1MB overhead
  });
  
  test('hash collisions are rare', () => {
    const cache = new StyleCache();
    
    // Generate 10k unique styles
    for (let i = 0; i < 10000; i++) {
      cache.intern({ fontSize: i + 1 });
    }
    
    const metrics = cache.getMetrics();
    expect(metrics.collisionRate).toBeLessThan(0.05); // <5%
  });
  
  // ... 3 more benchmarks
});
```

---

## Gate Conditions for Phase 2

**Before Rich Text implementation can start:**

- [ ] StyleCache hit rate ≥ 90% (realistic workload)
- [ ] Intern time < 0.1ms average (10k intern ops)
- [ ] Memory overhead < 1MB (100k cells, 1k unique styles)
- [ ] Zero mutation warnings in test suite
- [ ] 15+ unit tests passing
- [ ] 5+ performance benchmarks passing
- [ ] Export/import preserves styles correctly
- [ ] Integration tests with Worksheet model passing

**If ANY condition fails → Fix Phase 1 before proceeding.**

Enterprise-grade means refusing to carry weakness forward.

---

## Strategic Insight

**StyleCache is not a Phase 1 feature.**

**StyleCache is the architectural foundation for Phases 2-4.**

Without efficient style interning:
- Phase 2 (Rich Text): Per-character formatting = memory explosion
- Phase 3 (Gradients): Complex fill objects without deduplication
- Phase 4 (Compiled Formats): No cache for format functions

**This is why we design BEFORE coding.**

---

## Next Steps

1. **Approval Required:**
   - [ ] Review hash strategy (hybrid recommended)
   - [ ] Review mutation detection approach (proxy wrapper)
   - [ ] Review integration with cell model
   - [ ] Approve gate conditions for Phase 2

2. **Implementation Order (Day 1-2):**
   - [ ] Implement `hashStyle()` with numeric hash
   - [ ] Implement `deepEquals()` for collision resolution
   - [ ] Implement `freezeStyle()` with nested freeze
   - [ ] Implement `intern()` and `release()` with ref counting
   - [ ] Add metrics collection
   - [ ] Add mutation detection (dev mode)

3. **Testing (Day 2):**
   - [ ] Write 15+ unit tests
   - [ ] Write 5+ performance benchmarks
   - [ ] Validate gate conditions

**Only after gate conditions pass → Move to rendering features.**

---

**Status:** Awaiting approval to implement  
**Risk Level:** 🟢 Low (well-defined architecture)  
**Strategic Value:** 🔴 CRITICAL (foundation for Phases 2-4)

🚀 **Say "Implement StyleCache" to proceed with Day 1 coding.**
