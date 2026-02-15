import React, { useState } from 'react';
import { ConditionalFormattingRuleBuilder } from './ConditionalFormattingRuleBuilder';
import { ConditionalFormattingRuleManager } from './ConditionalFormattingRuleManager';
import type { ConditionalFormattingRule } from '@cyber-sheet/core';

/**
 * ConditionalFormattingPanel
 * 
 * Integration of Rule Builder + Rule Manager
 * Week 1, Day 3: Complete UI flow
 */
export const ConditionalFormattingIntegratedPanel: React.FC = () => {
	const [rules, setRules] = useState<ConditionalFormattingRule[]>([]);
	const [editingRule, setEditingRule] = useState<{
		rule: ConditionalFormattingRule;
		index: number;
	} | null>(null);
	const [isCreatingNew, setIsCreatingNew] = useState(false);

	/**
	 * Handle rule save from builder
	 */
	const handleSaveRule = (rule: ConditionalFormattingRule) => {
		if (editingRule !== null) {
			// Update existing rule
			const updatedRules = [...rules];
			updatedRules[editingRule.index] = rule;
			setRules(updatedRules);
			setEditingRule(null);
		} else {
			// Add new rule
			setRules([...rules, rule]);
			setIsCreatingNew(false);
		}
	};

	/**
	 * Handle rule cancel from builder
	 */
	const handleCancelEdit = () => {
		setEditingRule(null);
		setIsCreatingNew(false);
	};

	/**
	 * Handle rule edit from manager
	 */
	const handleEditRule = (rule: ConditionalFormattingRule, index: number) => {
		setEditingRule({ rule, index });
		setIsCreatingNew(false);
	};

	/**
	 * Handle rule delete from manager
	 */
	const handleDeleteRule = (ruleId: string, index: number) => {
		const updatedRules = rules.filter((_, idx) => idx !== index);
		setRules(updatedRules);
	};

	/**
	 * Handle rule duplicate from manager
	 */
	const handleDuplicateRule = (rule: ConditionalFormattingRule, index: number) => {
		const duplicatedRule = {
			...rule,
			id: `${rule.id}-copy-${Date.now()}`,
			description: `${rule.description || 'Rule'} (Copy)`,
			priority: (rule.priority || 0) - 1,
		};
		setRules([...rules, duplicatedRule]);
	};

	/**
	 * Handle rules reorder from manager
	 */
	const handleReorderRules = (reorderedRules: ConditionalFormattingRule[]) => {
		setRules(reorderedRules);
	};

	/**
	 * Handle create new rule
	 */
	const handleCreateNew = () => {
		setIsCreatingNew(true);
		setEditingRule(null);
	};

	return (
		<div className="cf-integrated-panel">
			<h2>Conditional Formatting</h2>

			{/* Rule Manager: Always visible */}
			<div className="cf-section">
				<ConditionalFormattingRuleManager
					rules={rules}
					onReorder={handleReorderRules}
					onEdit={handleEditRule}
					onDelete={handleDeleteRule}
					onDuplicate={handleDuplicateRule}
					onCreateNew={handleCreateNew}
					showRanges={true}
				/>
			</div>

			{/* Rule Builder: Shown when creating or editing */}
			{(isCreatingNew || editingRule !== null) && (
				<div className="cf-section cf-builder-section">
					<ConditionalFormattingRuleBuilder
						rule={editingRule?.rule || null}
						onSave={handleSaveRule}
						onCancel={handleCancelEdit}
					/>
				</div>
			)}

			<style>{`
				.cf-integrated-panel {
					padding: 24px;
					max-width: 1200px;
					margin: 0 auto;
				}

				.cf-integrated-panel h2 {
					margin: 0 0 24px 0;
					font-size: 24px;
					font-weight: 600;
					color: #333;
				}

				.cf-section {
					margin-bottom: 24px;
				}

				.cf-builder-section {
					padding: 20px;
					background: white;
					border: 2px solid #2196F3;
					border-radius: 8px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				}
			`}</style>
		</div>
	);
};
