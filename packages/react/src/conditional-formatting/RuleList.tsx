import React from 'react';
import type { RuleListItem } from './types';

export type RuleListProps = {
	rules: RuleListItem[];
	selectedRuleId?: string | null;
	onSelect: (ruleId: string) => void;
	onMoveRule?: (ruleId: string, direction: 'up' | 'down') => void;
	onDeleteRule?: (ruleId: string) => void;
};

export const RuleList = ({
	rules,
	selectedRuleId,
	onSelect,
	onMoveRule,
	onDeleteRule,
}: RuleListProps) => {
	return (
		<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
			<div style={{ fontWeight: 600, marginBottom: 8 }}>Rules</div>
			{rules.length === 0 && (
				<div style={{ color: '#6b7280', fontSize: 12 }}>No rules yet. Add one below.</div>
			)}
			<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
				{rules.map(rule => (
					<li key={rule.ruleId}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								padding: 8,
								borderRadius: 6,
								background: rule.ruleId === selectedRuleId ? '#eef2ff' : '#f9fafb',
								border: '1px solid #e5e7eb',
								cursor: 'pointer',
							}}
							onClick={() => onSelect(rule.ruleId)}
						>
							<div style={{ flex: 1 }}>
								<div style={{ fontWeight: 600 }}>{rule.name}</div>
								<div style={{ fontSize: 12, color: '#6b7280' }}>
									Priority: {rule.priority ?? 0} · stopIfTrue: {rule.stopIfTrue ? 'Yes' : 'No'}
								</div>
							</div>
							<div style={{ display: 'flex', gap: 4 }}>
								{onMoveRule && (
									<>
										<button type="button" onClick={() => onMoveRule(rule.ruleId, 'up')}>↑</button>
										<button type="button" onClick={() => onMoveRule(rule.ruleId, 'down')}>↓</button>
									</>
								)}
								{onDeleteRule && (
									<button type="button" onClick={() => onDeleteRule(rule.ruleId)}>✕</button>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
