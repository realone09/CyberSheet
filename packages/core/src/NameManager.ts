/**
 * NameManager.ts
 *
 * Manages named ranges and constants in a workbook.
 * Named ranges allow human-readable labels for cells or ranges.
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

export type NameScope = 'workbook' | string; // 'workbook' or sheet name

export interface DefinedName {
  name: string;
  refersTo: string; // Formula like "=Sheet1!$A$1:$A$10"
  scope: NameScope; // 'workbook' or specific sheet name
  comment?: string;
  hidden?: boolean;
}

export interface NameValidationResult {
  valid: boolean;
  error?: string;
}

type NameManagerEvent = 
  | 'nameAdded'
  | 'nameDeleted'
  | 'nameUpdated'
  | 'namesChanged';

/**
 * NameManager manages all defined names in a workbook.
 * Supports both workbook-scoped and sheet-scoped names.
 */
export class NameManager {
  private names: Map<string, DefinedName> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {}

  /**
   * Validate a name according to Excel rules
   */
  validateName(name: string, scope: NameScope = 'workbook'): NameValidationResult {
    // Excel name rules:
    // 1. First character must be letter, underscore, or backslash
    // 2. Remaining characters: letters, numbers, periods, underscores
    // 3. Cannot be a cell reference (A1, XFD1048576, etc.)
    // 4. Cannot be "R" or "C" (case-insensitive)
    // 5. Max 255 characters
    // 6. Case-insensitive (Excel treats "Sales" and "SALES" as the same)

    if (!name || name.length === 0) {
      return { valid: false, error: 'Name cannot be empty' };
    }

    if (name.length > 255) {
      return { valid: false, error: 'Name cannot exceed 255 characters' };
    }

    // Check first character
    const firstChar = name[0];
    if (!/[a-zA-Z_\\]/.test(firstChar)) {
      return { valid: false, error: 'Name must start with a letter, underscore, or backslash' };
    }

    // Check remaining characters
    if (!/^[a-zA-Z_\\][a-zA-Z0-9._]*$/.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }

    // Check for reserved names
    const upperName = name.toUpperCase();
    if (upperName === 'R' || upperName === 'C') {
      return { valid: false, error: 'R and C are reserved names' };
    }

    // Check if it looks like a cell reference
    if (/^[A-Z]{1,3}\d{1,7}$/.test(upperName)) {
      return { valid: false, error: 'Name cannot look like a cell reference' };
    }

    // Check for duplicate (case-insensitive)
    const key = this.getKey(name, scope);
    if (this.names.has(key)) {
      return { valid: false, error: 'Name already exists in this scope' };
    }

    return { valid: true };
  }

  /**
   * Generate unique key for name + scope
   */
  private getKey(name: string, scope: NameScope): string {
    return `${scope}::${name.toLowerCase()}`;
  }

  /**
   * Add a named range
   */
  addName(name: string, refersTo: string, scope: NameScope = 'workbook', comment?: string): void {
    const validation = this.validateName(name, scope);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const definedName: DefinedName = {
      name,
      refersTo,
      scope,
      comment,
      hidden: false,
    };

    const key = this.getKey(name, scope);
    this.names.set(key, definedName);
    this.eventEmitter.emit('nameAdded', definedName);
    this.eventEmitter.emit('namesChanged');
  }

  /**
   * Delete a named range
   */
  deleteName(name: string, scope: NameScope = 'workbook'): boolean {
    const key = this.getKey(name, scope);
    const deletedName = this.names.get(key);
    
    if (this.names.delete(key)) {
      this.eventEmitter.emit('nameDeleted', deletedName);
      this.eventEmitter.emit('namesChanged');
      return true;
    }
    
    return false;
  }

  /**
   * Update an existing name
   */
  updateName(
    oldName: string,
    oldScope: NameScope,
    newName: string,
    refersTo: string,
    scope: NameScope = 'workbook',
    comment?: string
  ): void {
    // If name or scope changed, validate new name
    if (oldName.toLowerCase() !== newName.toLowerCase() || oldScope !== scope) {
      const validation = this.validateName(newName, scope);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    const oldKey = this.getKey(oldName, oldScope);
    const oldDefinedName = this.names.get(oldKey);
    
    if (!oldDefinedName) {
      throw new Error(`Name '${oldName}' not found in scope '${oldScope}'`);
    }

    // Delete old entry if name or scope changed
    if (oldName.toLowerCase() !== newName.toLowerCase() || oldScope !== scope) {
      this.names.delete(oldKey);
    }

    const newDefinedName: DefinedName = {
      name: newName,
      refersTo,
      scope,
      comment,
      hidden: oldDefinedName.hidden,
    };

    const newKey = this.getKey(newName, scope);
    this.names.set(newKey, newDefinedName);
    this.eventEmitter.emit('nameUpdated', newDefinedName);
    this.eventEmitter.emit('namesChanged');
  }

  /**
   * Get a named range
   */
  getName(name: string, scope: NameScope = 'workbook'): DefinedName | undefined {
    const key = this.getKey(name, scope);
    return this.names.get(key);
  }

  /**
   * Resolve a name to its range/value
   */
  resolveName(name: string, scope: NameScope = 'workbook'): string | undefined {
    const definedName = this.getName(name, scope);
    return definedName?.refersTo;
  }

  /**
   * Get all names (optionally filtered by scope)
   */
  getAllNames(scope?: NameScope): DefinedName[] {
    const allNames = Array.from(this.names.values());
    
    if (scope !== undefined) {
      return allNames.filter(n => n.scope === scope);
    }
    
    return allNames;
  }

  /**
   * Check if a name exists
   */
  hasName(name: string, scope: NameScope = 'workbook'): boolean {
    const key = this.getKey(name, scope);
    return this.names.has(key);
  }

  /**
   * Create names from selection (e.g., from top row, left column)
   */
  createNamesFromSelection(
    range: string,
    options: {
      topRow?: boolean;
      leftColumn?: boolean;
      bottomRow?: boolean;
      rightColumn?: boolean;
    },
    scope: NameScope = 'workbook'
  ): void {
    // Implementation would parse the range and create multiple names
    // based on the selected options
    // This is a stub - full implementation would need range parsing
    console.log('Creating names from selection:', range, options, scope);
  }

  /**
   * Subscribe to name manager events
   */
  on(event: NameManagerEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Unsubscribe from name manager events
   */
  off(event: NameManagerEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Serialize all names for export
   */
  serialize(): DefinedName[] {
    return Array.from(this.names.values());
  }

  /**
   * Deserialize names from import
   */
  deserialize(names: DefinedName[]): void {
    this.names.clear();
    
    for (const name of names) {
      const key = this.getKey(name.name, name.scope);
      this.names.set(key, name);
    }
    
    this.eventEmitter.emit('namesChanged');
  }

  /**
   * Clear all names
   */
  clear(): void {
    this.names.clear();
    this.eventEmitter.emit('namesChanged');
  }
}
