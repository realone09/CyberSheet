import { ConditionalFormattingBatchEngine } from '../src/ConditionalFormattingBatchEngine';
import { ConditionalFormattingRule } from '../src/ConditionalFormattingEngine';
import { Address, CellValue } from '../src/types';

describe('ConditionalFormattingBatchEngine - Determinism', () => {
	let engine: ConditionalFormattingBatchEngine;
	let values: Map<string, CellValue>;

	const getValue = (address: Address): CellValue => {
		const key = `${address.row},${address.col}`;
		return values.get(key) ?? null;
	};

	beforeEach(() => {
		engine = new ConditionalFormattingBatchEngine();
		values = new Map();
		values.set('0,0', 10);
		values.set('0,1', 20);
	});

	it('returns consistent results for repeated evaluations', () => {
		const rule: ConditionalFormattingRule = {
			id: 'determinism-rule',
			type: 'value',
			operator: '>=',
			value: 15,
			style: { fillColor: '#FF00FF' },
			ranges: [{ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } }],
		};

		engine.addRule('determinism-rule', rule);

		const first = engine.evaluateCellCF({ row: 0, col: 1 }, { getValue });
		engine.markCellDirty({ row: 0, col: 1 });
		const second = engine.evaluateCellCF({ row: 0, col: 1 }, { getValue });

		expect(first).toEqual(second);
		expect(first.appliedRuleIds).toEqual(['determinism-rule']);
	});
});
