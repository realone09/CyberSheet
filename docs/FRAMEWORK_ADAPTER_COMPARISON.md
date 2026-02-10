# Framework Adapter Comparison Guide

**One Controller, Five Frameworks - Side-by-Side**

This document shows how the **same PresetPickerController** (181 lines of pure TypeScript) is wrapped by 5 different framework adapters.

---

## 🎯 The Core Controller (Framework-Agnostic)

```typescript
// packages/cf-ui-core/src/controllers/PresetPickerController.ts
export class PresetPickerController {
  private state: PresetPickerState;
  private listeners: Map<string, Set<(event: PresetEvent) => void>>;

  constructor() {
    this.state = {
      presets: getAllPresets(),
      selectedPresetId: null,
      selectedCategory: 'all',
      searchQuery: '',
      filteredPresets: getAllPresets(),
    };
    this.listeners = new Map();
  }

  public getState(): PresetPickerState { /* ... */ }
  public selectCategory(category: PresetCategory): void { /* ... */ }
  public setSearchQuery(query: string): void { /* ... */ }
  public selectPreset(presetId: string): void { /* ... */ }
  public getCategories(): CategoryWithCount[] { /* ... */ }
  public on(eventType: PresetEvent['type'], callback: (event: PresetEvent) => void): void { /* ... */ }
  private emit(event: PresetEvent): void { /* ... */ }
}
```

**Key Points:**
- Zero framework dependencies
- Event-driven architecture (subscribe/emit)
- Pure TypeScript business logic
- Works EVERYWHERE

---

## ⚛️ React Adapter

**File:** `packages/react/src/conditional-formatting/ConditionalFormattingPresetPicker.tsx`

### State Management
```typescript
const [controller] = useState(() => new PresetPickerController());
const [state, setState] = useState<PresetPickerState>(controller.getState());
const [categories, setCategories] = useState(controller.getCategories());
const [popularPresets, setPopularPresets] = useState(controller.getPopularPresets(6));
```

### Event Subscription
```typescript
useEffect(() => {
  controller.on('category-changed', () => {
    setState(controller.getState());
    setCategories(controller.getCategories());
  });
  
  controller.on('search-changed', () => {
    setState(controller.getState());
  });
  
  controller.on('preset-selected', () => {
    setState(controller.getState());
  });
}, [controller]);
```

### Event Handlers
```typescript
const handleCategoryChange = (category: PresetCategory) => {
  controller.selectCategory(category);
};

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  controller.setSearchQuery(e.target.value);
};

const handlePresetClick = (preset: CFPreset) => {
  controller.selectPreset(preset.id);
  onPresetSelect(preset);
};
```

### Template (JSX)
```tsx
<div className="cf-preset-picker">
  <input
    value={state.searchQuery}
    onChange={handleSearchChange}
  />
  
  {categories.map(cat => (
    <button
      key={cat.value}
      onClick={() => handleCategoryChange(cat.value)}
      className={state.selectedCategory === cat.value ? 'active' : ''}
    >
      {cat.label}
    </button>
  ))}
  
  {state.filteredPresets.map(preset => (
    <button
      key={preset.id}
      onClick={() => handlePresetClick(preset)}
      className={state.selectedPresetId === preset.id ? 'selected' : ''}
    >
      {preset.name}
    </button>
  ))}
</div>
```

**React Pattern:** `useState` + `useEffect` + JSX + inline handlers

---

## 🟩 Vue 3 Adapter

**File:** `packages/vue/src/conditional-formatting/ConditionalFormattingPresetPicker.vue`

### State Management
```typescript
const controller = new PresetPickerController();
const selectedPresetId: Ref<string | null> = ref(null);
const selectedCategory: Ref<PresetCategory> = ref('all');
const searchQuery: Ref<string> = ref('');
const filteredPresets: Ref<CFPreset[]> = ref([]);
const popularPresets: Ref<CFPreset[]> = ref([]);
const categories = computed(() => controller.getCategories());
```

### Event Subscription
```typescript
onMounted(() => {
  const state = controller.getState();
  selectedPresetId.value = state.selectedPresetId;
  selectedCategory.value = state.selectedCategory;
  searchQuery.value = state.searchQuery;
  filteredPresets.value = state.filteredPresets;
  popularPresets.value = controller.getPopularPresets(6);

  controller.on('category-changed', () => {
    const state = controller.getState();
    selectedCategory.value = state.selectedCategory;
    filteredPresets.value = state.filteredPresets;
  });
  
  controller.on('search-changed', () => {
    const state = controller.getState();
    searchQuery.value = state.searchQuery;
    filteredPresets.value = state.filteredPresets;
  });
  
  controller.on('preset-selected', () => {
    const state = controller.getState();
    selectedPresetId.value = state.selectedPresetId;
  });
});
```

### Event Handlers
```typescript
const handleCategoryChange = (category: PresetCategory) => {
  controller.selectCategory(category);
};

const handleSearchChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  controller.setSearchQuery(target.value);
};

const handlePresetClick = (preset: CFPreset) => {
  controller.selectPreset(preset.id);
  props.onPresetSelect(preset);
};
```

### Template
```vue
<template>
  <div class="cf-preset-picker">
    <input
      :value="searchQuery"
      @input="handleSearchChange"
    />
    
    <button
      v-for="cat in categories"
      :key="cat.value"
      @click="handleCategoryChange(cat.value)"
      :class="{ 'active': selectedCategory === cat.value }"
    >
      {{ cat.label }}
    </button>
    
    <button
      v-for="preset in filteredPresets"
      :key="preset.id"
      @click="handlePresetClick(preset)"
      :class="{ 'selected': selectedPresetId === preset.id }"
    >
      {{ preset.name }}
    </button>
  </div>
</template>
```

**Vue Pattern:** `ref` + `computed` + `onMounted` + Vue template syntax

---

## 🅰️ Angular Adapter

**File:** `packages/angular/src/conditional-formatting/cf-preset-picker.component.ts`

### State Management
```typescript
export class ConditionalFormattingPresetPickerComponent implements OnInit {
  private controller!: PresetPickerController;
  
  selectedPresetId: string | null = null;
  selectedCategory: PresetCategory = 'all';
  searchQuery: string = '';
  filteredPresets: CFPreset[] = [];
  popularPresets: CFPreset[] = [];
  categories: CategoryWithCount[] = [];
}
```

### Event Subscription
```typescript
ngOnInit(): void {
  this.controller = new PresetPickerController();

  const state = this.controller.getState();
  this.selectedPresetId = state.selectedPresetId;
  this.selectedCategory = state.selectedCategory;
  this.searchQuery = state.searchQuery;
  this.filteredPresets = state.filteredPresets;
  this.popularPresets = this.controller.getPopularPresets(6);
  this.categories = this.controller.getCategories();

  this.controller.on('category-changed', () => {
    const state = this.controller.getState();
    this.selectedCategory = state.selectedCategory;
    this.filteredPresets = state.filteredPresets;
    this.categories = this.controller.getCategories();
  });
  
  this.controller.on('search-changed', () => {
    const state = this.controller.getState();
    this.searchQuery = state.searchQuery;
    this.filteredPresets = state.filteredPresets;
  });
  
  this.controller.on('preset-selected', () => {
    const state = this.controller.getState();
    this.selectedPresetId = state.selectedPresetId;
  });
}
```

### Event Handlers
```typescript
handleCategoryChange(category: PresetCategory): void {
  this.controller.selectCategory(category);
}

handleSearchChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.controller.setSearchQuery(target.value);
}

handlePresetClick(preset: CFPreset): void {
  this.controller.selectPreset(preset.id);
  this.presetSelect.emit(preset);
}
```

### Template
```html
<div class="cf-preset-picker">
  <input
    [value]="searchQuery"
    (input)="handleSearchChange($event)"
  />
  
  <button
    *ngFor="let cat of categories"
    (click)="handleCategoryChange(cat.value)"
    [class.active]="selectedCategory === cat.value"
  >
    {{ cat.label }}
  </button>
  
  <button
    *ngFor="let preset of filteredPresets"
    (click)="handlePresetClick(preset)"
    [class.selected]="selectedPresetId === preset.id"
  >
    {{ preset.name }}
  </button>
</div>
```

**Angular Pattern:** Class properties + `ngOnInit` + Angular template syntax + `@Input/@Output`

---

## 🧡 Svelte Adapter

**File:** `packages/svelte/src/conditional-formatting/ConditionalFormattingPresetPicker.svelte`

### State Management
```typescript
let controller: PresetPickerController;
let selectedPresetId: string | null = null;
let selectedCategory: PresetCategory = 'all';
let searchQuery: string = '';
let filteredPresets: CFPreset[] = [];
let popularPresets: CFPreset[] = [];

// Reactive computed
$: categories = controller ? controller.getCategories() : [];
```

### Event Subscription
```typescript
onMount(() => {
  controller = new PresetPickerController();

  const state = controller.getState();
  selectedPresetId = state.selectedPresetId;
  selectedCategory = state.selectedCategory;
  searchQuery = state.searchQuery;
  filteredPresets = state.filteredPresets;
  popularPresets = controller.getPopularPresets(6);

  controller.on('category-changed', () => {
    const state = controller.getState();
    selectedCategory = state.selectedCategory;
    filteredPresets = state.filteredPresets;
  });
  
  controller.on('search-changed', () => {
    const state = controller.getState();
    searchQuery = state.searchQuery;
    filteredPresets = state.filteredPresets;
  });
  
  controller.on('preset-selected', () => {
    const state = controller.getState();
    selectedPresetId = state.selectedPresetId;
  });
});
```

### Event Handlers
```typescript
const handleCategoryChange = (category: PresetCategory) => {
  controller.selectCategory(category);
};

const handleSearchChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  controller.setSearchQuery(target.value);
};

const handlePresetClick = (preset: CFPreset) => {
  controller.selectPreset(preset.id);
  onPresetSelect(preset);
};
```

### Template
```svelte
<div class="cf-preset-picker">
  <input
    value={searchQuery}
    on:input={handleSearchChange}
  />
  
  {#each categories as cat}
    <button
      on:click={() => handleCategoryChange(cat.value)}
      class:active={selectedCategory === cat.value}
    >
      {cat.label}
    </button>
  {/each}
  
  {#each filteredPresets as preset}
    <button
      on:click={() => handlePresetClick(preset)}
      class:selected={selectedPresetId === preset.id}
    >
      {preset.name}
    </button>
  {/each}
</div>
```

**Svelte Pattern:** `let` (reactive) + `onMount` + Svelte template syntax + `$:` reactive statements

---

## 📜 Vanilla JS Adapter

**File:** `packages/test-utils/src/vanilla/CFPresetPicker.ts`

### State Management
```typescript
export class CFPresetPicker {
  private controller: PresetPickerController;
  private container: HTMLElement;
  private options: Required<CFPresetPickerOptions>;

  constructor(container: HTMLElement, options: CFPresetPickerOptions) {
    this.container = container;
    this.controller = new PresetPickerController();
    this.init();
  }
}
```

### Event Subscription
```typescript
private init(): void {
  this.controller.on('category-changed', () => this.render());
  this.controller.on('search-changed', () => this.render());
  this.controller.on('preset-selected', () => this.render());
  this.render();
}
```

### Render Method (Manual DOM)
```typescript
private render(): void {
  const state = this.controller.getState();
  const categories = this.controller.getCategories();
  
  // Clear container
  this.container.innerHTML = '';
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'cf-preset-picker';
  
  // Create search
  const search = this.createSearch(state.searchQuery);
  wrapper.appendChild(search);
  
  // Create categories
  const categoriesEl = this.createCategories(categories, state.selectedCategory);
  wrapper.appendChild(categoriesEl);
  
  // Create preset grid
  const grid = this.createPresetGrid(state.filteredPresets, state.selectedPresetId);
  wrapper.appendChild(grid);
  
  // Append to container
  this.container.appendChild(wrapper);
}
```

### Event Handlers (Manual)
```typescript
private createSearch(value: string): HTMLElement {
  const input = document.createElement('input');
  input.value = value;
  input.addEventListener('input', (e) => {
    this.controller.setSearchQuery((e.target as HTMLInputElement).value);
  });
  return input;
}

private createCategories(categories: CategoryWithCount[], selected: PresetCategory): HTMLElement {
  const container = document.createElement('div');
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.label;
    if (selected === cat.value) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      this.controller.selectCategory(cat.value);
    });
    container.appendChild(btn);
  });
  return container;
}
```

**Vanilla Pattern:** Class-based + manual DOM manipulation + `addEventListener` + no virtual DOM

---

## 📊 Pattern Comparison Table

| Aspect | React | Vue | Angular | Svelte | Vanilla |
|--------|-------|-----|---------|--------|---------|
| **State** | `useState` | `ref()` | Class props | `let` | Instance props |
| **Computed** | `useMemo` | `computed()` | Getters | `$:` | Methods |
| **Lifecycle** | `useEffect` | `onMounted` | `ngOnInit` | `onMount` | Constructor |
| **Events** | `onChange` | `@input` | `(input)` | `on:input` | `addEventListener` |
| **Loops** | `.map()` | `v-for` | `*ngFor` | `{#each}` | `.forEach()` |
| **Conditionals** | `&&`, `? :` | `v-if` | `*ngIf` | `{#if}` | `if` statements |
| **Classes** | `className` | `:class` | `[class]` | `class:` | `.className` |
| **Render** | JSX | Template | Template | Template | Manual DOM |
| **Lines** | 251 | ~350 | 443 | ~410 | 425 |

---

## 🎯 Key Takeaways

### 1. **Same Business Logic Everywhere**
The PresetPickerController is **identical** across all 5 frameworks. Not a single line changes.

### 2. **Only UI Wrapper Changes**
React uses JSX, Vue uses templates, Angular uses decorators, Svelte uses reactive stores, Vanilla uses DOM APIs. But the **core logic is the same**.

### 3. **Event-Driven Architecture Works**
The subscribe/emit pattern (`controller.on(event, callback)`) is a universal concept that works in every framework.

### 4. **Type Safety Across Boundaries**
TypeScript types (CFPreset, PresetCategory, PresetPickerState) ensure consistency across all adapters.

### 5. **Framework Features Are Just Different Syntax**
- React: `useState` → Vue: `ref()` → Angular: class properties → Svelte: `let` → Vanilla: instance properties
- React: JSX → Vue: `<template>` → Angular: inline template → Svelte: HTML-like → Vanilla: `createElement()`
- React: `useEffect` → Vue: `onMounted` → Angular: `ngOnInit` → Svelte: `onMount` → Vanilla: constructor

**All doing the same thing:** Listen to changes, update state, re-render UI.

### 6. **Vanilla JS Is the Ultimate Validator**
If it works in vanilla JS with no framework, the architecture is truly framework-agnostic. We proved it!

---

## 🏆 The Victory

```
ONE Controller (181 lines)
   ↓
FIVE Frameworks
   ↓
∞ Future-Proof
```

No matter what framework comes next (Solid.js? Qwik? Something new?), we can create an adapter in a day. The business logic never changes.

**This is how you build for the long term.** 💎

---

## 📚 Next Steps

Want to use the preset picker in your framework? Choose your adapter:

- **React:** Import `ConditionalFormattingPresetPicker` from `@cyber-sheet/react`
- **Vue:** Import `ConditionalFormattingPresetPicker` from `@cyber-sheet/vue`
- **Angular:** Import `ConditionalFormattingPresetPickerComponent` from `@cyber-sheet/angular`
- **Svelte:** Import `ConditionalFormattingPresetPicker` from `@cyber-sheet/svelte`
- **Vanilla:** Import `CFPresetPicker` class from `@cyber-sheet/test-utils/vanilla`

All use the same PresetPickerController under the hood. Same features, same behavior, different syntax.

Welcome to framework-agnostic bliss! 🎉
