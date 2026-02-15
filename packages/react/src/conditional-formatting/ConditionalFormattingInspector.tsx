import React, { useState, useEffect } from 'react';
import type { ConditionalFormattingRule, Address, CellValue } from '@cyber-sheet/core';
import { RuleInspectorController, type InspectorData } from '@cyber-sheet/cf-ui-core';
import { formatAddress } from '@cyber-sheet/cf-ui-core';

/**
 * Props for ConditionalFormattingInspector
 */
export type ConditionalFormattingInspectorProps = {
	/** All conditional formatting rules in priority order */
	rules: ConditionalFormattingRule[];
	/** Current cell address being inspected */
	address: Address;
	/** Cell value */
	value: CellValue;
	/** Function to get value of any cell (for range calculations) */
	getValue: (addr: Address) => CellValue;
	/** Position of tooltip (relative to cell) */
	position?: { x: number; y: number };
	/** Callback when inspector is closed */
	onClose?: () => void;
};

/**
 * ConditionalFormattingInspector - React Component
 * 
 * Excel-killer feature: Hover over cell to see applied CF rules with details
 * Shows: Rule type, reason, rank, threshold, source (preset vs manual)
 * 
 * This is a THIN ADAPTER around RuleInspectorController (framework-agnostic core)
 */
export const ConditionalFormattingInspector: React.FC<ConditionalFormattingInspectorProps> = ({
	rules,
	address,
	value,
	getValue,
	position = { x: 0, y: 0 },
	onClose,
}) => {
	const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);
	const [controller] = useState<RuleInspectorController>(() => new RuleInspectorController(rules));

	// Update controller when rules change
	useEffect(() => {
		controller.updateRules(rules);
	}, [controller, rules]);

	// Get inspector data when address/value changes
	useEffect(() => {
		const data = controller.getInspectorData(address, value, getValue);
		setInspectorData(data);
	}, [controller, address, value, getValue]);

	// Don't render if no conditional formatting applied
	if (!inspectorData || !inspectorData.hasConditionalFormatting) {
		return null;
	}

	return (
		<div
			className="cf-inspector"
			style={{
				position: 'absolute',
				top: position.y,
				left: position.x,
				zIndex: 10000,
				backgroundColor: 'white',
				border: '1px solid #ccc',
				borderRadius: '4px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
				padding: '12px',
				minWidth: '280px',
				maxWidth: '400px',
				fontSize: '13px',
			}}
		>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
					paddingBottom: '8px',
					borderBottom: '1px solid #e0e0e0',
				}}
			>
				<div style={{ fontWeight: 600, fontSize: '14px' }}>
					Conditional Formatting
				</div>
				<div style={{ color: '#666', fontSize: '12px' }}>
					{formatAddress(address)}
				</div>
				{onClose && (
					<button
						onClick={onClose}
						style={{
							border: 'none',
							background: 'none',
							cursor: 'pointer',
							fontSize: '16px',
							color: '#999',
							padding: '0 4px',
						}}
					>
						×
					</button>
				)}
			</div>

			{/* Cell Value */}
			<div style={{ marginBottom: '12px', color: '#666', fontSize: '12px' }}>
				Value: <strong>{String(value)}</strong>
			</div>

			{/* Applied Rules */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				{inspectorData.appliedRules.map((ruleInfo, idx) => (
					<div
						key={idx}
						style={{
							padding: '10px',
							backgroundColor: '#f8f9fa',
							borderRadius: '4px',
							borderLeft: '3px solid #007acc',
						}}
					>
						{/* Rule Type Badge */}
						<div style={{ marginBottom: '6px' }}>
							<span
								style={{
									display: 'inline-block',
									padding: '2px 8px',
									backgroundColor: '#007acc',
									color: 'white',
									borderRadius: '3px',
									fontSize: '11px',
									fontWeight: 600,
									textTransform: 'uppercase',
								}}
							>
								{ruleInfo.rule.type.replace(/-/g, ' ')}
							</span>
							{ruleInfo.rule.stopIfTrue && (
								<span
									style={{
										marginLeft: '6px',
										fontSize: '11px',
										color: '#999',
									}}
								>
									(Stop if true)
								</span>
							)}
						</div>

						{/* Reason */}
						<div style={{ marginBottom: '6px', fontWeight: 500 }}>
							{ruleInfo.reason}
						</div>

						{/* Rank Info (for top/bottom rules) */}
						{ruleInfo.rank && (
							<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
								<div>Rank: {ruleInfo.rank.position} / {ruleInfo.rank.total}</div>
								<div>Threshold: {typeof ruleInfo.rank.threshold === 'number' 
									? ruleInfo.rank.threshold.toFixed(2) 
									: ruleInfo.rank.threshold}</div>
								{ruleInfo.rank.percentage !== undefined && (
									<div>Percentile: {ruleInfo.rank.percentage}%</div>
								)}
							</div>
						)}

						{/* Icon Info (for icon-set rules) */}
						{ruleInfo.icon && (
							<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
								<div>Icon Set: {ruleInfo.icon.iconSet}</div>
								<div>Icon: {ruleInfo.icon.iconName}</div>
							</div>
						)}

						{/* Source */}
						<div
							style={{
								marginTop: '6px',
								fontSize: '11px',
								color: '#999',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<span>
								Source: {ruleInfo.source === 'preset' ? '📦 Preset' : '✏️ Manual'}
							</span>
							{ruleInfo.presetName && (
								<span style={{ fontWeight: 500 }}>
									{ruleInfo.presetName}
								</span>
							)}
							<span style={{ color: '#ccc' }}>
								Priority: {ruleInfo.ruleIndex + 1}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Footer */}
			<div
				style={{
					marginTop: '12px',
					paddingTop: '8px',
					borderTop: '1px solid #e0e0e0',
					fontSize: '11px',
					color: '#999',
					textAlign: 'center',
				}}
			>
				{inspectorData.appliedRules.length} rule{inspectorData.appliedRules.length !== 1 ? 's' : ''} applied
			</div>
		</div>
	);
};

export default ConditionalFormattingInspector;
