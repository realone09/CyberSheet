import type { ConditionalFormattingRule, Range } from '@cyber-sheet/core';

/**
 * CF Preset Category
 */
export type PresetCategory =
	| 'data-bars'
	| 'color-scales'
	| 'icon-sets'
	| 'top-bottom'
	| 'above-below'
	| 'duplicates'
	| 'text'
	| 'dates'
	| 'advanced';

/**
 * CF Preset Definition
 */
export type CFPreset = {
	id: string;
	name: string;
	description: string;
	category: PresetCategory;
	thumbnail: string; // SVG or data URL
	rules: any[]; // Rules without ranges/priority (applied at runtime) - use any to support all 11 rule types
	popularityRank?: number; // For sorting by popularity
	tags: string[];
};

/**
 * Preset Picker State
 */
export type PresetPickerState = {
	presets: CFPreset[];
	selectedPresetId: string | null;
	selectedCategory: PresetCategory | 'all';
	searchQuery: string;
	filteredPresets: CFPreset[];
};

/**
 * Preset Apply State
 */
export type PresetApplyState = {
	selectedPreset: CFPreset | null;
	targetRanges: Range[];
	inferredRange: Range | null;
	isPreviewMode: boolean;
	previewRules: ConditionalFormattingRule[];
	applyStatus: 'idle' | 'previewing' | 'applying' | 'applied' | 'error';
	errorMessage?: string;
};

/**
 * Range Inference Options
 */
export type RangeInferenceOptions = {
	expandToColumn?: boolean; // Expand to entire column
	expandToRow?: boolean; // Expand to entire row
	expandToDataRegion?: boolean; // Expand to contiguous data region
	respectHeaders?: boolean; // Exclude header row
};

/**
 * Preset Apply Options
 */
export type PresetApplyOptions = {
	replaceExisting?: boolean; // Replace existing rules vs append
	adjustPriority?: boolean; // Auto-adjust priorities
	customizeBeforeApply?: boolean; // Open customization dialog
};

/**
 * Preset Event Types
 */
export type PresetEvent =
	| { type: 'preset-selected'; presetId: string }
	| { type: 'preset-applied'; presetId: string; ranges: Range[] }
	| { type: 'preset-preview-started'; presetId: string }
	| { type: 'preset-preview-cancelled' }
	| { type: 'category-changed'; category: PresetCategory | 'all' }
	| { type: 'search-changed'; query: string };
