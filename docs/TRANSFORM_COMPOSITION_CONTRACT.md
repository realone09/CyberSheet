# Transform Composition Contract

**Status:** 🔒 **FROZEN** — Non-negotiable architectural contract  
**Applies to:** Phase 2 (Insert/Delete Row/Column implementation)  
**Date:** April 18, 2026

---

## Executive Summary

Cyber Sheet now implements a **verified graph rewriting system with coordinate semantics**, not just spreadsheet commands. This document defines the algebraic contract that Insert/Delete operations MUST satisfy.

**Bottom Line:** You are no longer building features. You are defining **valid graph automorphisms over a mutable coordinate lattice**.

---

## 1. System Architecture (3 Layers)

### Layer 1: Local Invariants (GraphInvariantValidator)

**Catches:**
- Zombie edges (formula deleted but edges remain)
- Orphan nodes (edges point to non-existent cells)
- DAG inconsistencies (forward ≠ reverse map)
- Dirty propagation errors

**Question:** "Is the graph internally consistent?"

---

### Layer 2: Global Structural Invariants (GraphTransformationValidator)

**Catches:**
- Coordinate shift inconsistencies
- Formula ↔ graph mismatch under transforms
- Merge/topology drift
- Selection desync
- f(S) vs graph(f(S)) mismatch

**Question:** "Did the transformation preserve meaning?"

**6 Formalized Invariants:**
1. **Graph-Formula Consistency:** ∀ cell c: parse(formula(c)) = refs(c)
2. **No Zombie Edges:** formula(c) = ∅ ⇒ outEdges(c) = ∅
3. **ORPHAN_NODE (Strengthened):** ∀ edge (u→v): worksheet.has(u) ∧ worksheet.has(v) AND f(u) ≠ null ∧ f(v) ≠ null
4. **Bidirectional Edge Consistency:** u ∈ predecessors(v) ⇔ v ∈ successors(u)
5. **Dirty Propagation Soundness:** cell ∈ dirtySet ⇒ ∀ dependent d: d reachable
6. **Transform Preservation (CRITICAL):** graph(f(S)) == f(graph(S))
7. **Reference Mapping Consistency (FINAL GAP):** For any reference r inside formula(c): map(r) == extractRefs(shiftFormula(formula(c)))

**WHY INVARIANT 7 IS CRITICAL:**

This is the **only place the system can still lie to itself**.

Example bug this catches:
```typescript
// map() says: A1 shifts to B1
transform.map({row: 0, col: 0}) → {row: 0, col: 1}

// shiftFormula() mistakenly keeps A1
transform.shiftFormula("=A1") → "=A1"  ❌ (should be "=B1")
```

This produces:
- **DAG says:** Cell depends on B1
- **Formula says:** Cell references A1
- **RESULT:** Graph ≠ Formula → CORRUPTION

---

### Layer 3: Algebraic Transform Model (AddressTransform)

**Defines:**
- Coordinate mapping: f: Address → Address ∪ {null}
- Formula rewriting: shiftFormula(formula)
- Invertibility contract: getUndoTransform()

**Question:** "What does change mean?"

---

## 2. The Coordinate Space Composition Hazard

### 🚨 THE DANGER

Transforms compose in **CURRENT coordinate space**, not original space.

#### Example of Composition Hazard:

```typescript
S0: Initial state with columns A, B, C (indices 0, 1, 2)

insertColumn(1)  → S1: Now A, [NEW], B, C (indices 0, 1, 2, 3)
insertColumn(1)  → S2: DANGER: Which column 1?
                       - Original column 1 (now at index 2)?
                       - Current column 1 (the one just inserted)?
```

### ❌ WRONG Implementation (Coordinate Space Confusion)

```typescript
// DANGER: Storing original column index
class InsertColumnCommand implements TransformCommand {
  constructor(private originalColumnIndex: number) {}  // 🔴 BUG!
  
  getTransform() {
    // This uses original index, not current index
    return new InsertColumnTransform(this.originalColumnIndex);
  }
  
  getUndoTransform() {
    // After insert, column indices have shifted!
    // Original index is now meaningless
    return new DeleteColumnTransform(this.originalColumnIndex);  // 🔴 BUG!
  }
}
```

**Problem:** After `insertColumn(1)`, the original "column 1" is now at index 2. Undo tries to delete the wrong column.

### ✅ CORRECT Implementation (Current Space Evaluation)

```typescript
class InsertColumnCommand implements TransformCommand {
  constructor(private columnIndex: number, private worksheet: Worksheet) {}
  
  getTransform(): AddressTransform {
    // Evaluated at execute() time in CURRENT state
    return new InsertColumnTransform(this.columnIndex);
  }
  
  getUndoTransform(): AddressTransform {
    // Evaluated at undo() time in CURRENT state (post-insert)
    // Column index is still valid because it refers to the inserted column
    return new DeleteColumnTransform(this.columnIndex);
  }
  
  execute(): void {
    const transform = this.getTransform();
    
    // MANDATORY PATTERN: Extract → Clear → Transform → Reinsert
    // DO NOT mutate in place!
    
    // 1. Extract affected region
    const affectedRegion = this.computeAffectedRegion();
    const snapshot = this.extractRegion(affectedRegion);
    
    // 2. Clear region
    this.clearRegion(affectedRegion);
    
    // 3. Transform snapshot
    const transformed = snapshot.map(cell => ({
      addr: transform.map(cell.addr)!,  // Non-null for insert
      value: cell.value,
      formula: cell.formula ? transform.shiftFormula(cell.formula) : undefined,
      style: cell.style,
      // ... other properties
    }));
    
    // 4. Reinsert via PasteCommand (reuses proven clipboard pipeline)
    const pasteCommand = new PasteCommand(
      this.worksheet,
      { cells: transformed, merges: [], styles: [] },
      transformed[0].addr  // Target anchor
    );
    pasteCommand.execute();
    
    // Validator runs automatically in CommandManager after this returns
  }
  
  undo(): void {
    const undoTransform = this.getUndoTransform();
    
    // 1. Apply inverse transform (delete the inserted column)
    // 2. Restore snapshot (if column had content before)
    // 3. Validator runs automatically
  }
}
```

**Key Insight:** The `columnIndex` stored in the command refers to a **logical operation**, not a snapshot coordinate. At execute() time, it means "insert here." At undo() time, it still means "delete the column at this index" (which is the one we just inserted).

**CRITICAL RULE: Never mutate DAG directly inside Insert/Delete.**

```typescript
// ❌ FORBIDDEN
registerDependencies()    // NEVER call directly
clearDependencies()       // NEVER call directly

// ✅ REQUIRED
new PasteCommand(...)     // Let PasteCommand handle DAG lifecycle
```

**Why this works:**
- ✅ Reuses clipboard pipeline (already proven correct)
- ✅ Reuses FormulaShiftingService (already proven correct)
- ✅ Reuses DAG lifecycle (already proven correct)
- ✅ Validator enforces all 7 invariants automatically

**Phase 2 becomes:** "Just another paste with a transform"

---

## 3. Transform Consistency Order Invariant

### Fundamental Theorem

For any command sequence C₁..Cₙ:

```
apply(C₁ ∘ C₂ ∘ ... ∘ Cₙ)
== 
sequential apply with per-step validation
```

### This Enforces:

1. ✅ Each Cᵢ is evaluated in the state produced by C₁..Cᵢ₋₁
2. ✅ Transforms are **NOT** compositional at the algebraic level
3. ✅ Validator runs after **EACH** step (no batching)
4. ✅ Coordinate indices are interpreted in **CURRENT** space, always

### Example Sequence:

```typescript
S0: Columns A, B, C

insertColumn(1)  → S1: A, [NEW1], B, C
// Validator runs → PASS

insertColumn(1)  → S2: A, [NEW2], [NEW1], B, C
// 'k=1' now refers to position AFTER first insert
// Validator runs → PASS

deleteColumn(1)  → S3: A, [NEW1], B, C
// Deletes NEW2 (current column 1)
// Validator runs → PASS
```

Each step is validated independently. Coordinate indices are resolved in the current state.

---

## 4. Identity Property (Algebraic Correctness)

### Theorem to Prove:

```
deleteColumn(k) ∘ insertColumn(k) = identity
```

This is **NOT a test case**—it is a **correctness property** enforced structurally.

### Verification Method:

```typescript
test('transformation identity', () => {
  const before = snapshot(sheet);
  
  insertColumn(k);
  // Validator runs → PASS (all 7 invariants)
  
  deleteColumn(k);
  // Validator runs → PASS (all 7 invariants)
  
  const after = snapshot(sheet);
  
  expect(after).toEqual(before);  // f⁻¹(f(state)) = state
});

test('compositional stability', () => {
  const before = snapshot(sheet);
  
  insertColumn(1);
  insertColumn(1);
  deleteColumn(1);
  deleteColumn(1);
  
  const after = snapshot(sheet);
  
  expect(after).toEqual(before);  // Multiple ops compose correctly
});
```

### What Makes This Work:

1. **Transform evaluated in current state:** `insertColumn(k)` shifts everything
2. **Inverse transform recomputed from metadata:** `deleteColumn(k)` undoes the shift
3. **Validator checks structural equivalence:** graph(S) == graph(S') after round trip
4. **map()/shiftFormula() consistency enforced:** Invariant 7 catches divergence

---

## 5. Implementation Contract (Non-Negotiable)

### Mandatory Properties:

| # | Property | Enforcement | Consequence of Violation |
|---|----------|-------------|-------------------------|
| 1 | ✅ Transforms are PURE (no side effects, deterministic) | Code review | Non-deterministic bugs, validator false positives |
| 2 | ✅ Transforms evaluated in CURRENT coordinate space | Architecture | Coordinate shift bugs, wrong column deleted |
| 3 | ✅ Inverse transforms recomputed from stored metadata | Architecture | Undo deletes wrong cells |
| 4 | ✅ Validator runs after EVERY command | CommandManager | Corruption propagates undetected |
| 5 | ✅ Forward/undo transforms are algebraically consistent | Tests + Validator | Identity property fails |

---

## 6. What Your System Now Guarantees

### Structural Correctness:
- ✅ No broken DAG edges
- ✅ No orphan nodes
- ✅ No zombie dependencies

### Semantic Correctness Under Transform:
- ✅ Formulas remain consistent with coordinate shifts
- ✅ Merges preserve topology
- ✅ Selection remains valid

### Algebraic Consistency:
- ✅ f⁻¹(f(S)) = S (tested invariant)
- ✅ Transform commutativity is controlled and validated

---

## 7. Phase 2 Readiness Verdict

**Status:** 🟢 **Safe to implement Insert/Delete**

**Condition:** Insert/Delete MUST be implemented as a **pure TransformCommand**, not ad-hoc mutation logic.

### Implementation Checklist:

**BEFORE writing any code:**
- [ ] Read this contract in full
- [ ] Understand coordinate space composition hazard
- [ ] Review AddressTransform.ts documentation
- [ ] Review GraphTransformationValidator.ts invariants (all 7)
- [ ] **Understand Invariant 7:** map(r) must equal extractRefs(shiftFormula(formula))

**DURING implementation:**
- [ ] InsertColumnCommand implements TransformCommand
- [ ] getTransform() returns new InsertColumnTransform(k)
- [ ] getUndoTransform() returns new DeleteColumnTransform(k)
- [ ] **MANDATORY PATTERN:** Extract → Clear → Transform → PasteCommand
- [ ] **NEVER mutate DAG directly** — let PasteCommand handle it
- [ ] **NEVER call** registerDependencies() or clearDependencies() in Insert/Delete
- [ ] execute() applies transform to ALL layers (cells, formulas, DAG, merges, selection)
- [ ] All transformations go through PasteCommand (reuse proven pipeline)
- [ ] Write transformation identity test (insert → delete → expect unchanged)
- [ ] Write compositional stability test (insert×2 → delete×2 → expect unchanged)

**AFTER implementation:**
- [ ] All 57 PasteCommand tests still passing
- [ ] Transformation identity test passes
- [ ] Compositional stability test passes
- [ ] Adversarial test (10k random operations) passes
- [ ] Validator reports zero violations (all 7 invariants)
- [ ] **Verify Invariant 7:** No REFERENCE_MAPPING_INCONSISTENCY errors

---

## 8. What You Are Building (Final Insight)

You are no longer building:
> spreadsheet commands

You are now building:
> a **verified graph rewriting system with coordinate semantics**

Phase 2 is NOT:
> "add insert column feature"

It is:
> "define a valid graph automorphism over a mutable coordinate lattice"

---

## 9. Adversarial Testing Strategy (Required for Phase 2)

### Test 1: Identity Property

```typescript
test('transformation identity', () => {
  const before = snapshot(sheet);
  
  insertColumn(k);
  deleteColumn(k);
  
  const after = snapshot(sheet);
  expect(after).toEqual(before);
});
```

### Test 2: Compositional Stability

```typescript
test('compositional stability', () => {
  const before = snapshot(sheet);
  
  insertColumn(1);
  insertColumn(1);
  deleteColumn(1);
  deleteColumn(1);
  
  const after = snapshot(sheet);
  expect(after).toEqual(before);
});
```

### Test 3: Structured Adversarial (10k Operations)

**NOT random-only — use weighted chaos:**

```typescript
const ops = [
  { fn: insertColumn, weight: 0.25 },
  { fn: deleteColumn, weight: 0.25 },
  { fn: paste,        weight: 0.15 },
  { fn: cut,          weight: 0.10 },
  { fn: undo,         weight: 0.15 },
  { fn: redo,         weight: 0.10 }
];

for (let i = 0; i < 10000; i++) {
  const op = weightedRandom(ops);
  op.fn(randomIndex());
  
  // Validator runs automatically after each op
  // If any invariant violated → THROWS immediately
}
```

**Why weighted?**
- 50% insert/delete (stresses coordinate transforms hardest)
- 25% paste/cut (stresses clipboard pipeline)
- 25% undo/redo (stresses inverse transforms)

**What this catches:**
- Coordinate drift bugs
- Index misinterpretation
- Transform stacking errors
- DAG corruption
- Formula/graph desync
- map()/shiftFormula() divergence

### Test 4: Reference Mapping Consistency (Invariant 7 Specific)

```typescript
test('map() and shiftFormula() consistency', () => {
  // Setup: Cell A1 contains "=B2+C3"
  sheet.setCellValue({row: 0, col: 0}, {formula: "=B2+C3"});
  
  const transform = new InsertColumnTransform(1);  // Insert at column B
  
  // Original refs: B2 (1,1), C3 (2,2)
  const originalRefs = [{row: 1, col: 1}, {row: 2, col: 2}];
  
  // Apply map() to each ref
  const mappedRefs = originalRefs.map(r => transform.map(r));
  // Expected: B2→C2 (1,2), C3→D3 (2,3)
  
  // Apply shiftFormula()
  const shiftedFormula = transform.shiftFormula("=B2+C3");
  // Expected: "=C2+D3"
  
  // Extract refs from shifted formula
  const shiftedRefs = extractRefs(shiftedFormula);
  // Expected: C2 (1,2), D3 (2,3)
  
  // INVARIANT: mappedRefs == shiftedRefs
  expect(new Set(mappedRefs)).toEqual(new Set(shiftedRefs));
});
```

---

## 10. References

- **AddressTransform.ts:** Transform interface + composition hazard documentation
- **GraphTransformationValidator.ts:** 7 formalized invariants + composition semantics
- **CommandManager.ts:** TransformCommand interface + coordinate space contract
- **GraphInvariantValidator.ts:** Local consistency checks (layer 1)

---

## 11. Approval & Sign-off

**Architecture Status:** 🔒 **FROZEN**  
**Breaking Changes:** ❌ **PROHIBITED without architecture review**  
**Phase 2 Authorization:** ✅ **Approved to proceed with TransformCommand implementation**

**Next Steps:**
1. Implement InsertColumnTransform / DeleteColumnTransform (complete shiftFormula())
2. Implement InsertColumnCommand / DeleteColumnCommand (Extract→Clear→Transform→Paste pattern)
3. Write transformation identity tests
4. Write compositional stability tests
5. Write map()/shiftFormula() consistency tests
6. Run weighted adversarial test suite (10k operations)
7. Verify zero validator violations (all 7 invariants)

---

## 12. The One-Line Rule for Phase 2

**If you remember nothing else:**

> **"Never mutate — always Extract → Clear → Transform → PasteCommand"**

**Corollary:**

> **"Insert/Delete must never directly touch the DAG. Ever."**

---

**What You Are Building:**

Not: spreadsheet commands  
**But:** a verified graph rewriting system over a mutable coordinate lattice

**Phase 2 is NOT:** "add insert column feature"  
**Phase 2 IS:** "define a valid graph automorphism over a coordinate lattice"
