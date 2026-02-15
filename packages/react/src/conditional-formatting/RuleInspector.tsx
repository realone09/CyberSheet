import React from 'react';
import type { RuleInspectionDetail } from './types';

export type RuleInspectorProps = {
	inspection: RuleInspectionDetail | null;
};

export const RuleInspector = ({ inspection }: RuleInspectorProps) => {
	if (!inspection) {
		return (
			<div style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: 12, color: '#6b7280' }}>
				Select a cell to inspect applied rules.
			</div>
		);
	}

	return (
		<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
			<div style={{ fontWeight: 600, marginBottom: 8 }}>Rule Inspector</div>
			<div style={{ fontSize: 13, display: 'grid', gap: 6 }}>
				<div>
					<strong>Cell:</strong> R{inspection.cell.row + 1}C{inspection.cell.col + 1}
				</div>
				<div>
					<strong>Rule:</strong> {inspection.ruleName}
				</div>
				{inspection.description && (
					<div>
						<strong>Description:</strong> {inspection.description}
					</div>
				)}
				{inspection.rank != null && inspection.total != null && (
					<div>
						<strong>Rank:</strong> {inspection.rank} / {inspection.total}
					</div>
				)}
				{inspection.message && (
					<div>
						<strong>Reason:</strong> {inspection.message}
					</div>
				)}
			</div>
		</div>
	);
};
