# E2E Test Fixture

Minimal Vite application for end-to-end testing of CyberSheet.

## Quick Start

```bash
# From this directory
npx vite

# Or from project root
cd examples/e2e-fixture && npx vite
```

Visit `http://localhost:5173` to see the test fixture.

## Test Data

The fixture initializes with:

| Cell | Value | Note |
|------|-------|------|
| A1   | "Product" | Header |
| B1   | "Price" | Header |
| A2   | "Widget" | Data |
| B2   | 100 | Data |
| A3   | "Gadget" | Data |
| B3   | 200 | Data |
| B4   | 300 | =SUM(B2:B3) formula |

## Running E2E Tests

### Install Browsers (First Time)

```bash
npx playwright install chromium
```

### Run Tests

```bash
# From project root
npx playwright test

# With UI
npx playwright test --ui

# Single browser
npx playwright test --project=chromium
```

### Test Coverage

Current E2E tests validate:
- ✅ Sheet initialization and rendering
- ✅ Canvas element creation
- ✅ Test data population
- ✅ Formula evaluation (SUM)
- ✅ API exposure on window
- ✅ Canvas dimensions

## Development

The fixture uses:
- Vite for fast dev server and HMR
- TypeScript for type safety
- Direct source imports (no build step needed)

The app exposes `window.cyberSheet` with:
- `workbook`: Workbook instance
- `sheet`: Active worksheet
- `renderer`: CanvasRenderer instance
- `formulaEngine`: FormulaEngine instance
