# Phase 2 Implementation Guide — Insert/Delete Row/Column

**Status:** 🔒 **READY TO IMPLEMENT**  
**Date:** April 18, 2026  
**Prerequisites:** Transform Composition Contract (binding)

---

## Quick Reference Card

### The One Rule

> **"Never mutate — always Extract → Clear → Transform → PasteCommand"**

### The One Forbidden Thing

> **"Insert/Delete must never directly touch the DAG. Ever."**

---

## Implementation Pattern (Mandatory)

```typescript
class InsertColumnCommand implements TransformCommand {
  execute(): void {
    const transform = this.getTransform();
    
    // 1. Extract
    const snapshot = this.extractRegion(affectedRegion);
    
    // 2. Clear
    this.clearRegion(affectedRegion);
    
    // 3. Transform
    const transformed = snapshot.map(cell => ({
      addr: transform.map(cell.addr)!,
      formula: cell.formula ? transform.shiftFormula(cell.formula) : undefined,
      ...
    }));
    
    // 4. Reinsert via PasteCommand
    new PasteCommand(worksheet, {cells: transformed}, anchor).execute();
    
    // Validator runs automatically (all 7 invariants)
  }
}
```

---

## The 7 Invariants (Auto-Validated)

1. **Graph-Formula Consistency:** parse(formula) = graph.edges
2. **No Zombie Edges:** no formula ⇒ no edges
3. **ORPHAN_NODE:** edges only between existing cells
4. **Bidirectional Edges:** forward ⇔ reverse
5. **Dirty Propagation:** dirtySet ⊆ graph nodes
6. **Transform Preservation:** graph(f(S)) == f(graph(S))
7. **Reference Mapping Consistency:** map(r) == extractRefs(shiftFormula(formula))

**Invariant 7 is the final gap — it catches map()/shiftFormula() divergence.**

---

## Required Tests (All Must Pass)

### 1. Transformation Identity
```typescript
insertColumn(k) → deleteColumn(k) → expect(state unchanged)
```

### 2. Compositional Stability
```typescript
insertColumn(1) × 2 → deleteColumn(1) × 2 → expect(state unchanged)
```

### 3. map()/shiftFormula() Consistency
```typescript
map(B2) → C2 ⇒ shiftFormula("=B2") → "=C2"
```

### 4. Weighted Adversarial (10k ops)
```typescript
50% insert/delete
25% paste/cut
25% undo/redo
→ Validator runs after each op
→ Zero violations
```

---

## Common Bugs You'll Hit (and How to Fix)

### Bug 1: Coordinate Space Confusion
**Symptom:** Undo deletes wrong column  
**Cause:** Using original index instead of current index  
**Fix:** Store logical operation, not snapshot coordinate

### Bug 2: map()/shiftFormula() Divergence
**Symptom:** REFERENCE_MAPPING_INCONSISTENCY error  
**Cause:** map() shifts to B1, but shiftFormula() keeps A1  
**Fix:** Both MUST delegate to same FormulaShiftingService logic

### Bug 3: In-Place Mutation
**Symptom:** Lost cells, corrupted DAG  
**Cause:** Moving cells before clearing source  
**Fix:** Use Extract → Clear → Transform → Paste pattern

### Bug 4: Direct DAG Mutation
**Symptom:** Zombie edges, orphan nodes  
**Cause:** Calling registerDependencies() directly  
**Fix:** Let PasteCommand handle DAG lifecycle

---

## Step-by-Step Checklist

### Phase 2.1: InsertColumnTransform (1 day)

- [ ] Implement `map(addr)`
  ```typescript
  map({row, col}) {
    if (col >= k) return {row, col: col + 1};
    return {row, col};
  }
  ```

- [ ] Implement `shiftFormula(formula)`
  ```typescript
  shiftFormula(formula) {
    return FormulaShiftingService.shift(formula, {
      colOffset: 1,
      startCol: this.insertAt
    });
  }
  ```

- [ ] Write unit tests for map()
- [ ] Write unit tests for shiftFormula()
- [ ] **VERIFY:** map(B2) and shiftFormula("=B2") produce same ref

### Phase 2.2: InsertColumnCommand (1-2 days)

- [ ] Implement `getTransform()`
- [ ] Implement `getUndoTransform()`
- [ ] Implement `execute()` using Extract → Clear → Transform → Paste
- [ ] Implement `undo()`
- [ ] **VERIFY:** Never calls registerDependencies() or clearDependencies()
- [ ] **VERIFY:** All transformations go through PasteCommand

### Phase 2.3: Testing (1 day)

- [ ] Write identity test (insert → delete → unchanged)
- [ ] Write compositional stability test
- [ ] Write map()/shiftFormula() consistency test
- [ ] Run all 57 PasteCommand tests (should still pass)
- [ ] Run validator on each test (zero violations)

### Phase 2.4: DeleteColumnCommand (1 day)

- [ ] Implement DeleteColumnTransform
- [ ] Implement DeleteColumnCommand
- [ ] Add tests
- [ ] Verify inverse: insert → delete = identity

### Phase 2.5: Adversarial Testing (1 day)

- [ ] Implement weighted random operation generator
- [ ] Run 10k operations
- [ ] Verify zero validator violations
- [ ] Add any discovered edge cases to test suite

---

## Success Criteria

✅ **All 57 PasteCommand tests passing**  
✅ **Transformation identity tests pass**  
✅ **Compositional stability tests pass**  
✅ **map()/shiftFormula() consistency tests pass**  
✅ **10k adversarial operations: zero violations**  
✅ **All 7 invariants: zero failures**  
✅ **Code review: no direct DAG mutation**

---

## Files to Create/Modify

### Create:
- `packages/core/src/dag/InsertColumnTransform.ts`
- `packages/core/src/dag/DeleteColumnTransform.ts`
- `packages/core/src/commands/InsertColumnCommand.ts`
- `packages/core/src/commands/DeleteColumnCommand.ts`
- `packages/core/__tests__/InsertDeleteColumn.test.ts`
- `packages/core/__tests__/AdversarialTransform.test.ts`

### Modify (minimal):
- `packages/core/src/dag/AddressTransform.ts` (remove skeleton implementations)

### Do NOT Modify:
- ❌ `DependencyGraph.ts` (no new public methods)
- ❌ `GraphInvariantValidator.ts` (frozen)
- ❌ `GraphTransformationValidator.ts` (frozen)
- ❌ `CommandManager.ts` (frozen)

---

## Debug Workflow

### When validator throws:

1. **Read the error message** (tells you which invariant violated)
2. **Check the violation type:**
   - REFERENCE_MAPPING_INCONSISTENCY → map() vs shiftFormula() diverged
   - GRAPH_FORMULA_MISMATCH → DAG not updated correctly
   - ZOMBIE_EDGE → Deleted cell still has edges
   - ORPHAN_NODE → Edge points to non-existent cell

3. **Common fixes:**
   - Invariant 7 → Ensure both map() and shiftFormula() use same logic
   - Invariant 6 → Use PasteCommand, don't mutate DAG directly
   - Invariant 3 → Clear edges before deleting cells

4. **Add test case for the bug scenario**

---

## Timeline Estimate

| Phase | Task | Time | Total |
|-------|------|------|-------|
| 2.1 | InsertColumnTransform | 1 day | 1 day |
| 2.2 | InsertColumnCommand | 1-2 days | 2-3 days |
| 2.3 | Testing | 1 day | 3-4 days |
| 2.4 | DeleteColumnCommand | 1 day | 4-5 days |
| 2.5 | Adversarial Testing | 1 day | **5-6 days** |

**Total: 1-1.5 weeks** (because hard parts already proven)

---

## What Makes This Fast

- ✅ FormulaShiftingService already exists (88.76% coverage)
- ✅ Clipboard pipeline already proven (57/57 tests)
- ✅ DAG lifecycle already correct
- ✅ Validator automatically enforces correctness
- ✅ No new infrastructure needed

**You're not building Insert/Delete from scratch.**  
**You're composing already-proven components.**

---

## When to Ask for Help

- Validator throws but you can't determine root cause
- map()/shiftFormula() consistency unclear
- Performance issues (>100ms for 1k cells)
- Adversarial test finds bug you can't reproduce

---

## Final Reminder

**This is NOT feature development.**  
**This is formally constrained state transformation engineering.**

**Phase 2 is safe because correctness is structurally enforced.**

The validator is your pair programmer.  
When it throws → you have a bug.  
When it passes → you're correct.

---

**Go forth and transform.**
