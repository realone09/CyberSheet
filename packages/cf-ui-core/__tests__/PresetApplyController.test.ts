import { describe, it, expect, beforeEach } from '@jest/globals';
import { PresetApplyController } from '../src/controllers/PresetApplyController';
import type { CFPreset } from '../src/types/PresetTypes';
import type { Range, ConditionalFormattingRule } from '@cyber-sheet/core';

/**
 * Integration tests for PresetApplyController
 * Tests range inference, preview mode, and preset application
 */

describe('PresetApplyController', () => {
  let controller: PresetApplyController;
  
  const mockPreset: CFPreset = {
    id: 'test-preset',
    name: 'Test Preset',
    description: 'Test Description',
    category: 'data-bars',
    thumbnail: '',
    tags: ['test'],
    rules: [
      {
        type: 'data-bar',
        color: '#0000FF',
        gradient: true,
        showValue: true,
      },
    ],
  };

  const mockRange: Range = {
    start: { row: 0, col: 0 },
    end: { row: 9, col: 4 },
  };

  beforeEach(() => {
    controller = new PresetApplyController();
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = controller.getState();
      
      expect(state.selectedPreset).toBeNull();
      expect(state.targetRanges).toEqual([]);
      expect(state.inferredRange).toBeNull();
      expect(state.isPreviewMode).toBe(false);
      expect(state.previewRules).toEqual([]);
      expect(state.applyStatus).toBe('idle');
      expect(state.errorMessage).toBeUndefined();
    });
  });

  describe('Preset Selection', () => {
    it('should set preset', () => {
      controller.setPreset(mockPreset);
      const state = controller.getState();
      
      expect(state.selectedPreset).toEqual(mockPreset);
    });

    it('should clear preset', () => {
      controller.setPreset(mockPreset);
      controller.setPreset(null);
      const state = controller.getState();
      
      expect(state.selectedPreset).toBeNull();
    });
  });

  describe('Target Range Management', () => {
    it('should set target ranges', () => {
      controller.setTargetRanges([mockRange]);
      const state = controller.getState();
      
      expect(state.targetRanges).toEqual([mockRange]);
    });

    it('should handle multiple ranges', () => {
      const ranges: Range[] = [
        mockRange,
        { start: { row: 10, col: 0 }, end: { row: 19, col: 4 } },
      ];
      
      controller.setTargetRanges(ranges);
      const state = controller.getState();
      
      expect(state.targetRanges).toEqual(ranges);
    });
  });

  describe('Range Inference', () => {
    it('should infer range without expansion', () => {
      const inferred = controller.inferRange(mockRange, {});
      
      expect(inferred).toEqual(mockRange);
    });

    it('should expand to full column', () => {
      const inferred = controller.inferRange(mockRange, {
        expandToColumn: true,
      });
      
      expect(inferred?.start.col).toBe(mockRange.start.col);
      expect(inferred?.end.col).toBe(mockRange.end.col);
      expect(inferred?.start.row).toBe(0);
      // End row should be expanded (exact value depends on implementation)
    });

    it('should expand to full row', () => {
      const inferred = controller.inferRange(mockRange, {
        expandToRow: true,
      });
      
      expect(inferred?.start.row).toBe(mockRange.start.row);
      expect(inferred?.end.row).toBe(mockRange.end.row);
      expect(inferred?.start.col).toBe(0);
      // End col should be expanded
    });

    it('should respect headers option', () => {
      const inferred = controller.inferRange(mockRange, {
        respectHeaders: true,
      });
      
      // Should skip first row
      expect(inferred?.start.row).toBeGreaterThanOrEqual(1);
    });

    // Note: Data region expansion not yet implemented in controller
    // it('should handle data region expansion', () => { ... });
  });

  describe('Preview Mode', () => {
    beforeEach(() => {
      controller.setPreset(mockPreset);
      controller.setTargetRanges([mockRange]);
    });

    it('should start preview mode', () => {
      controller.startPreview();
      const state = controller.getState();
      
      expect(state.isPreviewMode).toBe(true);
      expect(state.previewRules.length).toBeGreaterThan(0);
    });

    it('should generate preview rules', () => {
      controller.startPreview();
      const rules = controller.getPreviewRules();
      
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].type).toBe('data-bar');
      expect(rules[0].ranges).toBeDefined();
    });

    it('should cancel preview mode', () => {
      controller.startPreview();
      controller.cancelPreview();
      const state = controller.getState();
      
      expect(state.isPreviewMode).toBe(false);
      expect(state.previewRules).toEqual([]);
    });

    it('should emit preset-preview-started event', (done) => {
      controller.on('preset-preview-started', (event) => {
        expect(event.type).toBe('preset-preview-started');
        if (event.type === 'preset-preview-started') {
          expect(event.presetId).toBe(mockPreset.id);
        }
        done();
      });
      
      controller.startPreview();
    });

    it('should emit preset-preview-cancelled event', (done) => {
      controller.startPreview();
      
      controller.on('preset-preview-cancelled', (event) => {
        expect(event.type).toBe('preset-preview-cancelled');
        done();
      });
      
      controller.cancelPreview();
    });

    it('should check if in preview mode', () => {
      expect(controller.isInPreviewMode()).toBe(false);
      
      controller.startPreview();
      expect(controller.isInPreviewMode()).toBe(true);
      
      controller.cancelPreview();
      expect(controller.isInPreviewMode()).toBe(false);
    });
  });

  describe('Preset Application', () => {
    beforeEach(() => {
      controller.setPreset(mockPreset);
      controller.setTargetRanges([mockRange]);
    });

    it('should apply preset to empty rule list', () => {
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].priority).toBe(1);
    });

    it('should append to existing rules', () => {
      const existingRules: ConditionalFormattingRule[] = [
        {
          type: 'value',
          ranges: [mockRange],
          priority: 1,
          operator: '>',
          value: 100,
          style: { fillColor: '#FF0000' },
        },
      ];
      
      const rules = controller.applyPreset(existingRules, {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      expect(rules.length).toBeGreaterThan(existingRules.length);
    });

    it('should replace existing rules', () => {
      const existingRules: ConditionalFormattingRule[] = [
        {
          type: 'value',
          ranges: [mockRange],
          priority: 1,
          operator: '>',
          value: 100,
          style: { fillColor: '#FF0000' },
        },
      ];
      
      const rules = controller.applyPreset(existingRules, {
        replaceExisting: true,
        adjustPriority: true,
      });
      
      // Should only have preset rules (data-bar type)
      expect(rules.some(r => r.type === 'data-bar')).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should adjust priorities correctly', () => {
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      // Priorities should be sequential starting from 1
      rules.forEach((rule, index) => {
        expect(rule.priority).toBe(index + 1);
      });
    });

    it('should not adjust priorities when disabled', () => {
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: false,
      });
      
      // Priorities may not be sequential
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should emit preset-applied event', (done) => {
      controller.on('preset-applied', (event) => {
        expect(event.type).toBe('preset-applied');
        if (event.type === 'preset-applied') {
          expect(event.presetId).toBe(mockPreset.id);
          expect(event.ranges.length).toBeGreaterThan(0);
        }
        done();
      });
      
      controller.applyPreset([], { replaceExisting: false, adjustPriority: true });
    });

    it('should exit preview mode after applying', () => {
      controller.startPreview();
      expect(controller.isInPreviewMode()).toBe(true);
      
      controller.applyPreset([], { replaceExisting: false, adjustPriority: true });
      expect(controller.isInPreviewMode()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle applying without preset', () => {
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      // Should return empty array or original rules
      expect(rules).toEqual([]);
    });

    it('should handle applying without target ranges', () => {
      controller.setPreset(mockPreset);
      
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      // Should still work, may use default range or skip
      expect(Array.isArray(rules)).toBe(true);
    });

    it('should handle preview without preset', () => {
      controller.startPreview();
      const state = controller.getState();
      
      expect(state.previewRules).toEqual([]);
    });
  });

  describe('State Immutability', () => {
    it('should return new state object on getState()', () => {
      const state1 = controller.getState();
      const state2 = controller.getState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow external mutation of preview rules', () => {
      controller.setPreset(mockPreset);
      controller.setTargetRanges([mockRange]);
      controller.startPreview();
      
      const state = controller.getState();
      const originalLength = state.previewRules.length;
      
      // Try to mutate
      state.previewRules.push({} as any);
      
      // Get fresh state
      const newState = controller.getState();
      expect(newState.previewRules.length).toBe(originalLength);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle preset with multiple rules', () => {
      const multiRulePreset: CFPreset = {
        id: 'multi',
        name: 'Multi Rule',
        description: 'Multiple rules',
        category: 'color-scales',
        thumbnail: '',
        tags: ['multi'],
        rules: [
          { type: 'data-bar', color: '#FF0000', gradient: true, showValue: true },
          { type: 'data-bar', color: '#00FF00', gradient: true, showValue: true },
        ],
      };
      
      controller.setPreset(multiRulePreset);
      controller.setTargetRanges([mockRange]);
      
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      expect(rules.length).toBe(2);
    });

    it('should handle multiple target ranges', () => {
      const ranges: Range[] = [
        { start: { row: 0, col: 0 }, end: { row: 4, col: 4 } },
        { start: { row: 10, col: 0 }, end: { row: 14, col: 4 } },
      ];
      
      controller.setPreset(mockPreset);
      controller.setTargetRanges(ranges);
      
      const rules = controller.applyPreset([], {
        replaceExisting: false,
        adjustPriority: true,
      });
      
      // Should apply to all ranges
      expect(rules.length).toBeGreaterThan(0);
    });
  });
});
