import { ConditionalFormattingDependencyGraph } from '../src/ConditionalFormattingDependencyGraph';
import { ConditionalFormattingRule } from '../src/ConditionalFormattingEngine';

describe('ConditionalFormattingDependencyGraph - Range Stats Layer', () => {
	let graph: ConditionalFormattingDependencyGraph;

	beforeEach(() => {
		graph = new ConditionalFormattingDependencyGraph();
	});

	it('tracks dirty range stats for rule ranges', () => {
		const rule: ConditionalFormattingRule = {
			type: 'value',
			operator: '>',
			value: 10,
			ranges: [{ start: { row: 0, col: 0 }, end: { row: 1, col: 1 } }],
			style: { fillColor: '#FF0000' },
		};

		graph.addRule('rule-1', rule);

		const rangeStatId = 'R0C0:R1C1';
		expect(graph.getDirtyRangeStats()).toContain(rangeStatId);
		expect(graph.getAffectedRules(rangeStatId)).toContain('rule-1');
	});

	it('marks dependent range stats dirty on cell change', () => {
		const rule: ConditionalFormattingRule = {
			type: 'value',
			operator: '>=',
			value: 5,
			ranges: [{ start: { row: 2, col: 2 }, end: { row: 4, col: 4 } }],
			style: { fillColor: '#00FF00' },
		};

		graph.addRule('rule-2', rule);
		graph.clearRangeStatDirty('R2C2:R4C4');

		graph.markCellDirty({ row: 3, col: 3 });

		expect(graph.getDirtyRangeStats()).toContain('R2C2:R4C4');
	});

	it('clears dirty range stats after recomputation', () => {
		const rule: ConditionalFormattingRule = {
			type: 'value',
			operator: '<',
			value: 25,
			ranges: [{ start: { row: 5, col: 1 }, end: { row: 5, col: 3 } }],
			style: { fillColor: '#0000FF' },
		};

		graph.addRule('rule-3', rule);
		const rangeStatId = 'R5C1:R5C3';
		expect(graph.getDirtyRangeStats()).toContain(rangeStatId);

		graph.clearRangeStatDirty(rangeStatId);
		expect(graph.getDirtyRangeStats()).not.toContain(rangeStatId);
	});
});
