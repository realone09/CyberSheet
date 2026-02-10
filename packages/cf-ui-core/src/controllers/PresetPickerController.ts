import type { CFPreset, PresetCategory, PresetPickerState, PresetEvent } from '../types/PresetTypes';
import {
	getAllPresets,
	getPresetById,
	getPresetsByCategory,
	searchPresets,
	getPopularPresets,
} from '../presets/PresetLibrary';

/**
 * PresetPickerController
 * 
 * Framework-agnostic controller for CF preset selection
 * Handles preset filtering, searching, and selection
 * 
 * Works in: Vanilla, React, Vue, Angular, Svelte
 */
export class PresetPickerController {
	private state: PresetPickerState;
	private eventListeners: Map<string, Array<(event: PresetEvent) => void>> = new Map();

	constructor() {
		this.state = {
			presets: getAllPresets(),
			selectedPresetId: null,
			selectedCategory: 'all',
			searchQuery: '',
			filteredPresets: getAllPresets(),
		};
	}

	/**
	 * Get current state (immutable copy)
	 */
	getState(): Readonly<PresetPickerState> {
		return {
			...this.state,
			presets: [...this.state.presets],
			filteredPresets: [...this.state.filteredPresets],
		};
	}

	/**
	 * Get all available categories
	 */
	getCategories(): Array<{ id: PresetCategory | 'all'; label: string; count: number }> {
		const categories: Array<{ id: PresetCategory | 'all'; label: string; count: number }> = [
			{ id: 'all', label: 'All Presets', count: this.state.presets.length },
			{ id: 'data-bars', label: 'Data Bars', count: this.countByCategory('data-bars') },
			{ id: 'color-scales', label: 'Color Scales', count: this.countByCategory('color-scales') },
			{ id: 'icon-sets', label: 'Icon Sets', count: this.countByCategory('icon-sets') },
			{ id: 'top-bottom', label: 'Top/Bottom Rules', count: this.countByCategory('top-bottom') },
			{ id: 'above-below', label: 'Above/Below Average', count: this.countByCategory('above-below') },
			{ id: 'duplicates', label: 'Duplicates', count: this.countByCategory('duplicates') },
			{ id: 'text', label: 'Text Rules', count: this.countByCategory('text') },
			{ id: 'dates', label: 'Date Rules', count: this.countByCategory('dates') },
		];

		return categories.filter((cat) => cat.count > 0);
	}

	/**
	 * Select category
	 */
	selectCategory(category: PresetCategory | 'all'): void {
		this.state.selectedCategory = category;
		this.updateFilteredPresets();
		this.emit({ type: 'category-changed', category });
	}

	/**
	 * Set search query
	 */
	setSearchQuery(query: string): void {
		this.state.searchQuery = query;
		this.updateFilteredPresets();
		this.emit({ type: 'search-changed', query });
	}

	/**
	 * Select preset
	 */
	selectPreset(presetId: string | null): void {
		this.state.selectedPresetId = presetId;
		if (presetId) {
			this.emit({ type: 'preset-selected', presetId });
		}
	}

	/**
	 * Get selected preset
	 */
	getSelectedPreset(): CFPreset | null {
		if (!this.state.selectedPresetId) {
			return null;
		}
		return getPresetById(this.state.selectedPresetId) || null;
	}

	/**
	 * Get popular presets for quick access
	 */
	getPopularPresets(limit: number = 6): CFPreset[] {
		return getPopularPresets(limit);
	}

	/**
	 * Clear selection
	 */
	clearSelection(): void {
		this.selectPreset(null);
	}

	/**
	 * Reset filters
	 */
	resetFilters(): void {
		this.state.selectedCategory = 'all';
		this.state.searchQuery = '';
		this.updateFilteredPresets();
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
	 * Update filtered presets based on category and search
	 */
	private updateFilteredPresets(): void {
		let presets = this.state.presets;

		// Filter by category
		if (this.state.selectedCategory !== 'all') {
			presets = getPresetsByCategory(this.state.selectedCategory);
		}

		// Filter by search query
		if (this.state.searchQuery.trim()) {
			const query = this.state.searchQuery.toLowerCase();
			presets = presets.filter((p) => {
				return (
					p.name.toLowerCase().includes(query) ||
					p.description.toLowerCase().includes(query) ||
					p.tags.some((tag) => tag.toLowerCase().includes(query))
				);
			});
		}

		this.state.filteredPresets = presets;
	}

	/**
	 * Count presets by category
	 */
	private countByCategory(category: PresetCategory): number {
		return this.state.presets.filter((p) => p.category === category).length;
	}
}
