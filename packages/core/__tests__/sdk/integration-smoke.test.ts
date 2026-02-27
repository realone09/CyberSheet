/**
 * @group sdk
 *
 * Integration Smoke Matrix — Phase 15 Release & Adoption Readiness.
 *
 * PURPOSE
 * -------
 * Proves that @cyber-sheet/core/sdk is framework-neutral:
 *  - No microtask reliance (events fire SYNCHRONOUSLY within the mutation call)
 *  - No scheduler coupling (works without requestAnimationFrame, setTimeout, etc.)
 *  - Subscription lifecycle compatible with each framework's cleanup model
 *  - Multiple "component" instances independent — no cross-contamination
 *
 * Each section simulates a framework's lifecycle PATTERN using plain JS.
 * No actual React/Vue/Svelte/Angular runtime is imported.
 * If these patterns work, the SDK will work inside those frameworks.
 *
 * WHAT EACH SECTION PROVES
 * -------------------------
 * React   — useEffect cleanup: subscribe on mount, dispose on unmount
 * Vue     — onMounted/onUnmounted: same lifecycle, different mental model
 * Svelte  — store.subscribe() returning unsubscriber: functional cleanup
 * Vanilla — addEventListener pattern: manual imperative cleanup
 */

import { createSpreadsheet, SdkError } from '../../src/sdk/index';
import type { SpreadsheetSDK, SdkEvent, Disposable } from '../../src/sdk/index';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeSheet(name: string) {
  return createSpreadsheet(name, { rows: 20, cols: 20, maxUndoHistory: 10 });
}

// Simulates one scheduling tick — used to prove events do NOT require a tick.
function nextTick() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// ---------------------------------------------------------------------------
// ── React Adapter Pattern ─────────────────────────────────────────────────
//
// React useEffect returns a cleanup function:
//
//   useEffect(() => {
//     const sub = sheet.on('cell-changed', handler);
//     return () => sub.dispose();          ← cleanup
//   }, []);
//
// The smoke test simulates:
//   mount() → side effect runs, listener registered
//   trigger mutation
//   unmount() → cleanup runs, listener removed
// ---------------------------------------------------------------------------

describe('React adapter pattern — useEffect cleanup', () => {
  function simulateReactComponent(sheet: SpreadsheetSDK) {
    const received: SdkEvent[] = [];

    // ── mount (useEffect body) ───────────────────────────────────────────
    const sub: Disposable = sheet.on('cell-changed', (e) => received.push(e));
    const cleanup = () => sub.dispose();

    return { received, cleanup };
  }

  it('events fire synchronously — no nextTick required', () => {
    const sheet = makeSheet('React-Sync');
    const { received, cleanup } = simulateReactComponent(sheet);

    // Mutation happens synchronously
    sheet.setCell(1, 1, 'hello');

    // Event should ALREADY be in received — no await needed
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('cell-changed');

    cleanup();
    sheet.dispose();
  });

  it('cleanup (unmount) stops all further events', async () => {
    const sheet = makeSheet('React-Cleanup');
    const { received, cleanup } = simulateReactComponent(sheet);

    sheet.setCell(1, 1, 'before-unmount');
    expect(received).toHaveLength(1);

    // Simulate unmount
    cleanup();

    // Mutations after unmount must NOT deliver events to the old handler
    sheet.setCell(2, 2, 'after-unmount');
    await nextTick(); // even after a tick — still 1
    expect(received).toHaveLength(1);

    sheet.dispose();
  });

  it('multiple component instances are independent', () => {
    const sheet = makeSheet('React-Multi');

    const comp1: SdkEvent[] = [];
    const comp2: SdkEvent[] = [];

    const sub1 = sheet.on('cell-changed', (e) => comp1.push(e));
    const sub2 = sheet.on('cell-changed', (e) => comp2.push(e));

    sheet.setCell(1, 1, 'shared-mutation');

    // Both components receive the event
    expect(comp1).toHaveLength(1);
    expect(comp2).toHaveLength(1);

    // Unmount comp1, keep comp2
    sub1.dispose();

    sheet.setCell(2, 2, 'after-comp1-unmount');

    expect(comp1).toHaveLength(1); // comp1 did NOT receive new event
    expect(comp2).toHaveLength(2); // comp2 received both

    sub2.dispose();
    sheet.dispose();
  });

  it('re-mounting (new subscription) after unmount works correctly', () => {
    const sheet = makeSheet('React-Remount');
    const round1: SdkEvent[] = [];
    const round2: SdkEvent[] = [];

    // Mount component
    const sub1 = sheet.on('cell-changed', (e) => round1.push(e));
    sheet.setCell(1, 1, 'round-1');
    sub1.dispose(); // unmount

    // Re-mount (React may do this in StrictMode / fast-refresh)
    const sub2 = sheet.on('cell-changed', (e) => round2.push(e));
    sheet.setCell(2, 2, 'round-2');
    sub2.dispose();

    expect(round1).toHaveLength(1);
    expect(round2).toHaveLength(1);
    sheet.dispose();
  });

  it('sheet dispose from React cleanup does not leak or throw', () => {
    const sheet = makeSheet('React-DisposeCleanup');
    const { cleanup } = simulateReactComponent(sheet);

    // React strict mode may call cleanup + remount.
    // Here: call cleanup, then dispose the sheet (e.g., parent component unmounts).
    expect(() => {
      cleanup();
      sheet.dispose();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ── Vue Adapter Pattern ───────────────────────────────────────────────────
//
// Vue 3 Composition API:
//
//   const sheet = inject('sheet');
//   const events = ref([]);
//
//   onMounted(() => {
//     const sub = sheet.on('cell-changed', (e) => events.value.push(e));
//     onUnmounted(() => sub.dispose());
//   });
//
// Vue dispatches lifecycle hooks synchronously within the same task.
// No scheduler expectations — which matches the SDK's synchronous events.
// ---------------------------------------------------------------------------

describe('Vue adapter pattern — onMounted/onUnmounted', () => {
  // Simulate Vue's ref() as a simple container
  function ref<T>(initial: T) {
    return { value: initial };
  }

  // Simulate Vue component setup
  function simulateVueComponent(sheet: SpreadsheetSDK) {
    const events = ref<SdkEvent[]>([]);
    const cleanups: Array<() => void> = [];

    // onMounted body
    const sub = sheet.on('cell-changed', (e) => {
      events.value = [...events.value, e]; // immutable update pattern
    });
    cleanups.push(() => sub.dispose()); // onUnmounted registration

    // Return teardown (onUnmounted calls all registered cleanups)
    const unmount = () => cleanups.forEach((fn) => fn());
    return { events, unmount };
  }

  it('reactive ref updates synchronously with cell mutations', () => {
    const sheet = makeSheet('Vue-Ref');
    const { events, unmount } = simulateVueComponent(sheet);

    sheet.setCell(3, 3, 99);
    // Vue's reactivity would schedule a re-render, but the underlying
    // data is already updated synchronously:
    expect(events.value).toHaveLength(1);

    unmount();
    sheet.dispose();
  });

  it('onUnmounted (cleanup) stops event delivery', () => {
    const sheet = makeSheet('Vue-Unmount');
    const { events, unmount } = simulateVueComponent(sheet);

    sheet.setCell(1, 1, 'before');
    unmount(); // component teardown

    sheet.setCell(2, 2, 'after');
    expect(events.value).toHaveLength(1); // only 'before' was received
    sheet.dispose();
  });

  it('two Vue component instances listening on the same sheet are independent', () => {
    const sheet = makeSheet('Vue-TwoComps');
    const a = simulateVueComponent(sheet);
    const b = simulateVueComponent(sheet);

    sheet.setCell(1, 1, 'x');
    expect(a.events.value).toHaveLength(1);
    expect(b.events.value).toHaveLength(1);

    a.unmount();
    sheet.setCell(2, 2, 'y');

    expect(a.events.value).toHaveLength(1);
    expect(b.events.value).toHaveLength(2);

    b.unmount();
    sheet.dispose();
  });

  it('no microtask delay between mutation and event delivery', async () => {
    const sheet = makeSheet('Vue-NoMicrotask');
    const { events, unmount } = simulateVueComponent(sheet);

    sheet.setCell(5, 5, 'immediate');
    const snapshot = events.value.length; // captured BEFORE any await

    await nextTick();
    // Count must not change after the tick (event was synchronous, not deferred)
    expect(events.value.length).toBe(snapshot);
    expect(snapshot).toBe(1);

    unmount();
    sheet.dispose();
  });
});

// ---------------------------------------------------------------------------
// ── Svelte Adapter Pattern ────────────────────────────────────────────────
//
// Svelte stores use a subscribe() → unsubscriber pattern:
//
//   // Wrapping the sheet as a Svelte-compatible readable store
//   function sheetStore(sheet) {
//     return {
//       subscribe(run) {
//         const sub = sheet.on('cell-changed', (e) => run(e));
//         return () => sub.dispose();   ← unsubscriber
//       }
//     };
//   }
//
//   // In a component:
//   const store = sheetStore(sheet);
//   onDestroy(store.subscribe((e) => { ... }));
//
// ---------------------------------------------------------------------------

describe('Svelte adapter pattern — store.subscribe()', () => {
  // Wrap a sheet as a Svelte-compatible readable store
  function createCellChangedStore(sheet: SpreadsheetSDK) {
    return {
      subscribe(run: (event: SdkEvent) => void): () => void {
        const sub = sheet.on('cell-changed', run);
        return () => sub.dispose(); // Svelte calls this on component destroy
      },
    };
  }

  it('subscribe/unsubscribe pattern works correctly', () => {
    const sheet = makeSheet('Svelte-Sub');
    const store = createCellChangedStore(sheet);
    const received: SdkEvent[] = [];

    const unsubscribe = store.subscribe((e) => received.push(e));

    sheet.setCell(1, 1, 'svelte-val');
    expect(received).toHaveLength(1);

    unsubscribe(); // simulates onDestroy
    sheet.setCell(2, 2, 'after-destroy');
    expect(received).toHaveLength(1);

    sheet.dispose();
  });

  it('multiple subscribers (components) independent and individually unsubscribable', () => {
    const sheet = makeSheet('Svelte-Multi');
    const store = createCellChangedStore(sheet);
    const aEvents: SdkEvent[] = [];
    const bEvents: SdkEvent[] = [];

    const unsubA = store.subscribe((e) => aEvents.push(e));
    const unsubB = store.subscribe((e) => bEvents.push(e));

    sheet.setCell(1, 1, 'shared');
    expect(aEvents).toHaveLength(1);
    expect(bEvents).toHaveLength(1);

    unsubA(); // only A destroyed
    sheet.setCell(2, 2, 'b-only');

    expect(aEvents).toHaveLength(1); // A stopped
    expect(bEvents).toHaveLength(2); // B continues

    unsubB();
    sheet.dispose();
  });

  it('unsubscribe is idempotent (double-call does not throw)', () => {
    const sheet = makeSheet('Svelte-Idempotent');
    const store = createCellChangedStore(sheet);
    const unsub = store.subscribe(() => {});

    expect(() => {
      unsub();
      unsub(); // second call must be safe
    }).not.toThrow();

    sheet.dispose();
  });

  it('derived store pattern: count cell-changed events', () => {
    const sheet = makeSheet('Svelte-Derived');
    let changeCount = 0;

    // Simulate Svelte derived() which subscribes to base store
    const unsubscribeDerived = createCellChangedStore(sheet).subscribe(() => {
      changeCount += 1;
    });

    sheet.setCell(1, 1, 'a');
    sheet.setCell(2, 2, 'b');
    sheet.setCell(3, 3, 'c');

    expect(changeCount).toBe(3);

    unsubscribeDerived();
    sheet.dispose();
  });
});

// ---------------------------------------------------------------------------
// ── Vanilla DOM Adapter Pattern ───────────────────────────────────────────
//
// Plain JavaScript without a framework:
//
//   const sheet = createSpreadsheet('main');
//
//   function renderCell(e) {
//     document.getElementById(`cell-${e.row}-${e.col}`).textContent = ...;
//   }
//
//   const sub = sheet.on('cell-changed', renderCell);
//
//   // On page unload or when the component div is removed:
//   window.addEventListener('unload', () => sub.dispose());
//
// ---------------------------------------------------------------------------

describe('Vanilla DOM adapter pattern — imperative subscribe/cleanup', () => {
  it('imperative subscription and cleanup works without any framework', () => {
    const sheet = makeSheet('Vanilla-Imperative');
    const log: string[] = [];

    const sub = sheet.on('cell-changed', (e) => {
      if (e.type === 'cell-changed') {
        log.push(`cell(${e.row},${e.col})`);
      }
    });

    sheet.setCell(2, 3, 'hello');
    sheet.setCell(4, 5, 'world');

    sub.dispose(); // simulates page unload handler

    sheet.setCell(1, 1, 'after-unload');
    expect(log).toEqual(['cell(2,3)', 'cell(4,5)']);
    sheet.dispose();
  });

  it('structure-changed event fires for merge operations', () => {
    const sheet = makeSheet('Vanilla-Merge');
    const events: string[] = [];

    const sub = sheet.on('structure-changed', (e) => events.push(e.type));
    sheet.mergeCells(1, 1, 2, 2);

    // At least one structure-changed event must fire; the exact count is
    // an implementation detail (some ops emit auxiliary structure events).
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events.every((t) => t === 'structure-changed')).toBe(true);

    sub.dispose();
    sheet.dispose();
  });

  it('structure-changed fires for row/col hide operations', () => {
    const sheet = makeSheet('Vanilla-Hide');
    const events: string[] = [];

    const sub = sheet.on('structure-changed', (e) => events.push(e.type));
    sheet.hideRow(3);
    sheet.hideCol(2);

    // At least 2 structure-changed events (one per operation).
    // The exact count may be higher due to auxiliary emission.
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.every((t) => t === 'structure-changed')).toBe(true);
    sub.dispose();
    sheet.dispose();
  });

  it('subscription survives many mutations without leaking', () => {
    const sheet = makeSheet('Vanilla-Stress');
    let count = 0;
    const sub = sheet.on('cell-changed', () => { count += 1; });

    for (let i = 1; i <= 100; i++) {
      sheet.setCell(i % 20 + 1, i % 20 + 1, i);
    }

    expect(count).toBe(100);
    sub.dispose();

    // After dispose, further mutations don't increment
    sheet.setCell(1, 1, 'after');
    expect(count).toBe(100);

    sheet.dispose();
  });

  it('errors in listeners are contained — do not expose raw internal errors', () => {
    const sheet = makeSheet('Vanilla-ListenerError');

    // A listener that throws — the SDK either swallows it internally
    // (preferred) or re-wraps it as a typed SdkError.
    const sub = sheet.on('cell-changed', () => {
      throw new Error('listener-boom');
    });

    let caughtError: unknown;
    try {
      sheet.setCell(1, 1, 'test');
    } catch (err) {
      caughtError = err;
    }

    // If an error propagates, it MUST be an SdkError (never a raw Error leak).
    if (caughtError !== undefined) {
      expect(caughtError).toBeInstanceOf(SdkError);
    }

    // Either way, the cell value must have been written (mutation succeeded
    // before the listener was called).
    // If setCell threw, skip the value check since state may be partial.
    if (caughtError === undefined) {
      expect(sheet.getCellValue(1, 1)).toBe('test');
    }

    sub.dispose();
    sheet.dispose();
  });

  it('all error types thrown by the SDK are SdkError — not raw browser errors', () => {
    const sheet = makeSheet('Vanilla-ErrorType');
    sheet.dispose();

    // In a Vanilla app, user code typically does:
    //   try { sheet.setCell(r, c, v); }
    //   catch (err) { if (err instanceof SdkError) { /* handle */ } }
    //
    // This test ensures that pattern always works.
    try {
      sheet.setCell(1, 1, 'x');
    } catch (err) {
      expect(err).toBeInstanceOf(SdkError);
    }
  });
});

// ---------------------------------------------------------------------------
// ── Cross-framework neutrality assertions ─────────────────────────────────
// ---------------------------------------------------------------------------

describe('framework neutrality — no global state, no scheduler', () => {
  it('ten sheets can coexist without cross-contamination', () => {
    const sheets = Array.from({ length: 10 }, (_, i) =>
      createSpreadsheet(`Neutral-${i}`, { rows: 5, cols: 5 }),
    );

    // Wire up listeners on all sheets
    const counters = sheets.map(() => ({ count: 0 }));
    const subs = sheets.map((s, i) =>
      s.on('cell-changed', () => { counters[i].count += 1; }),
    );

    // Mutate only sheet[3]
    sheets[3].setCell(1, 1, 'only-sheet-3');

    // Only counter[3] should increment
    expect(counters[3].count).toBe(1);
    const otherCounts = counters.filter((_, i) => i !== 3).map((c) => c.count);
    expect(otherCounts.every((c) => c === 0)).toBe(true);

    // Cleanup
    subs.forEach((s) => s.dispose());
    sheets.forEach((s) => s.dispose());
  });

  it('SDK does not use global variables (multiple createSpreadsheet calls are independent)', () => {
    const a = createSpreadsheet('Global-A', { rows: 5, cols: 5 });
    const b = createSpreadsheet('Global-B', { rows: 5, cols: 5 });

    a.setCell(1, 1, 'in-A');
    b.setCell(1, 1, 'in-B');

    // Values must be independent
    expect(a.getCellValue(1, 1)).toBe('in-A');
    expect(b.getCellValue(1, 1)).toBe('in-B');

    a.dispose();
    b.dispose();
  });

  it('events fire synchronously — no Promise/setTimeout/setInterval required', () => {
    const sheet = makeSheet('Sync-Proof');
    let fired = false;

    const sub = sheet.on('cell-changed', () => { fired = true; });

    // BEFORE the call: not fired
    expect(fired).toBe(false);

    sheet.setCell(1, 1, 'trigger');

    // IMMEDIATELY after — must be true without any awaits
    expect(fired).toBe(true);

    sub.dispose();
    sheet.dispose();
  });
});
