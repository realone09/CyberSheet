import React from 'react';
import type { ConditionalFormattingRuleDraft, ConditionalFormattingPreset, RuleInspectionDetail, RuleListItem } from './types';
import type { PresetRuleBundle } from './presets';
import { RuleList } from './RuleList';
import { RuleBuilder } from './RuleBuilder';
import { PresetPicker } from './PresetPicker';
import { RuleInspector } from './RuleInspector';

export type ConditionalFormattingPanelProps = {
	rules: RuleListItem[];
	selectedRuleId?: string | null;
	activeRule: ConditionalFormattingRuleDraft | null;
	inspection: RuleInspectionDetail | null;
	onSelectRule: (ruleId: string) => void;
	onMoveRule?: (ruleId: string, direction: 'up' | 'down') => void;
	onDeleteRule?: (ruleId: string) => void;
	onRuleChange: (rule: ConditionalFormattingRuleDraft) => void;
	onSaveRule: () => void;
	onCancelRule?: () => void;
	onApplyPreset: (preset: ConditionalFormattingPreset, payload: PresetRuleBundle) => void;
};

export const ConditionalFormattingPanel = ({
	rules,
	selectedRuleId,
	activeRule,
	inspection,
	onSelectRule,
	onMoveRule,
	onDeleteRule,
	onRuleChange,
	onSaveRule,
	onCancelRule,
	onApplyPreset,
}: ConditionalFormattingPanelProps) => {
	return (
		<div style={{ display: 'grid', gap: 16 }}>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<RuleList
					rules={rules}
					selectedRuleId={selectedRuleId}
					onSelect={onSelectRule}
					onMoveRule={onMoveRule}
					onDeleteRule={onDeleteRule}
				/>
				<RuleBuilder rule={activeRule} onChange={onRuleChange} onSave={onSaveRule} onCancel={onCancelRule} />
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<PresetPicker onApplyPreset={onApplyPreset} />
				<RuleInspector inspection={inspection} />
			</div>
		</div>
	);
};
