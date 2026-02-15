import { ConditionalFormattingBatchEngine } from '../src/ConditionalFormattingBatchEngine';
import { ConditionalFormattingRule } from '../src/ConditionalFormattingEngine';
import { Address, CellValue } from '../src/types';

describe('ConditionalFormattingBatchEngine - 100k Benchmark', () => {
	jest.setTimeout(10000);

	const getValue = (address: Address): CellValue => {
		return address.row + address.col;
	};

	it('evaluates 100k cells with rule-centric evaluation', () => {
		const engine = new ConditionalFormattingBatchEngine();
		const rule: ConditionalFormattingRule = {
			id: 'benchmark-rule',
			type: 'value',
			operator: '>=',
			value: 50,
			style: { fillColor: '#00AAFF' },
			ranges: [{ start: { row: 0, col: 0 }, end: { row: 399, col: 249 } }],
		};

		engine.addRule('benchmark-rule', rule);

		const start = Date.now();
		const results = engine.evaluateDirtyRulesForRange(
			{ start: { row: 0, col: 0 }, end: { row: 399, col: 249 } },
			{ getValue }
		);
		const durationMs = Date.now() - start;

		expect(results.size).toBe(1);
		expect(durationMs).toBeLessThan(2000);
	});
});
