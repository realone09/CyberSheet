import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ConditionalFormattingRule, Address, CellValue } from '@cyber-sheet/core';
import { ConditionalFormattingInspector } from '../packages/react/src/conditional-formatting/ConditionalFormattingInspector';

/**
 * CF Inspector Demo - Day 4
 * Demonstrates the "Excel-killer" hover inspector feature
 */

// Mock data: 10x10 grid with values 1-100
const generateMockData = (): Map<string, CellValue> => {
	const data = new Map<string, CellValue>();
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			const value = row * 10 + col + 1;
			data.set(`${col},${row}`, value);
		}
	}
	return data;
};

// Sample CF Rules
const sampleRules: ConditionalFormattingRule[] = [
	// Rule 1: Top 10% - Red background
	{
		type: 'top-bottom',
		mode: 'top',
		rank: 10,
		rankType: 'percent',
		style: {
			fillColor: '#ffebee',
			fontColor: '#c62828',
			bold: true,
		},
		ranges: [{ start: { row: 0, col: 0 }, end: { row: 9, col: 9 } }],
		priority: 1,
		stopIfTrue: false,
	},
	// Rule 2: Above Average - Green background
	{
		type: 'above-average',
		mode: 'above',
		style: {
			fillColor: '#e8f5e9',
			fontColor: '#2e7d32',
		},
		ranges: [{ start: { row: 0, col: 0 }, end: { row: 9, col: 9 } }],
		priority: 2,
		stopIfTrue: false,
	},
	// Rule 3: Value >= 75 - Blue text
	{
		type: 'value',
		operator: '>=',
		value: 75,
		style: {
			fontColor: '#1976d2',
			bold: true,
		},
		ranges: [{ start: { row: 0, col: 0 }, end: { row: 9, col: 9 } }],
		priority: 3,
		stopIfTrue: false,
	},
] as ConditionalFormattingRule[];

const CFInspectorDemo: React.FC = () => {
	const [cellData] = useState(generateMockData());
	const [hoveredCell, setHoveredCell] = useState<{ address: Address; position: { x: number; y: number } } | null>(
		null
	);

	const getValue = (addr: Address): CellValue => {
		return cellData.get(`${addr.col},${addr.row}`) || null;
	};

	const handleCellHover = (row: number, col: number, event: React.MouseEvent) => {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		setHoveredCell({
			address: { row, col },
			position: {
				x: rect.right + 10, // Position to the right of cell
				y: rect.top,
			},
		});
	};

	const handleCellLeave = () => {
		setHoveredCell(null);
	};

	// Get cell style based on rules (simplified)
	const getCellStyle = (value: number): React.CSSProperties => {
		let style: React.CSSProperties = {};

		// Top 10% (values >= 91)
		if (value >= 91) {
			style = { ...style, backgroundColor: '#ffebee', color: '#c62828', fontWeight: 600 };
		}
		// Above average (values > 50)
		else if (value > 50) {
			style = { ...style, backgroundColor: '#e8f5e9', color: '#2e7d32' };
		}

		// Value >= 75 - Blue text
		if (value >= 75) {
			style = { ...style, color: '#1976d2', fontWeight: 600 };
		}

		return style;
	};

	return (
		<div>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 60px)', gap: '2px', position: 'relative' }}>
				{Array.from({ length: 100 }).map((_, index) => {
					const row = Math.floor(index / 10);
					const col = index % 10;
					const value = getValue({ row, col }) as number;
					const style = getCellStyle(value);

					return (
						<div
							key={`${col},${row}`}
							style={{
								width: '60px',
								height: '40px',
								border: '1px solid #ddd',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								...style,
							}}
							onMouseEnter={(e) => handleCellHover(row, col, e)}
							onMouseLeave={handleCellLeave}
						>
							{value}
						</div>
					);
				})}

				{/* Inspector Tooltip */}
				{hoveredCell && (
					<ConditionalFormattingInspector
						rules={sampleRules}
						address={hoveredCell.address}
						value={getValue(hoveredCell.address)}
						getValue={getValue}
						position={hoveredCell.position}
						onClose={() => setHoveredCell(null)}
					/>
				)}
			</div>

			<div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
				<h3>✅ Framework-Agnostic Architecture</h3>
				<p style={{ margin: '8px 0', color: '#666' }}>
					<strong>Core Logic:</strong> <code>@cyber-sheet/cf-ui-core</code> (RuleInspectorController)<br />
					<strong>React Adapter:</strong> <code>ConditionalFormattingInspector.tsx</code> (thin wrapper)<br />
					<strong>Next:</strong> Vue, Angular, Svelte, Vanilla JS adapters use the same controller
				</p>
			</div>
		</div>
	);
};

// Mount the demo
const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<CFInspectorDemo />);
}
