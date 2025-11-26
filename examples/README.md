# CyberSheet Examples

This directory contains various examples demonstrating different features of CyberSheet.

## 📋 Examples Overview

### 🎯 Formula Writing & Editing

#### **react-formula-demo.html** ⭐ NEW!
**Complete React-based formula editor with controlled components**

- ✅ FormulaBar component with validation
- ✅ Real-time error display
- ✅ Auto-calculation on formula changes
- ✅ Interactive toolbar with quick actions
- ✅ Sample data and examples
- ✅ 100+ Excel functions supported

**How to run:**
```bash
# Open directly in browser
open examples/react-formula-demo.html

# Or serve with dev server
npm run dev
# Navigate to http://localhost:5173/examples/react-formula-demo.html
```

**Documentation:** [REACT_DEMO_README.md](./REACT_DEMO_README.md)

---

#### **formula-editing-example.tsx**
**TypeScript/React example with CyberSheet integration**

Full working example showing:
- FormulaBar integration with CyberSheet
- useFormulaController hook usage
- Cell selection handling
- Validation and error handling
- Complete state management

**Import and use:**
```typescript
import { FormulaEditingExample } from './examples/formula-editing-example';
```

---

### 📊 Core Features

#### **index.html**
**Vanilla JavaScript Excel-like interface**

Demonstrates:
- Full Excel-style UI (ribbons, menus, toolbars)
- Formula bar (vanilla implementation)
- Cell filtering and sorting
- Comment system
- Context menus
- Sheet tabs

**How to run:**
```bash
npm run dev
# Navigate to http://localhost:5173/examples/
```

---

#### **url-load-example.ts**
**Load Excel files from URL**

Shows how to:
- Fetch XLSX files from URLs
- Parse and display Excel data
- Handle loading states
- Error handling

**Used by:** `index.html`

---

#### **react-canvas-viewer.tsx**
**React component for Excel file viewing**

Features:
- Load Excel files
- CyberSheet React integration
- Filter dropdown UI
- Error boundaries
- Loading states

---

### 🧪 Testing

#### **e2e-fixture/**
**Minimal app for end-to-end testing**

- Basic CyberSheet setup
- Test data initialization
- Playwright test target
- Vite development server

**Documentation:** [e2e-fixture/README.md](./e2e-fixture/README.md)

---

## 🚀 Quick Start Guide

### 1. Formula Writing (NEW)

The easiest way to see formula editing in action:

```bash
# Open the React demo
open examples/react-formula-demo.html
```

Try these formulas:
- `=SUM(A1:A3)` - Sum values
- `=AVERAGE(B1:B3)` - Calculate average
- `=IF(A1>10, "High", "Low")` - Conditional logic
- `=A1*B1` - Multiply cells

### 2. Full Excel Interface

```bash
npm run dev
# Open http://localhost:5173/examples/
```

Features to try:
- Enter formulas in the formula bar
- Apply filters to columns
- Add comments to cells
- Right-click for context menu
- Switch between sheets

### 3. React Integration

```bash
# Build packages
npm run build

# Import in your React app
import { CyberSheet, FormulaBar, useFormulaController } from '@cyber-sheet/react';
```

See `formula-editing-example.tsx` for complete code.

---

## 📖 Formula Writing Documentation

| Document | Description |
|----------|-------------|
| [FORMULA_WRITING.md](../docs/FORMULA_WRITING.md) | Complete implementation guide |
| [FORMULA_QUICK_START.md](../docs/FORMULA_QUICK_START.md) | Quick start with code examples |
| [FORMULA_ARCHITECTURE.md](../docs/FORMULA_ARCHITECTURE.md) | Architecture diagrams & flows |
| [REACT_DEMO_README.md](./REACT_DEMO_README.md) | React demo documentation |

---

## 🎨 Code Examples

### Example 1: Basic Formula Controller

```typescript
import { FormulaController } from '@cyber-sheet/core';

const controller = new FormulaController(worksheet);

// Validate before setting
const validation = controller.validateFormula('=SUM(A1:A10)', { row: 1, col: 1 });
if (validation.isValid) {
  controller.setFormula({ row: 1, col: 1 }, '=SUM(A1:A10)');
}
```

### Example 2: React Hook

```typescript
import { useFormulaController } from '@cyber-sheet/react';

function MyComponent() {
  const { currentFormula, setFormula, validateFormula } = useFormulaController({
    worksheet,
    selectedCell,
  });

  const handleSubmit = (formula) => {
    const result = setFormula(formula);
    if (!result.success) {
      alert(result.error);
    }
  };

  return <FormulaBar onFormulaSubmit={handleSubmit} />;
}
```

### Example 3: FormulaBar Component

```tsx
import { FormulaBar } from '@cyber-sheet/react';

<FormulaBar
  selectedCell={{ row: 1, col: 1 }}
  cellValue={currentValue}
  cellFormula={currentFormula}
  onFormulaSubmit={(formula) => handleSubmit(formula)}
  isEditing={isEditMode}
  onEditModeChange={setIsEditMode}
  validationError={error}
/>
```

---

## 🔧 Development

### Build All Examples

```bash
# Build core packages first
npm run build

# Start dev server for examples
npm run dev
```

### Test Examples

```bash
# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui
```

### Add New Example

1. Create new file in `examples/`
2. Add documentation section here
3. Update main README.md if needed
4. Test with `npm run dev`

---

## 📦 File Structure

```
examples/
├── index.html                      # Full Excel-like UI (vanilla JS)
├── url-load-example.ts            # Excel file loading
├── react-canvas-viewer.tsx        # React Excel viewer
├── formula-editing-example.tsx    # React formula editor (TypeScript)
├── react-formula-demo.html        # React formula demo (standalone) ⭐ NEW
├── REACT_DEMO_README.md           # React demo docs ⭐ NEW
├── README.md                       # This file
└── e2e-fixture/                   # E2E test fixture
    ├── index.html
    ├── main.ts
    └── README.md
```

---

## 🎯 Feature Comparison

| Feature | index.html | react-formula-demo.html | formula-editing-example.tsx |
|---------|------------|-------------------------|----------------------------|
| Formula Bar | ✅ Vanilla | ✅ React Component | ✅ React Component |
| Validation | ⚠️ Basic | ✅ Full | ✅ Full |
| Error Display | ❌ | ✅ Real-time | ✅ Real-time |
| Quick Actions | ❌ | ✅ Toolbar | ⚠️ Manual |
| Styled UI | ✅ Excel-like | ✅ Modern | ⚠️ Basic |
| Standalone | ✅ Yes | ✅ Yes | ❌ Needs build |
| Best For | Excel UI clone | Formula demo | Integration guide |

---

## 💡 Tips & Tricks

### Formula Entry
- Start with `=` for formulas
- Without `=`, value is set directly
- Press Enter to submit
- Press Escape to cancel

### Navigation
- Use toolbar buttons for quick cell selection
- Click cell reference display to see current cell
- Status message shows last action

### Validation
- Errors shown in real-time
- Red border indicates validation error
- Error message displayed next to input

### Performance
- Formulas evaluate immediately
- Auto-recalculation on dependencies
- Optimized for 1000+ cells

---

## 🐛 Troubleshooting

### Formula not working?
- Check it starts with `=`
- Verify cell references exist
- Check function name spelling
- Look for validation errors

### Demo not loading?
- Run `npm run build` first
- Check browser console for errors
- Try different browser
- Clear browser cache

### React components not found?
- Run `npm run build` in project root
- Check import paths
- Verify packages are installed

---

## 📚 Additional Resources

- **Main Documentation**: [/docs](../docs/)
- **API Reference**: [/packages/core/src](../packages/core/src/)
- **React Components**: [/packages/react/src](../packages/react/src/)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

---

## 🎉 What's New in v1.2.0

✨ **Formula Writing System**
- New FormulaController class
- React FormulaBar component
- useFormulaController hook
- Complete validation system
- Auto-calculation support
- Interactive demos

See [CHANGELOG.md](../CHANGELOG.md) for full details.

---

**Last Updated**: November 26, 2025  
**Version**: 1.2.0  
**Status**: ✅ Production Ready
