/**
 * Strict Command Pattern Contracts
 * 
 * Prevents command payload drift by enforcing typed, minimal payloads.
 * 
 * Anti-pattern (what we're avoiding):
 * ```ts
 * execute({ type: "border", payload: {...}, meta: {...}, flags: {...} })
 * ```
 * 
 * Correct pattern (strict + minimal):
 * ```ts
 * interface Command<TPayload> {
 *   execute(payload: TPayload, selection: SelectionState): void;
 * }
 * ```
 */

import type { SelectionState } from "./types";

/**
 * Base command interface
 * All UI commands MUST implement this with specific payload types
 */
export interface Command<TPayload> {
  /**
   * Execute command with typed payload
   * @param payload - Strongly typed command-specific data
   * @param selection - Current selection state
   */
  execute(payload: TPayload, selection: SelectionState): void;
}

/**
 * Font color command (simple string payload)
 */
export type FontColorPayload = string;

export interface FontColorCommand extends Command<FontColorPayload> {
  execute(color: string, selection: SelectionState): void;
}

/**
 * Fill color command (structured Fill object)
 */
export interface FillPayload {
  type: "solid" | "pattern" | "gradient";
  color?: string;
  pattern?: {
    type: string;
    foreground: string;
    background: string;
  };
  gradient?: {
    stops: Array<{ color: string; position: number }>;
    direction: string;
  };
}

export interface FillColorCommand extends Command<FillPayload> {
  execute(fill: FillPayload, selection: SelectionState): void;
}

/**
 * Border command (multi-operation payload)
 * Strict structure: array of edge operations, NOT arbitrary blobs
 */
export interface BorderOperation {
  style: string;
  color: string;
  position: "top" | "bottom" | "left" | "right" | "all" | "outer" | "inner" | "horizontal" | "vertical" | "clear";
}

export interface BorderPayload {
  operations: BorderOperation[];
}

export interface BorderCommand extends Command<BorderPayload> {
  execute(payload: BorderPayload, selection: SelectionState): void;
}

/**
 * Alignment command (compound state payload)
 * Tests command pattern with mutually exclusive + compound states
 */
export interface AlignmentPayload {
  horizontal?: "left" | "center" | "right" | "justify";
  vertical?: "top" | "middle" | "bottom";
  wrap?: boolean;
  indent?: number;
}

export interface AlignmentCommand extends Command<AlignmentPayload> {
  execute(payload: AlignmentPayload, selection: SelectionState): void;
}

/**
 * Type guard: Check if command implements Command<T>
 */
export function isCommand<T>(cmd: unknown): cmd is Command<T> {
  return (
    typeof cmd === "object" &&
    cmd !== null &&
    "execute" in cmd &&
    typeof (cmd as Command<T>).execute === "function"
  );
}

/**
 * Validation: Ensure payload is not empty/undefined
 */
export function validatePayload<T>(payload: T): asserts payload is NonNullable<T> {
  if (payload === null || payload === undefined) {
    throw new Error("Command payload cannot be null or undefined");
  }
}

/**
 * Enforcement: Commands MUST NOT mutate selection directly
 * They execute via CommandManager which handles undo/redo
 */
export interface CommandExecutionContext {
  commandManager: {
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): void;
    redo(): void;
    execute(command: Command<unknown>): void;
  };
  selection: SelectionState;
}

/**
 * Pattern: All commands go through CommandManager, never direct mutation
 * 
 * ✅ Correct:
 * ```ts
 * commandManager.execute(new SetAlignmentCommand(payload));
 * ```
 * 
 * ❌ Wrong:
 * ```ts
 * selection.alignment = payload; // Direct mutation breaks undo
 * ```
 */
