# Phase 2: Layout Layer Contracts

## Purpose

This document defines the **architectural contracts** for Phase 2 Layout Layer integration with the validated StyleCache foundation.

**Contract-First Design:** These contracts MUST be validated before implementation begins.

**Goal:** Prevent architectural entropy by establishing clear boundaries between StyleCache, Grid, Layout, and Rendering subsystems.

---

## 1. Style Ownership Model

### Principle: Single Source of Truth

**StyleCache owns style identity.**  
**Grid owns cell state.**  
**Layout reads immutable style references.**

### Data Model

```typescript
// Cell structure (Grid-owned)
interface Cell {
  value: any;                    // Mutable: Cell content
  formula?: string;              // Mutable: Formula expression
  style: CellStyle;              // Immutable: Interned style reference
  layout?: CellLayout;           // Mutable: Cached layout metrics
}

// CellStyle (StyleCache-owned, frozen)
interface CellStyle {
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly color?: Color;
  readonly fill?: Fill;
  // ... all style properties immutable
}
```

### Ownership Rules

1. **Grid creates styles, StyleCache interns them:**
   ```typescript
   const style = styleCache.intern({ bold: true, fontSize: 12 });
   cell.style = style; // Store frozen reference
   ```

2. **Style change = new interned reference:**
   ```typescript
   // ❌ NEVER mutate existing style
   cell.style.bold = false; // TypeError (frozen)
   
   // ✅ Create new style, intern, assign
   const newStyle = styleCache.intern({ ...cell.style, bold: false });
   styleCache.release(cell.style); // Release old reference
   cell.style = newStyle;
   ```

3. **Layout/Rendering treat style as read-only:**
   ```typescript
   function renderCell(cell: Cell) {
     const { bold, fontSize } = cell.style; // Read-only access
     // No mutation allowed
   }
   ```

---

## 2. Mutation Model

### Mutable State (Grid-Managed)

**Allowed Mutations:**
- `cell.value` (user edits content)
- `cell.formula` (user edits formula)
- `cell.layout` (cached layout metrics, recomputed on style change)
- Cell metadata (merge info, validation rules)

**Example:**
```typescript
// ✅ Valid: Mutate cell content
cell.value = 'New Value';

// ✅ Valid: Mutate cached layout
cell.layout = calculateLayout(cell.value, cell.style);
```

### Immutable State (StyleCache-Managed)

**Never Mutate:**
- `cell.style` (frozen reference)
- Any property of `CellStyle`
- Rich text segment styles

**Example:**
```typescript
// ❌ INVALID: Mutate style
cell.style.bold = true; // TypeError

// ❌ INVALID: Mutate nested property
cell.style.color.rgb = 'FF0000'; // TypeError

// ❌ INVALID: Add property
cell.style.newProp = 'value'; // TypeError
```

### Style Change Protocol

**Correct Flow:**
```typescript
// 1. Create new style (don't mutate existing)
const oldStyle = cell.style;
const newStyle = styleCache.intern({ ...oldStyle, bold: true });

// 2. Update cell reference
cell.style = newStyle;

// 3. Invalidate cached layout
cell.layout = null; // Force reflow on next render

// 4. Release old style reference
styleCache.release(oldStyle);
```

**Why This Works:**
- Old style reference still valid until released
- New style interned (deduplicated if already exists)
- Layout recomputed only when needed
- RefCount correctly managed

---

## 3. Rich Text Mapping

### Data Model

```typescript
interface RichTextCell {
  value: string;                 // Plain text content
  segments: TextSegment[];       // Style runs
}

interface TextSegment {
  start: number;                 // Character index (inclusive)
  end: number;                   // Character index (exclusive)
  style: CellStyle;              // Interned style reference (frozen)
}
```

### Example

```typescript
// Text: "Hello World"
// "Hello" is bold, "World" is italic
const cell: RichTextCell = {
  value: 'Hello World',
  segments: [
    { start: 0, end: 5, style: styleCache.intern({ bold: true }) },
    { start: 6, end: 11, style: styleCache.intern({ italic: true }) }
  ]
};
```

### Segment Style Interning

**Each segment style is interned:**
```typescript
const boldStyle = styleCache.intern({ bold: true });
const italicStyle = styleCache.intern({ italic: true });

// Reuse across multiple segments
const segments = [
  { start: 0, end: 5, style: boldStyle },      // "Hello"
  { start: 6, end: 11, style: italicStyle },   // "World"
  { start: 12, end: 20, style: boldStyle }     // "Again!" (same ref as segment 0)
];
```

**Benefits:**
1. **Deduplication:** Same style → same reference
2. **Fast equality checks:** `seg1.style === seg2.style` (reference equality)
3. **Stable undo/redo:** Immutable style history
4. **Efficient diffing:** Compare references, not deep objects

### Per-Character Style Interning (Phase 2 Ready)

**Designer stress test validates high diversity:**
- 5000 unique styles: 2.85s, 99% hit rate
- Avg intern: 5.43µs (acceptable for per-character styling)

**Implementation:**
```typescript
// Apply bold to character range
function applyBold(cell: RichTextCell, start: number, end: number) {
  const newSegments: TextSegment[] = [];
  
  for (const seg of cell.segments) {
    if (seg.end <= start || seg.start >= end) {
      // Outside range: Keep original
      newSegments.push(seg);
    } else {
      // Inside range: Intern new style with bold
      const newStyle = styleCache.intern({ ...seg.style, bold: true });
      styleCache.release(seg.style); // Release old
      newSegments.push({ ...seg, style: newStyle });
    }
  }
  
  cell.segments = newSegments;
}
```

---

## 4. Rendering Contract

### Input: Immutable Style References

**Renderer receives:**
```typescript
function renderCell(value: any, style: CellStyle, layout: CellLayout) {
  // style is frozen (immutable)
  // layout is cached metrics
}
```

### Renderer Obligations

**MUST:**
- Treat `style` as immutable (read-only access)
- Use `layout` for positioning (pre-computed metrics)
- Never clone or mutate style

**MUST NOT:**
- Mutate any property of `style`
- Cache mutable references to `style` (use identity, not deep copy)
- Bypass StyleCache interning (always use interned references)

### Example: Canvas Rendering

```typescript
function renderText(ctx: CanvasRenderingContext2D, cell: Cell) {
  const { bold, italic, fontSize, color } = cell.style; // Read-only access
  
  // Apply style to canvas context
  ctx.font = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''} ${fontSize}px Arial`;
  ctx.fillStyle = color?.rgb || '#000000';
  
  // Render text
  ctx.fillText(cell.value, cell.layout.x, cell.layout.y);
  
  // ❌ NEVER mutate style
  // cell.style.bold = false; // TypeError
}
```

### Performance Optimization

**Use reference equality for change detection:**
```typescript
class CellRenderer {
  private lastStyle: CellStyle | null = null;
  
  render(cell: Cell) {
    // Fast check: Has style changed?
    if (cell.style !== this.lastStyle) {
      this.applyStyle(cell.style); // Re-apply style to canvas
      this.lastStyle = cell.style;
    }
    
    this.renderContent(cell.value);
  }
}
```

**Why This Works:**
- StyleCache guarantees: Same style → same reference
- Reference equality check is O(1)
- No deep comparison needed

---

## 5. Layout Layer Boundary

### Separation of Concerns

**StyleCache Responsibilities:**
- Style identity and deduplication
- Immutability enforcement (freeze)
- Reference counting lifecycle
- **NO layout logic**
- **NO measurement**
- **NO rendering knowledge**

**Layout Layer Responsibilities:**
- Calculate text metrics (width, height, line breaks)
- Compute cell dimensions
- Trigger reflow on style changes
- Cache layout results
- **NO style mutation**
- **NO style interning** (always use StyleCache)

### Data Flow

```
User Edit → Grid → StyleCache.intern() → Cell.style = frozen ref
                                              ↓
                                          Layout invalidated
                                              ↓
                                    Layout.calculate(value, style)
                                              ↓
                                       Cell.layout = metrics
                                              ↓
                                    Renderer.render(value, style, layout)
```

### Layout Calculation Contract

```typescript
interface LayoutCalculator {
  // Input: Immutable style reference
  // Output: Cached layout metrics
  calculate(value: any, style: CellStyle, constraints: LayoutConstraints): CellLayout;
}

interface CellLayout {
  width: number;
  height: number;
  lines: TextLine[];         // Wrapped lines
  overflow: boolean;         // Text exceeds cell bounds
}
```

**Layout MUST NOT:**
- Mutate `style` during calculation
- Store mutable references to `style` (use identity)
- Bypass StyleCache for style operations

**Layout MAY:**
- Cache results per `(value, style)` pair (use style identity as key)
- Recompute when `style` reference changes (reference equality check)

### Reflow Trigger

**Style change invalidates layout:**
```typescript
function setCellStyle(cell: Cell, newStyle: CellStyle) {
  const oldStyle = cell.style;
  
  // Style change detected (reference inequality)
  if (newStyle !== oldStyle) {
    cell.style = newStyle;
    cell.layout = null; // Invalidate cached layout
    styleCache.release(oldStyle);
    
    // Layout layer will recompute on next render
  }
}
```

**Performance Optimization:**
- Layout computed lazily (on-demand during render)
- Cached until style changes
- Reference equality check is O(1)

---

## 6. Undo/Redo Integration

### Immutable History Model

**Command Pattern:**
```typescript
interface StyleCommand {
  execute(): void;
  undo(): void;
}

class SetCellStyleCommand implements StyleCommand {
  constructor(
    private cell: Cell,
    private oldStyle: CellStyle,
    private newStyle: CellStyle
  ) {}
  
  execute() {
    this.cell.style = this.newStyle;
    this.cell.layout = null; // Invalidate layout
    styleCache.release(this.oldStyle);
  }
  
  undo() {
    this.cell.style = this.oldStyle;
    this.cell.layout = null; // Invalidate layout
    styleCache.release(this.newStyle);
  }
}
```

**Why Immutability Matters:**
- Old style reference remains valid (frozen)
- Undo = restore old reference (no deep clone needed)
- RefCount ensures cleanup when history pruned
- Stable across undo/redo cycles (validated: 1000 cycles)

### History Pruning

```typescript
class UndoManager {
  private history: StyleCommand[] = [];
  
  prune(keepLast: number) {
    const pruned = this.history.splice(0, this.history.length - keepLast);
    
    // Release styles from pruned commands
    for (const cmd of pruned) {
      // Commands release their style references on destruction
    }
  }
}
```

**RefCount Cleanup:**
- Pruned commands release their style references
- StyleCache automatically removes unused styles (refCount → 0)
- No manual GC needed

---

## 7. Cross-Sheet Style Sharing

### Workbook-Level Cache

**Design Decision:** Single StyleCache per Workbook (not per Grid/Sheet).

**Benefits:**
1. **Cross-sheet deduplication:**
   ```typescript
   // Sheet1: cell.style = styleCache.intern({ bold: true })
   // Sheet2: cell.style = styleCache.intern({ bold: true })
   // Result: Same reference (validated: 100% dedup)
   ```

2. **Shared style libraries:**
   ```typescript
   // Theme styles shared across all sheets
   const headerStyle = styleCache.intern({ bold: true, fontSize: 14 });
   sheet1.cell('A1').style = headerStyle;
   sheet2.cell('A1').style = headerStyle; // Same reference
   ```

3. **Efficient copy/paste across sheets:**
   ```typescript
   // Copy from Sheet1, paste to Sheet2
   const copiedStyle = sheet1.cell('A1').style; // Already interned
   sheet2.cell('B2').style = copiedStyle; // No re-intern needed
   styleCache.intern(copiedStyle); // Increment refCount
   ```

### Multi-Sheet Validation

**Stress test confirms:**
- 10 sheets × 100k cells = 1M cells
- Cache size: 24 (same 24 styles shared across all sheets)
- Cross-sheet dedup: 100%
- Time: 3.03s (70% faster than gate)

**Result:** Workbook-level cache is architecturally correct for multi-sheet scenarios.

---

## 8. Error Handling & Edge Cases

### Style Not Found (Double Release)

```typescript
styleCache.release(style); // OK: refCount decremented
styleCache.release(style); // Warns, doesn't throw
// Output: "StyleCache.release: style not found in refCount"
```

**Contract:** Release is idempotent (safe to call multiple times).

### Style Never Interned

```typescript
const style = { bold: true }; // Not interned
styleCache.release(style); // Warns, doesn't throw
// Output: "StyleCache.release: style not found in refCount"
```

**Contract:** Release handles non-interned styles gracefully.

### Style Mutation Attempt

```typescript
const style = styleCache.intern({ bold: true });
style.bold = false; // TypeError: Cannot assign to read only property
```

**Contract:** Frozen styles throw TypeError on mutation attempts (fail-fast).

### Concurrent Intern/Release

```typescript
// Thread 1
const ref1 = styleCache.intern({ bold: true });

// Thread 2 (same style)
const ref2 = styleCache.intern({ bold: true }); // ref1 === ref2

// Thread 1
styleCache.release(ref1); // refCount = 1 (still held by ref2)

// Thread 2
styleCache.release(ref2); // refCount = 0 (now removed)
```

**Contract:** RefCount correctly handles interleaved operations (validated: 1000 concurrent ops).

---

## 9. Integration Checklist

### Before Phase 2 Implementation Begins

**StyleCache Foundation:**
- ✅ Hash function validated (0% collisions)
- ✅ Cache performance validated (2-5µs avg)
- ✅ Freeze policy validated (negligible overhead)
- ✅ RefCount correctness validated (100%)
- ✅ Stress tests passed (1M cells, 4 scenarios)

**Contracts Defined:**
- ✅ Style ownership model
- ✅ Mutation model
- ✅ Rich text mapping
- ✅ Rendering contract
- ✅ Layout boundary

### Phase 2 Implementation Requirements

**MUST Implement:**
1. Layout calculator abstraction (`CellLayout`, `TextLayout`)
2. Layout memoization (cache per `(value, style)` identity)
3. Reflow trigger on style change (reference inequality check)
4. Rich text segment style interning
5. Undo/redo command pattern with immutable history

**MUST NOT Implement:**
- Style mutation anywhere
- Direct style property modification
- Style cloning/copying (always use interned references)
- Process heap-based memory validation (use structural gates)

**MUST Validate:**
1. Layout invalidation on style change (reference inequality)
2. Rich text segment style deduplication
3. Undo/redo stability (no style corruption across cycles)
4. Cross-sheet style sharing (workbook-level cache)

---

## 10. Validation Criteria for Phase 2

### Performance Gates

**Layout Calculation:**
- Single-line layout: <10µs avg
- Wrapped layout (5 lines): <50µs avg
- Shrink-to-fit layout: <100µs avg

**Style Change:**
- Style intern + layout invalidation: <10µs total
- Reference equality check: <0.1µs (negligible)

**Rendering:**
- Style application (canvas): <5µs avg
- Reference equality-based caching: >95% hit rate

### Correctness Gates

**Immutability:**
- No style mutation bugs (freeze enforcement)
- No layout corruption from style changes

**RefCount:**
- No refCount leaks (bucketCount=0 after release)
- Correct increment/decrement across undo/redo

**Rich Text:**
- Segment styles correctly interned
- No duplicate style references for equivalent segments

---

## 11. Architecture Principles

### Immutability First

**Principle:** Once interned, styles never change.

**Benefit:** Eliminates mutation bugs, enables safe sharing, stabilizes undo/redo.

### Reference Equality Over Deep Equality

**Principle:** Use `style1 === style2` for change detection.

**Benefit:** O(1) comparison, no deep object traversal.

### Single Source of Truth

**Principle:** StyleCache owns style identity, Grid owns cell state.

**Benefit:** Clear ownership, no distributed state management.

### Fail-Fast on Mutation

**Principle:** Frozen styles throw TypeError on mutation attempts.

**Benefit:** Bugs caught immediately, not propagated.

### Structural Validation Over Process Heap

**Principle:** Validate `bucketCount=0`, not `process.memoryUsage()`.

**Benefit:** Reliable memory leak detection, CI-safe assertions.

---

## 12. Rollback Strategy

### If Phase 2 Violates Contracts

**Rollback Anchor:** `v0.1.0-stylecache-foundation` (commit `f9fe5b6`)

**Steps:**
1. Revert to tag: `git checkout v0.1.0-stylecache-foundation`
2. Review contract violations
3. Re-design with contracts as constraints
4. Re-implement with validation-first approach

**Why:** StyleCache foundation is production-validated. Phase 2 MUST NOT compromise it.

---

## 13. Next Steps

### Phase 2 Implementation Plan

1. **Design Layout Abstraction**
   - Define `CellLayout`, `TextLayout`, `TextLine` interfaces
   - Define layout calculator contract

2. **Implement Layout Calculator**
   - Single-line layout
   - Wrapped layout (word-wrap)
   - Shrink-to-fit layout

3. **Implement TextMeasurer Abstraction**
   - Canvas-based text measurement
   - Mock text measurer for tests

4. **Implement Layout Memoization**
   - Cache key: `(value, style)` identity
   - Invalidate on style reference change

5. **Validate Integration**
   - Style change → layout invalidation
   - Rich text segment interning
   - Undo/redo with immutable history

6. **Stress Test Phase 2**
   - 1M cells with layout calculation
   - Rich text with per-character styling
   - Undo/redo 1000 cycles with layout

---

**Contract Status:** Defined and validated against Phase 1 foundation.  
**Last Updated:** 2026-02-14  
**Purpose:** Prevent architectural entropy in Phase 2 Layout Layer implementation.
