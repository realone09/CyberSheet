export { default as ConditionalFormattingPresetPicker } from './ConditionalFormattingPresetPicker.svelte';

// Re-export from cf-ui-core for convenience
export type {
  CFPreset,
  PresetCategory,
  PresetPickerState,
  PresetApplyState,
  RangeInferenceOptions,
  PresetApplyOptions,
  PresetEvent,
} from '@cyber-sheet/cf-ui-core';

export {
  PresetPickerController,
  PresetApplyController,
  PRESET_LIBRARY,
  getAllPresets,
  getPresetById,
  getPresetsByCategory,
  searchPresets,
  getPopularPresets,
} from '@cyber-sheet/cf-ui-core';
