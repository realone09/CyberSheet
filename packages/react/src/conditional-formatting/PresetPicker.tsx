import React from 'react';
import type { ConditionalFormattingPreset } from './types';
import { buildPresetRules } from './presets';

export type PresetPickerProps = {
	onApplyPreset: (preset: ConditionalFormattingPreset, payload: ReturnType<typeof buildPresetRules>) => void;
};

const presets: Array<{ id: ConditionalFormattingPreset; title: string; description: string }> = [
	{
		id: 'traffic-light',
		title: 'Traffic Light',
		description: 'Green / Yellow / Red status indicators.',
	},
	{
		id: 'heatmap',
		title: 'Heatmap',
		description: 'Color scale gradient for intensity.',
	},
	{
		id: 'kpi',
		title: 'KPI',
		description: 'Icon sets for target thresholds.',
	},
];

export const PresetPicker = ({ onApplyPreset }: PresetPickerProps) => {
	return (
		<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
			<div style={{ fontWeight: 600, marginBottom: 8 }}>Presets</div>
			<div style={{ display: 'grid', gap: 8 }}>
				{presets.map(preset => (
					<button
						key={preset.id}
						type="button"
						onClick={() => onApplyPreset(preset.id, buildPresetRules(preset.id))}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							gap: 4,
							padding: 10,
							borderRadius: 6,
							border: '1px solid #e5e7eb',
							background: '#ffffff',
						}}
					>
						<span style={{ fontWeight: 600 }}>{preset.title}</span>
						<span style={{ fontSize: 12, color: '#6b7280' }}>{preset.description}</span>
					</button>
				))}
			</div>
		</div>
	);
};
