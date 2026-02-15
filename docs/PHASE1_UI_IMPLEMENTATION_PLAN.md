# Phase 1 UI Implementation Plan

**Date:** February 15, 2026  
**Status:** Evidence Review → Implementation  
**Discipline:** Same rigor that validated Phase 4  

---

## ✅ Pre-Implementation Evidence Review

### Substrate Status
- **Identity:** O(1) StyleCache, frozen, canonical ✅
- **Layout:** Pure functions, sub-µs ✅
- **Formatting:** 0.56ms/frame @ 600 cells (3.4% budget) ✅
- **Regression:** 0.062µs overhead (7% acceptable) ✅

### Budget Validation
- Frame budget: 16.67ms (60fps)
- Formatting: 0.56ms (3.4%)
- Reserve: ~40% headroom
- **Conclusion:** Safe to proceed ✅

### Existing Infrastructure Audit

**CellStyle type (`packages/core/src/types.ts`):**
```typescript
// ✅ ALREADY EXISTS
rotation?: number;
shrinkToFit?: boolean;
wrap?: boolean;  // (named `wrap` not `wrapText`)
valign?: 'top' | 'middle' | 'bottom';  // (named `valign` not `verticalAlign`)
align?: 'left' | 'center' | 'right';
```

**⚠️ MISSING (Phase 1 scope):**
- `strikethrough?: boolean`
- `superscript?: boolean`
- `subscript?: boolean`
- `indent?: number` (0-15)
- `diagonalUp?: BorderStyle`
- `diagonalDown?: BorderStyle`

**StyleCache (`packages/core/src/StyleCache.ts`):**
- ✅ Hash includes `rotation` (line 61-62)
- ✅ Hash includes `shrinkToFit` (line 46)
- ⚠️ Need to add: strikethrough, superscript, subscript, indent, diagonals

---

## 📋 Implementation Scope (Locked)

### What We're Building

**1. Type Extensions** (4 new properties)
- `strikethrough?: boolean`
- `superscript?: boolean`
- `subscript?: boolean`
- `indent?: number` (0-15)

**2. StyleCache Updates**
- Add 4 properties to hash function
- Add 4 properties to equality check
- **No new cache logic** (existing system handles it)

**3. Renderer Integration** (DEFERRED)
- Strikethrough line rendering
- Superscript/subscript offset
- Indent padding calculation
- **No layout changes yet** (pure state transformation)

### What We're NOT Building

❌ **NO** rich text editor  
❌ **NO** inline run diffing  
❌ **NO** mutation observers  
❌ **NO** UI-level caches  
❌ **NO** view-model layers  
❌ **NO** shadow state  
❌ **NO** diagonal borders (complex, defer to Phase 1.5)  
❌ **NO** wrap text/rotation rendering (already in types, just need rendering)  

---

## 🎯 Execution Plan (Surgical)

### Step 1: Type Extensions (5 min)
**File:** `packages/core/src/types.ts`
**Change:** Add 4 new optional properties
**Test:** TypeScript compiles

### Step 2: StyleCache Hash (10 min)
**File:** `packages/core/src/StyleCache.ts`
**Change:** Add 4 properties to `computeHash()` and equality check
**Test:** Unit tests for hash consistency

### Step 3: Identity Guard Test (15 min)
**File:** `packages/core/__tests__/StyleCache.test.ts` (or new file)
**Test:** Verify `styleA === styleB` for identical styles
**Purpose:** Protect identity at UI boundary (your requirement)

### Step 4: Rendering Stubs (20 min)
**File:** `packages/renderer-canvas/src/ExcelRenderer.ts` or similar
**Change:** Add conditional rendering for new properties
**Test:** Visual inspection (no-op if property undefined)

### Step 5: Integration Test (10 min)
**Test:** Set style, verify identity preserved, render doesn't crash

**Total Time:** ~60 minutes for core integration  
**Risk:** Minimal (pure additive changes)  

---

## 🧪 Testing Strategy

### 1. Identity Protection (Critical)
```typescript
it('should preserve identity when UI sets style', () => {
  const cache = new StyleCache();
  const style1 = cache.intern({ bold: true, strikethrough: true });
  const style2 = cache.intern({ bold: true, strikethrough: true });
  
  expect(style1 === style2).toBe(true); // MUST BE TRUE
});
```

### 2. Hash Consistency
```typescript
it('should produce consistent hash for strikethrough', () => {
  const style1 = { strikethrough: true };
  const style2 = { strikethrough: true };
  
  expect(computeHash(style1)).toBe(computeHash(style2));
});
```

### 3. No Regression
```typescript
it('should not affect existing formatting performance', () => {
  // Run existing pipeline benchmark
  // Expect: <0.56ms for 600 cells (same baseline)
});
```

---

## 📊 Success Criteria

### ✅ Type Extensions
- [ ] 4 new properties added to `CellStyle`
- [ ] TypeScript strict mode passes
- [ ] No breaking changes to existing code

### ✅ StyleCache Integration
- [ ] Hash includes new properties
- [ ] Equality check includes new properties
- [ ] No performance regression (<7% overhead acceptable)

### ✅ Identity Protection
- [ ] Test verifies `styleA === styleB` for identical styles
- [ ] UI cannot accidentally clone styles
- [ ] Cache hit rate remains >95%

### ✅ Rendering (Deferred)
- [ ] Strikethrough renders (or no-ops gracefully if undefined)
- [ ] Superscript/subscript offsets work (or no-ops)
- [ ] Indent padding works (or no-ops)

---

## 🚨 Guardrails (Your Requirements)

### 1. No UI-Level Memoization
**Rule:** UI consumes substrate, doesn't re-interpret it  
**Enforcement:** Code review before merge

### 2. No View-Layer Caches
**Rule:** StyleCache is the single source of truth  
**Enforcement:** `grep -r "new Map" packages/*/src` → no new caches

### 3. No Shadow State
**Rule:** UI → state → identity → layout → render (no bypasses)  
**Enforcement:** Trace data flow in integration test

### 4. Identity Guard Test
**Rule:** Must include `expect(styleA === styleB).toBe(true)` test  
**Enforcement:** PR checklist requires passing identity test

---

## 📝 Evidence Requirements (Before Proceeding)

### Question 1: Existing Properties
**Current types already have:**
- `rotation?: number` ✅
- `shrinkToFit?: boolean` ✅
- `wrap?: boolean` ✅
- `valign?: 'top' | 'middle' | 'bottom'` ✅

**Do we need rendering for these first?**
- If YES: Start with rendering existing properties (rotation, shrinkToFit, wrap)
- If NO: Add new properties (strikethrough, etc.) and render later

### Question 2: Diagonal Borders
**Complexity:** High (requires border rendering coordination)  
**Value:** Low (rarely used feature)  
**Decision:** DEFER to Phase 1.5 or Phase 2

### Question 3: Layout Changes
**Current layout system:** Unknown (need to check)  
**New properties requiring layout:**
- `indent` (affects horizontal position)
- `superscript/subscript` (affects vertical position + font size)
- `wrap` (already exists, but rendering unclear)

**Strategy:**
- If layout system is pure functions: Add indent/script calculations
- If layout system is imperative: Add minimal hooks, refactor later

---

## 🎯 Recommended Start Point

### Option A: Render Existing Properties First (Low Risk)
**Rationale:** Types already exist, just need rendering  
**Work:**
1. Implement `rotation` rendering (canvas transform)
2. Implement `wrap` text rendering (line breaking)
3. Implement `shrinkToFit` rendering (font scaling)

**Time:** 2-3 hours  
**Risk:** Low (types exist, just rendering)  
**Value:** High (closes existing gaps)

### Option B: Add New Properties (Deferred Rendering)
**Rationale:** Extend type system, render later  
**Work:**
1. Add `strikethrough`, `superscript`, `subscript`, `indent`
2. Update StyleCache
3. Add identity guard test
4. Defer rendering to Phase 1.1

**Time:** 1 hour  
**Risk:** Minimal (no rendering yet)  
**Value:** Medium (enables UI construction)

---

## 🤔 Decision Point

**Which path preserves discipline while making progress?**

**My Recommendation:** **Option A** (Render existing properties first)

**Why:**
1. **Evidence-driven:** Types exist, rendering is the gap
2. **User-visible:** Rotation/wrap/shrinkToFit are common features
3. **Low risk:** No type changes, pure rendering work
4. **Validates substrate:** Proves rendering layer can consume existing state

**What's the evidence that rendering is the gap?**
- Types exist in `CellStyle` (rotation, wrap, shrinkToFit)
- StyleCache already hashes them
- But rendering likely NO-OPs or incomplete

**Next Action:** Audit rendering to confirm gap, then implement.

---

## ✅ Final Checklist Before Starting

- [ ] Substrate validated (identity, layout, formatting) ✅
- [ ] Frame budget confirmed (3.4% formatting, 40% reserve) ✅
- [ ] Existing type infrastructure audited ✅
- [ ] Implementation scope locked (no feature creep) ✅
- [ ] Guardrails defined (no UI caches, no shadow state) ✅
- [ ] Testing strategy defined (identity guard required) ✅
- [ ] Decision point: Render existing vs. add new properties

**Status:** Ready to proceed after decision on Option A vs. Option B

**Awaiting directive:** Which path (A or B) to execute first?

---

**Document Version:** 1.0  
**Last Updated:** February 15, 2026  
**Branch:** `wave4-excel-parity-validation`
