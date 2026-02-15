import type { ConditionalFormattingRule, Range, Address, CellValue } from '@cyber-sheet/core';
import type {
	CFPreset,
	PresetApplyState,
	RangeInferenceOptions,
	PresetApplyOptions,
	PresetEvent,
} from '../types/PresetTypes';

/**
 * PresetApplyController
 * 
 * Framework-agnostic controller for applying CF presets
 * Handles range inference, preview mode, and rule application
 * 
 * Works in: Vanilla, React, Vue, Angular, Svelte
 */
export class PresetApplyController {
	private state: PresetApplyState;
	private eventListeners: Map<string, Array<(event: PresetEvent) => void>> = new Map();

	constructor() {
		this.state = {
			selectedPreset: null,
			targetRanges: [],
			inferredRange: null,
			isPreviewMode: false,
			previewRules: [],
			applyStatus: 'idle',
		};
	}

	/**
	 * Get current state (immutable copy)
	 */
	getState(): Readonly<PresetApplyState> {
		return {
			...this.state,
			targetRanges: [...this.state.targetRanges],
			previewRules: [...this.state.previewRules],
		};
	}

	/**
	 * Set selected preset
	 */
	setPreset(preset: CFPreset | null): void {
		this.state.selectedPreset = preset;
		this.state.applyStatus = 'idle';
		this.state.errorMessage = undefined;
	}

	/**
	 * Set target ranges
	 */
	setTargetRanges(ranges: Range[]): void {
		this.state.targetRanges = ranges;
		this.state.inferredRange = null;
	}

	/**
	 * Infer range from selection or data region
	 */
	inferRange(
		selection: Range | null,
		options: RangeInferenceOptions = {}
	): Range | null {
		if (!selection) {
			return null;
		}

		let inferred: Range = { ...selection };

		// Expand to entire column
		if (options.expandToColumn) {
			inferred.start.row = 0;
			inferred.end.row = 1048575; // Excel max row
		}

		// Expand to entire row
		if (options.expandToRow) {
			inferred.start.col = 0;
			inferred.end.col = 16383; // Excel max column
		}

		// Respect headers (exclude first row)
		if (options.respectHeaders && inferred.start.row === 0) {
			inferred.start.row = 1;
		}

		// TODO: Implement data region expansion (detect contiguous non-empty cells)
		// if (options.expandToDataRegion) {
		//   inferred = this.expandToDataRegion(inferred, getValue);
		// }

		this.state.inferredRange = inferred;
		return inferred;
	}

	/**
	 * Start preview mode
	 */
	startPreview(): void {
		if (!this.state.selectedPreset) {
			this.state.errorMessage = 'No preset selected';
			return;
		}

		const ranges = this.state.inferredRange
			? [this.state.inferredRange]
			: this.state.targetRanges;

		if (ranges.length === 0) {
			this.state.errorMessage = 'No target range specified';
			return;
		}

		// Generate preview rules
		const previewRules = this.convertPresetToRules(this.state.selectedPreset, ranges);

		this.state.isPreviewMode = true;
		this.state.previewRules = previewRules;
		this.state.applyStatus = 'previewing';

		this.emit({ type: 'preset-preview-started', presetId: this.state.selectedPreset.id });
	}

	/**
	 * Cancel preview
	 */
	cancelPreview(): void {
		this.state.isPreviewMode = false;
		this.state.previewRules = [];
		this.state.applyStatus = 'idle';

		this.emit({ type: 'preset-preview-cancelled' });
	}

	/**
	 * Apply preset (commit preview or direct apply)
	 */
	applyPreset(
		existingRules: ConditionalFormattingRule[],
		options: PresetApplyOptions = {}
	): ConditionalFormattingRule[] {
		if (!this.state.selectedPreset) {
			this.state.errorMessage = 'No preset selected';
			this.state.applyStatus = 'error';
			return existingRules;
		}

		const ranges = this.state.inferredRange
			? [this.state.inferredRange]
			: this.state.targetRanges;

		if (ranges.length === 0) {
			this.state.errorMessage = 'No target range specified';
			this.state.applyStatus = 'error';
			return existingRules;
		}

		try {
			this.state.applyStatus = 'applying';

			// Generate rules from preset
			const newRules = this.convertPresetToRules(this.state.selectedPreset, ranges);

			let finalRules: ConditionalFormattingRule[];

			if (options.replaceExisting) {
				// Replace all existing rules with new ones
				finalRules = newRules;
			} else {
				// Append to existing rules
				finalRules = [...existingRules, ...newRules];
			}

			// Adjust priorities if needed
			if (options.adjustPriority) {
				finalRules = this.adjustPriorities(finalRules);
			}

			this.state.applyStatus = 'applied';
			this.state.isPreviewMode = false;
			this.state.previewRules = [];

			this.emit({
				type: 'preset-applied',
				presetId: this.state.selectedPreset.id,
				ranges,
			});

			return finalRules;
		} catch (error) {
			this.state.applyStatus = 'error';
			this.state.errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return existingRules;
		}
	}

	/**
	 * Get preview rules (for rendering)
	 */
	getPreviewRules(): ConditionalFormattingRule[] {
		return this.state.previewRules;
	}

	/**
	 * Check if in preview mode
	 */
	isInPreviewMode(): boolean {
		return this.state.isPreviewMode;
	}

	/**
	 * Subscribe to events
	 */
	on(eventType: string, callback: (event: PresetEvent) => void): () => void {
		if (!this.eventListeners.has(eventType)) {
			this.eventListeners.set(eventType, []);
		}
		this.eventListeners.get(eventType)!.push(callback);

		// Return unsubscribe function
		return () => {
			const listeners = this.eventListeners.get(eventType);
			if (listeners) {
				const index = listeners.indexOf(callback);
				if (index > -1) {
					listeners.splice(index, 1);
				}
			}
		};
	}

	/**
	 * Emit event to listeners
	 */
	private emit(event: PresetEvent): void {
		const listeners = this.eventListeners.get(event.type);
		if (listeners) {
			listeners.forEach((callback) => callback(event));
		}

		// Also emit to 'all' listeners
		const allListeners = this.eventListeners.get('*');
		if (allListeners) {
			allListeners.forEach((callback) => callback(event));
		}
	}

	/**
	 * Convert preset to actual rules with ranges and priorities
	 */
	private convertPresetToRules(
		preset: CFPreset,
		ranges: Range[]
	): ConditionalFormattingRule[] {
		return preset.rules.map((presetRule, index) => ({
			...presetRule,
			ranges,
			priority: index + 1,
		})) as ConditionalFormattingRule[];
	}

	/**
	 * Adjust priorities of all rules
	 */
	private adjustPriorities(rules: ConditionalFormattingRule[]): ConditionalFormattingRule[] {
		return rules.map((rule, index) => ({
			...rule,
			priority: index + 1,
		}));
	}

	/**
	 * Expand range to contiguous data region
	 * TODO: Implement with actual cell data access
	 */
	private expandToDataRegion(
		selection: Range,
		getValue: (addr: Address) => CellValue
	): Range {
		// Start with selection
		let expanded = { ...selection };

		// Expand right until empty column
		let col = selection.end.col + 1;
		while (col < 16384) {
			let hasData = false;
			for (let row = selection.start.row; row <= selection.end.row; row++) {
				if (getValue({ row, col }) !== null && getValue({ row, col }) !== '') {
					hasData = true;
					break;
				}
			}
			if (!hasData) break;
			col++;
		}
		expanded.end.col = col - 1;

		// Expand down until empty row
		let row = selection.end.row + 1;
		while (row < 1048576) {
			let hasData = false;
			for (let c = selection.start.col; c <= expanded.end.col; c++) {
				if (getValue({ row, col: c }) !== null && getValue({ row, col: c }) !== '') {
					hasData = true;
					break;
				}
			}
			if (!hasData) break;
			row++;
		}
		expanded.end.row = row - 1;

		return expanded;
	}
}
