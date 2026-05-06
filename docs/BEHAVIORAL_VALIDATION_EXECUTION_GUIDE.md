# 🎯 BEHAVIORAL VALIDATION — EXECUTION GUIDE

**Status**: Test infrastructure deployed ✅  
**Next**: Run tests, extract failures, fix root causes

---

## 🚨 Critical Reality

You're **DONE building infrastructure**.

If you keep adding systems now, you'll regress.

The only correct move: **Run tests → Extract failures → Fix root causes**

---

## ⚡ Quick Start (5 minutes)

### Option 1: Visual Test Runner (Recommended for first run)

Open the interactive test interface:

```bash
npm run dev
# Open: http://localhost:5173/examples/behavioral-test-runner.html
```

**What you'll see:**
- ✅ Live context overlay (shows current interaction mode)
- ✅ Phase 1 & Phase 2 test cards (click to run)
- ✅ Real-time metrics (critical/medium/low failures)
- ✅ Failure detection as it happens

---

### Option 2: CLI Test Runner (Automated)

Run all tests from terminal:

```bash
npm run test:behavioral           # Run all (Phase 1 → Phase 2)
npm run test:behavioral:phase1    # Phase 1 only
npm run test:behavioral:phase2    # Phase 2 only (requires Phase 1 pass)
npm run test:behavioral:export    # Generate JSON report
```

**What to look for:**

```
❌ PHASE 1 FAILED
Found 3 critical failures
FIX THESE BEFORE RUNNING PHASE 2
```

**If you see this**: STOP. Fix those first.

---

## 📋 Phase 1: Baseline Stability (MUST PASS)

**Goal**: Verify deterministic behavior under normal usage

### Tests:

| Test | What It Validates | If It Fails |
|------|-------------------|-------------|
| **Ctrl+B** | Bold toggle | Core shortcut broken |
| **Ctrl+Z** | Undo | State mutation bug |
| **Ctrl+Y** | Redo | Undo/redo asymmetry |
| **Enter** | Confirm edit | Context transition bug |
| **ESC** | Cancel edit | State rollback bug |

### Success Criteria:

- ✅ **0 critical failures (severity 4-5)**
- ✅ **≤ 2 medium failures (understood root cause)**
- ✅ **No duplicate executions**
- ✅ **No missed shortcuts**

### If Anything Fails:

> **This is NOT a chaos bug. This is a core correctness bug.**

Stop immediately. Don't proceed to Phase 2.

---

## 🔥 Phase 2: Context Shock Testing (ONLY AFTER PHASE 1 PASSES)

**Goal**: Stress the system where it *actually* breaks

### Tests:

| Test | Scenario | Expected Failure Types |
|------|----------|----------------------|
| **Rapid Context** | Grid → Edit → Ribbon → Dialog (< 300ms) | `context-mismatch`, `wrong-context-route` |
| **ESC Edge** | Dropdown → Dialog → ESC spam | `context-mismatch`, `stale-selection` |
| **Undo Selection** | Selection change → Ctrl+Z immediately | `stale-selection`, `ui-state-desync` |
| **Focus Bounce** | Ribbon → Ctrl+B → Grid → Ctrl+B (fast) | `wrong-context-route`, `double-execution` |

### Expected Failures (Don't Panic):

#### 1. Context Mismatch (Severity 5) ⚠️

```
[context-mismatch] Event #3
  Shortcut fired in wrong context
  💡 Hypothesis: ContextResolver reading stale DOM
```

**Fix**: Context locking / release timing

---

#### 2. Stale Selection (Severity 3) ⚠️

```
[stale-selection] Event #7
  Selection state read before React commit
  💡 Hypothesis: Snapshot timing vs React batching
```

**Fix**: Wait for React commit before snapshot

---

#### 3. Double Execution (Severity 4) ⚠️

```
[double-execution] Event #2
  Shortcut fired twice within 18ms
  💡 Hypothesis: Keyboard repeat not blocked
```

**Fix**: Debounce or key repeat guard

---

#### 4. Wrong Context Route (Severity 4) ⚠️

```
[wrong-context-route] Event #5
  Context resolved incorrectly from DOM
  💡 Hypothesis: ContextResolver priority / boundary leak
```

**Fix**: Tighten DOM traversal boundaries

---

## 🧠 Using the Diagnostic Engine

Your system has **built-in failure analysis**. Use it.

### In Code (React Component):

```tsx
import {
  shortcutEventRecorder,
  printSequenceAnalysis,
  exportDiagnosticReport,
} from '@cyber-sheet/react/components/ribbon';

// Start recording
shortcutEventRecorder.startRecording('my-test');

// ... user performs actions ...

// Stop and analyze
const sequence = shortcutEventRecorder.stopRecording();
const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);

// Print to console
printSequenceAnalysis(analysis);

// Check critical failures
if (analysis.severitySummary.critical > 0) {
  console.error('🔴 CRITICAL FAILURES DETECTED');
  console.log('Root causes:', analysis.rootCauseClusters);
}

// Export for sharing
const report = exportDiagnosticReport(analysis, 'Phase 1 Results');
```

---

### What the Analyzer Detects:

✅ **Context flips** - Rapid transitions < 100ms (race conditions)  
✅ **Stale state reads** - State changed without execution (desync)  
✅ **Double execution** - Handler fired multiple times for single event  
✅ **Performance anomalies** - Slow handlers (> 10ms)

---

## 📊 Reading the Output

### Console Output:

```
=== SEQUENCE ANALYSIS ===
Total events: 12
Avg execution: 3.4ms
Slowest: Ctrl+B (8.2ms)

📊 Issue Detection:
  Context flips: 2
  Stale state reads: 1
  Total failures: 3

📊 Severity Breakdown:
  🔴 Critical: 1
  🟡 Medium: 2
  🟢 Low: 0

🧠 Root Cause Clusters (most frequent):
  [2x] ContextResolver reading stale DOM
      Types: context-mismatch, wrong-context-route
  [1x] React state update from another source
      Types: ui-state-desync

🔴 CRITICAL FAILURES:
  [context-mismatch] Event #5
    Expected context 'grid', got 'cell-edit'
    💡 Hypothesis: Focus event during keypress handling
```

---

## 🎯 What You're Looking For

### ❌ RED FLAGS (Fix Immediately):

- **Severity 5**: Any failure
- **Severity 4**: More than 2 occurrences
- **Same hypothesis in 3+ failures**: Root cause confirmed

### ⚠️ INVESTIGATE (If Persistent):

- **Severity 3**: More than 5 occurrences
- **Context flips > 10**: Timing issue
- **Avg execution > 10ms**: Performance problem

### ✅ IGNORE (For Now):

- **Severity 1-2**: Low priority
- **One-off failures**: Could be test artifacts
- **Performance warnings**: Unless blocking

---

## 🔧 Fixing Root Causes (Not Symptoms)

### ❌ DON'T:

```ts
// Bad: Fixing individual failures
if (key === 'b' && ctrl) {
  // Add special case for context mismatch
  if (context === 'grid' || context === 'cell-edit') {
    // ... workaround
  }
}
```

### ✅ DO:

```ts
// Good: Fix the root cause
class ContextResolver {
  resolve(target: EventTarget): InteractionContext {
    // BEFORE: Reading stale DOM
    // const mode = target.getAttribute('data-context');
    
    // AFTER: Read from live state
    const mode = this.stateManager.getCurrentContext();
    return this.normalizeContext(mode);
  }
}
```

**Rule**: If 5 failures say "ContextResolver reading stale DOM"

→ Fix: Context resolution timing  
→ NOT: 5 different handlers

---

## 🚀 Success Criteria (Strict)

You are done with this phase ONLY when:

- ✅ **0 critical failures (severity 5)**
- ✅ **≤ 2 medium failures (severity 3-4), understood root cause**
- ✅ **Replay = 100% deterministic match**
- ✅ **No new failure types after 3 runs**

---

## 📈 After Testing Complete

### If ALL tests pass:

1. ✅ Export final report:
   ```bash
   npm run test:behavioral:export
   ```

2. ✅ Commit test fixtures:
   ```bash
   git add examples/behavioral-test-runner.html
   git add scripts/run-behavioral-tests.js
   git commit -m "chore: add behavioral validation suite"
   ```

3. ✅ Move to next feature:
   - **Grow/Shrink Font** (safe, low complexity)
   - Touches command + UI + keyboard
   - Perfect integration test

---

### If tests fail:

1. 🔴 Review console output
2. 🔴 Identify root cause clusters
3. 🔴 Fix the hypothesis, not the symptom
4. 🔴 Re-run tests
5. 🔴 Repeat until 0 critical failures

**DO NOT add new features until behavior is stable.**

---

## 🧪 Test Infrastructure Files

```
examples/
  behavioral-test-runner.html          # Visual test interface
  behavioral-validation-demo.tsx       # React integration
  
scripts/
  run-behavioral-tests.js              # CLI test runner

packages/react/src/components/ribbon/keyboard/
  ShortcutEventRecorder.ts             # Core recording system
  DiagnosticReporter.ts                # Analysis + reporting
  KeyboardContextOverlay.tsx           # Live visualization
```

---

## 🎓 What This Proves

After validation passes:

1. ✅ **Context correctness** - No race conditions during transitions
2. ✅ **Single execution** - No multi-fire per event
3. ✅ **State consistency** - No UI + keyboard desync
4. ✅ **Determinism** - Same inputs → same outputs
5. ✅ **Performance** - Sub-10ms execution under load

**This is Excel-class.** Not features—**engineering rigor**.

---

## 📞 Next Steps

1. **Run first test** (choose one):
   ```bash
   npm run dev  # Visual runner
   # OR
   npm run test:behavioral:phase1  # CLI
   ```

2. **Paste one diagnostic report** in chat (if you want help triaging)

3. **Fix failures** (focus on critical first)

4. **Re-run until green**

5. **Then and only then**: Add new features

---

**System Status**: Testing infrastructure complete ✅  
**Your Move**: Run the tests and extract failures 🎯
