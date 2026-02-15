import React, { useState } from 'react';
import type { ConditionalFormattingRule } from '@cyber-sheet/core';

type DragState = {
	draggedIndex: number | null;
	draggedOverIndex: number | null;
};

export type ConditionalFormattingRuleManagerProps = {
	/** List of rules for the current worksheet/range */
	rules: ConditionalFormattingRule[];
	/** Callback when rules are reordered */
	onReorder: (rules: ConditionalFormattingRule[]) => void;
	/** Callback to edit a rule */
	onEdit: (rule: ConditionalFormattingRule, index: number) => void;
	/** Callback to delete a rule */
	onDelete: (ruleId: string, index: number) => void;
	/** Callback to duplicate a rule */
	onDuplicate: (rule: ConditionalFormattingRule, index: number) => void;
	/** Callback to toggle rule enabled state */
	onToggleEnabled?: (ruleId: string, enabled: boolean) => void;
	/** Callback to create a new rule */
	onCreateNew?: () => void;
	/** Optional: Show range information for each rule */
	showRanges?: boolean;
};

/**
 * ConditionalFormattingRuleManager
 * 
 * Excel-style rule management panel with:
 * - Drag & drop reordering (rule priority)
 * - Enable/disable toggle
 * - Edit/Delete/Duplicate actions
 * - stopIfTrue visualization
 * - Rule metadata display
 * 
 * Week 1, Day 3: Rule Management Panel implementation
 */
export const ConditionalFormattingRuleManager: React.FC<ConditionalFormattingRuleManagerProps> = ({
	rules,
	onReorder,
	onEdit,
	onDelete,
	onDuplicate,
	onToggleEnabled,
	onCreateNew,
	showRanges = false,
}) => {
	const [dragState, setDragState] = useState<DragState>({
		draggedIndex: null,
		draggedOverIndex: null,
	});

	const [enabledRules, setEnabledRules] = useState<Set<string>>(
		new Set(rules.map((r) => r.id || ''))
	);

	/**
	 * Handle drag start
	 */
	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		e.dataTransfer.effectAllowed = 'move';
		setDragState({ draggedIndex: index, draggedOverIndex: null });
	};

	/**
	 * Handle drag over
	 */
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		setDragState({ ...dragState, draggedOverIndex: index });
	};

	/**
	 * Handle drop - reorder rules
	 */
	const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
		e.preventDefault();
		const { draggedIndex } = dragState;

		if (draggedIndex === null || draggedIndex === dropIndex) {
			setDragState({ draggedIndex: null, draggedOverIndex: null });
			return;
		}

		// Reorder rules array
		const reorderedRules = [...rules];
		const [draggedRule] = reorderedRules.splice(draggedIndex, 1);
		reorderedRules.splice(dropIndex, 0, draggedRule);

		// Update priorities based on new order
		const rulesWithUpdatedPriority = reorderedRules.map((rule, idx) => ({
			...rule,
			priority: reorderedRules.length - idx, // Higher priority = earlier in list
		}));

		onReorder(rulesWithUpdatedPriority);
		setDragState({ draggedIndex: null, draggedOverIndex: null });
	};

	/**
	 * Handle drag end
	 */
	const handleDragEnd = () => {
		setDragState({ draggedIndex: null, draggedOverIndex: null });
	};

	/**
	 * Toggle rule enabled state
	 */
	const handleToggleEnabled = (ruleId: string, currentEnabled: boolean) => {
		const newEnabled = !currentEnabled;
		const newEnabledSet = new Set(enabledRules);
		
		if (newEnabled) {
			newEnabledSet.add(ruleId);
		} else {
			newEnabledSet.delete(ruleId);
		}
		
		setEnabledRules(newEnabledSet);
		onToggleEnabled?.(ruleId, newEnabled);
	};

	/**
	 * Get human-readable rule description
	 */
	const getRuleDescription = (rule: ConditionalFormattingRule): string => {
		if (rule.description) return rule.description;

		switch (rule.type) {
			case 'color-scale':
				return 'Color Scale';
			case 'data-bar':
				return 'Data Bar';
			case 'icon-set':
				return `Icon Set (${rule.iconSet})`;
			case 'formula':
				return `Formula: ${rule.expression}`;
			case 'value':
				return `Value ${rule.operator} ${rule.value}`;
			case 'top-bottom':
				return `${rule.mode === 'top' ? 'Top' : 'Bottom'} ${rule.rank}${rule.rankType === 'percent' ? '%' : ''}`;
			case 'above-average':
				return rule.mode === 'above' ? 'Above Average' : 'Below Average';
			case 'duplicate-unique':
				return rule.mode === 'duplicate' ? 'Duplicate Values' : 'Unique Values';
			case 'date-occurring':
				return `Date: ${rule.timePeriod.replace(/-/g, ' ')}`;
			case 'text':
				return `Text ${rule.mode}: "${rule.text}"`;
			case 'errors-blank':
				return rule.mode.replace(/-/g, ' ');
			default:
				return 'Unknown Rule';
		}
	};

	/**
	 * Get rule type badge color
	 */
	const getRuleTypeBadgeColor = (type: string): string => {
		const colors: Record<string, string> = {
			'color-scale': '#4CAF50',
			'data-bar': '#2196F3',
			'icon-set': '#FF9800',
			'formula': '#9C27B0',
			'value': '#F44336',
			'top-bottom': '#E91E63',
			'above-average': '#00BCD4',
			'duplicate-unique': '#8BC34A',
			'date-occurring': '#FFC107',
			'text': '#795548',
			'errors-blank': '#607D8B',
		};
		return colors[type] || '#999';
	};

	/**
	 * Format ranges for display
	 */
	const formatRanges = (rule: ConditionalFormattingRule): string => {
		if (!rule.ranges || rule.ranges.length === 0) return 'No range';
		return rule.ranges
			.map((r) => `${String.fromCharCode(64 + r.start.col)}${r.start.row}:${String.fromCharCode(64 + r.end.col)}${r.end.row}`)
			.join(', ');
	};

	return (
		<div className="cf-rule-manager">
			<div className="cf-manager-header">
				<h3>Conditional Formatting Rules</h3>
				{onCreateNew && (
					<button onClick={onCreateNew} className="btn-primary btn-sm">
						+ New Rule
					</button>
				)}
			</div>

			{rules.length === 0 ? (
				<div className="cf-empty-state">
					<p>No conditional formatting rules.</p>
					{onCreateNew && (
						<button onClick={onCreateNew} className="btn-secondary">
							Create First Rule
						</button>
					)}
				</div>
			) : (
				<div className="cf-rules-list">
					{rules.map((rule, index) => {
						const ruleId = rule.id || `rule-${index}`;
						const isEnabled = enabledRules.has(ruleId);
						const isDragging = dragState.draggedIndex === index;
						const isDraggedOver = dragState.draggedOverIndex === index;

						return (
							<div
								key={ruleId}
								className={`cf-rule-item ${isDragging ? 'dragging' : ''} ${
									isDraggedOver ? 'drag-over' : ''
								} ${!isEnabled ? 'disabled' : ''}`}
								draggable
								onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, index)}
								onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, index)}
								onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, index)}
								onDragEnd={handleDragEnd}
							>
								{/* Drag Handle */}
								<div className="cf-rule-drag-handle" title="Drag to reorder">
									⋮⋮
								</div>

								{/* Rule Priority Badge */}
								<div className="cf-rule-priority" title="Priority (higher = first)">
									{rule.priority || index + 1}
								</div>

								{/* Rule Content */}
								<div className="cf-rule-content">
									<div className="cf-rule-header">
										<span
											className="cf-rule-type-badge"
											style={{ backgroundColor: getRuleTypeBadgeColor(rule.type) }}
										>
											{rule.type}
										</span>
										<span className="cf-rule-description">
											{getRuleDescription(rule)}
										</span>
										{rule.stopIfTrue && (
											<span className="cf-rule-stop-if-true" title="Stop if true">
												🛑 Stop
											</span>
										)}
									</div>

									{showRanges && (
										<div className="cf-rule-ranges" title="Applied ranges">
											📍 {formatRanges(rule)}
										</div>
									)}
								</div>

								{/* Rule Actions */}
								<div className="cf-rule-actions">
									{/* Enable/Disable Toggle */}
									<label className="cf-toggle" title={isEnabled ? 'Disable rule' : 'Enable rule'}>
										<input
											type="checkbox"
											checked={isEnabled}
											onChange={() => handleToggleEnabled(ruleId, isEnabled)}
										/>
										<span className="cf-toggle-slider"></span>
									</label>

									{/* Edit Button */}
									<button
										onClick={() => onEdit(rule, index)}
										className="btn-icon"
										title="Edit rule"
									>
										✏️
									</button>

									{/* Duplicate Button */}
									<button
										onClick={() => onDuplicate(rule, index)}
										className="btn-icon"
										title="Duplicate rule"
									>
										📋
									</button>

									{/* Delete Button */}
									<button
										onClick={() => onDelete(ruleId, index)}
										className="btn-icon btn-danger"
										title="Delete rule"
									>
										🗑️
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Rule Order Explanation */}
			{rules.length > 1 && (
				<div className="cf-manager-footer">
					<small>
						💡 Rules are applied from top to bottom. Drag to reorder. Use "Stop if true" to prevent
						lower-priority rules from applying.
					</small>
				</div>
			)}

			<style>{`
				.cf-rule-manager {
					padding: 16px;
					background: #f5f5f5;
					border-radius: 8px;
					max-width: 800px;
				}

				.cf-manager-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 16px;
				}

				.cf-manager-header h3 {
					margin: 0;
					font-size: 18px;
					font-weight: 600;
				}

				.cf-empty-state {
					text-align: center;
					padding: 40px 20px;
					background: white;
					border-radius: 4px;
					border: 2px dashed #ddd;
				}

				.cf-empty-state p {
					color: #666;
					margin-bottom: 16px;
				}

				.cf-rules-list {
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				.cf-rule-item {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px;
					background: white;
					border: 2px solid #e0e0e0;
					border-radius: 4px;
					cursor: grab;
					transition: all 0.2s ease;
				}

				.cf-rule-item:hover {
					border-color: #2196F3;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}

				.cf-rule-item.dragging {
					opacity: 0.5;
					cursor: grabbing;
				}

				.cf-rule-item.drag-over {
					border-color: #4CAF50;
					border-style: dashed;
					background: #e8f5e9;
				}

				.cf-rule-item.disabled {
					opacity: 0.5;
					background: #fafafa;
				}

				.cf-rule-drag-handle {
					font-size: 20px;
					color: #999;
					cursor: grab;
					user-select: none;
					line-height: 1;
				}

				.cf-rule-item.dragging .cf-rule-drag-handle {
					cursor: grabbing;
				}

				.cf-rule-priority {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 32px;
					height: 32px;
					background: #e3f2fd;
					border-radius: 50%;
					font-weight: 600;
					font-size: 14px;
					color: #1976d2;
					flex-shrink: 0;
				}

				.cf-rule-content {
					flex: 1;
					min-width: 0;
				}

				.cf-rule-header {
					display: flex;
					align-items: center;
					gap: 8px;
					flex-wrap: wrap;
				}

				.cf-rule-type-badge {
					padding: 4px 8px;
					border-radius: 4px;
					font-size: 11px;
					font-weight: 600;
					color: white;
					text-transform: uppercase;
					white-space: nowrap;
				}

				.cf-rule-description {
					font-size: 14px;
					font-weight: 500;
					color: #333;
					flex: 1;
					min-width: 0;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.cf-rule-stop-if-true {
					padding: 2px 6px;
					background: #fff3e0;
					border: 1px solid #ff9800;
					border-radius: 3px;
					font-size: 11px;
					font-weight: 600;
					color: #e65100;
					white-space: nowrap;
				}

				.cf-rule-ranges {
					font-size: 12px;
					color: #666;
					margin-top: 4px;
					font-family: monospace;
				}

				.cf-rule-actions {
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.cf-toggle {
					position: relative;
					display: inline-block;
					width: 44px;
					height: 24px;
					cursor: pointer;
				}

				.cf-toggle input {
					opacity: 0;
					width: 0;
					height: 0;
				}

				.cf-toggle-slider {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: #ccc;
					border-radius: 24px;
					transition: 0.3s;
				}

				.cf-toggle-slider:before {
					position: absolute;
					content: "";
					height: 18px;
					width: 18px;
					left: 3px;
					bottom: 3px;
					background-color: white;
					border-radius: 50%;
					transition: 0.3s;
				}

				.cf-toggle input:checked + .cf-toggle-slider {
					background-color: #4CAF50;
				}

				.cf-toggle input:checked + .cf-toggle-slider:before {
					transform: translateX(20px);
				}

				.btn-icon {
					padding: 6px 8px;
					background: transparent;
					border: 1px solid #ddd;
					border-radius: 4px;
					cursor: pointer;
					font-size: 16px;
					transition: all 0.2s;
				}

				.btn-icon:hover {
					background: #f5f5f5;
					border-color: #999;
				}

				.btn-icon.btn-danger:hover {
					background: #ffebee;
					border-color: #f44336;
				}

				.btn-primary {
					padding: 8px 16px;
					background: #2196F3;
					color: white;
					border: none;
					border-radius: 4px;
					font-weight: 500;
					cursor: pointer;
					transition: background 0.2s;
				}

				.btn-primary:hover {
					background: #1976d2;
				}

				.btn-primary.btn-sm {
					padding: 6px 12px;
					font-size: 14px;
				}

				.btn-secondary {
					padding: 8px 16px;
					background: white;
					color: #2196F3;
					border: 2px solid #2196F3;
					border-radius: 4px;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s;
				}

				.btn-secondary:hover {
					background: #e3f2fd;
				}

				.cf-manager-footer {
					margin-top: 16px;
					padding: 12px;
					background: #fff8e1;
					border-left: 4px solid #ffc107;
					border-radius: 4px;
				}

				.cf-manager-footer small {
					color: #666;
					line-height: 1.5;
				}
			`}</style>
		</div>
	);
};
