/**
 * CalculationController.ts
 *
 * Controls calculation mode and recalculation triggers for formulas.
 */

// ─── Simple event emitter ───────────────────────────────────────────────────

class EventEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type CalculationMode = 'automatic' | 'automaticExceptTables' | 'manual';

export interface CalculationState {
  mode: CalculationMode;
  calculating: boolean;
  needsRecalc: boolean;
  lastRecalcTime?: number;
  lastRecalcDuration?: number;
}

type CalculationEvent =
  | 'modeChanged'
  | 'calculationStarted'
  | 'calculationCompleted'
  | 'needsRecalcChanged';

/**
 * CalculationController manages calculation mode and triggers.
 * Works with FormulaEngine to control when formulas are recalculated.
 */
export class CalculationController {
  private state: CalculationState;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.state = {
      mode: 'automatic',
      calculating: false,
      needsRecalc: false,
    };
  }

  /**
   * Get current calculation mode
   */
  getMode(): CalculationMode {
    return this.state.mode;
  }

  /**
   * Set calculation mode
   */
  setMode(mode: CalculationMode): void {
    if (this.state.mode !== mode) {
      this.state.mode = mode;
      this.eventEmitter.emit('modeChanged', mode);
      
      // If switching to automatic, trigger recalc if needed
      if (mode === 'automatic' && this.state.needsRecalc) {
        this.triggerRecalculation('all');
      }
    }
  }

  /**
   * Mark that formulas need recalculation
   */
  markNeedsRecalc(): void {
    if (!this.state.needsRecalc) {
      this.state.needsRecalc = true;
      this.eventEmitter.emit('needsRecalcChanged', true);
      
      // If in automatic mode, trigger recalc immediately
      if (this.state.mode === 'automatic') {
        this.triggerRecalculation('all');
      }
    }
  }

  /**
   * Trigger recalculation
   */
  triggerRecalculation(scope: 'all' | 'sheet'): void {
    if (this.state.calculating) {
      console.warn('Calculation already in progress');
      return;
    }

    this.state.calculating = true;
    this.eventEmitter.emit('calculationStarted', scope);

    const startTime = performance.now();

    // Simulate calculation (in real implementation, this would call FormulaEngine)
    setTimeout(() => {
      const duration = performance.now() - startTime;
      
      this.state.calculating = false;
      this.state.needsRecalc = false;
      this.state.lastRecalcTime = Date.now();
      this.state.lastRecalcDuration = duration;
      
      this.eventEmitter.emit('calculationCompleted', { scope, duration });
      this.eventEmitter.emit('needsRecalcChanged', false);
    }, 10); // Simulate calculation time
  }

  /**
   * Calculate all formulas in all workbooks (F9)
   */
  calculateNow(): void {
    this.triggerRecalculation('all');
  }

  /**
   * Calculate only the active sheet (Shift+F9)
   */
  calculateSheet(): void {
    this.triggerRecalculation('sheet');
  }

  /**
   * Check if calculation is in progress
   */
  isCalculating(): boolean {
    return this.state.calculating;
  }

  /**
   * Check if recalculation is needed
   */
  needsRecalculation(): boolean {
    return this.state.needsRecalc;
  }

  /**
   * Get current calculation state
   */
  getState(): CalculationState {
    return { ...this.state };
  }

  /**
   * Subscribe to calculation events
   */
  on(event: CalculationEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Unsubscribe from calculation events
   */
  off(event: CalculationEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Serialize calculation settings
   */
  serialize(): { mode: CalculationMode } {
    return { mode: this.state.mode };
  }

  /**
   * Deserialize calculation settings
   */
  deserialize(data: { mode: CalculationMode }): void {
    this.setMode(data.mode);
  }
}
