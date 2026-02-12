# Wave 0 — Platform Hardening Sprint

**Duration:** 1 week  
**Goal:** Architectural foundation for 300-function scale  
**Priority:** CRITICAL — Execute before Wave 1

---

## 🎯 The Real Problem

Current engine built for ~100 functions.  
Financial functions (YIELD, XIRR, ACCRINT) will expose every architectural weakness.

**Without Wave 0:** Technical debt collapse at function 150.  
**With Wave 0:** Clean scaling to 300.

---

## 📋 Three Critical Tasks

### 1️⃣ **Extended Function Metadata** (2 days)

**Add to existing metadata:**

```typescript
interface FunctionMetadata {
  // ... existing fields ...
  
  // NEW
  volatile?: boolean;              // RAND, NOW → always recalc
  complexityClass?: ComplexityClass; // O(1), O(n), O(n²), ITERATIVE
  precisionClass?: PrecisionClass; // EXACT, FINANCIAL (±$0.01), ERF_LIMITED (±1e-7)
}

enum ComplexityClass {
  O_1 = 'O(1)',           // PI, TRUE, NOW
  O_N = 'O(n)',           // SUM, AVERAGE
  O_N_LOG_N = 'O(n log n)', // SORT, MEDIAN
  O_N2 = 'O(n²)',         // MMULT
  ITERATIVE = 'iterative' // IRR, YIELD (Newton/bisection)
}

enum PrecisionClass {
  EXACT = 'exact',            // Integer math, text
  FINANCIAL = 'financial',    // ±$0.01
  STATISTICAL = 'statistical', // ±1e-10
  ERF_LIMITED = 'erf-limited', // ±1e-7 (NORM.DIST)
  ITERATIVE = 'iterative'    // Convergence-dependent
}
```

**Tasks:**
- Extend `FunctionMetadata` interface
- Backfill all 98 existing functions
- Add registry query methods: `getVolatileFunctions()`, `getIterativeFunctions()`

**Why it matters:**
- Prevents performance regressions (know which functions are expensive)
- Precision expectations documented (no surprise failures)
- Volatile tracking = correct recalc behavior

---

### 2️⃣ **Error Propagation Matrix** (2 days)

**Formalize implicit rules:**

| Input | Math | Text | Financial | Lookup |
|-------|------|------|-----------|--------|
| `#DIV/0!` | Propagate | Propagate | Propagate | Propagate |
| `#VALUE!` | Propagate | Propagate | Propagate | Propagate |
| `#N/A` | Propagate | Propagate | Propagate | Return #N/A |
| Empty cell | 0 | "" | 0 | #N/A (VLOOKUP) |
| String "123" | Coerce to 123 | Keep as "123" | Coerce to 123 | Match "123" |
| String "abc" | #VALUE! | Keep as "abc" | #VALUE! | Match "abc" |

**Critical for Financial:**
- PRICE/YIELD need consistent coercion rules
- Date handling: serial number vs. string vs. Date object
- Empty vs. zero: affects bond calculations

**Tasks:**
- Create `error-propagation.ts` with centralized rules
- Add 50+ tests covering matrix
- Document Excel quirks (e.g., AVERAGE skips #N/A, COUNT doesn't)

**Why it matters:**
- Financial functions fail silently without this
- Eliminates 80% of "why did Excel return X?" bugs

---

### 3️⃣ **Performance Budget** (1 day)

**Label complexity, establish baselines:**

```typescript
// Example benchmarks (n=1000)
SUM:       0.1ms   (O(n))
SORT:      12ms    (O(n log n))
IRR:       8ms     (iterative)
MMULT:     1000ms  (O(n²)) ← WARNING
```

**Budget:**
- O(1), O(n), O(n log n): ✅ Safe for large datasets
- O(n²): ⚠️ Warn users above 100 elements
- Iterative: ⚠️ May not converge, document failure modes

**Tasks:**
- Label all 98 functions with complexity class
- Run benchmarks for n=10, 100, 1000
- Add performance regression tests (<20% slowdown alert)

**Why it matters:**
- YIELD iterating 100 times = 10x slower than SUM
- Users need to know which functions are expensive
- Prevents "spreadsheet freezes with 10k rows" complaints

---

## 🧪 Testing Requirements

**New test suites:**
1. `metadata-validation.test.ts` — All 98 functions have complete metadata
2. `error-propagation-matrix.test.ts` — 50+ error cases
3. `performance-benchmarks.test.ts` — Baseline for regressions

**Coverage:** 95% for new infrastructure

---

## 📊 Success Metrics

| Task | Target | Status |
|------|--------|--------|
| Extended metadata | 98/98 functions | ❌ Not started |
| Error matrix | 50+ tests | ❌ Not started |
| Performance baselines | 98 functions | ❌ Not started |

---

## ⏱️ Timeline

**Day 1-2:** Extended metadata system  
**Day 3-4:** Error propagation matrix  
**Day 5:** Performance benchmarks  

**Total:** 1 week → **Ready for Wave 1**

---

## � Management Decision

**Option A:** Skip Wave 0, start Wave 1 immediately  
**Risk:** Technical debt collapse at function 150, 2-3x cost to fix later

**Option B:** Execute Wave 0 first  
**Benefit:** Clean foundation, prevents future pain, pays dividends in all 202 functions

**Recommendation:** **Execute Wave 0** — low risk, high ROI, correct engineering approach.
