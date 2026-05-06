# Chaos Testing Protocol

**Status**: Auto-diagnosis system complete ✅ | **Ready for systematic validation** ⏳

---

## 🚨 Critical Upgrade: Failure Classification System

**What Changed**: Chaos testing is no longer just noise generation.

### ✅ Now Includes:

1. **Failure Taxonomy** - 7 classified types (context-mismatch, missed-shortcut, double-execution, etc.)
2. **Auto-Diagnosis Engine** - Automatic root cause hypothesis for every failure
3. **Severity Scoring** - 1-5 scale (prevents drowning in low-priority warnings)
4. **Diagnostic Reporter** - Actionable reports (critical failures first)

### 🎯 This Transforms:

**Before**: "Mismatch at event 42: context: expected 'grid', got 'cell-edit'"  
**After**: 
```
🔴 [context-mismatch] Event #42 (Severity: 5)
  Expected context "grid", got "cell-edit"
  💡 Hypothesis: ContextResolver reading stale DOM state or focus event not propagated
```

---

## 🧪 Usage Example

```ts
import { 
  shortcutEventRecorder, 
  diagnostics 
} from '@cyber-sheet/react/components/ribbon';

// Record sequence
shortcutEventRecorder.startRecording('context-switch-test');
// ... user interactions ...
const sequence = shortcutEventRecorder.stopRecording();

// Analyze with auto-diagnosis
const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);
diagnostics.printSequenceAnalysis(analysis);

// Output:
// 🔴 CRITICAL FAILURES:
// [context-mismatch] Event #5
//   Rapid context transition: grid → cell-edit in 45ms
//   💡 Hypothesis: Focus event or DOM mutation during keypress handling
// 
// 🧠 Root Cause Clusters:
//   [3x] Focus event or DOM mutation during keypress handling
//       Types: context-mismatch
```

---

## 🧪 Chaos Testing Procedure (Refined with Auto-Diagnosis)

**Critical**: Now structured with failure classification, not just observation

---

### Phase 1: Baseline Stability (NO Stress - Prove Basics First)

**Goal**: Verify 100% determinism under normal usage

**IF THIS FAILS → STOP IMMEDIATELY**

#### Steps:

1. Record 10 normal shortcut sequences:
   ```ts
   shortcutEventRecorder.startRecording('baseline-1-bold');
   // Press Ctrl+B on selected cell
   const seq1 = shortcutEventRecorder.stopRecording();
   
   shortcutEventRecorder.startRecording('baseline-2-undo');
   // Press Ctrl+Z after edit
   const seq2 = shortcutEventRecorder.stopRecording();
   
   // ... 8 more normal sequences ...
   ```

2. Replay each with frame-locked timing:
   ```ts
   for (const sequence of sequences) {
     const result = await shortcutEventRecorder.replay(sequence, {
       timingMode: 'frame-locked',
       waitForCommit: true,
     });
     
     diagnostics.printReplayResult(result);
     
     if (!result.passed) {
       console.error('BASELINE FAILED - Fix before continuing');
       break;
     }
   }
   ```

**Expected Results**:
- ✅ 100% match (10/10 sequences)
- ✅ Zero failures (critical or otherwise)
- ✅ Avg execution time <5ms

**If Baseline Fails**:
- 🚨 **Architecture issue** (not interaction entropy)
- Fix immediately before stress testing
- Re-run baseline until clean

---

### Phase 2: Context Shock Tests (Rapid Transitions)

**Goal**: Find context resolution edge cases

#### Test Patterns:

**A. Grid → Edit → Grid (Rapid ESC)**

**Steps**:
1. Enable recording and overlay:
   ```ts
   shortcutRegistry.setRecordingEnabled(true);
   shortcutEventRecorder.startRecording('context-shock-esc');
   ```
   ```tsx
   <KeyboardContextOverlay enabled={true} position="bottom-right" />
   ```

2. Perform rapid sequence (10 cycles):
   - Click cell (grid context)
   - Double-click cell (cell-edit context)
   - Press ESC quickly (<100ms)
   - Verify overlay shows context correctly

3. Stop and analyze with auto-diagnosis:
   ```ts
   const sequence = shortcutEventRecorder.stopRecording();
   const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);
   
   diagnostics.printSequenceAnalysis(analysis);
   ```

**Expected Results**:
- ✅ Zero critical failures
- ✅ Context transitions detected but classified correctly
- ⚠️ May show medium-severity timing warnings (acceptable)

**Predicted Failures** (Your List):
1. 🔴 **ESC context edge case** - dialog + dropdown overlap, wrong unlock order
   - Type: `context-mismatch`
   - Severity: 5 (critical)
   - Hypothesis: "Context lock not released during modal transition"

**Red Flags**:
- ❌ Context flip <100ms classified as critical `context-mismatch`
- ❌ Stale state reads during ESC transition
- ❌ Handler overlap (ESC firing in multiple contexts)

---

### Phase 3: Event Collision Stress (Key Spam + State Changes)

**Goal**: Detect double-execution and stale selection

#### Test Patterns:

**A. Ctrl+B Spam During Selection Changes**

**Steps**:
1. Start recording:
   ```ts
   shortcutEventRecorder.startRecording('ctrl-b-spam-stress');
   ```

2. Rapidly press Ctrl+B 20 times while:
   - Selection is stable (baseline)
   - Arrow keys pressed between Ctrl+B presses
   - During edit mode entry/exit

3. Analyze for double-execution:
   ```ts
   const sequence = shortcutEventRecorder.stopRecording();
   const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);
   
   diagnostics.printSequenceAnalysis(analysis);
   
   // Check for specific failure type
   const doubleExecs = analysis.failures.filter(
     f => f.type === 'double-execution'
   );
   console.log('Double executions:', doubleExecs.length);
   ```

**Expected Results**:
- ✅ Every Ctrl+B triggers exactly ONE handler
- ✅ Zero `double-execution` failures
- ✅ Avg execution time <5ms

**Predicted Failures**:
2. 🔴 **Stale selection after Ctrl+Z** - Selection state read before React commit
   - Type: `stale-selection`
   - Severity: 3 (medium)
   - Hypothesis: "Command didn't trigger update or state read too early"

**Red Flags**:
- ❌ `double-execution` detected (<50ms between same shortcut)
- ❌ Execution time >10ms (performance degradation)
- ❌ `missed-shortcut` (some Ctrl+B presses not executed)

---

**Steps**:
1. Start recording:
   ```ts
   shortcutEventRecorder.startRecording('focus-hijack-stress');
   ```

2. Sequence:
   - Select cell in grid
   - Click browser address bar (focus leaves)
   - Click back into spreadsheet quickly
   - Immediately press Ctrl+B
   - Check if shortcut fires correctly

3. Verify context resolution:
   ```ts
   const sequence = shortcutEventRecorder.stopRecording();
   const lastEvent = sequence.events[sequence.events.length - 1];
   
   console.log('Context after focus return:', lastEvent.contextAtPress);
   console.log('Shortcut executed:', lastEvent.executed);
   ```

**Expected Results**:
- ✅ Context correct after focus return
- ✅ Shortcut fires in correct context
- ✅ No context lock stuck from previous state

**Red Flags**:
- ❌ Wrong context after focus return
- ❌ Context lock stuck (contextLocked=true when shouldn't be)
- ❌ Shortcut fires in wrong layer

---

### Phase 4: Replay Validation (Determinism Proof)

**Goal**: Prove same inputs → same outputs (no hidden dependencies)

#### Steps:

1. Export Phase 2-3 sequences as fixtures:
   ```ts
   const json = shortcutEventRecorder.exportSequence(sequence.id);
   fs.writeFileSync('test-fixtures/context-shock-esc.json', json);
   ```

2. Replay with frame-locked timing:
   ```ts
   const json = fs.readFileSync('test-fixtures/context-shock-esc.json', 'utf-8');
   const sequence = shortcutEventRecorder.importSequence(json);
   
   const result = await shortcutEventRecorder.replay(sequence, {
     timingMode: 'frame-locked',
     waitForCommit: true,
     abortOnMismatch: false,
   });
   
   diagnostics.printReplayResult(result);
   ```

**Expected Results**:
- ✅ 100% match (deterministic)
- ✅ No context drift over replay
- ✅ State changes identical
- ✅ Zero critical failures in replay

**Predicted Failures**:
3. 🔴 **Focus return context wrong** - Context not re-resolved after focus event
   - Type: `wrong-context-route`
   - Severity: 4 (high)
   - Hypothesis: "ContextResolver cached stale focus target"

**Red Flags**:
- ❌ Mismatches detected (non-deterministic behavior)
- ❌ Context differs between runs
- ❌ New failures appear in replay (timing-dependent bugs)

---

## 📊 Failure Classification Reference

### 🔴 Critical (Severity 4-5) - Fix First

| Type                 | Severity | Meaning                                        |
| -------------------- | -------- | ---------------------------------------------- |
| `context-mismatch`   | 5        | Shortcut fired in wrong interaction layer      |
| `missed-shortcut`    | 5        | Expected shortcut didn't execute               |
| `double-execution`   | 4        | Handler fired multiple times for single event  |
| `wrong-context-route`| 4        | Context resolved incorrectly from DOM          |

### 🟡 Medium (Severity 3) - Fix After Critical

| Type                 | Severity | Meaning                                        |
| -------------------- | -------- | ---------------------------------------------- |
| `ui-state-desync`    | 3        | UI state \u2260 keyboard state after handler      |
| `stale-selection`    | 3        | Selection state read before React commit       |

### 🟢 Low (Severity 1-2) - Monitor, Fix if Recurring

| Type                 | Severity | Meaning                                        |
| -------------------- | -------- | ---------------------------------------------- |
| `timing-drift`       | 2        | Event timing deviated from expected            |

---

## 🧠 Root Cause Clusters (Automated Grouping)

The auto-diagnosis engine clusters failures by hypothesis:

```ts
const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);

console.log(analysis.rootCauseClusters);
// Output:
// [
//   { 
//     hypothesis: "ContextResolver reading stale DOM state", 
//     count: 5,
//     failureTypes: ["context-mismatch", "wrong-context-route"]
//   },
//   {
//     hypothesis: "React batching delay",
//     count: 2,
//     failureTypes: ["ui-state-desync", "stale-selection"]
//   }
// ]
```

**This guides priority**:
- Fix "ContextResolver reading stale DOM" → eliminates 5 failures at once
- Fix "React batching delay" → eliminates 2 failures

---

## 🎯 Critical Success Metrics

| Metric                      | Target         | Phase 1 | Phase 2-3 |
| --------------------------- | -------------- | ------- | --------- |
| **Baseline determinism**    | 100% match     | ⏳ Test  | N/A       |
| **Critical failures**       | 0              | ⏳ Test  | ⏳ Test    |
| **Context correctness**     | 100% accurate  | ⏳ Test  | ⏳ Test    |
| **Double-execution**        | 0 occurrences  | ⏳ Test  | ⏳ Test    |
| **Avg execution time**      | <5ms           | ⏳ Test  | ⏳ Test    |
| **Replay determinism**      | 100% match     | N/A     | ⏳ Test    |

---

## 🚀 After Validation Complete

### IF Phase 1 + 2 Pass (Zero Critical Failures):

✅ **Implement Grow/Shrink Font** (Ctrl+Shift+[>/<])

**Why This Order**:
- Grow/Shrink Font tests Command + UI + Keyboard integration
- Uses Ctrl+Shift combos (collision risk validation)
- Triggers formatting pipeline (state update validation)
- Low complexity, high validation value
- Becomes final integration proof

### IF Critical Failures Found:

⚠️ **Fix Root Causes** (not symptoms)

**Example Fix Priority**:
1. Fix "ContextResolver reading stale DOM" (eliminates 5 failures)
2. Fix "React batching delay" (eliminates 2 failures)
3. Re-run Phase 1-2 until clean

---

## 🧠 Engineering Truth

You've now built:

> **A self-analyzing interaction engine**, not a feature-driven UI

**Before**: "Does this feature work?"

**After**: "Does this system behave deterministically under entropy?"

That's the transition from:

> ❌ "Well-engineered React app"  
> ✅ "Production-grade spreadsheet interaction engine"

---

##dashboard Commands Quick Reference

### Enable Recording:
```ts
shortcutRegistry.setRecordingEnabled(true);
```

### Start Session:
```ts
shortcutEventRecorder.startRecording('test-name');
```

### Stop and Diagnose:
```ts
const sequence = shortcutEventRecorder.stopRecording();
const analysis = shortcutEventRecorder.analyzeSequence(sequence.id);
diagnostics.printSequenceAnalysis(analysis);
```

### Replay with Diagnosis:
```ts
const result = await shortcutEventRecorder.replay(sequence, {
  timingMode: 'frame-locked',
  waitForCommit: true,
});
diagnostics.printReplayResult(result);
```

### Export Report:
```ts
const markdown = diagnostics.exportDiagnosticReport(analysis, 'Phase 2 Results');
fs.writeFileSync('reports/phase2-analysis.md', markdown);
```

---

**System Status**: Auto-diagnosis complete ✅ | **Systematic validation ready** ⏳

**Next**: Phase 1 baseline stability testing (10 normal sequences)
