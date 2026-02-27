/**
 * fuzz-undo-redo.test.ts — Phase 12: Determinism Hardening
 *
 * P6: Walk with snapshot injection
 *     Every 10 steps, encode/restore snapshot and verify state is unchanged;
 *     then continue the walk.  Invariants across undo/redo/apply operations.
 *
 * P7: Deterministic replay
 *     Two independent executions with the same PRNG seed must produce
 *     identical final states.
 */

import {
  FUZZ,
  mulberry32,
  randInt,
  runFuzzTrials,
  captureState,
  statesEqual,
  generatePatch,
  generatePatchNonDestructive,
  makeEngine,
  Worksheet,
  PatchOps,
  applyPatch,
  PatchUndoStack,
  invertPatch,
} from './fuzz-harness';
import { snapshotCodec } from '../../src/persistence/SnapshotCodec';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode ArrayBuffer → WorksheetState via a temporary Worksheet. */
function decodeState(buf: ArrayBuffer): WorksheetState {
  const ws = new Worksheet('dec');
  ws.applySnapshot(snapshotCodec.decode(new Uint8Array(buf)));
  return captureState(ws);
}

import type { WorksheetState } from './fuzz-harness';

// ---------------------------------------------------------------------------
// P6 — Walk with Snapshot Injection
// ---------------------------------------------------------------------------

describe(`P6 — undo/redo walk with snapshot injection (${FUZZ.P6_WALKS} walks × ${FUZZ.P6_STEPS} steps)`, () => {
  /**
   * Each walk:
   *  1. Create engine + PatchUndoStack.
   *  2. Maintain a local Worksheet mirror (`localWs`) in sync with the proxy.
   *  3. Each step: randomly apply, undo, or redo.
   *     - apply: generatePatch(rng, localWs) — advances localWs AND returns the patch.
   *              Then applyAndRecord(patch) on stack.
   *     - undo:  stack.undo() → apply the inverse that was actually used (from redoHistory)
   *              to localWs to keep it in sync.
   *     - redo:  stack.redo() → re-apply the forward patch from undoHistory to localWs.
   *  4. Every 10th step (snapshot injection):
   *     a. proxy.snapshot() → decode → verify state == captureState(localWs).
   *     b. Re-encode decoded snapshot → proxy.applySnapshot (roundtrip).
   *     c. proxy.snapshot() again → verify state still == localWs (applySnapshot idempotent).
   *     d. stack.clear() — checkpoint.
   *     e. Reset localWs from decoded snapshot.
   */
  it('invariants hold across apply/undo/redo with periodic snapshot injection', async () => {
    const base = 0xf0055eed;

    for (let walkIdx = 0; walkIdx < FUZZ.P6_WALKS; walkIdx++) {
      const rng = mulberry32(base + walkIdx * 1_000_003);
      const { proxy } = makeEngine(`P6w${walkIdx}`);
      const stack = new PatchUndoStack(proxy);

      // Local worksheet mirror (source of truth for before-values in generatePatch)
      let localWs = new Worksheet('local');

      for (let step = 0; step < FUZZ.P6_STEPS; step++) {
        // ── Snapshot injection every 10th step ────────────────────────────
        if (step > 0 && step % 10 === 9) {
          const buf1 = await proxy.snapshot();
          // Decode immediately before the buffer is consumed
          const decoded = snapshotCodec.decode(new Uint8Array(buf1.slice(0)));
          const snapWs  = new Worksheet('s');
          snapWs.applySnapshot(decoded);
          const snapState1 = captureState(snapWs);
          const localState = captureState(localWs);

          // (a) proxy state must match localWs mirror
          const r1 = statesEqual(localState, snapState1);
          if (!r1.equal) {
            throw new Error(
              `P6 walk ${walkIdx} step ${step}: proxy vs local mirror: ${r1.diff}`,
            );
          }

          // (b) re-encode → applySnapshot to proxy (round-trip test)
          const reEncoded = snapshotCodec.encode(decoded);
          await proxy.applySnapshot(reEncoded.buffer as ArrayBuffer);

          // (c) take snapshot again — must still match
          const buf2      = await proxy.snapshot();
          const snapState2 = decodeState(buf2);
          const r2 = statesEqual(snapState1, snapState2);
          if (!r2.equal) {
            throw new Error(
              `P6 walk ${walkIdx} step ${step}: applySnapshot idempotent: ${r2.diff}`,
            );
          }

          // (d) checkpoint — clear undo stack, reset localWs from snapshot
          stack.clear();
          localWs = new Worksheet('local');
          localWs.applySnapshot(snapshotCodec.decode(new Uint8Array(buf2.slice(0))));
          continue;
        }

        // ── Stochastic operation ──────────────────────────────────────────
        const roll = rng();

        if (roll < 0.5 || !stack.canUndo) {
          // Apply a new patch (non-destructive: no mergeCells so undo restores fully)
          const p = generatePatchNonDestructive(rng, localWs); // advances localWs
          await stack.applyAndRecord(p);

          // canUndo/canRedo consistency
          expect(stack.canUndo).toBe(stack.undoCount > 0);
          expect(stack.canRedo).toBe(stack.redoCount > 0);

        } else if (roll < 0.75 && stack.canUndo) {
          // Undo
          await stack.undo();
          // Sync localWs: apply the inverse that was actually used
          const redoEntry = stack.redoHistory[stack.redoHistory.length - 1];
          if (redoEntry) {
            applyPatch(localWs, redoEntry.inverse);
          }

          expect(stack.canUndo).toBe(stack.undoCount > 0);
          expect(stack.canRedo).toBe(stack.redoCount > 0);
          expect(stack.canRedo).toBe(true); // we just undid something

        } else if (stack.canRedo) {
          // Redo
          await stack.redo();
          const undoEntry = stack.undoHistory[stack.undoHistory.length - 1];
          if (undoEntry) {
            applyPatch(localWs, undoEntry.forward);
          }

          expect(stack.canUndo).toBe(true); // we just redid something
          expect(stack.canUndo).toBe(stack.undoCount > 0);
          expect(stack.canRedo).toBe(stack.redoCount > 0);

        } else {
          // Fallback: apply new patch (non-destructive)
          const p = generatePatchNonDestructive(rng, localWs);
          await stack.applyAndRecord(p);
        }
      }
    }
  });

  it('full undo sequence restores initial state', async () => {
    const rng = mulberry32(0xba5e5eed);

    for (let trial = 0; trial < FUZZ.P6_WALKS; trial++) {
      const { proxy } = makeEngine(`P6full${trial}`);
      const stack = new PatchUndoStack(proxy);

      // Capture initial (empty) state
      const initialBuf = await proxy.snapshot();
      const initialState = decodeState(initialBuf);

      // Apply N random patches — use NonDestructive variant so that
      // PatchUndoStack.undo() (which uses recordingApplyPatch inverse) can
      // restore the exact pre-patch state.  mergeCells is excluded because
      // it permanently deletes non-anchor cell data, making undo incomplete.
      const localWs = new Worksheet('local');
      const applyCount = randInt(rng, 3, Math.min(15, FUZZ.P6_STEPS));
      for (let i = 0; i < applyCount; i++) {
        const p = generatePatchNonDestructive(rng, localWs);
        await stack.applyAndRecord(p);
      }

      // Undo them all
      while (stack.canUndo) {
        await stack.undo();
      }

      // Verify proxy state matches initial state
      const finalBuf = await proxy.snapshot();
      const finalState = decodeState(finalBuf);
      const r = statesEqual(initialState, finalState);
      if (!r.equal) {
        throw new Error(`P6 full-undo trial ${trial}: ${r.diff}`);
      }

      expect(stack.canUndo).toBe(false);
      expect(stack.canRedo).toBe(true);
    }
  });

  it('undo then redo restores pre-undo state', async () => {
    /**
     * After N applies and 1 undo, redo must restore the state that existed
     * immediately before the undo.
     */
    const rng = mulberry32(0xdeadbeef);
    const trials = Math.floor(FUZZ.P6_WALKS * 2);

    for (let trial = 0; trial < trials; trial++) {
      const { proxy } = makeEngine(`P6ur${trial}`);
      const stack = new PatchUndoStack(proxy);
      const localWs = new Worksheet('local');

      // Apply 2–5 patches
      const n = randInt(rng, 2, 5);
      for (let i = 0; i < n; i++) {
        const p = generatePatch(rng, localWs);
        await stack.applyAndRecord(p);
      }

      // Capture state after N applies
      const beforeUndoBuf = await proxy.snapshot();
      const beforeUndoState = decodeState(beforeUndoBuf);

      // Undo one
      await stack.undo();
      // Redo it
      await stack.redo();

      // State must match what it was before the undo
      const afterRedoBuf = await proxy.snapshot();
      const afterRedoState = decodeState(afterRedoBuf);

      const r = statesEqual(beforeUndoState, afterRedoState);
      if (!r.equal) {
        throw new Error(`P6 undo/redo pair trial ${trial}: ${r.diff}`);
      }
    }
  });

  it('new apply after undo clears redo stack', async () => {
    const { proxy } = makeEngine('P6-redo-clear');
    const stack = new PatchUndoStack(proxy);
    const localWs = new Worksheet('local');

    // Apply 3 patches
    for (let i = 0; i < 3; i++) {
      const rng = mulberry32(0xca11 + i);
      const p = generatePatch(rng, localWs);
      await stack.applyAndRecord(p);
    }
    expect(stack.undoCount).toBe(3);

    // Undo 2
    await stack.undo();
    await stack.undo();
    expect(stack.redoCount).toBe(2);

    // Apply new patch → clears redo
    const rng2 = mulberry32(0xca1100);
    const p = generatePatch(rng2, localWs);
    await stack.applyAndRecord(p);
    expect(stack.redoCount).toBe(0);
    expect(stack.canRedo).toBe(false);
    expect(stack.undoCount).toBe(2); // 1 original + 1 new
  });

  it('maxSize eviction: oldest entry is dropped at limit', async () => {
    const { proxy } = makeEngine('P6-max');
    const stack = new PatchUndoStack(proxy, { maxSize: 5 });
    const localWs = new Worksheet('local');

    // Push 7 entries
    for (let i = 0; i < 7; i++) {
      const rng = mulberry32(0xee + i * 97);
      const p = generatePatch(rng, localWs);
      await stack.applyAndRecord(p);
    }

    // Only last 5 should be retained
    expect(stack.undoCount).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// P7 — Deterministic Replay
// ---------------------------------------------------------------------------

describe(`P7 — deterministic replay (${FUZZ.P7_TRIALS} trials)`, () => {
  /**
   * Property: applyPatch is a pure deterministic function.
   *
   * For any seed S, generating a patch sequence and applying it to ws1
   * must produce the same final state as generating the SAME sequence
   * (same seed) and applying it to ws2.
   *
   * This proves that:
   *   - Patch generation is purely input-driven (no hidden entropy)
   *   - applyPatch has no hidden side effects
   *   - The system is reproducible (useful for crash replay)
   */
  it('same seed → same final state across independent executions', () => {
    runFuzzTrials(FUZZ.P7_TRIALS, (rng) => {
      // Capture the seed for generating patches (use first rng output as seed2)
      const seed2 = Math.floor(rng() * 0xffffffff);

      // --- Execution 1 ---
      const ws1 = new Worksheet('P7a');
      const rng1 = mulberry32(seed2);
      const n = randInt(rng1, 3, 12);
      const patches1: unknown[] = [];
      for (let i = 0; i < n; i++) {
        const p = generatePatch(rng1, ws1);
        patches1.push(p);
      }
      const state1 = captureState(ws1);

      // --- Execution 2 (replay) ---
      const ws2 = new Worksheet('P7b');
      const rng2 = mulberry32(seed2);
      const n2   = randInt(rng2, 3, 12); // must equal n
      for (let i = 0; i < n2; i++) {
        const p = generatePatch(rng2, ws2);
        // Replay: ws2 is advanced by generatePatch just like ws1 was
      }
      const state2 = captureState(ws2);

      const r = statesEqual(state1, state2);
      if (!r.equal) throw new Error(`P7 determinism: ${r.diff}`);
    });
  });

  it('recording then replaying a patch sequence on a fresh worksheet is identical', () => {
    /**
     * Phase 1: record patches by applying them to ws1 (live execution).
     * Phase 2: replay recorded patches on fresh ws2 using bare applyPatch.
     * Invariant: captureState(ws1) === captureState(ws2).
     *
     * Unlike the test above, here we explicitly separate record and replay
     * phases using pre-recorded WorksheetPatch objects.
     */
    runFuzzTrials(FUZZ.P7_TRIALS, (rng) => {
      // Phase 1: record
      const ws1 = new Worksheet('P7rec');
      const patchCount = randInt(rng, 2, 10);
      const recorded: ReturnType<typeof generatePatch>[] = [];
      for (let i = 0; i < patchCount; i++) {
        const p = generatePatch(rng, ws1);
        recorded.push(p);
      }

      // Phase 2: replay on fresh ws2
      const ws2 = new Worksheet('P7rep');
      for (const p of recorded) {
        applyPatch(ws2, p);
      }

      const r = statesEqual(captureState(ws1), captureState(ws2));
      if (!r.equal) throw new Error(`P7 record/replay: ${r.diff}`);
    });
  });

  it('invertPatch chain: apply→invert→apply-inverse restores original state', () => {
    /**
     * For any patch P with before-values captured from the actual worksheet:
     *   apply(ws, P) advances ws → S_after
     *   apply(ws, invertPatch(P)) restores ws → S_before
     *
     * This is the foundational identity: InvertPatch·Patch = Identity.
     *
     * NOTE: Only non-destructive ops (setCellValue, visibility) are tested.
     * mergeCells permanently deletes non-anchor cell data and therefore
     * cannot be covered by this property — it is tested separately in
     * fuzz-patch-algebra.test.ts#P1 (merge state only, not cell values).
     */
    runFuzzTrials(FUZZ.P7_TRIALS, (rng) => {
      const ws = new Worksheet('P7inv');

      // Build up some state first
      const setup = randInt(rng, 0, 5);
      for (let i = 0; i < setup; i++) generatePatchNonDestructive(rng, ws);

      // Capture state before patch
      const beforeState = captureState(ws);

      // Apply a non-destructive patch (generatePatchNonDestructive advances ws)
      const p = generatePatchNonDestructive(rng, ws);
      const inv = invertPatch(p);

      // Apply inverse
      applyPatch(ws, inv);
      const afterInvState = captureState(ws);

      const r = statesEqual(beforeState, afterInvState);
      if (!r.equal) throw new Error(`P7 invertPatch: ${r.diff}`);
    });
  });

  it('proxy replay: sequential applyPatch calls produce same state as batch via worker', async () => {
    /**
     * Replay patches through the WorkerEngineProxy and compare against
     * a direct-Worksheet replay.  Proves the worker adds no hidden state.
     */
    const rng = mulberry32(0xb16b00b5);
    const trials = Math.floor(FUZZ.P7_TRIALS / 5);

    for (let trial = 0; trial < trials; trial++) {
      // Direct Worksheet path
      const ws = new Worksheet('P7direct');
      const patchCount = randInt(rng, 2, 8);
      const recorded: ReturnType<typeof generatePatch>[] = [];
      for (let i = 0; i < patchCount; i++) {
        recorded.push(generatePatch(rng, ws));
      }
      const directState = captureState(ws);

      // Worker proxy path
      const { proxy } = makeEngine(`P7proxy${trial}`);
      for (const p of recorded) {
        await proxy.applyPatch(p);
      }
      const proxyBuf = await proxy.snapshot();
      const proxyState = decodeState(proxyBuf);

      const r = statesEqual(directState, proxyState);
      if (!r.equal) {
        throw new Error(`P7 proxy-replay trial ${trial}: ${r.diff}`);
      }
    }
  });

  it('crash replay: snapshot at step K replays remaining steps correctly', async () => {
    /**
     * Simulates a crash scenario:
     *   1. Apply K patches → take snapshot S_K.
     *   2. Apply M more patches → final state S_K+M.
     *   3. "Crash": restore S_K from snapshot.
     *   4. Replay the same M patches.
     *   5. Final state must equal S_K+M.
     */
    runFuzzTrials(Math.floor(FUZZ.P7_TRIALS / 4), (rng) => {
      const ws = new Worksheet('P7crash');

      // Phase 1: apply K patches
      const k = randInt(rng, 2, 6);
      for (let i = 0; i < k; i++) generatePatch(rng, ws);

      // Snapshot at K
      const snapK = snapshotCodec.encode(ws.extractSnapshot());

      // Phase 2: apply M more patches, record them
      const m = randInt(rng, 2, 6);
      const tailPatches: ReturnType<typeof generatePatch>[] = [];
      for (let i = 0; i < m; i++) {
        tailPatches.push(generatePatch(rng, ws));
      }
      const expectedState = captureState(ws);

      // Phase 3: "crash" — restore snapshot
      const ws2 = new Worksheet('P7crash-r');
      ws2.applySnapshot(snapshotCodec.decode(snapK));

      // Phase 4: replay tail patches
      for (const p of tailPatches) {
        applyPatch(ws2, p);
      }

      const actualState = captureState(ws2);
      const r = statesEqual(expectedState, actualState);
      if (!r.equal) throw new Error(`P7 crash-replay: ${r.diff}`);
    });
  });
});
