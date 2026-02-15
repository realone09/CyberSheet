import type { ConditionalFormattingRule, Range } from '@cyber-sheet/core';
import type { CFPreset } from '../packages/cf-ui-core/src/types/PresetTypes';
import { CFPresetPicker } from '../packages/test-utils/src/vanilla/CFPresetPicker';
import { PresetApplyController } from '../packages/cf-ui-core/src/controllers/PresetApplyController';
import { formatRange } from '../packages/cf-ui-core/src/formatters/RangeFormatter';

/**
 * Vanilla JS CF Preset Picker Demo
 * Zero framework dependencies - pure DOM APIs
 * This proves our architecture is truly framework-agnostic!
 */

// State (just plain JavaScript variables, no reactivity framework)
let selectedPreset: CFPreset | null = null;
let appliedRules: ConditionalFormattingRule[] = [];
let targetRange: Range = {
  start: { row: 0, col: 0 },
  end: { row: 9, col: 4 },
};
const applyController = new PresetApplyController();

// Create container div for demo controls
const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

// Create range selector
const rangeSelector = document.createElement('div');
rangeSelector.style.cssText = 'margin-bottom: 20px; padding: 16px; background: #f9f9f9; border-radius: 4px;';

const rangeLabel = document.createElement('label');
rangeLabel.style.cssText = 'display: flex; align-items: center; gap: 12px; font-size: 13px;';

const rangeLabelText = document.createElement('strong');
rangeLabelText.textContent = 'Target Range:';

const rangeSelect = document.createElement('select');
rangeSelect.style.cssText = 'padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;';
rangeSelect.innerHTML = `
  <option value="small">Small (A1:E10)</option>
  <option value="medium">Medium (A1:J50)</option>
  <option value="large">Large (A1:T100)</option>
`;

const rangeDisplay = document.createElement('span');
rangeDisplay.style.cssText = 'color: #666; font-size: 12px;';
rangeDisplay.textContent = formatRange(targetRange);

rangeSelect.addEventListener('change', (e) => {
  const value = (e.target as HTMLSelectElement).value;
  const ranges: Record<string, Range> = {
    small: { start: { row: 0, col: 0 }, end: { row: 9, col: 4 } },
    medium: { start: { row: 0, col: 0 }, end: { row: 49, col: 9 } },
    large: { start: { row: 0, col: 0 }, end: { row: 99, col: 19 } },
  };
  targetRange = ranges[value];
  rangeDisplay.textContent = formatRange(targetRange);
});

rangeLabel.appendChild(rangeLabelText);
rangeLabel.appendChild(rangeSelect);
rangeLabel.appendChild(rangeDisplay);
rangeSelector.appendChild(rangeLabel);

container.appendChild(rangeSelector);

// Create preset picker container
const pickerContainer = document.createElement('div');
container.appendChild(pickerContainer);

// Initialize preset picker
const picker = new CFPresetPicker(pickerContainer, {
  onPresetSelect: (preset) => {
    selectedPreset = preset;
    applyController.setPreset(preset);
    console.log('📦 Vanilla JS: Selected preset:', preset.name);
  },
  onApply: (preset) => {
    // Set target range
    applyController.setTargetRanges([targetRange]);

    // Infer range
    const inferredRange = applyController.inferRange(targetRange, {
      respectHeaders: true,
    });

    console.log('🎯 Vanilla JS: Target range:', formatRange(targetRange));
    console.log('🔍 Vanilla JS: Inferred range:', inferredRange ? formatRange(inferredRange) : 'None');

    // Apply preset
    const newRules = applyController.applyPreset(appliedRules, {
      replaceExisting: false,
      adjustPriority: true,
    });

    appliedRules = newRules;
    console.log('✅ Vanilla JS: Applied rules:', newRules);
    alert(`✅ Applied "${preset.name}" to range ${formatRange(inferredRange || targetRange)}`);

    // Update UI
    updateAppliedRulesUI();
  },
  showPopular: true,
  maxWidth: 700,
});

// Create applied rules container
const appliedRulesContainer = document.createElement('div');
appliedRulesContainer.style.cssText = 'margin-top: 24px;';
container.appendChild(appliedRulesContainer);

// Function to update applied rules UI
function updateAppliedRulesUI() {
  appliedRulesContainer.innerHTML = '';

  if (appliedRules.length === 0) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'padding: 16px; background: #e8f5e9; border-radius: 4px;';

  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0 0 12px 0; font-size: 14px; color: #2e7d32;';
  title.textContent = `✅ Applied Rules (${appliedRules.length})`;
  wrapper.appendChild(title);

  const rulesList = document.createElement('div');
  rulesList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

  appliedRules.forEach((rule) => {
    const ruleCard = document.createElement('div');
    ruleCard.style.cssText = `
      padding: 8px 12px;
      background: white;
      border-radius: 4px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const ruleInfo = document.createElement('span');
    ruleInfo.innerHTML = `<strong>#${rule.priority}</strong> - ${rule.type.replace(/-/g, ' ').toUpperCase()}`;

    const ruleRange = document.createElement('span');
    ruleRange.style.cssText = 'color: #666; font-size: 11px;';
    ruleRange.textContent = rule.ranges?.[0] ? formatRange(rule.ranges[0]) : 'No range';

    ruleCard.appendChild(ruleInfo);
    ruleCard.appendChild(ruleRange);
    rulesList.appendChild(ruleCard);
  });

  wrapper.appendChild(rulesList);
  appliedRulesContainer.appendChild(wrapper);
}

// Create architecture info
const architectureInfo = document.createElement('div');
architectureInfo.style.cssText = 'margin-top: 24px; padding: 16px; background: #fffbea; border-radius: 4px; border-left: 4px solid #f7df1e;';
architectureInfo.innerHTML = `
  <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #d97706;">📜 Vanilla JavaScript Pattern</h3>
  <div style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>Pure DOM APIs:</strong><br />
    • <code>document.createElement()</code> for element creation<br />
    • <code>appendChild()</code> for DOM manipulation<br />
    • <code>addEventListener()</code> for event handling<br />
    • <code>innerHTML</code> and <code>textContent</code> for content<br />
    • <code>style.cssText</code> for inline styles<br />
    <br />
    <strong>No Framework Features:</strong><br />
    • No virtual DOM<br />
    • No reactivity system<br />
    • No templating language<br />
    • No build step required (can run directly in browser)<br />
    <br />
    <strong>Same Controller as React, Vue, Angular, Svelte!</strong> PresetPickerController is pure TypeScript.
  </div>
`;
container.appendChild(architectureInfo);

console.log('🎉 Vanilla JS demo initialized!');
console.log('📦 Preset picker created with pure DOM APIs');
console.log('🏗️ Same PresetPickerController used in React, Vue, Angular, Svelte');
