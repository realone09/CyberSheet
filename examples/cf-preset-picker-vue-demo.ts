import { createApp, ref, type Ref } from 'vue';
import type { ConditionalFormattingRule, Range } from '@cyber-sheet/core';
import type { CFPreset } from '../packages/cf-ui-core/src/types/PresetTypes';
import ConditionalFormattingPresetPicker from '../packages/vue/src/conditional-formatting/ConditionalFormattingPresetPicker.vue';
import { PresetApplyController } from '../packages/cf-ui-core/src/controllers/PresetApplyController';
import { formatRange } from '../packages/cf-ui-core/src/formatters/RangeFormatter';

/**
 * Vue 3 CF Preset Picker Demo
 * Shows Vue Composition API adapter wrapping PresetPickerController
 */

const App = {
  components: {
    ConditionalFormattingPresetPicker,
  },
  setup() {
    // State
    const selectedPreset: Ref<CFPreset | null> = ref(null);
    const appliedRules: Ref<ConditionalFormattingRule[]> = ref([]);
    const targetRange: Ref<Range> = ref({
      start: { row: 0, col: 0 },
      end: { row: 9, col: 4 },
    });
    const applyController = new PresetApplyController();

    // Handlers
    const handlePresetSelect = (preset: CFPreset) => {
      selectedPreset.value = preset;
      applyController.setPreset(preset);
      console.log('📦 Vue: Selected preset:', preset.name);
    };

    const handleApply = (preset: CFPreset) => {
      // Set target range
      applyController.setTargetRanges([targetRange.value]);

      // Infer range
      const inferredRange = applyController.inferRange(targetRange.value, {
        respectHeaders: true,
      });

      console.log('🎯 Vue: Target range:', formatRange(targetRange.value));
      console.log('🔍 Vue: Inferred range:', inferredRange ? formatRange(inferredRange) : 'None');

      // Apply preset
      const newRules = applyController.applyPreset(appliedRules.value, {
        replaceExisting: false,
        adjustPriority: true,
      });

      appliedRules.value = newRules;
      console.log('✅ Vue: Applied rules:', newRules);
      alert(`✅ Applied "${preset.name}" to range ${formatRange(inferredRange || targetRange.value)}`);
    };

    const handleRangeChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      const ranges: Record<string, Range> = {
        small: { start: { row: 0, col: 0 }, end: { row: 9, col: 4 } },
        medium: { start: { row: 0, col: 0 }, end: { row: 49, col: 9 } },
        large: { start: { row: 0, col: 0 }, end: { row: 99, col: 19 } },
      };
      targetRange.value = ranges[target.value];
    };

    return {
      selectedPreset,
      appliedRules,
      targetRange,
      handlePresetSelect,
      handleApply,
      handleRangeChange,
      formatRange,
    };
  },
  template: `
    <div>
      <!-- Range Selector -->
      <div style="margin-bottom: 20px; padding: 16px; background: #f9f9f9; border-radius: 4px;">
        <label style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
          <strong>Target Range:</strong>
          <select 
            @change="handleRangeChange"
            style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"
          >
            <option value="small">Small (A1:E10)</option>
            <option value="medium">Medium (A1:J50)</option>
            <option value="large">Large (A1:T100)</option>
          </select>
          <span style="color: #666; font-size: 12px;">
            {{ formatRange(targetRange) }}
          </span>
        </label>
      </div>

      <!-- Preset Picker -->
      <ConditionalFormattingPresetPicker
        :on-preset-select="handlePresetSelect"
        :on-apply="handleApply"
        :show-popular="true"
        :max-width="700"
      />

      <!-- Applied Rules Summary -->
      <div 
        v-if="appliedRules.length > 0"
        style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 4px;"
      >
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #2e7d32;">
          ✅ Applied Rules ({{ appliedRules.length }})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="(rule, index) in appliedRules"
            :key="index"
            style="
              padding: 8px 12px;
              background: white;
              border-radius: 4px;
              font-size: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span>
              <strong>#{{ rule.priority }}</strong> - {{ rule.type.replace(/-/g, ' ').toUpperCase() }}
            </span>
            <span style="color: #666; font-size: 11px;">
              {{ rule.ranges && rule.ranges[0] ? formatRange(rule.ranges[0]) : 'No range' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Vue Pattern Info -->
      <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 4px; border-left: 4px solid #42b883;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #42b883;">🎯 Vue 3 Composition API Pattern</h3>
        <div style="font-size: 12px; color: #666; line-height: 1.6;">
          <strong>Reactive State:</strong><br />
          • <code>ref()</code> for primitive values (selectedPreset, targetRange)<br />
          • <code>computed()</code> for derived state (categories)<br />
          • <code>onMounted()</code> for controller event subscription<br />
          • <code>onUnmounted()</code> for cleanup<br />
          <br />
          <strong>Template Directives:</strong><br />
          • <code>v-for</code> for list rendering<br />
          • <code>v-if</code> for conditional rendering<br />
          • <code>:class</code> for dynamic classes<br />
          • <code>@click</code> for event handling<br />
          <br />
          <strong>Same Controller as React!</strong> PresetPickerController is pure TypeScript.
        </div>
      </div>
    </div>
  `,
};

// Mount Vue app
const app = createApp(App);
app.mount('#app');
