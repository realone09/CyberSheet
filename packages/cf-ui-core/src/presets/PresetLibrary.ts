import type { CFPreset } from '../types/PresetTypes';

/**
 * Built-in CF Preset Library
 * Excel-compatible presets ready to apply
 */

export const PRESET_LIBRARY: CFPreset[] = [
	// ===== DATA BARS =====
	{
		id: 'data-bar-blue',
		name: 'Blue Data Bar',
		description: 'Gradient blue bars showing relative values',
		category: 'data-bars',
		thumbnail: 'data:image/svg+xml;base64,...', // Placeholder
		tags: ['popular', 'simple', 'visual'],
		popularityRank: 1,
		rules: [
			{
				type: 'data-bar',
				color: '#5b9bd5',
				showValue: true,
				gradient: true,
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'data-bar-green',
		name: 'Green Data Bar',
		description: 'Gradient green bars for positive metrics',
		category: 'data-bars',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['positive', 'growth'],
		popularityRank: 2,
		rules: [
			{
				type: 'data-bar',
				color: '#70ad47',
				showValue: true,
				gradient: true,
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'data-bar-red',
		name: 'Red Data Bar',
		description: 'Gradient red bars for negative metrics',
		category: 'data-bars',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['negative', 'alert'],
		popularityRank: 3,
		rules: [
			{
				type: 'data-bar',
				color: '#ff6b6b',
				showValue: true,
				gradient: true,
				stopIfTrue: false,
			},
		],
	},

	// ===== COLOR SCALES =====
	{
		id: 'color-scale-red-yellow-green',
		name: 'Red-Yellow-Green Color Scale',
		description: 'Traffic light colors (low=red, mid=yellow, high=green)',
		category: 'color-scales',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'traffic-light', 'heatmap'],
		popularityRank: 1,
		rules: [
			{
				type: 'color-scale',
				minColor: '#f8696b',
				midColor: '#ffeb84',
				maxColor: '#63be7b',
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'color-scale-green-yellow-red',
		name: 'Green-Yellow-Red Color Scale',
		description: 'Reverse traffic light (low=green, high=red)',
		category: 'color-scales',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['reverse', 'risk'],
		popularityRank: 2,
		rules: [
			{
				type: 'color-scale',
				minColor: '#63be7b',
				midColor: '#ffeb84',
				maxColor: '#f8696b',
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'color-scale-white-blue',
		name: 'White-Blue Color Scale',
		description: 'Cool gradient from white to blue',
		category: 'color-scales',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['cool', 'subtle'],
		popularityRank: 3,
		rules: [
			{
				type: 'color-scale',
				minColor: '#ffffff',
				maxColor: '#5b9bd5',
				stopIfTrue: false,
			},
		],
	},

	// ===== ICON SETS =====
	{
		id: 'icon-set-3-arrows',
		name: '3 Arrows',
		description: 'Up/sideways/down arrows for trends',
		category: 'icon-sets',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'trend', 'arrows'],
		popularityRank: 1,
		rules: [
			{
				type: 'icon-set',
				iconSet: '3-arrows' as any,
				thresholds: [
					{ type: 'percent', value: 67, operator: '>=', icon: 'up' },
					{ type: 'percent', value: 33, operator: '>=', icon: 'side' },
				],
				reverseOrder: false,
				showIconOnly: false,
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'icon-set-3-traffic-lights',
		name: '3 Traffic Lights',
		description: 'Red/yellow/green circles',
		category: 'icon-sets',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'status'],
		popularityRank: 2,
		rules: [
			{
				type: 'icon-set',
				iconSet: '3-traffic-lights' as any,
				thresholds: [
					{ type: 'percent', value: 67, operator: '>=', icon: 'green' },
					{ type: 'percent', value: 33, operator: '>=', icon: 'yellow' },
				],
				reverseOrder: false,
				showIconOnly: false,
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'icon-set-5-quarters',
		name: '5 Quarters',
		description: 'Rating indicators (0-5 quarters)',
		category: 'icon-sets',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['rating', 'detailed'],
		popularityRank: 3,
		rules: [
			{
				type: 'icon-set',
				iconSet: '5-quarters' as any,
				thresholds: [
					{ type: 'percent', value: 80, operator: '>=', icon: '5' },
					{ type: 'percent', value: 60, operator: '>=', icon: '4' },
					{ type: 'percent', value: 40, operator: '>=', icon: '3' },
					{ type: 'percent', value: 20, operator: '>=', icon: '2' },
				],
				reverseOrder: false,
				showIconOnly: false,
				stopIfTrue: false,
			},
		],
	},

	// ===== TOP/BOTTOM =====
	{
		id: 'top-10-percent',
		name: 'Top 10%',
		description: 'Highlight top 10% of values',
		category: 'top-bottom',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'top', 'winners'],
		popularityRank: 1,
		rules: [
			{
				type: 'top-bottom',
				mode: 'top',
				rank: 10,
				rankType: 'percent',
				style: {
					fillColor: '#c6efce',
					fontColor: '#006100',
					bold: true,
				},
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'top-10-items',
		name: 'Top 10 Items',
		description: 'Highlight top 10 values',
		category: 'top-bottom',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['top', 'count'],
		popularityRank: 2,
		rules: [
			{
				type: 'top-bottom',
				mode: 'top',
				rank: 10,
				rankType: 'items',
				style: {
					fillColor: '#c6efce',
					fontColor: '#006100',
				},
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'bottom-10-percent',
		name: 'Bottom 10%',
		description: 'Highlight bottom 10% of values',
		category: 'top-bottom',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['bottom', 'losers'],
		popularityRank: 3,
		rules: [
			{
				type: 'top-bottom',
				mode: 'bottom',
				rank: 10,
				rankType: 'percent',
				style: {
					fillColor: '#ffc7ce',
					fontColor: '#9c0006',
					bold: true,
				},
				stopIfTrue: false,
			},
		],
	},

	// ===== ABOVE/BELOW AVERAGE =====
	{
		id: 'above-average',
		name: 'Above Average',
		description: 'Highlight values above average',
		category: 'above-below',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'average'],
		popularityRank: 1,
		rules: [
			{
				type: 'above-average',
				mode: 'above',
				style: {
					fillColor: '#c6efce',
					fontColor: '#006100',
				},
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'below-average',
		name: 'Below Average',
		description: 'Highlight values below average',
		category: 'above-below',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['average'],
		popularityRank: 2,
		rules: [
			{
				type: 'above-average',
				mode: 'below',
				style: {
					fillColor: '#ffc7ce',
					fontColor: '#9c0006',
				},
				stopIfTrue: false,
			},
		],
	},

	// ===== DUPLICATES =====
	{
		id: 'duplicate-values',
		name: 'Duplicate Values',
		description: 'Highlight duplicate values in pink',
		category: 'duplicates',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['popular', 'duplicates'],
		popularityRank: 1,
		rules: [
			{
				type: 'duplicate-unique',
				mode: 'duplicate',
				style: {
					fillColor: '#ffc7ce',
					fontColor: '#9c0006',
				},
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'unique-values',
		name: 'Unique Values',
		description: 'Highlight unique values in green',
		category: 'duplicates',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['unique'],
		popularityRank: 2,
		rules: [
			{
				type: 'duplicate-unique',
				mode: 'unique',
				style: {
					fillColor: '#c6efce',
					fontColor: '#006100',
				},
				stopIfTrue: false,
			},
		],
	},

	// ===== TEXT =====
	{
		id: 'text-contains',
		name: 'Text Contains...',
		description: 'Highlight cells containing specific text',
		category: 'text',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['text', 'search'],
		popularityRank: 1,
		rules: [
			{
				type: 'text',
				mode: 'contains',
				text: '', // User will customize
				style: {
					fillColor: '#ffeb9c',
					fontColor: '#9c5700',
				},
				stopIfTrue: false,
			},
		],
	},

	// ===== DATES =====
	{
		id: 'date-occurring-today',
		name: "Today's Dates",
		description: 'Highlight dates occurring today',
		category: 'dates',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['date', 'today'],
		popularityRank: 1,
		rules: [
			{
				type: 'date-occurring',
				timePeriod: 'today',
				style: {
					fillColor: '#c6efce',
					fontColor: '#006100',
					bold: true,
				},
				stopIfTrue: false,
			},
		],
	},
	{
		id: 'date-occurring-this-week',
		name: 'This Week',
		description: 'Highlight dates in current week',
		category: 'dates',
		thumbnail: 'data:image/svg+xml;base64,...',
		tags: ['date', 'week'],
		popularityRank: 2,
		rules: [
			{
				type: 'date-occurring',
				timePeriod: 'this-week',
				style: {
					fillColor: '#ffeb9c',
					fontColor: '#9c5700',
				},
				stopIfTrue: false,
			},
		],
	},
];

/**
 * Get all presets
 */
export function getAllPresets(): CFPreset[] {
	return [...PRESET_LIBRARY];
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): CFPreset | undefined {
	return PRESET_LIBRARY.find((p) => p.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): CFPreset[] {
	if (category === 'all') {
		return getAllPresets();
	}
	return PRESET_LIBRARY.filter((p) => p.category === category);
}

/**
 * Search presets by name or tags
 */
export function searchPresets(query: string): CFPreset[] {
	const lowerQuery = query.toLowerCase().trim();
	if (!lowerQuery) {
		return getAllPresets();
	}

	return PRESET_LIBRARY.filter((p) => {
		return (
			p.name.toLowerCase().includes(lowerQuery) ||
			p.description.toLowerCase().includes(lowerQuery) ||
			p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
		);
	});
}

/**
 * Get popular presets (top 10)
 */
export function getPopularPresets(limit: number = 10): CFPreset[] {
	return PRESET_LIBRARY.filter((p) => p.popularityRank !== undefined)
		.sort((a, b) => (a.popularityRank || 999) - (b.popularityRank || 999))
		.slice(0, limit);
}
