/**
 * ContextResolver - Real-time Interaction Context Detection
 * 
 * CRITICAL: This determines which shortcuts are active
 * 
 * Detection strategy:
 * 1. Check for modal/dialog (highest priority)
 * 2. Check for cell editing (contenteditable or input focused)
 * 3. Check for formula bar editing
 * 4. Check for ribbon focus (dropdown, button, input)
 * 5. Default to grid (cell selection)
 * 
 * ⚠️ MUST be real-time (not cached) - user can switch context mid-keystroke
 */

import type { InteractionContext, IContextResolver } from './types';

/**
 * Custom context detector function
 */
type ContextDetector = () => InteractionContext | null;

/**
 * ContextResolver implementation
 */
export class ContextResolver implements IContextResolver {
  /**
   * Custom detectors (registered by components)
   * 
   * Example: Dialog component registers detector when mounted
   */
  private detectors: Map<string, ContextDetector> = new Map();

  /**
   * Get current interaction context (real-time)
   * 
   * Priority order (first match wins):
   * 1. Custom detectors (dialog, modal)
   * 2. Cell editing (contenteditable, input in grid)
   * 3. Formula bar editing
   * 4. Ribbon focus (dropdown, button)
   * 5. Grid (default)
   */
  getCurrentContext(): InteractionContext {
    // 1. Check custom detectors (highest priority)
    for (const detector of this.detectors.values()) {
      const context = detector();
      if (context !== null) {
        return context;
      }
    }

    // 2. Check for editing context
    const activeElement = document.activeElement;

    if (!activeElement) {
      return 'grid';
    }

    // Check if element is contenteditable (inline cell editing)
    if (
      activeElement.hasAttribute('contenteditable') ||
      (activeElement as HTMLElement).isContentEditable
    ) {
      // Determine if it's cell edit or formula bar
      if (this.isFormulaBar(activeElement)) {
        return 'formula-bar';
      }
      return 'cell-edit';
    }

    // Check if element is input/textarea
    if (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA'
    ) {
      // Check if it's in formula bar
      if (this.isFormulaBar(activeElement)) {
        return 'formula-bar';
      }

      // Check if it's in ribbon (search, dropdowns)
      if (this.isRibbonControl(activeElement)) {
        return 'ribbon';
      }

      // Otherwise, assume it's grid-related input
      return 'cell-edit';
    }

    // 3. Check for ribbon focus (buttons, dropdowns)
    if (this.isRibbonControl(activeElement)) {
      return 'ribbon';
    }

    // 4. Default to grid
    return 'grid';
  }

  /**
   * Check if user is currently editing
   */
  isEditing(): boolean {
    const context = this.getCurrentContext();
    return context === 'cell-edit' || context === 'formula-bar';
  }

  /**
   * Register custom context detector
   * 
   * Example:
   * ```ts
   * contextResolver.registerDetector('myDialog', () => {
   *   return isMyDialogOpen ? 'dialog' : null;
   * });
   * ```
   */
  registerDetector(name: string, detector: ContextDetector): void {
    this.detectors.set(name, detector);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ContextResolver] Registered detector: ${name}`);
    }
  }

  /**
   * Unregister custom detector
   */
  unregisterDetector(name: string): void {
    this.detectors.delete(name);
  }

  /**
   * Check if element is in formula bar
   * 
   * Uses heuristics:
   * - Has data-formula-bar attribute
   * - Has class containing 'formula-bar'
   * - Parent has formula-bar markers
   */
  private isFormulaBar(element: Element): boolean {
    // Check element itself
    if (
      element.hasAttribute('data-formula-bar') ||
      element.classList.contains('formula-bar') ||
      element.classList.contains('cs-formula-bar')
    ) {
      return true;
    }

    // Check parents (up to 5 levels)
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      if (
        parent.hasAttribute('data-formula-bar') ||
        parent.classList.contains('formula-bar') ||
        parent.classList.contains('cs-formula-bar')
      ) {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }

    return false;
  }

  /**
   * Check if element is a ribbon control
   * 
   * Heuristics:
   * - Has data-ribbon-* attribute
   * - Has class containing 'ribbon'
   * - Has role="button", "combobox", etc.
   * - Parent is ribbon
   */
  private isRibbonControl(element: Element): boolean {
    // Check for ribbon-specific attributes
    const attributes = Array.from(element.attributes);
    if (attributes.some(attr => attr.name.startsWith('data-ribbon-'))) {
      return true;
    }

    // Check classes
    const classes = Array.from(element.classList);
    if (
      classes.some(cls =>
        cls.includes('ribbon') ||
        cls.startsWith('cs-ribbon-') ||
        cls.includes('dropdown')
      )
    ) {
      return true;
    }

    // Check role (buttons, comboboxes)
    const role = element.getAttribute('role');
    if (
      role === 'button' ||
      role === 'combobox' ||
      role === 'listbox' ||
      role === 'option'
    ) {
      // If it has role and is in ribbon area, consider it ribbon
      if (this.isInRibbonArea(element)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if element is within ribbon area
   */
  private isInRibbonArea(element: Element): boolean {
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
      if (
        parent.classList.contains('ribbon') ||
        parent.classList.contains('cs-ribbon') ||
        parent.hasAttribute('data-ribbon')
      ) {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }
    return false;
  }

  /**
   * Clear all detectors
   */
  clear(): void {
    this.detectors.clear();
  }
}

/**
 * Global singleton instance
 */
export const contextResolver = new ContextResolver();
