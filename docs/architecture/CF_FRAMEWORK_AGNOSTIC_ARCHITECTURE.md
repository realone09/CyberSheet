# Conditional Formatting: Framework-Agnostic Architecture

**Date:** February 8, 2026  
**Status:** 🔄 IN PROGRESS - Critical Refactor  
**Branch:** wave4-excel-parity-validation

## 🎯 Critical Requirement

**ALL UI components must support:**
- ✅ Vanilla JS (Web Components or pure DOM)
- ✅ React
- ✅ Vue
- ✅ Angular
- ✅ Svelte

## 🏗️ Architecture Strategy

### Core Principle: Business Logic ≠ Framework Code

```
┌─────────────────────────────────────────────────────────────┐
│                    @cyber-sheet/core                        │
│              (CF Engine - Already Done ✅)                   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────────┐
│              @cyber-sheet/cf-ui-core (NEW)                  │
│                                                              │
│  • ConditionalFormattingUIController                        │
│  • RuleBuilderState                                         │
│  • RuleManagerState                                         │
│  • DragDropController                                       │
│  • RuleDescriptionFormatter                                 │
│  • RangeFormatter                                           │
│  • All business logic, validation, state management         │
│                                                              │
│  Implementation: Pure TypeScript/JavaScript                 │
│  Zero framework dependencies                                │
│  Can be used directly in Vanilla JS                         │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼────────┐  ┌──────▼────────┐
│ React Adapter  │  │  Vue Adapter  │  │Angular Adapter│
│ (Thin wrapper) │  │ (Thin wrapper)│  │ (Thin wrapper)│
└────────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼────────┐  ┌──────▼────────┐
│Svelte Adapter  │  │Vanilla Export │  │  (Future...)  │
│ (Thin wrapper) │  │  (Direct use) │  │               │
└────────────────┘  └───────────────┘  └───────────────┘
```

## 📦 Package Structure

### 1. `packages/cf-ui-core/` (NEW - Framework-Agnostic Core)

**Purpose:** All CF UI business logic, state management, controllers

**Files:**
```
packages/cf-ui-core/
├── src/
│   ├── controllers/
│   │   ├── RuleBuilderController.ts        # Rule building logic
│   │   ├── RuleManagerController.ts        # Rule management logic
│   │   ├── DragDropController.ts           # Drag & drop state
│   │   ├── RuleInspectorController.ts      # Hover inspector logic
│   │   └── PresetApplyController.ts        # Preset application
│   ├── state/
│   │   ├── RuleBuilderState.ts             # Builder state machine
│   │   ├── RuleManagerState.ts             # Manager state machine
│   │   └── StateManager.ts                 # Generic state manager
│   ├── formatters/
│   │   ├── RuleDescriptionFormatter.ts     # Human-readable descriptions
│   │   ├── RangeFormatter.ts               # A1 notation
│   │   └── ValueFormatter.ts               # Format thresholds, ranks
│   ├── validators/
│   │   ├── RuleValidator.ts                # Rule validation
│   │   └── FormulaValidator.ts             # Formula syntax check
│   ├── types/
│   │   ├── UITypes.ts                      # UI-specific types
│   │   └── EventTypes.ts                   # Event payloads
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Key Classes:**

```typescript
// RuleBuilderController.ts
export class RuleBuilderController {
  constructor(private engine: ConditionalFormattingEngine) {}
  
  // State management
  createState(): RuleBuilderState;
  updateField(state: RuleBuilderState, field: string, value: any): RuleBuilderState;
  
  // Validation
  validateFormula(expression: string): ValidationResult;
  validateRule(rule: ConditionalFormattingRule): ValidationResult;
  
  // Build
  buildRule(state: RuleBuilderState): ConditionalFormattingRule;
  
  // Description
  getDescription(rule: ConditionalFormattingRule): string;
}

// RuleManagerController.ts
export class RuleManagerController {
  constructor(private rules: ConditionalFormattingRule[]) {}
  
  // Reordering
  reorder(fromIndex: number, toIndex: number): ConditionalFormattingRule[];
  updatePriorities(rules: ConditionalFormattingRule[]): ConditionalFormattingRule[];
  
  // CRUD
  add(rule: ConditionalFormattingRule): ConditionalFormattingRule[];
  update(index: number, rule: ConditionalFormattingRule): ConditionalFormattingRule[];
  delete(index: number): ConditionalFormattingRule[];
  duplicate(index: number): ConditionalFormattingRule[];
  
  // State
  toggleEnabled(ruleId: string, enabled: boolean): void;
  getEnabled(ruleId: string): boolean;
}

// DragDropController.ts
export class DragDropController {
  private draggedIndex: number | null = null;
  private draggedOverIndex: number | null = null;
  
  startDrag(index: number): void;
  dragOver(index: number): void;
  drop(dropIndex: number): number | null; // returns fromIndex if valid
  endDrag(): void;
  
  getDragState(): { draggedIndex: number | null; draggedOverIndex: number | null };
}
```

**Zero Dependencies:** Pure TypeScript, no React/Vue/Angular/Svelte

### 2. Framework Adapters (Thin Wrappers)

#### React Adapter (`packages/react/src/conditional-formatting/`)

```typescript
// ConditionalFormattingRuleBuilder.tsx
import { RuleBuilderController } from '@cyber-sheet/cf-ui-core';

export const ConditionalFormattingRuleBuilder: React.FC<Props> = ({ ... }) => {
  const controllerRef = useRef(new RuleBuilderController(engine));
  const [state, setState] = useState(controllerRef.current.createState());
  
  const handleFieldChange = (field: string, value: any) => {
    setState(controllerRef.current.updateField(state, field, value));
  };
  
  const handleSave = () => {
    const rule = controllerRef.current.buildRule(state);
    onSave(rule);
  };
  
  // React JSX rendering using state
  return <div>...</div>;
};
```

#### Vue Adapter (`packages/vue/src/conditional-formatting/`)

```vue
<!-- ConditionalFormattingRuleBuilder.vue -->
<template>
  <div>
    <!-- Vue template using state -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RuleBuilderController } from '@cyber-sheet/cf-ui-core';

const controller = new RuleBuilderController(engine);
const state = ref(controller.createState());

const handleFieldChange = (field: string, value: any) => {
  state.value = controller.updateField(state.value, field, value);
};

const handleSave = () => {
  const rule = controller.buildRule(state.value);
  emit('save', rule);
};
</script>
```

#### Angular Adapter (`packages/angular/src/conditional-formatting/`)

```typescript
// conditional-formatting-rule-builder.component.ts
import { Component } from '@angular/core';
import { RuleBuilderController } from '@cyber-sheet/cf-ui-core';

@Component({
  selector: 'cf-rule-builder',
  templateUrl: './conditional-formatting-rule-builder.component.html'
})
export class ConditionalFormattingRuleBuilderComponent {
  private controller = new RuleBuilderController(this.engine);
  state = this.controller.createState();
  
  handleFieldChange(field: string, value: any) {
    this.state = this.controller.updateField(this.state, field, value);
  }
  
  handleSave() {
    const rule = this.controller.buildRule(this.state);
    this.save.emit(rule);
  }
}
```

#### Svelte Adapter (`packages/svelte/src/conditional-formatting/`)

```svelte
<!-- ConditionalFormattingRuleBuilder.svelte -->
<script lang="ts">
  import { RuleBuilderController } from '@cyber-sheet/cf-ui-core';
  
  const controller = new RuleBuilderController(engine);
  let state = controller.createState();
  
  function handleFieldChange(field: string, value: any) {
    state = controller.updateField(state, field, value);
  }
  
  function handleSave() {
    const rule = controller.buildRule(state);
    dispatch('save', rule);
  }
</script>

<div>
  <!-- Svelte markup using state -->
</div>
```

#### Vanilla JS (Direct Use)

```typescript
// vanilla-example.ts
import { RuleBuilderController, RuleManagerController } from '@cyber-sheet/cf-ui-core';

const controller = new RuleBuilderController(engine);
let state = controller.createState();

// Manually bind to DOM
document.getElementById('ruleType').addEventListener('change', (e) => {
  state = controller.updateField(state, 'ruleType', e.target.value);
  render(state);
});

document.getElementById('save').addEventListener('click', () => {
  const rule = controller.buildRule(state);
  console.log('Rule created:', rule);
});

function render(state) {
  // Update DOM based on state
  document.getElementById('ruleType').value = state.ruleType;
  // ...
}
```

## 🔄 Refactor Plan

### Phase 1: Create Core Package (NOW)
1. ✅ Create `packages/cf-ui-core/` structure
2. ✅ Extract all business logic from React components
3. ✅ Create controllers, state managers, formatters
4. ✅ Zero dependencies except `@cyber-sheet/core`
5. ✅ Full TypeScript with strict types

### Phase 2: Refactor React Components (Day 3 continuation)
1. ✅ Update `ConditionalFormattingRuleBuilder` to use controller
2. ✅ Update `ConditionalFormattingRuleManager` to use controller
3. ✅ Update `ConditionalFormattingIntegratedPanel` to use controller
4. ✅ Keep React JSX/hooks, delegate logic to core

### Phase 3: Create Vue Adapter (Day 4)
1. Create Vue components using core controllers
2. Vue composition API with reactivity
3. Test with Vue 3 examples

### Phase 4: Create Angular Adapter (Day 4)
1. Create Angular components using core controllers
2. Angular reactive forms with RxJS
3. Test with Angular 17+ examples

### Phase 5: Create Svelte Adapter (Day 5)
1. Create Svelte components using core controllers
2. Svelte stores for state management
3. Test with Svelte 4+ examples

### Phase 6: Vanilla Examples (Day 5)
1. Direct usage examples with pure DOM manipulation
2. Web Components wrapper (optional)
3. CDN distribution

## 📋 Implementation Checklist

### Core Package (`cf-ui-core`)
- [ ] `RuleBuilderController.ts` - Rule building logic
- [ ] `RuleManagerController.ts` - Rule management logic
- [ ] `DragDropController.ts` - Drag & drop state
- [ ] `RuleInspectorController.ts` - Hover inspector logic
- [ ] `PresetApplyController.ts` - Preset application
- [ ] `RuleDescriptionFormatter.ts` - Human descriptions
- [ ] `RangeFormatter.ts` - A1 notation
- [ ] `ValueFormatter.ts` - Threshold formatting
- [ ] `RuleValidator.ts` - Validation logic
- [ ] `StateManager.ts` - Generic state management
- [ ] Unit tests for all controllers
- [ ] Zero framework dependencies verified

### React Adapter (Refactor)
- [ ] Update `ConditionalFormattingRuleBuilder` to use core
- [ ] Update `ConditionalFormattingRuleManager` to use core
- [ ] Update `ConditionalFormattingIntegratedPanel` to use core
- [ ] Tests still passing

### Vue Adapter
- [ ] `ConditionalFormattingRuleBuilder.vue`
- [ ] `ConditionalFormattingRuleManager.vue`
- [ ] `ConditionalFormattingIntegratedPanel.vue`
- [ ] Vue 3 composition API examples
- [ ] Tests with Vue Test Utils

### Angular Adapter
- [ ] `ConditionalFormattingRuleBuilderComponent`
- [ ] `ConditionalFormattingRuleManagerComponent`
- [ ] `ConditionalFormattingIntegratedPanelComponent`
- [ ] Angular module setup
- [ ] Tests with Jasmine/Karma

### Svelte Adapter
- [ ] `ConditionalFormattingRuleBuilder.svelte`
- [ ] `ConditionalFormattingRuleManager.svelte`
- [ ] `ConditionalFormattingIntegratedPanel.svelte`
- [ ] Svelte store integration
- [ ] Tests with @testing-library/svelte

### Vanilla Examples
- [ ] Pure DOM manipulation example
- [ ] Web Components wrapper (optional)
- [ ] CDN bundle
- [ ] Vanilla JS documentation

## 🎯 Benefits

1. **Code Reuse:** Business logic written once, used everywhere
2. **Consistency:** Same behavior across all frameworks
3. **Testability:** Core logic tested independently
4. **Maintainability:** Fix bugs once, benefits all frameworks
5. **Performance:** Minimal framework-specific code
6. **Future-Proof:** Easy to add new frameworks
7. **Vanilla Support:** Works without any framework

## 📊 Updated Timeline

**Week 1 (Revised):**
- ✅ Day 1-2: Rule Builder UI (React - needs refactor)
- ✅ Day 3: Rule Management Panel (React - needs refactor)
- 🔄 Day 3 (continued): Create `cf-ui-core` package + refactor React
- ⏳ Day 4: Vue + Angular adapters + Rule Inspector
- ⏳ Day 5: Svelte adapter + Vanilla examples + Toolbar Integration

**Week 2:**
- Framework-specific examples (5 frameworks × 10 examples = 50 examples)
- Integration tests for all frameworks
- Accessibility testing across frameworks
- Documentation for each framework

**Week 3:**
- Cross-framework Excel comparison
- Stress testing in all frameworks
- Performance benchmarks
- 100% declaration with framework support proof

## 🚨 Critical Note

**This refactor is ESSENTIAL.** Without it:
- ❌ Can't support Vue, Angular, Svelte, Vanilla
- ❌ Violates user requirement
- ❌ Business logic tied to React
- ❌ Duplicate code across frameworks

**With this refactor:**
- ✅ All frameworks supported
- ✅ Single source of truth for logic
- ✅ Easy to maintain and extend
- ✅ Meets user requirement perfectly

---

**Next Immediate Action:** Create `packages/cf-ui-core/` and start extracting controllers from React components.
