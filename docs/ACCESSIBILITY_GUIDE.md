# Accessibility Guide for Conditional Formatting UI

**WCAG 2.1 AA Compliance Strategy**

This document outlines accessibility requirements and implementation guidelines for all CF UI components across all frameworks.

---

## 🎯 Accessibility Goals

### WCAG 2.1 Level AA Requirements
- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
- ✅ **Screen Reader Support**: Proper ARIA labels and roles
- ✅ **Focus Management**: Visible focus indicators and logical tab order
- ✅ **Color Contrast**: 4.5:1 minimum for text, 3:1 for UI components
- ✅ **Semantic HTML**: Proper heading hierarchy and landmarks
- ✅ **Assistive Technology**: Announcements for dynamic changes

---

## ⌨️ Keyboard Navigation Standards

### Global Shortcuts
| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Move focus forward | All components |
| `Shift+Tab` | Move focus backward | All components |
| `Enter` / `Space` | Activate button/preset | Buttons, presets |
| `Escape` | Close dialog/cancel preview | Modals, preview mode |
| `Arrow Up/Down` | Navigate vertical lists | Preset grid, categories |
| `Arrow Left/Right` | Navigate horizontal items | Category buttons |
| `Home` | Jump to first item | Lists, grids |
| `End` | Jump to last item | Lists, grids |

### Component-Specific Shortcuts

#### Preset Picker
- `Tab`: Move between search → categories → presets → apply button
- `Arrow Keys`: Navigate between category buttons
- `Enter` on preset: Select preset
- `Enter` on apply button: Apply selected preset
- `Escape`: Clear selection

#### Rule Builder
- `Tab`: Move between rule type → form fields → actions
- `Enter` on rule type: Open dropdown
- `Arrow Up/Down`: Navigate rule type options
- `Escape`: Close dropdown

#### Rule Manager
- `Tab`: Move between rules
- `Enter`: Edit selected rule
- `Delete`: Remove selected rule
- `Ctrl+D`: Duplicate selected rule
- `Arrow Up/Down`: Reorder rules (when dragging)

---

## 🏷️ ARIA Labels and Roles

### Required ARIA Attributes

#### Preset Picker Component
```html
<div 
  role="region" 
  aria-label="Conditional Formatting Preset Picker"
  aria-describedby="picker-description"
>
  <!-- Header -->
  <h3 id="picker-title">Conditional Formatting Presets</h3>
  <p id="picker-description">
    Choose from 20+ Excel-style presets to quickly format your data
  </p>

  <!-- Search -->
  <label for="preset-search">Search presets</label>
  <input
    id="preset-search"
    type="text"
    role="searchbox"
    aria-label="Search presets by name or category"
    aria-controls="preset-grid"
    aria-activedescendant="preset-123" <!-- When navigating -->
  />

  <!-- Category Filters -->
  <div role="toolbar" aria-label="Category filters">
    <button
      role="radio"
      aria-checked="true"
      aria-label="All categories (20 presets)"
    >
      All <span aria-hidden="true">20</span>
    </button>
    <!-- More buttons... -->
  </div>

  <!-- Popular Presets -->
  <section aria-label="Popular presets">
    <h4>Popular Presets</h4>
    <div role="list">
      <button role="listitem" aria-selected="true">
        <span aria-hidden="true">📊</span>
        Blue Data Bars
      </button>
      <!-- More presets... -->
    </div>
  </section>

  <!-- Main Preset Grid -->
  <div
    id="preset-grid"
    role="grid"
    aria-label="Available presets"
    aria-rowcount="10"
    aria-colcount="2"
  >
    <div role="row" aria-rowindex="1">
      <button
        role="gridcell"
        aria-colindex="1"
        aria-selected="true"
        aria-describedby="preset-123-desc"
      >
        <span aria-hidden="true">📊</span>
        <span id="preset-123-name">Blue Data Bars</span>
        <span id="preset-123-desc">
          Show values as horizontal blue bars
        </span>
      </button>
    </div>
    <!-- More rows... -->
  </div>

  <!-- Apply Button -->
  <button
    aria-label="Apply selected preset"
    aria-disabled="false"
    aria-describedby="apply-hint"
  >
    Apply Preset
  </button>
  <span id="apply-hint" class="sr-only">
    Applies the selected preset to your target range
  </span>
</div>
```

#### Rule Inspector (Tooltip)
```html
<div
  role="tooltip"
  aria-live="polite"
  aria-atomic="true"
  id="rule-tooltip"
>
  <h4>Applied Rules</h4>
  <ul role="list">
    <li>
      <strong>Top 10%</strong>
      <span>Rank: 1</span>
      <span>Source: Preset "Top 10%"</span>
    </li>
  </ul>
</div>
```

#### Rule Builder
```html
<form
  role="form"
  aria-label="Conditional formatting rule builder"
  aria-describedby="builder-instructions"
>
  <p id="builder-instructions" class="sr-only">
    Configure rule settings and click save to apply
  </p>

  <!-- Rule Type Selector -->
  <label for="rule-type">Rule Type</label>
  <select
    id="rule-type"
    aria-label="Select rule type"
    aria-required="true"
    aria-describedby="rule-type-help"
  >
    <option value="data-bar">Data Bar</option>
    <!-- More options... -->
  </select>
  <span id="rule-type-help" class="sr-only">
    Choose how cells should be formatted
  </span>

  <!-- Dynamic Form Fields -->
  <fieldset>
    <legend>Style Settings</legend>
    
    <label for="bar-color">Bar Color</label>
    <input
      id="bar-color"
      type="color"
      aria-label="Data bar color"
      aria-describedby="color-value"
    />
    <span id="color-value" aria-live="polite">#0000FF</span>
  </fieldset>
</form>
```

---

## 🎨 Visual Focus Indicators

### Focus Styles (All Frameworks)
```css
/* Visible focus indicator */
:focus-visible {
  outline: 2px solid #007acc;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip default browser focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus for buttons */
button:focus-visible {
  outline: 3px solid #007acc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.2);
}

/* Grid cell focus */
[role="gridcell"]:focus-visible {
  outline: 2px solid #007acc;
  outline-offset: -2px;
  background: #e6f3ff;
}

/* Category button focus */
.category-btn:focus-visible {
  outline: 2px solid #007acc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.2);
}
```

### Focus Trap (for Modals)
```typescript
// When opening modal
function openModal() {
  const modal = document.querySelector('[role="dialog"]');
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();
  
  // Trap focus inside modal
  modal.addEventListener('keydown', trapFocus);
}

function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
}
```

---

## 📢 Screen Reader Announcements

### Live Regions for Dynamic Updates

```html
<!-- Status announcements -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
  id="status-announcer"
>
  <!-- JavaScript updates this -->
</div>

<!-- Error announcements -->
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  class="sr-only"
  id="error-announcer"
>
  <!-- JavaScript updates this -->
</div>
```

### Announcement Patterns

#### Preset Selection
```typescript
function announcePresetSelection(presetName: string) {
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = `Selected preset: ${presetName}`;
}
```

#### Filter Changes
```typescript
function announceFilterChange(count: number, category: string) {
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = `Showing ${count} presets in ${category} category`;
}
```

#### Preview Mode
```typescript
function announcePreview(presetName: string) {
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = `Previewing ${presetName}. Press Escape to cancel or Enter to apply.`;
}
```

#### Application Success
```typescript
function announceApply(presetName: string, range: string) {
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = `Applied ${presetName} to range ${range}`;
}
```

---

## 🎯 Testing Checklist

### Manual Testing

#### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical and intuitive
- [ ] Arrow keys work for navigation within components
- [ ] Enter/Space activate buttons and selections
- [ ] Escape cancels operations and closes modals
- [ ] No keyboard traps (can always tab out)

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS)
- [ ] Test with TalkBack (Android)
- [ ] All interactive elements have accessible names
- [ ] Dynamic changes are announced
- [ ] No orphaned ARIA references

#### Focus Management
- [ ] Focus indicators are clearly visible
- [ ] Focus is not lost during interactions
- [ ] Modal dialogs trap focus properly
- [ ] Focus returns to trigger after modal closes
- [ ] Focus moves logically during dynamic content changes

#### Color & Contrast
- [ ] Text meets 4.5:1 contrast ratio
- [ ] UI components meet 3:1 contrast ratio
- [ ] Focus indicators have sufficient contrast
- [ ] Color is not the only means of conveying information

### Automated Testing

#### Tools
- **axe DevTools**: Browser extension for accessibility scanning
- **Lighthouse**: Automated accessibility audit
- **WAVE**: Web accessibility evaluation tool
- **jest-axe**: Automated testing in Jest

#### Example Test (React)
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('PresetPicker should have no accessibility violations', async () => {
  const { container } = render(
    <ConditionalFormattingPresetPicker
      onPresetSelect={() => {}}
    />
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 📚 Framework-Specific Implementation

### React
```tsx
import { useRef, useEffect } from 'react';

// Focus management hook
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const container = containerRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Trap focus logic
      }
    };
    
    container?.addEventListener('keydown', handleKeyDown);
    return () => container?.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  
  return containerRef;
}

// Usage
function PresetPicker() {
  const containerRef = useFocusTrap(true);
  
  return (
    <div ref={containerRef} role="region" aria-label="Preset Picker">
      {/* Content */}
    </div>
  );
}
```

### Vue
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!containerRef.value) return;
  
  containerRef.value.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Focus trap logic
    }
  });
});
</script>

<template>
  <div
    ref="containerRef"
    role="region"
    aria-label="Preset Picker"
  >
    <!-- Content -->
  </div>
</template>
```

### Angular
```typescript
@Component({
  selector: 'cf-preset-picker',
  template: `
    <div
      #container
      role="region"
      aria-label="Preset Picker"
      (keydown)="handleKeyDown($event)"
    >
      <!-- Content -->
    </div>
  `
})
export class PresetPickerComponent {
  @ViewChild('container') container!: ElementRef;
  
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      // Focus trap logic
    }
  }
}
```

### Svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let containerRef: HTMLElement;
  
  onMount(() => {
    containerRef.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Focus trap logic
      }
    });
  });
</script>

<div
  bind:this={containerRef}
  role="region"
  aria-label="Preset Picker"
>
  <!-- Content -->
</div>
```

### Vanilla JS
```typescript
class PresetPicker {
  private setupAccessibility() {
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Preset Picker');
    
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Focus trap logic
      }
    });
  }
}
```

---

## 🔧 Utility Functions

### Screen Reader Only Class
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Announce Function
```typescript
function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}
```

### Focus Management
```typescript
function moveFocus(direction: 'next' | 'prev' | 'first' | 'last', container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];
  
  if (focusable.length === 0) return;
  
  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  let targetIndex: number;
  
  switch (direction) {
    case 'next':
      targetIndex = (currentIndex + 1) % focusable.length;
      break;
    case 'prev':
      targetIndex = (currentIndex - 1 + focusable.length) % focusable.length;
      break;
    case 'first':
      targetIndex = 0;
      break;
    case 'last':
      targetIndex = focusable.length - 1;
      break;
  }
  
  focusable[targetIndex]?.focus();
}
```

---

## ✅ Compliance Checklist

### WCAG 2.1 Level AA Criteria

#### Perceivable
- [ ] 1.1.1 Non-text Content (Level A)
- [ ] 1.3.1 Info and Relationships (Level A)
- [ ] 1.3.2 Meaningful Sequence (Level A)
- [ ] 1.3.4 Orientation (Level AA)
- [ ] 1.3.5 Identify Input Purpose (Level AA)
- [ ] 1.4.3 Contrast (Minimum) (Level AA)
- [ ] 1.4.10 Reflow (Level AA)
- [ ] 1.4.11 Non-text Contrast (Level AA)
- [ ] 1.4.12 Text Spacing (Level AA)
- [ ] 1.4.13 Content on Hover or Focus (Level AA)

#### Operable
- [ ] 2.1.1 Keyboard (Level A)
- [ ] 2.1.2 No Keyboard Trap (Level A)
- [ ] 2.1.4 Character Key Shortcuts (Level A)
- [ ] 2.4.3 Focus Order (Level A)
- [ ] 2.4.5 Multiple Ways (Level AA)
- [ ] 2.4.6 Headings and Labels (Level AA)
- [ ] 2.4.7 Focus Visible (Level AA)
- [ ] 2.5.3 Label in Name (Level A)

#### Understandable
- [ ] 3.1.1 Language of Page (Level A)
- [ ] 3.2.1 On Focus (Level A)
- [ ] 3.2.2 On Input (Level A)
- [ ] 3.2.4 Consistent Identification (Level AA)
- [ ] 3.3.1 Error Identification (Level A)
- [ ] 3.3.2 Labels or Instructions (Level A)
- [ ] 3.3.3 Error Suggestion (Level AA)
- [ ] 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

#### Robust
- [ ] 4.1.1 Parsing (Level A)
- [ ] 4.1.2 Name, Role, Value (Level A)
- [ ] 4.1.3 Status Messages (Level AA)

---

## 📖 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [Deque axe DevTools](https://www.deque.com/axe/devtools/)

---

**Next Steps:**
1. Implement keyboard navigation in all framework adapters
2. Add ARIA labels and roles
3. Implement screen reader announcements
4. Run automated accessibility tests
5. Conduct manual testing with assistive technologies
6. Document accessibility features in user guide
