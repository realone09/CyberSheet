import { CFDirtyPropagationEngine } from '../src/CFDirtyPropagationEngine';
import { ConditionalFormattingDependencyGraph } from '../src/ConditionalFormattingDependencyGraph';
import { RangeStatsManager } from '../src/RangeStatsManager';
import { ConditionalFormattingRule } from '../src/ConditionalFormattingEngine';
import { Address, CellValue } from '../src/types';

describe('CFDirtyPropagationEngine', () => {
	let graph: ConditionalFormattingDependencyGraph;
	let statsManager: RangeStatsManager;
	let values: Map<string, CellValue>;
	let engine: CFDirtyPropagationEngine;

	const getValue = (address: Address): CellValue => {
		const key = `${address.row},${address.col}`;
		return values.get(key) ?? null;
	};

	beforeEach(() => {
		graph = new ConditionalFormattingDependencyGraph();
		statsManager = new RangeStatsManager();
		values = new Map();
		values.set('0,0', 10);
		values.set('0,1', 20);
		values.set('1,0', 30);
		values.set('1,1', 40);
		engine = new CFDirtyPropagationEngine(graph, statsManager, getValue);
	});

	it('recomputes dirty range stats and collects affected rules', () => {
		const rule: ConditionalFormattingRule = {
			type: 'value',
			operator: '>',
			value: 15,
			ranges: [{ start: { row: 0, col: 0 }, end: { row: 1, col: 1 } }],
			style: { fillColor: '#FF0000' },
		};

		graph.addRule('rule-1', rule);

		const result = engine.flush();
		expect(result.recomputedRangeStats.size).toBe(1);
		expect(result.affectedRules.has('rule-1')).toBe(true);

		const stats = result.recomputedRangeStats.get('R0C0:R1C1');
		expect(stats?.min).toBe(10);
		expect(stats?.max).toBe(40);
	});

	it('responds to cell changes by marking dependent range stats dirty', () => {
		const rule: ConditionalFormattingRule = {
			type: 'value',
			operator: '>=',
			value: 25,
			ranges: [{ start: { row: 0, col: 0 }, end: { row: 1, col: 1 } }],
			style: { fillColor: '#00FF00' },
		};

		graph.addRule('rule-2', rule);
		engine.flush();

		values.set('1,1', 100);
		engine.onCellChange({ row: 1, col: 1 });

		const result = engine.flush();
		expect(result.recomputedRangeStats.size).toBe(1);
		const stats = result.recomputedRangeStats.get('R0C0:R1C1');
		expect(stats?.max).toBe(100);
	});
});
