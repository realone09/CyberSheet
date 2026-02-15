import type { ConditionalFormattingRule } from '@cyber-sheet/core';

export type ConditionalFormattingPreset = 'traffic-light' | 'heatmap' | 'kpi';

export type RuleInspectionDetail = {
	cell: { row: number; col: number };
	ruleId: string;
	ruleName: string;
	description?: string;
	rank?: number;
	total?: number;
	message?: string;
};

export type RuleListItem = {
	ruleId: string;
	name: string;
	priority?: number;
	stopIfTrue?: boolean;
};

export type ConditionalFormattingRuleDraft = Partial<ConditionalFormattingRule> & {
	id?: string;
};
