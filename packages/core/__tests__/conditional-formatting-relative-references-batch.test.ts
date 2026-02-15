import { ConditionalFormattingBatchEngine } from '../src/ConditionalFormattingBatchEngine';
import { ConditionalFormattingRule } from '../src/ConditionalFormattingEngine';
import { Address, CellValue } from '../src/types';

describe('ConditionalFormattingBatchEngine - Relative References', () => {
	let engine: ConditionalFormattingBatchEngine;
	let values: Map<string, CellValue>;

	const getValue = (address: Address): CellValue => {
		const key = `${address.row},${address.col}`;
		return values.get(key) ?? null;
	};

	beforeEach(() => {
		engine = new ConditionalFormattingBatchEngine();
		values = new Map();
	});

	it('evaluates relative references (A1)', () => {
		const rule: ConditionalFormattingRule = {
			id: 'rule-1',
			type: 'formula',
			expression: '=A1>10',
			style: { fillColor: '#FF0000' },
			ranges: [{ start: { row: 1, col: 1 }, end: { row: 2, col: 2 } }], // B2:C3
		};

		values.set('0,0', 5);  // A1
		values.set('1,1', 20); // B2
		values.set('2,2', 0);  // C3

		engine.addRule('rule-1', rule);

		let result = engine.evaluateCellCF({ row: 1, col: 1 }, { getValue }); // B2
		expect(result.appliedRuleIds).toHaveLength(0);

		engine.markCellDirty({ row: 1, col: 1 });
		result = engine.evaluateCellCF({ row: 2, col: 2 }, { getValue }); // C3 uses B2
		expect(result.appliedRuleIds).toHaveLength(1);
	});

	it('evaluates absolute references ($A$1)', () => {
		const rule: ConditionalFormattingRule = {
			id: 'rule-2',
			type: 'formula',
			expression: '=$A$1>10',
			style: { fillColor: '#00FF00' },
			ranges: [{ start: { row: 1, col: 1 }, end: { row: 3, col: 3 } }],
		};

		values.set('0,0', 15); // A1
		engine.addRule('rule-2', rule);

		const result = engine.evaluateCellCF({ row: 3, col: 3 }, { getValue });
		expect(result.appliedRuleIds).toHaveLength(1);
	});

	it('evaluates mixed references ($A1)', () => {
		const rule: ConditionalFormattingRule = {
			id: 'rule-3',
			type: 'formula',
			expression: '=$A1>10',
			style: { fillColor: '#0000FF' },
			ranges: [{ start: { row: 1, col: 1 }, end: { row: 3, col: 2 } }], // B2:C4
		};

		values.set('0,0', 5);  // A1
		values.set('2,0', 25); // A3
		engine.addRule('rule-3', rule);

		let result = engine.evaluateCellCF({ row: 1, col: 1 }, { getValue }); // B2 -> A1
		expect(result.appliedRuleIds).toHaveLength(0);

		engine.markCellDirty({ row: 2, col: 1 });
		result = engine.evaluateCellCF({ row: 3, col: 2 }, { getValue }); // C4 -> A3
		expect(result.appliedRuleIds).toHaveLength(1);
	});

	it('evaluates mixed references (A$1)', () => {
		const rule: ConditionalFormattingRule = {
			id: 'rule-4',
			type: 'formula',
			expression: '=A$1>10',
			style: { fillColor: '#AAAAAA' },
			ranges: [{ start: { row: 1, col: 1 }, end: { row: 1, col: 3 } }], // B2:D2
		};

		values.set('0,0', 12); // A1
		values.set('0,2', 5);  // C1
		engine.addRule('rule-4', rule);

		let result = engine.evaluateCellCF({ row: 1, col: 1 }, { getValue }); // B2 -> A1
		expect(result.appliedRuleIds).toHaveLength(1);

		engine.markCellDirty({ row: 1, col: 2 });
		result = engine.evaluateCellCF({ row: 1, col: 3 }, { getValue }); // D2 -> C1
		expect(result.appliedRuleIds).toHaveLength(0);
	});
});
