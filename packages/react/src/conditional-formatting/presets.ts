import type { ConditionalFormattingRule } from '@cyber-sheet/core';
import type { ConditionalFormattingPreset } from './types';

export type PresetRuleBundle = {
	name: string;
	rules: ConditionalFormattingRule[];
};

const createTrafficLightPreset = (): PresetRuleBundle => {
	const baseRanges = [{ start: { row: 0, col: 0 }, end: { row: 9, col: 0 } }];
	return {
		name: 'Traffic Light',
		rules: [
			{
				id: 'traffic-light-icon-set',
				type: 'icon-set',
				iconSet: '3-traffic-lights',
				ranges: baseRanges,
				thresholds: [
					{ value: 67, type: 'percent', operator: '>=', icon: 'green' },
					{ value: 33, type: 'percent', operator: '>=', icon: 'yellow' },
					{ value: 0, type: 'percent', operator: '>=', icon: 'red' },
				],
				priority: 10,
				description: 'Traffic light status (top 33% green, mid yellow, bottom red)',
			},
		],
	};
};

const createHeatmapPreset = (): PresetRuleBundle => {
	const baseRanges = [{ start: { row: 0, col: 0 }, end: { row: 9, col: 4 } }];
	return {
		name: 'Heatmap',
		rules: [
			{
				id: 'heatmap-color-scale',
				type: 'color-scale',
				minColor: '#F8696B',
				maxColor: '#63BE7B',
				ranges: baseRanges,
				priority: 5,
				description: 'Heatmap gradient (red to green)',
			},
		],
	};
};

const createKpiPreset = (): PresetRuleBundle => {
	const baseRanges = [{ start: { row: 0, col: 0 }, end: { row: 9, col: 0 } }];
	return {
		name: 'KPI',
		rules: [
			{
				id: 'kpi-icon-set',
				type: 'icon-set',
				iconSet: '3-arrows',
				ranges: baseRanges,
				thresholds: [
					{ value: 75, type: 'percent', operator: '>=', icon: 'up' },
					{ value: 40, type: 'percent', operator: '>=', icon: 'flat' },
					{ value: 0, type: 'percent', operator: '>=', icon: 'down' },
				],
				priority: 10,
				description: 'KPI arrows (top >= 75%, mid >= 40%, bottom < 40%)',
			},
			{
				id: 'kpi-data-bar',
				type: 'data-bar',
				color: '#638EC6',
				gradient: true,
				ranges: baseRanges,
				priority: 5,
				description: 'KPI supporting data bar',
			},
		],
	};
};

export const buildPresetRules = (preset: ConditionalFormattingPreset): PresetRuleBundle => {
	switch (preset) {
		case 'traffic-light':
			return createTrafficLightPreset();
		case 'heatmap':
			return createHeatmapPreset();
		case 'kpi':
			return createKpiPreset();
		default:
			return createHeatmapPreset();
	}
};
