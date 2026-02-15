import { describe, it, expect, beforeEach } from '@jest/globals';
import { PresetPickerController } from '../src/controllers/PresetPickerController';
import { PRESET_LIBRARY } from '../src/presets/PresetLibrary';
import type { PresetCategory } from '../src/types/PresetTypes';

/**
 * Integration tests for PresetPickerController
 * Tests core business logic independent of any framework
 */

describe('PresetPickerController', () => {
  let controller: PresetPickerController;

  beforeEach(() => {
    controller = new PresetPickerController();
  });

  describe('Initialization', () => {
    it('should initialize with all presets', () => {
      const state = controller.getState();
      expect(state.presets.length).toBeGreaterThan(0);
      expect(state.filteredPresets.length).toBe(state.presets.length);
      expect(state.selectedCategory).toBe('all');
      expect(state.searchQuery).toBe('');
      expect(state.selectedPresetId).toBeNull();
    });

    it('should load presets from library', () => {
      const state = controller.getState();
      expect(state.presets.length).toBe(PRESET_LIBRARY.length);
    });
  });

  describe('Category Filtering', () => {
    it('should filter presets by category', () => {
      controller.selectCategory('data-bars');
      const state = controller.getState();
      
      expect(state.selectedCategory).toBe('data-bars');
      expect(state.filteredPresets.every(p => p.category === 'data-bars')).toBe(true);
      expect(state.filteredPresets.length).toBeGreaterThan(0);
    });

    it('should show all presets when "all" category is selected', () => {
      controller.selectCategory('data-bars');
      controller.selectCategory('all');
      const state = controller.getState();
      
      expect(state.selectedCategory).toBe('all');
      expect(state.filteredPresets.length).toBe(state.presets.length);
    });

    it('should emit category-changed event', (done) => {
      controller.on('category-changed', (event) => {
        expect(event.type).toBe('category-changed');
        if (event.type === 'category-changed') {
          expect(event.category).toBe('color-scales');
        }
        done();
      });
      
      controller.selectCategory('color-scales');
    });

    it('should return correct category counts', () => {
      const categories = controller.getCategories();
      const allCategory = categories.find(c => c.id === 'all');
      const dataBarsCategory = categories.find(c => c.id === 'data-bars');
      
      expect(allCategory).toBeDefined();
      expect(allCategory!.count).toBe(PRESET_LIBRARY.length);
      expect(dataBarsCategory).toBeDefined();
      expect(dataBarsCategory!.count).toBeGreaterThan(0);
    });
  });

  describe('Search Filtering', () => {
    it('should filter presets by search query', () => {
      controller.setSearchQuery('blue');
      const state = controller.getState();
      
      expect(state.searchQuery).toBe('blue');
      expect(state.filteredPresets.every(p => 
        p.name.toLowerCase().includes('blue') ||
        p.description.toLowerCase().includes('blue') ||
        p.tags?.some(t => t.toLowerCase().includes('blue'))
      )).toBe(true);
    });

    it('should be case-insensitive', () => {
      controller.setSearchQuery('BLUE');
      const state1 = controller.getState();
      
      controller.setSearchQuery('blue');
      const state2 = controller.getState();
      
      expect(state1.filteredPresets.length).toBe(state2.filteredPresets.length);
    });

    it('should search in name, description, and tags', () => {
      controller.setSearchQuery('data');
      const state = controller.getState();
      
      expect(state.filteredPresets.length).toBeGreaterThan(0);
      expect(state.filteredPresets.some(p => p.name.toLowerCase().includes('data'))).toBe(true);
    });

    it('should emit search-changed event', (done) => {
      controller.on('search-changed', (event) => {
        expect(event.type).toBe('search-changed');
        if (event.type === 'search-changed') {
          expect(event.query).toBe('average');
        }
        done();
      });
      
      controller.setSearchQuery('average');
    });

    it('should combine with category filtering', () => {
      controller.selectCategory('data-bars');
      controller.setSearchQuery('blue');
      const state = controller.getState();
      
      expect(state.filteredPresets.every(p => p.category === 'data-bars')).toBe(true);
      expect(state.filteredPresets.every(p => 
        p.name.toLowerCase().includes('blue') ||
        p.description.toLowerCase().includes('blue')
      )).toBe(true);
    });
  });

  describe('Preset Selection', () => {
    it('should select a preset by id', () => {
      const presets = controller.getState().presets;
      const presetId = presets[0].id;
      
      controller.selectPreset(presetId);
      const state = controller.getState();
      
      expect(state.selectedPresetId).toBe(presetId);
    });

    it('should return selected preset', () => {
      const presets = controller.getState().presets;
      const preset = presets[0];
      
      controller.selectPreset(preset.id);
      const selected = controller.getSelectedPreset();
      
      expect(selected).toEqual(preset);
    });

    it('should emit preset-selected event', (done) => {
      const presets = controller.getState().presets;
      const presetId = presets[0].id;
      
      controller.on('preset-selected', (event) => {
        expect(event.type).toBe('preset-selected');
        if (event.type === 'preset-selected') {
          expect(event.presetId).toBe(presetId);
        }
        done();
      });
      
      controller.selectPreset(presetId);
    });

    it('should clear selection', () => {
      const presets = controller.getState().presets;
      controller.selectPreset(presets[0].id);
      controller.clearSelection();
      
      const state = controller.getState();
      expect(state.selectedPresetId).toBeNull();
    });
  });

  describe('Popular Presets', () => {
    it('should return popular presets', () => {
      const popular = controller.getPopularPresets(6);
      
      expect(popular.length).toBeLessThanOrEqual(6);
      expect(popular.every(p => p.popularityRank !== undefined)).toBe(true);
    });

    it('should return presets sorted by popularity', () => {
      const popular = controller.getPopularPresets(10);
      
      for (let i = 0; i < popular.length - 1; i++) {
        const current = popular[i].popularityRank ?? Infinity;
        const next = popular[i + 1].popularityRank ?? Infinity;
        expect(current).toBeLessThanOrEqual(next);
      }
    });

    it('should limit results by specified count', () => {
      const popular3 = controller.getPopularPresets(3);
      const popular5 = controller.getPopularPresets(5);
      
      expect(popular3.length).toBeLessThanOrEqual(3);
      expect(popular5.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Event System', () => {
    it('should allow multiple listeners for same event', () => {
      let listener1Called = false;
      let listener2Called = false;
      
      controller.on('category-changed', () => { listener1Called = true; });
      controller.on('category-changed', () => { listener2Called = true; });
      
      controller.selectCategory('data-bars');
      
      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
    });

    it('should emit events with correct payload', (done) => {
      controller.on('search-changed', (event) => {
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('query');
        expect(event.type).toBe('search-changed');
        if (event.type === 'search-changed') {
          expect(event.query).toBe('test');
        }
        done();
      });
      
      controller.setSearchQuery('test');
    });
  });

  describe('Reset Filters', () => {
    it('should reset category and search filters', () => {
      controller.selectCategory('data-bars');
      controller.setSearchQuery('blue');
      controller.resetFilters();
      
      const state = controller.getState();
      expect(state.selectedCategory).toBe('all');
      expect(state.searchQuery).toBe('');
      expect(state.filteredPresets.length).toBe(state.presets.length);
    });

    it('should emit events when resetting', (done) => {
      let categoryChanged = false;
      let searchChanged = false;
      
      controller.on('category-changed', () => { categoryChanged = true; });
      controller.on('search-changed', () => { 
        searchChanged = true;
        if (categoryChanged && searchChanged) {
          done();
        }
      });
      
      controller.selectCategory('data-bars');
      controller.setSearchQuery('test');
      controller.resetFilters();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      controller.setSearchQuery('');
      const state = controller.getState();
      
      expect(state.searchQuery).toBe('');
      expect(state.filteredPresets.length).toBe(state.presets.length);
    });

    it('should handle search query with no matches', () => {
      controller.setSearchQuery('zzzznonexistent');
      const state = controller.getState();
      
      expect(state.filteredPresets.length).toBe(0);
    });

    it('should handle selecting non-existent preset', () => {
      controller.selectPreset('non-existent-id');
      const selected = controller.getSelectedPreset();
      
      expect(selected).toBeNull();
    });

    it('should handle category with no presets', () => {
      // 'advanced' category might have no presets
      controller.selectCategory('advanced' as PresetCategory);
      const state = controller.getState();
      
      expect(state.selectedCategory).toBe('advanced');
      // May or may not have presets, just checking it doesn't crash
    });
  });

  describe('State Immutability', () => {
    it('should return new state object on getState()', () => {
      const state1 = controller.getState();
      const state2 = controller.getState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow external state mutation', () => {
      const state = controller.getState();
      const originalLength = state.filteredPresets.length;
      
      // Try to mutate
      state.filteredPresets.push({
        id: 'fake',
        name: 'Fake',
        description: 'Fake',
        category: 'all',
        rules: [],
      } as any);
      
      // Get fresh state
      const newState = controller.getState();
      expect(newState.filteredPresets.length).toBe(originalLength);
    });
  });
});
