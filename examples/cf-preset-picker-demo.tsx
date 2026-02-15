import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ConditionalFormattingRule, Range } from '@cyber-sheet/core';
import type { CFPreset } from '../packages/cf-ui-core/src/types/PresetTypes';
import { ConditionalFormattingPresetPicker } from '../packages/react/src/conditional-formatting/ConditionalFormattingPresetPicker';
import { PresetApplyController } from '../packages/cf-ui-core/src/controllers/PresetApplyController';
import { formatRange } from '../packages/cf-ui-core/src/formatters/RangeFormatter';

/**
 * CF Preset Picker Demo - Day 5
 * Demonstrates preset selection, range inference, and application
 */

const CFPresetPickerDemo: React.FC = () => {
	const [selectedPreset, setSelectedPreset] = useState<CFPreset | null>(null);
	const [appliedRules, setAppliedRules] = useState<ConditionalFormattingRule[]>([]);
	const [targetRange, setTargetRange] = useState<Range>({ 
		start: { row: 0, col: 0 }, 
		end: { row: 9, col: 4 } 
	});
	const [applyController] = useState(() => new PresetApplyController());

	const handlePresetSelect = (preset: CFPreset) => {
		setSelectedPreset(preset);
		applyController.setPreset(preset);
		console.log('📦 Selected preset:', preset.name);
	};

	const handleApply = (preset: CFPreset) => {
		// Set target range
		applyController.setTargetRanges([targetRange]);
		
		// Infer range (expand if needed)
		const inferredRange = applyController.inferRange(targetRange, {
			respectHeaders: true,
		});

		console.log('🎯 Target range:', formatRange(targetRange));
		console.log('🔍 Inferred range:', inferredRange ? formatRange(inferredRange) : 'None');

		// Apply preset
		const newRules = applyController.applyPreset(appliedRules, {
			replaceExisting: false,
			adjustPriority: true,
		});

		setAppliedRules(newRules);
		console.log('✅ Applied rules:', newRules);
		alert(`✅ Applied "${preset.name}" to range ${formatRange(inferredRange || targetRange)}`);
	};

	const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const ranges: Record<string, Range> = {
			small: { start: { row: 0, col: 0 }, end: { row: 9, col: 4 } },
			medium: { start: { row: 0, col: 0 }, end: { row: 49, col: 9 } },
			large: { start: { row: 0, col: 0 }, end: { row: 99, col: 19 } },
		};
		setTargetRange(ranges[e.target.value]);
	};

	return (
		<div>
			{/* Range Selector */}
			<div style={{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '4px' }}>
				<label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
					<strong>Target Range:</strong>
					<select 
						onChange={handleRangeChange}
						style={{
							padding: '6px 12px',
							border: '1px solid #ddd',
							borderRadius: '4px',
							fontSize: '13px',
						}}
					>
						<option value="small">Small (A1:E10)</option>
						<option value="medium">Medium (A1:J50)</option>
						<option value="large">Large (A1:T100)</option>
					</select>
					<span style={{ color: '#666', fontSize: '12px' }}>
						{formatRange(targetRange)}
					</span>
				</label>
			</div>

			{/* Preset Picker */}
			<ConditionalFormattingPresetPicker
				onPresetSelect={handlePresetSelect}
				onApply={handleApply}
				showPopular={true}
				maxWidth={700}
			/>

			{/* Applied Rules Summary */}
			{appliedRules.length > 0 && (
				<div style={{ marginTop: '24px', padding: '16px', background: '#e8f5e9', borderRadius: '4px' }}>
					<h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2e7d32' }}>
						✅ Applied Rules ({appliedRules.length})
					</h3>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						{appliedRules.map((rule, index) => (
							<div
								key={index}
								style={{
									padding: '8px 12px',
									background: 'white',
									borderRadius: '4px',
									fontSize: '12px',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<span>
									<strong>#{rule.priority}</strong> - {rule.type.replace(/-/g, ' ').toUpperCase()}
								</span>
								<span style={{ color: '#666', fontSize: '11px' }}>
									{rule.ranges?.[0] ? formatRange(rule.ranges[0]) : 'No range'}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Architecture Info */}
			<div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
				<h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🏗️ Framework-Agnostic Architecture</h3>
				<div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
					<strong>Core Logic (cf-ui-core):</strong><br />
					• PresetPickerController - Selection, filtering, search<br />
					• PresetApplyController - Range inference, preview, apply<br />
					• PresetLibrary - 20+ Excel-compatible presets<br />
					<br />
					<strong>React Adapter:</strong><br />
					• ConditionalFormattingPresetPicker.tsx - UI wrapper<br />
					• useState for component state<br />
					• useEffect for controller events<br />
					<br />
					<strong>Next:</strong> Vue, Angular, Svelte, Vanilla JS adapters using same controllers!
				</div>
			</div>
		</div>
	);
};

// Mount the demo
const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<CFPresetPickerDemo />);
}
