# Layout Abstraction Layer Design

**Status:** Design Phase (Pre-Implementation)  
**Target:** Decoupled Layout → Render Pipeline  
**Date:** February 14, 2026  
**Gate Condition:** Must be approved before implementing text features (wrap, rotation, shrink-to-fit)

---

## Executive Summary

The Layout Layer is the **boundary between style and rendering**. It calculates text positioning, dimensions, and line breaks WITHOUT performing any rendering.

**Core Principle:**
> Layout is pure calculation. Rendering is impure side effects. Never mix them.

**Why This Matters:**
- **Phase 2 (Rich Text):** Layout must measure per-run, not per-cell
- **Performance:** Layout results are memoizable (pure functions)
- **Testing:** Layout can be tested without canvas/DOM
- **Separation:** Style → Layout → Render is a clean pipeline

**If layout couples with rendering, Rich Text becomes exponentially harder.**

---

## The Problem

**Bad Architecture (Coupled):**

```typescript
// ❌ BAD: Layout logic mixed with rendering
function renderCell(ctx: CanvasRenderingContext2D, cell: Cell, x: number, y: number) {
  // ... apply font ...
  
  if (cell.style.wrapText) {
    // Layout calculation happens DURING rendering
    const lines = []; // wrap logic inline
    let currentLine = '';
    for (const word of cell.value.split(' ')) {
      const test = currentLine + ' ' + word;
      if (ctx.measureText(test).width > width) {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Rendering immediately after layout
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
  }
}
```

**Problems:**
1. Layout cannot be tested without canvas
2. Layout cannot be memoized (side effects)
3. Cannot calculate layout before rendering decision
4. Rich text per-run layout = impossible

---

## Good Architecture (Decoupled)

**Style → Layout → Render Pipeline:**

```typescript
// Step 1: Calculate layout (pure)
const layout = calculateCellLayout(cell, bounds);

// Step 2: Memoize (cache by style + value + bounds)
const cachedLayout = layoutCache.get(key) || layout;

// Step 3: Render (impure, uses cached layout)
renderCellLayout(ctx, cachedLayout);
```

**Benefits:**
1. ✅ Layout testable without canvas
2. ✅ Layout memoizable (pure function)
3. ✅ Rich text per-run layout = straightforward
4. ✅ Can calculate layout for entire sheet before rendering

---

## Layout Data Structure

### CellLayout (Output of Layout Calculation)

```typescript
/**
 * CellLayout - Pure layout information
 * 
 * Contains ZERO rendering logic.
 * Rendering reads this structure and draws it.
 */
interface CellLayout {
  // Cell bounds
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Text layout (single or multi-line)
  textLayout: TextLayout;
  
  // Border layout (if any)
  borderLayout?: BorderLayout;
  
  // Background layout (if any)
  backgroundLayout?: BackgroundLayout;
}

/**
 * TextLayout - How text is positioned and split
 */
interface TextLayout {
  // Text positioning
  x: number;
  y: number;
  
  // Single-line vs multi-line
  lines: TextLine[];
  
  // Transform (for rotation)
  transform?: {
    rotation: number; // degrees
    centerX: number;
    centerY: number;
  };
  
  // Font properties (for renderer)
  font: {
    family: string;
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
    color: string;
  };
}

/**
 * TextLine - A single line of text (or run within line)
 */
interface TextLine {
  text: string;
  x: number; // Relative to cell
  y: number; // Relative to cell
  width: number;
  height: number;
  
  // Phase 2: Rich text runs
  runs?: TextRun[];
}

/**
 * TextRun - A single styled run within a line (Phase 2)
 */
interface TextRun {
  text: string;
  startIndex: number;
  endIndex: number;
  font: Partial<CellStyle>; // Style override
  width: number;
  x: number; // Relative to line
}

/**
 * BorderLayout - Border positioning
 */
interface BorderLayout {
  top?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
  right?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
  bottom?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
  left?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
  diagonalUp?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
  diagonalDown?: { x1: number; y1: number; x2: number; y2: number; style: BorderStyle };
}

/**
 * BackgroundLayout - Fill positioning
 */
interface BackgroundLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: FillStyle;
}
```

---

## Layout Calculator (Pure Functions)

### Main Layout Function

```typescript
/**
 * Calculate cell layout (pure function, no side effects)
 * 
 * @param cell - Cell to layout
 * @param bounds - Cell bounds { x, y, width, height }
 * @param measurer - Text measurement interface (abstracted)
 * @returns Complete layout information
 */
export function calculateCellLayout(
  cell: Cell,
  bounds: { x: number; y: number; width: number; height: number },
  measurer: TextMeasurer
): CellLayout {
  const style = cell.style || {};
  
  // Calculate text layout
  const textLayout = calculateTextLayout(
    String(cell.value),
    bounds,
    style,
    measurer
  );
  
  // Calculate border layout
  const borderLayout = calculateBorderLayout(bounds, style);
  
  // Calculate background layout
  const backgroundLayout = style.fill
    ? calculateBackgroundLayout(bounds, style.fill)
    : undefined;
  
  return {
    ...bounds,
    textLayout,
    borderLayout,
    backgroundLayout,
  };
}
```

### Text Layout (Phase 1)

```typescript
function calculateTextLayout(
  text: string,
  bounds: { x: number; y: number; width: number; height: number },
  style: CellStyle,
  measurer: TextMeasurer
): TextLayout {
  const font = extractFontProperties(style);
  
  // Handle wrap text
  if (style.wrapText) {
    return calculateWrappedLayout(text, bounds, style, font, measurer);
  }
  
  // Handle shrink to fit
  if (style.shrinkToFit) {
    return calculateShrinkToFitLayout(text, bounds, style, font, measurer);
  }
  
  // Default: single line
  return calculateSingleLineLayout(text, bounds, style, font, measurer);
}

function calculateSingleLineLayout(
  text: string,
  bounds: { x: number; y: number; width: number; height: number },
  style: CellStyle,
  font: FontProperties,
  measurer: TextMeasurer
): TextLayout {
  const metrics = measurer.measure(text, font);
  
  // Calculate X position (horizontal alignment + indent)
  const indent = (style.indent || 0) * 8; // 8px per indent level
  let x = bounds.x + indent;
  
  switch (style.horizontalAlign) {
    case 'center':
      x = bounds.x + (bounds.width - metrics.width) / 2;
      break;
    case 'right':
      x = bounds.x + bounds.width - metrics.width - 2; // 2px padding
      break;
    case 'left':
    default:
      x = bounds.x + indent + 2; // 2px padding
  }
  
  // Calculate Y position (vertical alignment)
  let y = bounds.y + bounds.height / 2; // Default: middle
  
  switch (style.verticalAlign) {
    case 'top':
      y = bounds.y + metrics.height / 2 + 2; // 2px padding
      break;
    case 'bottom':
      y = bounds.y + bounds.height - metrics.height / 2 - 2; // 2px padding
      break;
  }
  
  const line: TextLine = {
    text,
    x,
    y,
    width: metrics.width,
    height: metrics.height,
  };
  
  return {
    x: bounds.x,
    y: bounds.y,
    lines: [line],
    transform: style.rotation ? {
      rotation: style.rotation,
      centerX: bounds.x + bounds.width / 2,
      centerY: bounds.y + bounds.height / 2,
    } : undefined,
    font,
  };
}

function calculateWrappedLayout(
  text: string,
  bounds: { x: number; y: number; width: number; height: number },
  style: CellStyle,
  font: FontProperties,
  measurer: TextMeasurer
): TextLayout {
  const indent = (style.indent || 0) * 8;
  const availableWidth = bounds.width - indent - 4; // 4px total padding
  
  // Split text into lines
  const lines = wrapTextToLines(text, availableWidth, font, measurer);
  
  // Calculate line height
  const lineHeight = font.size * 1.2; // 120% line spacing (Excel standard)
  const totalHeight = lines.length * lineHeight;
  
  // Calculate starting Y based on vertical alignment
  let startY = bounds.y + 2; // Default: top-aligned with padding
  
  switch (style.verticalAlign) {
    case 'middle':
      startY = bounds.y + (bounds.height - totalHeight) / 2;
      break;
    case 'bottom':
      startY = bounds.y + bounds.height - totalHeight - 2;
      break;
  }
  
  // Calculate X position (horizontal alignment)
  let baseX = bounds.x + indent + 2;
  
  // Create text lines
  const textLines: TextLine[] = lines.map((lineText, index) => {
    const metrics = measurer.measure(lineText, font);
    let x = baseX;
    
    switch (style.horizontalAlign) {
      case 'center':
        x = bounds.x + (bounds.width - metrics.width) / 2;
        break;
      case 'right':
        x = bounds.x + bounds.width - metrics.width - 2;
        break;
    }
    
    return {
      text: lineText,
      x,
      y: startY + (index * lineHeight),
      width: metrics.width,
      height: lineHeight,
    };
  });
  
  return {
    x: bounds.x,
    y: bounds.y,
    lines: textLines,
    font,
  };
}

function calculateShrinkToFitLayout(
  text: string,
  bounds: { x: number; y: number; width: number; height: number },
  style: CellStyle,
  font: FontProperties,
  measurer: TextMeasurer
): TextLayout {
  const availableWidth = bounds.width - 4; // 4px total padding
  
  // Binary search for optimal font size
  let minSize = 1;
  let maxSize = font.size;
  let optimalSize = font.size;
  
  while (maxSize - minSize > 0.5) {
    const testSize = (minSize + maxSize) / 2;
    const testFont = { ...font, size: testSize };
    const metrics = measurer.measure(text, testFont);
    
    if (metrics.width <= availableWidth) {
      optimalSize = testSize;
      minSize = testSize;
    } else {
      maxSize = testSize;
    }
  }
  
  // Use single line layout with optimal font size
  const optimalFont = { ...font, size: optimalSize };
  return calculateSingleLineLayout(text, bounds, style, optimalFont, measurer);
}

function wrapTextToLines(
  text: string,
  maxWidth: number,
  font: FontProperties,
  measurer: TextMeasurer
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = measurer.measure(testLine, font);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
```

---

## Text Measurer Abstraction

**Problem:** Canvas `measureText()` is impure (requires canvas context).

**Solution:** Abstract measurement interface.

```typescript
/**
 * TextMeasurer - Abstract text measurement
 * 
 * Implementations:
 * - CanvasTextMeasurer (browser, uses canvas)
 * - MockTextMeasurer (testing, uses estimates)
 * - NodeTextMeasurer (Node.js, uses canvas package)
 */
interface TextMeasurer {
  measure(text: string, font: FontProperties): TextMetrics;
}

interface FontProperties {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
}

interface TextMetrics {
  width: number;
  height: number;
}

/**
 * Canvas-based measurer (browser)
 */
class CanvasTextMeasurer implements TextMeasurer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  measure(text: string, font: FontProperties): TextMetrics {
    // Apply font
    const weight = font.bold ? 'bold' : 'normal';
    const style = font.italic ? 'italic' : 'normal';
    this.ctx.font = `${style} ${weight} ${font.size}px ${font.family}`;
    
    // Measure
    const metrics = this.ctx.measureText(text);
    
    return {
      width: metrics.width,
      height: font.size * 1.2, // Approximate height
    };
  }
}

/**
 * Mock measurer (testing)
 */
class MockTextMeasurer implements TextMeasurer {
  measure(text: string, font: FontProperties): TextMetrics {
    // Rough estimate: 0.6 * fontSize per character
    const width = text.length * font.size * 0.6;
    const height = font.size * 1.2;
    
    return { width, height };
  }
}
```

---

## Layout Memoization

**Why:** Layout calculation is expensive (text measurement, wrapping logic).

**Strategy:** Cache layout by key (style + value + bounds).

```typescript
class LayoutCache {
  private cache = new Map<string, CellLayout>();
  
  get(key: string): CellLayout | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, layout: CellLayout): void {
    this.cache.set(key, layout);
  }
  
  /**
   * Generate cache key from cell properties
   */
  static key(
    value: string | number,
    style: CellStyle,
    bounds: { x: number; y: number; width: number; height: number }
  ): string {
    // Hash relevant properties
    return JSON.stringify({
      value,
      // Style properties that affect layout
      font: style.fontFamily,
      size: style.fontSize,
      bold: style.bold,
      italic: style.italic,
      align: style.horizontalAlign,
      valign: style.verticalAlign,
      wrap: style.wrapText,
      shrink: style.shrinkToFit,
      rotation: style.rotation,
      indent: style.indent,
      // Bounds
      width: bounds.width,
      height: bounds.height,
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

**Usage:**
```typescript
const layoutCache = new LayoutCache();
const measurer = new CanvasTextMeasurer();

function getOrCalculateLayout(cell: Cell, bounds: Bounds): CellLayout {
  const key = LayoutCache.key(cell.value, cell.style || {}, bounds);
  
  let layout = layoutCache.get(key);
  if (!layout) {
    layout = calculateCellLayout(cell, bounds, measurer);
    layoutCache.set(key, layout);
  }
  
  return layout;
}
```

---

## Render Pipeline (Consumes Layout)

**Rendering is now trivial:**

```typescript
function renderCellLayout(
  ctx: CanvasRenderingContext2D,
  layout: CellLayout
): void {
  // Render background
  if (layout.backgroundLayout) {
    renderBackground(ctx, layout.backgroundLayout);
  }
  
  // Render borders
  if (layout.borderLayout) {
    renderBorders(ctx, layout.borderLayout);
  }
  
  // Render text
  renderText(ctx, layout.textLayout);
}

function renderText(ctx: CanvasRenderingContext2D, textLayout: TextLayout): void {
  // Apply font
  const font = textLayout.font;
  ctx.font = getCSSFont(font);
  ctx.fillStyle = font.color;
  
  // Apply transform (rotation)
  if (textLayout.transform) {
    ctx.save();
    ctx.translate(textLayout.transform.centerX, textLayout.transform.centerY);
    ctx.rotate((textLayout.transform.rotation * Math.PI) / 180);
    ctx.translate(-textLayout.transform.centerX, -textLayout.transform.centerY);
  }
  
  // Render each line
  for (const line of textLayout.lines) {
    ctx.fillText(line.text, line.x, line.y);
    
    // Strikethrough (decoration)
    if (font.strikethrough) {
      const strikeY = line.y - font.size * 0.4;
      ctx.beginPath();
      ctx.moveTo(line.x, strikeY);
      ctx.lineTo(line.x + line.width, strikeY);
      ctx.strokeStyle = font.color;
      ctx.lineWidth = Math.max(1, font.size / 20);
      ctx.stroke();
    }
  }
  
  // Restore transform
  if (textLayout.transform) {
    ctx.restore();
  }
}
```

**Benefits:**
- Rendering reads from pure layout structure
- No layout logic in renderer
- Easy to test rendering separately

---

## Phase 2 Extension: Rich Text Layout

**With clean separation, rich text is straightforward:**

```typescript
// Phase 2: Calculate layout for rich text
function calculateRichTextLayout(
  richText: RichTextValue,
  bounds: Bounds,
  style: CellStyle,
  measurer: TextMeasurer
): TextLayout {
  const lines = wrapRichTextToLines(richText, bounds.width, measurer);
  
  // Calculate position for each line
  const textLines: TextLine[] = lines.map((lineRuns, index) => {
    const lineWidth = lineRuns.reduce((sum, run) => sum + run.width, 0);
    
    // Horizontal alignment
    let x = bounds.x + 2;
    switch (style.horizontalAlign) {
      case 'center':
        x = bounds.x + (bounds.width - lineWidth) / 2;
        break;
      case 'right':
        x = bounds.x + bounds.width - lineWidth - 2;
        break;
    }
    
    return {
      text: lineRuns.map(r => r.text).join(''),
      x,
      y: bounds.y + (index * font.size * 1.2),
      width: lineWidth,
      height: font.size * 1.2,
      runs: lineRuns, // ← Rich text runs
    };
  });
  
  return {
    x: bounds.x,
    y: bounds.y,
    lines: textLines,
    font: extractFontProperties(style),
  };
}

function wrapRichTextToLines(
  richText: RichTextValue,
  maxWidth: number,
  measurer: TextMeasurer
): TextRun[][] {
  // Split runs across lines
  const lines: TextRun[][] = [];
  let currentLine: TextRun[] = [];
  let currentLineWidth = 0;
  
  for (const run of richText.runs) {
    const runFont = { ...baseFont, ...run.style };
    const runMetrics = measurer.measure(run.text, runFont);
    
    if (currentLineWidth + runMetrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [];
      currentLineWidth = 0;
    }
    
    currentLine.push({
      text: run.text,
      startIndex: run.start,
      endIndex: run.end,
      font: run.style,
      width: runMetrics.width,
      x: currentLineWidth,
    });
    
    currentLineWidth += runMetrics.width;
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  return lines;
}
```

**Key Insight:** Rich text layout is EASY because layout is decoupled from rendering.

---

## Testing Strategy

### Unit Tests (20+ tests)

```typescript
describe('Layout Calculator', () => {
  let measurer: TextMeasurer;
  
  beforeEach(() => {
    measurer = new MockTextMeasurer();
  });
  
  test('single line layout calculates correct position', () => {
    const cell = { value: 'Test', style: {} };
    const bounds = { x: 0, y: 0, width: 100, height: 20 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    
    expect(layout.textLayout.lines).toHaveLength(1);
    expect(layout.textLayout.lines[0].text).toBe('Test');
  });
  
  test('horizontal alignment affects X position', () => {
    const cell = { value: 'Test', style: { horizontalAlign: 'center' as const } };
    const bounds = { x: 0, y: 0, width: 100, height: 20 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    const line = layout.textLayout.lines[0];
    
    // Centered: x should be > 0 and < 100
    expect(line.x).toBeGreaterThan(0);
    expect(line.x).toBeLessThan(100);
  });
  
  test('vertical alignment affects Y position', () => {
    const cell = { value: 'Test', style: { verticalAlign: 'top' as const } };
    const bounds = { x: 0, y: 0, width: 100, height: 50 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    const line = layout.textLayout.lines[0];
    
    // Top-aligned: y should be near top (< 10)
    expect(line.y).toBeLessThan(10);
  });
  
  test('wrap text splits into multiple lines', () => {
    const cell = { 
      value: 'This is a very long text that should wrap', 
      style: { wrapText: true }
    };
    const bounds = { x: 0, y: 0, width: 50, height: 100 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    
    expect(layout.textLayout.lines.length).toBeGreaterThan(1);
  });
  
  test('shrink to fit reduces font size', () => {
    const cell = {
      value: 'Very long text',
      style: { shrinkToFit: true, fontSize: 12 }
    };
    const bounds = { x: 0, y: 0, width: 30, height: 20 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    
    expect(layout.textLayout.font.size).toBeLessThan(12);
  });
  
  test('rotation adds transform to layout', () => {
    const cell = { value: 'Test', style: { rotation: 45 } };
    const bounds = { x: 0, y: 0, width: 100, height: 20 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    
    expect(layout.textLayout.transform).toBeDefined();
    expect(layout.textLayout.transform!.rotation).toBe(45);
  });
  
  test('indent affects X position', () => {
    const cell = { value: 'Test', style: { indent: 2 } };
    const bounds = { x: 0, y: 0, width: 100, height: 20 };
    
    const layout = calculateCellLayout(cell, bounds, measurer);
    const line = layout.textLayout.lines[0];
    
    // Indented: x should be 2 * 8px = 16px + padding
    expect(line.x).toBeGreaterThan(16);
  });
  
  // ... 13 more tests
});

describe('Layout Memoization', () => {
  test('cache returns same layout for identical input', () => {
    const cache = new LayoutCache();
    const measurer = new MockTextMeasurer();
    
    const cell = { value: 'Test', style: { bold: true } };
    const bounds = { x: 0, y: 0, width: 100, height: 20 };
    
    const layout1 = calculateCellLayout(cell, bounds, measurer);
    const key = LayoutCache.key(cell.value, cell.style, bounds);
    cache.set(key, layout1);
    
    const layout2 = cache.get(key);
    
    expect(layout2).toBe(layout1); // Same reference
  });
  
  test('different values generate different keys', () => {
    const key1 = LayoutCache.key('A', {}, { x: 0, y: 0, width: 100, height: 20 });
    const key2 = LayoutCache.key('B', {}, { x: 0, y: 0, width: 100, height: 20 });
    
    expect(key1).not.toBe(key2);
  });
  
  // ... more tests
});
```

---

## Gate Conditions for Rendering

**Before implementing rendering features:**

- [ ] Layout calculator passes 20+ unit tests
- [ ] Layout is pure (no side effects)
- [ ] TextMeasurer abstraction working
- [ ] Layout memoization implemented
- [ ] Layout structure supports rotation, wrap, shrink-to-fit
- [ ] Mock measurer allows testing without canvas

**Only after gates pass → Implement rendering.**

---

## Strategic Insight

**Layout abstraction is not a Phase 1 feature.**

**Layout abstraction is the architectural boundary that makes Rich Text possible.**

Without clean separation:
- Phase 2 (Rich Text): Per-run layout = impossible to test, impossible to optimize
- Performance: Cannot memoize layout results
- Testing: Cannot test layout without canvas/DOM

**This is why we design the boundary BEFORE implementing features.**

---

## Next Steps

1. **Approval Required:**
   - [ ] Review layout data structure
   - [ ] Review TextMeasurer abstraction
   - [ ] Review layout memoization strategy
   - [ ] Approve gate conditions

2. **Implementation Order (Day 3-4):**
   - [ ] Implement `TextMeasurer` interface + Canvas implementation
   - [ ] Implement `calculateSingleLineLayout`
   - [ ] Implement `calculateWrappedLayout`
   - [ ] Implement `calculateShrinkToFitLayout`
   - [ ] Implement `LayoutCache` with memoization
   - [ ] Write 20+ layout unit tests

**Only after gate conditions pass → Implement rendering (Day 5+).**

---

**Status:** Awaiting approval to implement  
**Risk Level:** 🟢 Low (clean abstraction)  
**Strategic Value:** 🔴 CRITICAL (enables Rich Text in Phase 2)

🚀 **Say "Implement Layout Layer" to proceed with Day 3-4 coding.**
