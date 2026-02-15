# Keyboard Shortcuts Reference

**Conditional Formatting UI - Keyboard Navigation Guide**

---

## 🎯 Quick Reference Card

### Preset Picker

| Shortcut | Action |
|----------|--------|
| `Tab` | Move focus forward through elements |
| `Shift + Tab` | Move focus backward through elements |
| `Arrow Left/Right` | Navigate between category filter buttons |
| `Arrow Up/Down/Left/Right` | Navigate through preset grid (2D navigation) |
| `Home` | Jump to first item in current list |
| `End` | Jump to last item in current list |
| `Enter` or `Space` | Select focused preset |
| `Escape` | Clear selection (future: close modal) |
| `Ctrl + F` | Focus search input (browser default) |

### Rule Builder (Future)

| Shortcut | Action |
|----------|--------|
| `Tab` | Move through form fields |
| `Enter` | Open dropdown / Confirm selection |
| `Escape` | Close dropdown / Cancel changes |
| `Arrow Up/Down` | Navigate dropdown options |
| `Space` | Toggle checkboxes |

### Rule Manager (Future)

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between rules |
| `Arrow Up/Down` | Navigate rules list |
| `Enter` | Edit selected rule |
| `Delete` or `Backspace` | Remove selected rule |
| `Ctrl + D` | Duplicate selected rule |
| `Ctrl + Arrow Up` | Move rule up in priority |
| `Ctrl + Arrow Down` | Move rule down in priority |

---

## 🧭 Detailed Navigation

### Tab Order Flow

1. **Search Input** → Type to filter presets
2. **Category Buttons** → Select a category (use Arrow keys for faster navigation)
3. **Popular Presets** (if visible) → Quick access to common presets
4. **Preset Grid** → Main preset selection area (use Arrow keys for 2D navigation)
5. **Apply Button** → Apply selected preset to target range

### Arrow Key Navigation

#### In Category Buttons (Horizontal Navigation)
- `Arrow Right` → Next category (wraps to first)
- `Arrow Left` → Previous category (wraps to last)
- `Home` → First category ("All")
- `End` → Last category

#### In Preset Grid (2D Navigation)
The preset grid is displayed in 2 columns:
```
[Preset 1] [Preset 2]
[Preset 3] [Preset 4]
[Preset 5] [Preset 6]
```

- `Arrow Right` → Move to next preset (same row)
- `Arrow Left` → Move to previous preset (same row)
- `Arrow Down` → Move down one row (skip 2 presets since 2 columns)
- `Arrow Up` → Move up one row (skip 2 presets)
- `Home` → Jump to first preset (top-left)
- `End` → Jump to last preset (bottom-right)

**Example Navigation**:
- Starting at Preset 1:
  - Press `Arrow Right` → Focus Preset 2
  - Press `Arrow Down` → Focus Preset 4
  - Press `Arrow Left` → Focus Preset 3
  - Press `Home` → Focus Preset 1

---

## 🎨 Visual Indicators

### Focus Styles

When navigating with keyboard, you'll see:

- **Blue Outline**: 2px solid blue border around focused element
- **Offset**: 2px space between element and outline
- **Background Change**: Subtle background color change on hover/focus
- **Selected State**: Highlighted preset with blue background

### Screen Reader Feedback

Your screen reader will announce:

- **Category Selection**: "All category selected. Showing 20 presets."
- **Search Results**: "5 presets found for 'blue'"
- **Preset Selection**: "Selected preset: Blue Data Bars"
- **Application Success**: "Applied Blue Data Bars preset"
- **No Results**: "No presets found"

---

## 🔧 Tips & Tricks

### Efficient Navigation

1. **Search First**: Type a few letters to narrow down options
2. **Use Categories**: Filter by category before browsing
3. **Arrow Keys > Tab**: Use arrow keys within sections for faster navigation
4. **Home/End**: Jump to ends of lists to save time
5. **Enter on Preset**: Automatically focuses Apply button after selection

### Common Workflows

#### Workflow 1: Quick Apply
1. Press `Tab` to search input
2. Type "data bar"
3. Press `Tab` until first preset is focused
4. Press `Enter` to select
5. Press `Enter` again to apply

#### Workflow 2: Browse by Category
1. Press `Tab` to search (skip)
2. Press `Tab` to categories
3. Press `Arrow Right` to find "Data Bars" category
4. Press `Tab` to enter preset grid
5. Use `Arrow Keys` to browse
6. Press `Enter` to select
7. Press `Tab` to Apply button
8. Press `Enter` to apply

#### Workflow 3: Popular Presets
1. Press `Tab` to search (skip)
2. Press `Tab` to categories (skip if "All" is selected)
3. Press `Tab` to popular presets section
4. Use `Tab` or `Arrow Keys` to browse
5. Press `Enter` to select
6. Press `Enter` on Apply button (focused automatically)

---

## ♿ Accessibility Features

### WCAG 2.1 Level AA Compliance

#### Keyboard Accessibility (2.1)
- ✅ All functionality available via keyboard
- ✅ No keyboard traps
- ✅ Logical tab order
- ✅ Visible focus indicators
- ✅ Keyboard shortcuts don't conflict with browser/assistive technology

#### Focus Management (2.4.3, 2.4.7)
- ✅ Focus order follows visual layout
- ✅ Focus visible with 3:1 contrast ratio
- ✅ Focus restored after actions
- ✅ No unexpected focus changes

#### Labels and Instructions (3.3.2)
- ✅ All inputs have labels
- ✅ Button purposes are clear
- ✅ Error messages are descriptive
- ✅ Instructions provided where needed

#### Screen Reader Support (4.1.2, 4.1.3)
- ✅ ARIA roles and labels on all interactive elements
- ✅ Live regions announce dynamic changes
- ✅ Semantic HTML structure
- ✅ Alternative text for icons

---

## 🧪 Testing Your Keyboard Navigation

### Self-Test Checklist

1. **Unplug Mouse**
   - [ ] Can you reach every interactive element?
   - [ ] Can you select any preset?
   - [ ] Can you apply a preset?
   - [ ] Can you clear selection?

2. **Tab Order**
   - [ ] Does Tab move forward logically?
   - [ ] Does Shift+Tab move backward?
   - [ ] Is tab order same as visual layout?

3. **Arrow Keys**
   - [ ] Do Arrow keys navigate categories?
   - [ ] Do Arrow keys navigate presets in 2D?
   - [ ] Do Home/End work correctly?

4. **Activation**
   - [ ] Does Enter activate buttons?
   - [ ] Does Space activate buttons?
   - [ ] Does Escape work as expected?

5. **Visual Feedback**
   - [ ] Can you see which element is focused?
   - [ ] Is focus indicator visible on all backgrounds?
   - [ ] Does focus indicator meet contrast requirements?

---

## 🎓 Learning Resources

### Keyboard Navigation Basics
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [W3C: Keyboard Navigation Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)

### Screen Reader Guides
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Keyboard Shortcuts](https://www.freedomscientific.com/training/jaws/hotkeys/)
- [VoiceOver Commands](https://support.apple.com/guide/voiceover/welcome/mac)

### Testing Tools
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 📞 Support & Feedback

### Report Accessibility Issues
If you encounter keyboard navigation problems:
1. Describe the issue (which keys, which elements)
2. Specify your browser and OS
3. Mention if using assistive technology
4. File an issue on GitHub with label "accessibility"

### Request New Shortcuts
Want to suggest new keyboard shortcuts?
1. Check existing shortcuts don't conflict
2. Follow standard conventions (Tab, Enter, Escape, Arrows)
3. Provide use case and rationale
4. File a feature request on GitHub

---

**Print This Reference** 📄  
Keep this guide handy while learning the keyboard shortcuts. Most users become proficient within 10-15 minutes of practice!

**Version**: 1.0.0  
**Last Updated**: Current Session  
**Applies To**: Conditional Formatting Preset Picker (React, Vue, Angular, Svelte, Vanilla JS)
