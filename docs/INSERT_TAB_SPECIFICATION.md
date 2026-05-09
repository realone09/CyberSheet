# Insert Tab — Complete Specification
## CyberSheet Excel 365 UI Implementation
### Version 1.0 — Phase 7 Planning

---

## 1. Overview

The Insert tab adds content to the spreadsheet: tables, pivot tables, illustrations, 
form controls, text elements, charts, sparklines, filters, links, and symbols.

**Key architectural dependency**: A kernel-level `DrawingLayer` that manages floating 
objects on top of the cell grid. This layer must support:
- Drawing objects (pictures, shapes, text boxes)
- Form controls (checkboxes, buttons, dropdowns)
- Hit testing for selection and interaction
- Z-ordering with bring-to-front/send-to-back
- Resize/rotate handles
- Serialization for save/load and undo/redo

---

## 2. Tab Layout

Group order (left to right), matching Excel 365:

| # | Group | Commands | Visible in Screenshot |
|---|-------|----------|----------------------|
| 1 | Tables | PivotTable, Recommended PivotTables, Table | ✅ Yes |
| 2 | Illustrations | Pictures, Shapes, Icons, 3D Models | ✅ Shapes visible |
| 3 | Add-ins | Get Add-ins, My Add-ins | ❌ Not shown |
| 4 | Charts | Recommended Charts, all chart types | ❌ Not shown |
| 5 | Tours | Map, 3D Map | ❌ Not shown |
| 6 | Sparklines | Line, Column, Win/Loss | ❌ Not shown |
| 7 | Filters | Slicer, Timeline | ❌ Not shown |
| 8 | Links | Hyperlink | ❌ Not shown |
| 9 | Text | Text Box, Header & Footer, WordArt, Signature Line, Object | ✅ Text Box visible |
| 10 | Symbols | Equation, Symbol | ❌ Partially visible (glyphs) |

---

## 3. Group Specifications

### 3.1 Tables Group

#### 3.1.1 PivotTable

**Button type**: Split button (top half = quick create, bottom half = dropdown)

**Dropdown menu**:
```
┌──────────────────────────────────────┐
│  PivotTable                          │
│  PivotChart                          │
│  ─────────────────────────────────── │
│  Recommended PivotTables             │
│  ─────────────────────────────────── │
│  From External Data Source...        │
│  Use this workbook's Data Model      │
└──────────────────────────────────────┘
```

**Quick create behavior**:
- If a single cell is selected within a data range: auto-detect the contiguous range
- If a range is explicitly selected: use that range
- Opens the PivotTable dialog with the range pre-filled

**PivotTable Build Dialog** (after range is confirmed):
```
┌──────────────────────────────────────────────────────────┐
│  PivotTable Fields                                  ✕    │
├──────────────────────────────────────────────────────────┤
│  Choose fields to add to report:                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ ☑ Field1    ☑ Field2    ☐ Field3    ☐ Field4  │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Drag fields between areas below:                       │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ FILTERS     │  │ COLUMNS     │                      │
│  │ (drop here) │  │ (drop here) │                      │
│  └─────────────┘  └─────────────┘                      │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ ROWS        │  │ VALUES      │                      │
│  │ (drop here) │  │ (drop here) │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                          │
│  ☑ Defer Layout Update                                  │
│  [ Update ]                                              │
└──────────────────────────────────────────────────────────┘
```

**Kernel data structures**:

```typescript
interface PivotTableDefinition {
  id: string;
  name: string; // e.g., "PivotTable1"
  sourceRange: Range;
  sourceType: 'range' | 'external' | 'dataModel';
  cacheId: string;
  fields: PivotField[];
  rowFields: string[];    // Field names in order
  columnFields: string[];
  valueFields: PivotValueField[];
  filterFields: PivotFilterField[];
  location: Address;       // Top-left cell of pivot table
  style: string;           // PivotTable style name
  options: PivotTableOptions;
}

interface PivotField {
  name: string;
  sourceName: string;
  dataType: 'number' | 'text' | 'date' | 'boolean';
  subtotals: boolean;
  layout: 'compact' | 'outline' | 'tabular';
}

interface PivotValueField {
  fieldName: string;
  aggregation: 'sum' | 'count' | 'average' | 'max' | 'min' | 'product' | 'countNums' | 'stdDev' | 'var';
  numberFormat: string;
  showAs: 'normal' | '%ofRow' | '%ofColumn' | '%ofTotal' | 'difference' | 'runningTotal';
  caption: string;
}

interface PivotFilterField {
  fieldName: string;
  filterType: 'values' | 'labels' | 'date';
  criteria: any;
}

interface PivotTableOptions {
  showRowHeaders: boolean;
  showColumnHeaders: boolean;
  showRowStripes: boolean;
  showColumnStripes: boolean;
  autoFormat: boolean;
  preserveFormatting: boolean;
  mergeLabelCells: boolean;
  indentRowLabels: number;
  enableFieldList: boolean;
}
```

**Rendering approach**:
- PivotTables render in a separate grid region (not as standard cells)
- The canvas renders pivot headers with expand/collapse buttons
- Double-clicking a value cell drills down to show source data in a new sheet
- Changes to source data trigger pivot refresh (debounced 500ms)

**Microinteractions**:
- PivotTable creation dialog slides up from the ribbon (250ms ease-out)
- Field drag between zones shows a ghost element following the cursor
- Drop zone highlights with a blue dashed border when hovering with a field
- Values recalculate with a subtle number-flip animation (300ms)

---

#### 3.1.2 Table

**Button type**: Single button (opens dialog) + optional dropdown for Format as Table gallery

**Dialog**:
```
┌──────────────────────────────────────┐
│  Create Table                   ✕    │
├──────────────────────────────────────┤
│  Where is the data for your table?   │
│  ┌────────────────────────────────┐  │
│  │ =$A$1:$D$100                   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ☑ My table has headers             │
│                                      │
│  [  OK  ]  [ Cancel ]               │
└──────────────────────────────────────┘
```

**Kernel data structures**:

```typescript
interface TableDefinition {
  id: string;
  name: string; // e.g., "Table1"
  range: Range;
  hasHeaders: boolean;
  style: TableStyle;
  showFilterButton: boolean;
  showTotalRow: boolean;
  showBandedRows: boolean;
  showBandedColumns: boolean;
  showFirstColumn: boolean;
  showLastColumn: boolean;
  columns: TableColumn[];
  totalRow: TableTotalRow;
}

interface TableColumn {
  name: string;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  formula?: string; // Calculated column formula
}

interface TableTotalRow {
  enabled: boolean;
  columns: Map<string, 'sum' | 'average' | 'count' | 'max' | 'min' | 'none'>;
}

interface TableStyle {
  id: string;
  name: string;
  category: 'light' | 'medium' | 'dark';
  headerFill: string;
  headerFont: string;
  stripeFill: string;
  borderColor: string;
  firstColumnFill?: string;
  lastColumnFill?: string;
}
```

**Structured references**:
- `=SUM(Table1[Sales])` — references the entire Sales column
- `=Table1[@Sales]` — references the current row's Sales value
- Formula parser must recognize these bracket notations

**Rendering**:
- Table renders as standard cells with special formatting
- Filter buttons appear in header cells automatically
- Sizing handle in bottom-right corner for expanding the table
- Total row displays at bottom when enabled

**Microinteractions**:
- Table creation: selected range briefly glows blue (400ms)
- Auto-expansion: when data is typed in the row immediately below the table, 
  the table absorbs it with a 200ms row-expand animation
- Table name appears in Name Box when table is selected

---

### 3.2 Illustrations Group

#### 3.2.1 Pictures

**Button type**: Single button with dropdown

**Dropdown**:
```
┌──────────────────────────────────────┐
│  This Device...                      │
│  Stock Images...                     │
│  Online Pictures...                  │
│  ─────────────────────────────────── │
│  From Screenshot                     │
│    Available Screenshots (thumbnails)│
└──────────────────────────────────────┘
```

**Insertion behavior**:
- Opens file picker (or stock image browser, or URL input)
- After selection, places the image centered on the visible viewport
- Image is a floating object on the drawing layer
- Default size: actual image size, capped at 50% of viewport

**Kernel data structures**:

```typescript
interface PictureObject extends DrawingObject {
  type: 'picture';
  source: string; // Data URI, blob URL, or file path
  sourceType: 'dataUri' | 'blob' | 'url' | 'stockImage';
  naturalWidth: number;
  naturalHeight: number;
  // Inherits from DrawingObject:
  // position: { x, y } — top-left corner in pixels from cell A1
  // size: { width, height } — display size in pixels
  // rotation: number — degrees
  // zIndex: number
  // locked: boolean
  // altText: string
}
```

**Rendering**:
- Images render on a separate canvas layer above the grid
- Selection shows white square handles at corners and edge midpoints
- Rotation handle is a green circle above the top-center handle
- Right-click context menu: Cut, Copy, Paste, Size and Properties, Format Picture

**Microinteractions**:
- Insert: image fades in (300ms ease-out) and scales from 0.9→1.0
- Selection: handles appear with a pop-in animation (150ms)
- Resize: corner handles maintain aspect ratio by default; Shift overrides
- Move: ghost image follows cursor, snaps to cell boundaries when close

---

#### 3.2.2 Shapes

**Button type**: Dropdown gallery

**Gallery layout**:
```
┌──────────────────────────────────────────────────────┐
│  Recently Used Shapes                                │
│  [circle] [rectangle] [arrow]                        │
│  ─────────────────────────────────────────────────── │
│  Lines                                               │
│  [line] [arrow] [elbow] [curve] [freeform] [scribble]│
│  ─────────────────────────────────────────────────── │
│  Rectangles                                          │
│  [rect] [rounded] [snip single] [snip same] [snip diag]│
│  ─────────────────────────────────────────────────── │
│  Basic Shapes                                        │
│  [oval] [triangle] [diamond] [parallelogram] [trapezoid]│
│  [pentagon] [hexagon] [heptagon] [octagon]          │
│  [plus] [cross] [cube] [cylinder] [brace] [bracket] │
│  [sun] [moon] [cloud] [heart] [lightning] [smile]   │
│  ─────────────────────────────────────────────────── │
│  Block Arrows                                        │
│  [right] [left] [up] [down] [left-right] [up-down]  │
│  [quad] [circular] [striped] [bent] [chevron] [pentagon]│
│  ─────────────────────────────────────────────────── │
│  Flowchart                                           │
│  [process] [decision] [data] [document] [terminal]   │
│  [preparation] [manual] [connector] [off-page]       │
│  ─────────────────────────────────────────────────── │
│  Stars and Banners                                   │
│  [5-point] [6-point] [7-point] [8-point] [explosion] │
│  [scroll] [wave] [up ribbon] [down ribbon]          │
│  ─────────────────────────────────────────────────── │
│  Callouts                                            │
│  [rectangular] [rounded] [oval] [cloud] [line]      │
│  [line no-border] [double] [triple] [accent]        │
└──────────────────────────────────────────────────────┘
```

**Drawing behavior**:
- After selecting a shape, cursor changes to crosshair
- Click on canvas: inserts shape at default size centered on click
- Click-drag: draws shape to desired size
- Shape appears with the default style (blue fill, 1px border)

**Kernel data structures**:

```typescript
interface ShapeObject extends DrawingObject {
  type: 'shape';
  shapeType: ShapeType;
  fill: FillProperties;
  line: LineProperties;
  shadow: ShadowProperties;
  effects: EffectProperties;
  text?: string; // For shapes that contain text
}

type ShapeType = 
  | 'line' | 'arrow' | 'elbowConnector' | 'curve' | 'freeform' | 'scribble'
  | 'rectangle' | 'roundedRectangle' | 'snipSingle' | 'snipSameCorner' | 'snipDiagonal'
  | 'oval' | 'triangle' | 'diamond' | 'parallelogram' | 'trapezoid'
  | 'pentagon' | 'hexagon' | 'heptagon' | 'octagon'
  | 'plus' | 'cross' | 'cube' | 'cylinder' | 'brace' | 'bracket'
  | 'sun' | 'moon' | 'cloud' | 'heart' | 'lightning' | 'smileyFace'
  // ... all block arrows, flowchart, stars, banners, callouts

interface FillProperties {
  type: 'none' | 'solid' | 'gradient' | 'pattern' | 'picture';
  color?: string;
  transparency?: number; // 0-100
  gradient?: GradientConfig;
  pattern?: PatternConfig;
}

interface LineProperties {
  color: string;
  width: number; // pixels
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  compound?: 'single' | 'double' | 'thickThin' | 'thinThick';
  dashType?: 'roundDot' | 'squareDot' | 'dash' | 'dashDot' | 'longDash' | 'longDashDot';
  beginArrow?: ArrowStyle;
  endArrow?: ArrowStyle;
}

interface ShadowProperties {
  type: 'none' | 'outer' | 'inner' | 'perspective';
  color: string;
  blur: number;
  angle: number;
  distance: number;
  transparency: number;
}

interface EffectProperties {
  glow?: GlowConfig;
  reflection?: ReflectionConfig;
  softEdge?: number; // radius
  bevel?: BevelConfig;
  threeD?: ThreeDConfig;
}
```

**Rendering**:
- Shapes render on the drawing layer canvas using SVG or Canvas2D paths
- Text inside shapes renders using the same font system as cells
- Selection handles match the Pictures behavior
- Rotation via a green circle handle above the shape
- Yellow diamond handles for shape-specific adjustments (e.g., rounding radius, arrow head size)

**Microinteractions**:
- Gallery opens with categories sliding in from right (200ms staggered)
- Drawing: crosshair cursor pulsing; shape renders as a semi-transparent preview during drag
- Insert: shape pops in with scale 0.8→1.0 (200ms)
- Shape-specific handles: yellow diamond drags smoothly with 0ms visual lag

---

#### 3.2.3 Icons

**Button type**: Single button

**Opens**: A gallery/search dialog of Microsoft's icon library

**Implementation**: Insert SVG markup into a `PictureObject` with `sourceType: 'svg'`

---

#### 3.2.4 3D Models

**Button type**: Single button

**Opens**: File picker for .glb, .fbx files or stock 3D library

**Implementation**: Deferred to future phase (requires WebGL renderer)

---

### 3.3 Forms Group

**Visible in screenshot**: Checkbox button

**Full toolset** (dropdown next to Checkbox or separate group):

| Control | Icon | Description |
|---------|------|-------------|
| Checkbox | ☑ | Toggle linked cell TRUE/FALSE |
| Button | [Btn] | Runs assigned macro on click |
| Combo Box | ▾ | Dropdown with values from a range |
| List Box | ▨ | Multi-select list from a range |
| Spin Button | ↕ | Increments/decrements a linked cell |
| Scroll Bar | ═══ | Scrolls through values |
| Option Button | ○ | Radio button for mutually exclusive choices |
| Group Box | ┌─┐ | Visual container for grouping controls |
| Label | Aa | Static text label |

**Drawing behavior**: Same as Shapes—select from dropdown, then click/drag on canvas.

**Kernel data structures**:

```typescript
interface FormControlObject extends DrawingObject {
  type: 'formControl';
  controlType: FormControlType;
  linkedCell?: Address; // Cell that stores the control's value
  controlProperties: FormControlProperties;
}

type FormControlType = 
  | 'checkbox' | 'button' | 'comboBox' | 'listBox' 
  | 'spinButton' | 'scrollBar' | 'optionButton' | 'groupBox' | 'label';

interface FormControlProperties {
  // Common
  enabled: boolean;
  printObject: boolean;
  
  // Checkbox / OptionButton
  checked?: boolean;
  label?: string;
  
  // ComboBox / ListBox
  inputRange?: Range; // Range containing list items
  selectedIndex?: number;
  dropDownLines?: number; // Visible rows in dropdown
  
  // SpinButton / ScrollBar
  minValue?: number;
  maxValue?: number;
  incrementalChange?: number;
  pageChange?: number; // ScrollBar only
  
  // Button
  buttonText?: string;
  macroName?: string;
}
```

**Rendering**:
- Form controls render on the drawing layer with native-looking widgets
- Checkbox: square box + label text; click toggles the checkmark
- Button: raised rectangle with text; click depression animation
- Combo Box: text field with dropdown arrow; click opens list
- Spin Button: two-arrow button (up/down); click increments/decrements

**Microinteractions**:
- Checkbox: checkmark animates in (scale 0→1 with slight overshoot, 200ms)
- Button: click depression (scale 1.0→0.97→1.0, 100ms)
- Combo Box dropdown: slides down from the control (150ms)
- Spin Button: value changes with a brief +/- indicator popup (300ms)

---

### 3.4 Charts Group

**Button type**: Dropdown gallery for each chart type

**Chart types** (each with its own dropdown):

| Category | Subtypes |
|----------|----------|
| Column/Bar | Clustered, Stacked, 100% Stacked, 3D variants |
| Line | Line, Stacked Line, 100% Stacked, with Markers, 3D |
| Pie | Pie, Doughnut, 3D Pie, Pie of Pie, Bar of Pie |
| Area | Area, Stacked Area, 100% Stacked |
| Scatter | Scatter, with Lines, with Smooth Lines |
| Others | Radar, Stock, Surface, Treemap, Sunburst, Histogram, Box & Whisker, Waterfall, Funnel, Combo |

**Chart creation workflow**:
1. Select data range (optional—can do it after chart creation)
2. Click chart type → chart appears on the sheet
3. Chart Tools contextual ribbon tabs appear (Design, Format)
4. Chart data is linked to the source range; updating cells updates the chart

**Implementation**: Use a chart library (ECharts, Chart.js, or custom Canvas2D renderer). 
Store chart definition in the drawing layer with a data link to the source range.

**Microinteractions**:
- Chart gallery: hover over subtype shows a live tooltip with a sample image
- Chart creation: chart animates in with elements drawing progressively (500ms staggered)
- Data updates: chart elements transition smoothly to new values (300ms ease-in-out)

---

### 3.5 Sparklines Group

| Sparkline Type | Icon | Description |
|----------------|------|-------------|
| Line | ╱╲ | Tiny line chart in a single cell |
| Column | ▓ | Tiny column chart in a single cell |
| Win/Loss | ▪▴▪ | Shows positive/negative/zero as bars |

**Dialog**:
```
┌──────────────────────────────────────┐
│  Create Sparklines              ✕    │
├──────────────────────────────────────┤
│  Data Range:  ┌──────────────────┐  │
│               │ B2:G2            │  │
│               └──────────────────┘  │
│  Location Range: ┌──────────────┐  │
│                  │ H2            │  │
│                  └──────────────┘  │
│  [  OK  ]  [ Cancel ]              │
└──────────────────────────────────────┘
```

**Implementation**: Render sparklines as small Canvas2D or SVG elements within cells. 
Store sparkline definition in cell metadata.

---

### 3.6 Filters Group

| Tool | Description |
|------|-------------|
| Slicer | Visual filter buttons for Tables/PivotTables |
| Timeline | Date range slider for filtering date fields |

**Implementation**: Slicers are interactive widgets on the drawing layer. 
Timelines render as a horizontal scroll bar with date labels.

---

### 3.7 Links Group

| Tool | Shortcut | Description |
|------|----------|-------------|
| Hyperlink | Ctrl+K | Creates a clickable link to web, email, or document location |

**Dialog**:
```
┌──────────────────────────────────────────┐
│  Insert Hyperlink                   ✕    │
├──────────────────────────────────────────┤
│  Link to:        Text to display:        │
│  ○ Web Page      ┌──────────────────┐   │
│  ○ This Document │ Click here       │   │
│  ○ Email Address └──────────────────┘   │
│                  Address:                │
│                  ┌──────────────────┐   │
│                  │ https://...      │   │
│                  └──────────────────┘   │
│  [  OK  ]  [ Cancel ]                   │
└──────────────────────────────────────────┘
```

**Implementation**: Store hyperlink in cell metadata. Rendered as underlined blue text. 
Click navigates (opens browser or scrolls to document location).

---

### 3.8 Text Group

| Tool | Description |
|------|-------------|
| Text Box | Floating text container (like a shape) |
| Header & Footer | Opens page layout view for headers/footers |
| WordArt | Stylized text with effects |
| Signature Line | Draws a signature placeholder |
| Object | Embeds another document (OLE) |

**Text Box** is the primary tool (visible in screenshot). Its implementation is similar 
to a Shape with text content—see ShapeObject with text property.

---

### 3.9 Symbols Group

| Tool | Shortcut | Description |
|------|----------|-------------|
| Equation | Alt+= | Opens equation editor for math notation |
| Symbol | — | Opens character map to insert special characters |

**Symbol dialog**: A grid of Unicode characters organized by font and subset.

**Equation editor**: A specialized input area with math notation toolbars (fractions, 
radicals, integrals, matrices, Greek letters).

---

## 4. DrawingLayer — Kernel Architecture

This is the critical infrastructure needed before any Insert tab command can work.

```typescript
// packages/core/src/DrawingLayer.ts

export interface DrawingObject {
  id: string;
  type: 'picture' | 'shape' | 'icon' | 'formControl' | 'chart' | 'textBox' | 'slicer';
  name: string;
  position: { x: number; y: number }; // Pixels from cell A1 top-left
  size: { width: number; height: number };
  rotation: number; // Degrees (0-360)
  zIndex: number;
  locked: boolean;
  visible: boolean;
  altText: string;
  anchor?: {
    moveWithCells: boolean;
    resizeWithCells: boolean;
    colOffset: number;
    rowOffset: number;
  };
}

export class DrawingLayer {
  private objects: Map<string, DrawingObject> = new Map();
  private zOrder: string[] = []; // Object IDs in z-order
  private selection: Set<string> = new Set();
  private eventEmitter: EventEmitter;

  // CRUD
  addObject(obj: DrawingObject): void;
  removeObject(id: string): DrawingObject | undefined;
  getObject(id: string): DrawingObject | undefined;
  getObjectsInRect(rect: Rect): DrawingObject[]; // Hit test
  getAllObjects(): DrawingObject[];

  // Z-order
  bringToFront(id: string): void;
  sendToBack(id: string): void;
  bringForward(id: string): void;
  sendBackward(id: string): void;

  // Selection
  selectObject(id: string, multiSelect?: boolean): void;
  deselectAll(): void;
  getSelectedObjects(): DrawingObject[];

  // Position/Size
  moveObject(id: string, delta: { x: number; y: number }): void;
  resizeObject(id: string, newSize: { width: number; height: number }, anchor: 'topLeft' | 'center'): void;
  rotateObject(id: string, degrees: number): void;

  // Grouping
  groupObjects(ids: string[]): string; // Returns group ID
  ungroupObjects(groupId: string): string[];

  // Serialization
  serialize(): SerializedDrawingLayer;
  deserialize(data: SerializedDrawingLayer): void;

  // Events
  on(event: 'changed', callback: () => void): void;
}
```

**Canvas rendering**:
- The drawing layer renders on a separate `<canvas>` element positioned absolutely over the grid canvas
- It must forward mouse events to the `DrawingLayer` for hit testing
- Resize/rotate handles render when objects are selected
- The canvas listens to `DrawingLayer.on('changed')` for re-renders

---

## 5. Command Classes for Insert Operations

Each insert operation gets a Command for undo support:

```typescript
class InsertPictureCommand implements Command {
  constructor(private layer: DrawingLayer, private picture: PictureObject) {}
  execute(): void { this.layer.addObject(this.picture); }
  undo(): void { this.layer.removeObject(this.picture.id); }
  description: string = 'Insert Picture';
}

class InsertShapeCommand implements Command {
  constructor(private layer: DrawingLayer, private shape: ShapeObject) {}
  execute(): void { this.layer.addObject(this.shape); }
  undo(): void { this.layer.removeObject(this.shape.id); }
  description: string = 'Insert Shape';
}

class CreateTableCommand implements Command {
  constructor(
    private tableManager: TableManager, 
    private tableDef: TableDefinition, 
    private styleService: StyleService
  ) {}
  execute(): void { 
    this.tableManager.createTable(this.tableDef); 
    this.styleService.applyTableStyle(this.tableDef.range, this.tableDef.style);
  }
  undo(): void { 
    this.tableManager.removeTable(this.tableDef.id); 
  }
  description: string = 'Create Table';
}

class InsertCheckboxCommand implements Command {
  constructor(
    private layer: DrawingLayer,
    private checkbox: FormControlObject,
    private cellAddress: Address
  ) {}
  execute(): void { 
    this.layer.addObject(this.checkbox); 
    // Link to cell
  }
  undo(): void { 
    this.layer.removeObject(this.checkbox.id); 
  }
  description: string = 'Insert Checkbox';
}
```

---

## 6. Implementation Priority (Recommended Order)

| Phase | Component | Effort | Dependencies |
|-------|-----------|--------|--------------|
| **7.1** | `DrawingLayer.ts` (kernel) | High | EventEmitter |
| **7.2** | Drawing canvas renderer (React) | High | DrawingLayer |
| **7.3** | Text Box + Shapes (basic) | Medium | DrawingLayer |
| **7.4** | Pictures | Medium | DrawingLayer |
| **7.5** | Table (Insert tab version) | Medium | TableManager (exists) |
| **7.6** | Checkbox (form control) | Medium | DrawingLayer |
| **7.7** | PivotTable dialog + engine | Very High | TableManager |
| **7.8** | Charts | Very High | DrawingLayer, chart library |
| **7.9** | Sparklines | Low | Cell renderer |
| **7.10** | Hyperlink | Low | Cell metadata |
| **7.11** | Slicer, Timeline | High | DrawingLayer, TableManager |
| **7.12** | Symbols, Equation | Low | Dialog only |

---

## 7. InsertTab.tsx Component Structure

```typescript
// packages/react/src/components/ribbon/InsertTab.tsx

interface InsertTabProps {
  drawingLayer: DrawingLayer;
  tableManager: TableManager;
  selectionManager: SelectionManager;
  commandManager: CommandManager;
  onDrawingChange: () => void; // Triggers canvas redraw
  onSheetStructureChange: () => void; // Triggers React re-render
}

// Groups rendered in order:
// <TablesGroup>
//   <PivotTableButton />
//   <TableButton />
// </TablesGroup>
// <IllustrationsGroup>
//   <PicturesButton />
//   <ShapesDropdown />
//   <IconsButton />
// </IllustrationsGroup>
// <FormsGroup>
//   <CheckboxButton />
//   <FormsDropdown /> {/* Other form controls */}
// </FormsGroup>
// <TextGroup>
//   <TextBoxButton />
// </TextGroup>
// <SymbolsGroup>
//   <EquationButton />
//   <SymbolButton />
// </SymbolsGroup>
```

---

## 8. Next Session Action Items

When Phase 7 implementation begins:

1. Create `DrawingLayer.ts` in kernel — the foundation for everything
2. Create `DrawingCanvas.tsx` — renders objects on overlay canvas
3. Create `InsertTab.tsx` — ribbon tab with stub buttons
4. Implement `TextBox` and `Shapes` first (they prove the drawing layer works)
5. Then `Table`, `Checkbox`, `Pictures` in that order
6. PivotTable and Charts deferred to Phase 8+

---

## 9. Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) — Overall system architecture
- [EXCEL_365_UI_IMPLEMENTATION_ROADMAP.md](../EXCEL_365_UI_IMPLEMENTATION_ROADMAP.md) — Complete UI roadmap
- Home Tab implementation (Phase 6) — see `packages/react/src/components/ribbon/`
- Backstage panels (Phase 6) — see `packages/react/src/components/backstage/`

---

**Document Version**: 1.0  
**Created**: 2026-05-09  
**Author**: CyberSheet Development Team  
**Status**: Planning — awaiting Phase 7 implementation