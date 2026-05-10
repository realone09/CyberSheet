# Phase 8 Testing Guide: Object Operations & Keyboard Shortcuts

**Dev Server**: http://localhost:5174/

## Quick Wins Implemented ✅

1. **Delete Key** - Remove selected objects
2. **Copy/Paste** - Duplicate objects with Ctrl+C/Ctrl+V
3. **Multi-Select** - Shift+Click to select multiple objects
4. **Cut** - Ctrl+X to cut objects
5. **Escape** - Clear selection

---

## Test Scenarios

### 1. Delete Objects (80 lines implemented)

**Test Steps**:
1. Click **Insert** tab → **Shapes** → Pick a shape (e.g., rectangle)
2. Shape appears at position (100, 100)
3. Click the shape → Selection handles appear (8 white squares + green rotation circle)
4. Press **Delete** key or **Backspace**
5. ✅ **Expected**: Shape disappears immediately

**Edge Cases**:
- Delete with multiple objects selected → All should disappear
- Delete with no selection → Nothing happens (no error)
- Delete while typing in formula bar → Text deleted, not object

---

### 2. Copy/Paste Objects (150 lines implemented)

**Test Steps**:
1. Insert a shape (rectangle, oval, etc.)
2. Select the shape
3. Press **Ctrl+C** (or **Cmd+C** on Mac)
4. Press **Ctrl+V** (or **Cmd+V** on Mac)
5. ✅ **Expected**: Duplicate appears at (+20, +20) offset
6. Press **Ctrl+V** again
7. ✅ **Expected**: Another duplicate appears at (+40, +40) offset
8. Press **Ctrl+V** again
9. ✅ **Expected**: Third duplicate appears at (+60, +60) offset

**Cascade Effect**:
- Each paste increments offset by 20px in both X and Y
- Creates diagonal cascade pattern (professional look)
- Copy a new object → Paste counter resets to 0

**Console Feedback**:
- Copy: "Copied 1 object(s)"
- Paste: "Pasted 1 object(s) at offset (20, 20)"
- Cut: "Cut 1 object(s)"

---

### 3. Multi-Select with Shift+Click (120 lines implemented)

**Test Steps**:
1. Insert 3 different shapes (rectangle, oval, triangle)
2. Click first shape → Selection handles appear
3. **Shift+Click** second shape
4. ✅ **Expected**: Both shapes show selection handles
5. **Shift+Click** third shape
6. ✅ **Expected**: All three shapes show selection handles
7. **Shift+Click** one of the selected shapes
8. ✅ **Expected**: That shape is deselected (toggle behavior)
9. Click empty space (without Shift)
10. ✅ **Expected**: All selections cleared

**Multi-Select Behaviors**:
- Each selected object renders its own selection handles independently
- No bounding box yet (that's Phase 8.3)
- Drag still only works on the clicked object (not multi-object drag yet)
- Grabbing a handle doesn't change selection

---

### 4. Cut Objects (Ctrl+X)

**Test Steps**:
1. Insert a shape
2. Select the shape
3. Press **Ctrl+X** (or **Cmd+X**)
4. ✅ **Expected**: Shape disappears (cut to clipboard)
5. Press **Ctrl+V**
6. ✅ **Expected**: Shape reappears at (+20, +20) offset

**Difference from Copy**:
- Copy leaves original in place
- Cut removes original immediately

---

### 5. Clear Selection (Escape)

**Test Steps**:
1. Select one or more shapes
2. Press **Escape** key
3. ✅ **Expected**: Selection cleared, handles disappear
4. Objects remain visible, just not selected

---

### 6. Copy/Paste Pictures

**Test Steps**:
1. Insert a picture (Insert → Pictures → Upload image)
2. Select the picture
3. Press **Ctrl+C** → **Ctrl+V**
4. ✅ **Expected**: Duplicate picture appears with offset
5. Both pictures show selection handles when clicked

---

### 7. Copy/Paste Form Controls

**Test Steps**:
1. Insert a checkbox (Insert → Checkbox)
2. Select the checkbox
3. Press **Ctrl+C** → **Ctrl+V**
4. ✅ **Expected**: Duplicate checkbox appears with offset
5. Both are functional and draggable

---

### 8. Multi-Object Copy/Paste

**Test Steps**:
1. Insert multiple shapes
2. **Shift+Click** to select all of them
3. Press **Ctrl+C**
4. Press **Ctrl+V**
5. ✅ **Expected**: All objects duplicated at (+20, +20) offset
6. Pasted objects are auto-selected (original objects deselected)

**Group Paste Behavior**:
- Relative positions preserved
- All objects move by same offset
- Z-index maintained (top object stays on top)

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Notes |
|----------|--------|-------|
| **Delete** or **Backspace** | Remove selected objects | Works with multi-select |
| **Ctrl+C** (Cmd+C) | Copy selected objects | Stores in component clipboard |
| **Ctrl+V** (Cmd+V) | Paste from clipboard | Cascade offset: 20px per paste |
| **Ctrl+X** (Cmd+X) | Cut selected objects | Copy + Delete |
| **Escape** | Clear selection | Leaves objects visible |
| **Shift+Click** | Toggle object selection | Multi-select mode |

---

## Known Limitations (Intentional for Phase 8.1)

1. **No Undo/Redo**: Commands exist but not yet wired to CommandManager
2. **No Bounding Box**: Multi-selected objects don't show combined bounding box
3. **No Multi-Drag**: Dragging only moves the clicked object, not all selected
4. **No Group**: Can't group objects into a single logical unit yet
5. **Clipboard is local**: Not using system clipboard (can't paste between apps)

---

## Architecture Highlights

**Command Pattern**:
```typescript
// All operations implement this interface:
interface Command {
  execute(): void;
  undo(): void;
}
```

**Clipboard State**:
```typescript
const [clipboard, setClipboard] = useState<DrawingObject[]>([]);
const [pasteCount, setPasteCount] = useState<number>(0);
```

**Deep Copy**:
```typescript
// Prevents reference sharing:
const copy = JSON.parse(JSON.stringify(source));
copy.id = `${source.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

**Input Field Detection**:
```typescript
// Shortcuts disabled when typing:
if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
  return;
}
```

---

## Next Phase 8 Features

### Phase 8.2: CommandManager Integration (~80 lines)
- Wire commands to CommandManager
- Ctrl+Z for undo, Ctrl+Y for redo
- Undo history shows operation names

### Phase 8.3: Bounding Box for Multi-Select (~120 lines)
- Combined resize handles for multi-selected objects
- Single rotation handle for the group
- Proportional resize for all objects

### Phase 8.4: Multi-Object Drag (~50 lines)
- Dragging one selected object moves all selected objects
- Maintains relative positions

### Phase 8.5: Group/Ungroup (~300 lines)
- GroupObject type with childIds
- Hierarchical selection
- Group transformations propagate to children

### Phase 8.6: Align/Distribute Tools (~250 lines)
- Align Left, Center, Right, Top, Middle, Bottom
- Distribute Horizontally, Distribute Vertically
- Align to Grid, Align to Slide

---

## Bug Reports

If you find any issues:

1. **Delete doesn't work**: Check console for errors, verify object is selected
2. **Paste creates object at wrong position**: Check zoom and scroll offsets
3. **Shift+Click doesn't multi-select**: Check if click hits object (hover changed cursor)
4. **Shortcuts work in formula bar**: Report as bug (should be blocked)

---

## Performance Notes

- **O(n) rendering**: Each object renders independently (no batching yet)
- **Deep copy on paste**: JSON.parse/stringify for simplicity (could optimize)
- **Window event listener**: Single listener for all keyboard shortcuts
- **HMR safe**: Clipboard state survives hot reload

---

## Success Criteria ✅

- [x] Delete key removes objects
- [x] Ctrl+C/Ctrl+V duplicates objects
- [x] Shift+Click multi-selects
- [x] Cascade offset on repeated paste
- [x] Console feedback for operations
- [x] Input field detection works
- [x] Escape clears selection
- [x] Cut (Ctrl+X) works

**Phase 8.1 Status**: ✅ COMPLETE

**Total Lines Added**: ~350 lines
- DrawingCommands.ts: 180 lines
- DrawingCanvas updates: ~170 lines

**Dev Server**: http://localhost:5174/
