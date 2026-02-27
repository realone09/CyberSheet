# @cyber-sheet/core — Semantic Versioning Policy

**Version:** 0.1.0 → 1.0.0 candidate  
**Stability Gate:** API Freeze Test suite must pass with 0 failures  
**Last Updated:** February 27, 2026

---

## Table of Contents

1. [Current Status](#current-status)
2. [Version Thresholds](#version-thresholds)
3. [What Constitutes a Breaking Change](#what-constitutes-a-breaking-change)
4. [Snapshot Upgrade Path Requirements](#snapshot-upgrade-path-requirements)
5. [Patch Compatibility Decision Tree](#patch-compatibility-decision-tree)
6. [Error Contract Preservation](#error-contract-preservation)
7. [Release Checklist](#release-checklist)
8. [Pre-1.0 Exception Window](#pre-10-exception-window)

---

## Current Status

| Metric | Value |
|--------|-------|
| Package | `@cyber-sheet/core` |
| Current version | `0.1.0` |
| Stability | Pre-release (0.x) |
| API freeze test | ✅ Enforced (`api-freeze.test.ts`) |
| Snapshot version | `FORMAT_VERSION = 1` |
| Error contract | ✅ Locked (all public errors are `SdkError` subclasses) |

The SDK enters **1.0.0** when:
1. The API freeze test passes without modification for **three consecutive releases**
2. The real-world simulation scenario completes with 0 failures on the target CI machine
3. The bundle budget script reports ≤ 50 KB gzipped

---

## Version Thresholds

### PATCH release (`0.1.x` → `0.1.y`)

A patch release **MUST NOT** change any of:

- Export names from `@cyber-sheet/core/sdk`
- Error class `.name` strings
- Public method names or arities
- Snapshot `FORMAT_VERSION`
- Event type strings (`SdkEventType` union members)

A patch release **MAY**:

- Fix bugs in existing method behaviour
- Improve error messages (text only, not `.name`)
- Improve performance without changing output
- Add internal private methods that are not exported

### MINOR release (`0.x.0` → `0.y.0`)

A minor release **MUST NOT**:

- Remove any exported name
- Change any existing method's parameter types to be *narrower*
- Change a thrown error class to a different `SdkError` subclass already in use by callers
- Change the binary snapshot format without a registered upgrader

A minor release **MAY**:

- Add new exported names (functions, classes, types)
- Add optional parameters to existing methods
- Add new `SdkError` subclasses
- Add new `SdkEventType` union members (additive)
- Register a new snapshot upgrader (see below)

### MAJOR release (`x.0.0` → `y.0.0`)

A major release **MUST**:

- Provide a migration guide in `CHANGELOG.md`
- Provide snapshot upgrade paths for all `FORMAT_VERSION` values in the previous major
- Preserve the `SdkError` base class hierarchy (no flat restructure)
- Maintain backward-compatible error `.name` strings for at least one minor version (deprecation window)

---

## What Constitutes a Breaking Change

The following changes **always** require a major version bump, regardless of how "small" they seem:

### API Surface

| Change | Breaking | Required Action |
|--------|----------|-----------------|
| Remove exported name | ✅ Yes | Major bump + migration guide |
| Rename exported name | ✅ Yes | Major bump + deprecation alias |
| Remove method from `SpreadsheetSDK` interface | ✅ Yes | Major bump |
| Rename method | ✅ Yes | Major bump + deprecation shim |
| Change method return type to incompatible type | ✅ Yes | Major bump |
| Change required parameter count | ✅ Yes | Major bump |
| Add required parameter | ✅ Yes | Major bump |
| Add optional parameter | ✅ No | Minor bump |
| Narrow parameter type | ✅ Yes | Major bump (callers may pass wider values) |
| Widen parameter type | ✅ No | Minor bump |

### Error Contract

| Change | Breaking | Required Action |
|--------|----------|-----------------|
| Change `error.name` string | ✅ Yes | Major bump |
| Move error to different `SdkError` subclass | ✅ Yes (if callers use `instanceof`) | Major bump |
| Add new error subclass | ✅ No | Minor bump |
| Change error message text (not `.name`) | ✅ No | Patch |
| Remove `.cause` from error class | ✅ Yes | Major bump |

### Events

| Change | Breaking | Required Action |
|--------|----------|-----------------|
| Remove `SdkEventType` member | ✅ Yes | Major bump |
| Rename `SdkEventType` member | ✅ Yes | Major bump |
| Remove property from `SdkEvent` payload | ✅ Yes | Major bump |
| Add `SdkEventType` member | ✅ No | Minor bump |
| Add optional property to `SdkEvent` payload | ✅ No | Minor bump |

### Snapshot Binary Format

| Change | Breaking | Required Action |
|--------|----------|-----------------|
| Change `FORMAT_VERSION` without upgrader | ✅ Yes | Major bump |
| Change `FORMAT_VERSION` with upgrader registered | ✅ No | Minor bump |
| Change magic bytes | ✅ Yes | Major bump (always) |

---

## Snapshot Upgrade Path Requirements

Every time `FORMAT_VERSION` advances (e.g., from `1` to `2`), the following **must** be completed before release:

### Required Artifacts

1. **Upgrader function** registered in `SnapshotUpgraderRegistry`:

   ```typescript
   snapshotUpgraderRegistry.register({
     fromVersion: 1,
     toVersion: 2,
     upgrade: (snap: WorksheetSnapshot): WorksheetSnapshot => {
       // transform v1 → v2 fields
       return { ...snap, version: 2 };
     },
   });
   ```

2. **Unit test** verifying the upgrader in `snapshot-versioning.test.ts`

3. **End-to-end test**: encode under old version → decode under new version → assert values survive

4. **Documentation** entry in `CHANGELOG.md` under the appropriate version heading:
   - What changed in the format
   - How the upgrader transforms data
   - Any fields added/removed/renamed

### Version Chain Invariant

The registry **must** chain upgraders from any supported prior version to the current version:

```
FORMAT_VERSION 1 → 2 → 3 (current)
```

Skipping versions in the chain is prohibited. Callers must be able to restore any snapshot produced by any prior minor version.

---

## Patch Compatibility Decision Tree

When a bug fix changes observable behavior, use this tree to decide the version bump:

```
Does the fix change a thrown error class?
├── Yes → Is it adding a more specific SdkError subclass?
│   ├── Yes → MINOR bump (narrowing error type is additive)
│   └── No (changing to unrelated class) → MAJOR bump
└── No → Does the fix change a return value type?
    ├── Yes → Is the new type assignable from the old type?
    │   ├── Yes (widening) → MINOR bump
    │   └── No (narrowing or change) → MAJOR bump
    └── No → Does the fix change event payload structure?
        ├── Yes → See Events table above
        └── No → PATCH bump ✅
```

### Explicit Patch-Safe Categories

These changes are always patch-safe (no version bump required beyond patch):

- Fixing incorrect cell values when a formula/op returns wrong results
- Fixing undo/redo to restore state that was incorrectly restored
- Fixing memory leaks that do not change the observable API
- Fixing performance regressions
- Fixing snapshot encode/decode corruption (same version, same format)
- Fixing error `.message` text (not `.name`)

---

## Error Contract Preservation

The public error contract is defined by these invariants. All **must** hold across any release:

### Invariant 1 — Subclass Hierarchy Stability

Every error thrown by a public method must be an `instanceof SdkError`.

```typescript
// This must ALWAYS hold for any error thrown by any public method:
try { sheet.anyMethod(); } catch (err) {
  assert(err instanceof SdkError);   // NEVER violates
}
```

### Invariant 2 — Name String Stability

Each error class has a `.name` property that must not change:

| Class | `.name` | Since |
|-------|---------|-------|
| `SdkError` | `'SdkError'` | 0.1.0 |
| `DisposedError` | `'DisposedError'` | 0.1.0 |
| `BoundsError` | `'BoundsError'` | 0.1.0 |
| `SnapshotError` | `'SnapshotError'` | 0.1.0 |
| `MergeError` | `'MergeError'` | 0.1.0 |
| `PatchError` | `'PatchError'` | 0.1.0 |
| `PatchDeserializeError` | `'PatchDeserializeError'` | 0.1.0 |

### Invariant 3 — Cause Chain Preservation

All errors that carry a `.cause` must preserve it across releases:

- `SnapshotError` — always has `.cause` when arising from decode failure
- `MergeError` — always has `.cause` when arising from an internal conflict
- `PatchError` — always has `.cause` when arising from internal patch failure

### Invariant 4 — Method-to-Error Mapping Stability

The following method → error class mappings must not change without a major bump:

| Method | Throws | Condition |
|--------|--------|-----------|
| Any method after `dispose()` | `DisposedError` | Always |
| `setCell`, `getCell`, `getCellValue` | `BoundsError` | Out of range |
| `mergeCells`, `cancelMerge` | `MergeError` | Conflict / invalid range |
| `encodeSnapshot`, `decodeAndRestore`, `restore` | `SnapshotError` | Format/version error |
| `applyPatch`, `undo`, `redo` | `PatchError` | Internal patch failure |

---

## Release Checklist

Before tagging any release:

### Pre-release Gate

- [ ] `npx jest --testPathPattern="packages/core/__tests__/sdk" --no-coverage` → 0 failures
- [ ] `api-freeze.test.ts` passes with no snapshot updates needed
- [ ] `real-world-scenario.test.ts` completes within timing budgets
- [ ] `npm run bundle-budget` passes (≤ 50 KB gzipped)
- [ ] `git tag` reflects the version in `package.json`

### For MINOR releases additionally

- [ ] All new exports documented in `CHANGELOG.md`
- [ ] New error classes added to the name table above
- [ ] `SdkEventType` additions documented

### For MAJOR releases additionally

- [ ] Snapshot upgrader registered and tested for all prior `FORMAT_VERSION` values
- [ ] Migration guide written in `CHANGELOG.md`
- [ ] Deprecation aliases added for any renamed exports (one-release window)
- [ ] `api-freeze.test.ts` snapshot **intentionally updated** with PR description explaining why

---

## Pre-1.0 Exception Window

While the version is `0.x.x`, the following relaxed rules apply:

- Breaking changes are allowed in minor bumps (`0.1.0` → `0.2.0`)
- The `api-freeze.test.ts` snapshot may be intentionally updated with maintainer sign-off
- No deprecation window is required before removal

**The moment `1.0.0` is tagged**, all rules in this document become binding with no exceptions.

### 1.0.0 Declaration Criteria

`1.0.0` will be tagged when all of the following are true:

1. The API freeze test has passed for ≥ 3 consecutive weeks without snapshot updates
2. The real-world simulation scenario passes in < 10 seconds on a baseline CI machine
3. Bundle gzip ≤ 50 KB
4. Integration smoke tests pass for all four adapter patterns (React, Vue, Svelte, Vanilla)
5. No open issues labeled `breaking-change-candidate` in the tracker

---

*This document is part of the public contract of `@cyber-sheet/core`. Changes to this document that weaken the invariants defined here require maintainer consensus and a CHANGELOG entry.*
