import { ConditionalFormattingBatchEngine } from '../../src/ConditionalFormattingBatchEngine';
import { ConditionalFormattingRule } from '../../src/ConditionalFormattingEngine';
import { rgbToHex } from '../../src/ExcelColor';
import { Address, CellValue } from '../../src/types';
import {
	generateOracleTestCases,
	generateColorScaleTestCases,
	generateDataBarTestCases,
} from './oracle-test-data';

describe('Wave 4 Oracle Regression (Batch Engine)', () => {
	const getIndex = (dataset: number[], value: number): number => {
		const index = dataset.indexOf(value);
		if (index === -1) {
			throw new Error(`Value ${value} not found in dataset`);
		}
		return index;
	};

	const createGetValue = (dataset: number[]) => (address: Address): CellValue => {
		if (address.col !== 0) return null;
		return dataset[address.row] ?? null;
	};

	describe('Icon Set Oracle Cases', () => {
		const iconSetCases = generateOracleTestCases();

		for (const testCase of iconSetCases) {
			it(`matches oracle: ${testCase.name}`, () => {
				const engine = new ConditionalFormattingBatchEngine();
				const getValue = createGetValue(testCase.dataset);

				const rule: ConditionalFormattingRule = {
					id: testCase.name,
					type: 'icon-set',
					iconSet: testCase.rule.iconSet as any,
					thresholds: testCase.rule.thresholds.map((threshold, index) => ({
						value: threshold.value,
						type: threshold.type,
						icon: `${testCase.rule.iconSet}-${index}`,
						operator: threshold.operator,
					})),
					ranges: [
						{ start: { row: 0, col: 0 }, end: { row: testCase.dataset.length - 1, col: 0 } },
					],
				};

				engine.addRule(testCase.name, rule);

				for (const expected of testCase.expectedResults) {
					const row = getIndex(testCase.dataset, expected.value);
					engine.markCellDirty({ row, col: 0 });
					const result = engine.evaluateCellCF({ row, col: 0 }, { getValue });
					expect(result.icon?.iconIndex).toBe(expected.iconIndex);
				}
			});
		}
	});

	describe('Color Scale Oracle Cases', () => {
		const colorScaleCases = generateColorScaleTestCases();

		for (const testCase of colorScaleCases) {
			it(`matches oracle: ${testCase.name}`, () => {
				const engine = new ConditionalFormattingBatchEngine();
				const getValue = createGetValue(testCase.dataset);

				const rule: ConditionalFormattingRule = {
					id: testCase.name,
					type: 'color-scale',
					minColor: rgbToHex(testCase.rule.minColor.r, testCase.rule.minColor.g, testCase.rule.minColor.b),
					maxColor: rgbToHex(testCase.rule.maxColor.r, testCase.rule.maxColor.g, testCase.rule.maxColor.b),
					ranges: [
						{ start: { row: 0, col: 0 }, end: { row: testCase.dataset.length - 1, col: 0 } },
					],
				};

				if (testCase.rule.midColor) {
					rule.midColor = rgbToHex(testCase.rule.midColor.r, testCase.rule.midColor.g, testCase.rule.midColor.b);
				}

				if (testCase.rule.minType === 'number' && testCase.rule.minValue !== undefined) {
					rule.minValue = testCase.rule.minValue;
				}
				if (testCase.rule.maxType === 'number' && testCase.rule.maxValue !== undefined) {
					rule.maxValue = testCase.rule.maxValue;
				}
				if (testCase.rule.midType === 'number' && testCase.rule.midValue !== undefined) {
					rule.midValue = testCase.rule.midValue;
				}

				engine.addRule(testCase.name, rule);

				for (const expected of testCase.expectedResults) {
					const row = getIndex(testCase.dataset, expected.value);
					engine.markCellDirty({ row, col: 0 });
					const result = engine.evaluateCellCF({ row, col: 0 }, { getValue });
					const expectedHex = rgbToHex(
						expected.expectedColor.r,
						expected.expectedColor.g,
						expected.expectedColor.b
					);
					expect(result.style?.fillColor).toBe(expectedHex);
				}
			});
		}
	});

	describe('Data Bar Oracle Cases', () => {
		const dataBarCases = generateDataBarTestCases();

		for (const testCase of dataBarCases) {
			it(`matches oracle: ${testCase.name}`, () => {
				const engine = new ConditionalFormattingBatchEngine();
				const getValue = createGetValue(testCase.dataset);

				const rule: ConditionalFormattingRule = {
					id: testCase.name,
					type: 'data-bar',
					color: rgbToHex(testCase.rule.color.r, testCase.rule.color.g, testCase.rule.color.b),
					gradient: testCase.rule.gradient,
					showValue: testCase.rule.showValue,
					ranges: [
						{ start: { row: 0, col: 0 }, end: { row: testCase.dataset.length - 1, col: 0 } },
					],
				};

				if (testCase.rule.minValue !== undefined) {
					rule.minValue = testCase.rule.minValue;
				}
				if (testCase.rule.maxValue !== undefined) {
					rule.maxValue = testCase.rule.maxValue;
				}

				engine.addRule(testCase.name, rule);

				for (const expected of testCase.expectedResults) {
					const row = getIndex(testCase.dataset, expected.value);
					engine.markCellDirty({ row, col: 0 });
					const result = engine.evaluateCellCF({ row, col: 0 }, { getValue });
					const actualPercent = (result.dataBar?.percent ?? 0) * 100;
					expect(Math.abs(actualPercent - expected.expectedPercent)).toBeLessThanOrEqual(0.1);
				}
			});
		}
	});

	describe('Multi-Range Dirty Propagation', () => {
		it('recomputes icon set stats across multiple ranges', () => {
			const dataset = [10, 20, 30, 40];
			const engine = new ConditionalFormattingBatchEngine();
			const getValue = createGetValue(dataset);

			const rule: ConditionalFormattingRule = {
				id: 'icon-set-multi-range',
				type: 'icon-set',
				iconSet: '3-arrows',
				thresholds: [
					{ value: 67, type: 'percent', operator: '>=', icon: 'icon-0' },
					{ value: 33, type: 'percent', operator: '>=', icon: 'icon-1' },
					{ value: 0, type: 'percent', operator: '>=', icon: 'icon-2' },
				],
				ranges: [
					{ start: { row: 0, col: 0 }, end: { row: 1, col: 0 } },
					{ start: { row: 2, col: 0 }, end: { row: 3, col: 0 } },
				],
			};

			engine.addRule(rule.id!, rule);
			engine.markCellDirty({ row: 0, col: 0 });
			let result = engine.evaluateCellCF({ row: 3, col: 0 }, { getValue });
			expect(result.icon?.iconIndex).toBe(0);

			dataset[3] = 5;
			engine.markCellDirty({ row: 3, col: 0 });
			result = engine.evaluateCellCF({ row: 3, col: 0 }, { getValue });
			expect(result.icon?.iconIndex).toBe(2);
		});

		it('recomputes color scale stats across multiple ranges', () => {
			const dataset = [10, 20, 30, 40];
			const engine = new ConditionalFormattingBatchEngine();
			const getValue = createGetValue(dataset);

			const rule: ConditionalFormattingRule = {
				id: 'color-scale-multi-range',
				type: 'color-scale',
				minColor: '#f8696b',
				maxColor: '#63be7b',
				ranges: [
					{ start: { row: 0, col: 0 }, end: { row: 1, col: 0 } },
					{ start: { row: 2, col: 0 }, end: { row: 3, col: 0 } },
				],
			};

			engine.addRule(rule.id!, rule);
			engine.markCellDirty({ row: 0, col: 0 });
			let result = engine.evaluateCellCF({ row: 0, col: 0 }, { getValue });
			expect(result.style?.fillColor).toBeDefined();

			dataset[0] = 100;
			engine.markCellDirty({ row: 0, col: 0 });
			result = engine.evaluateCellCF({ row: 0, col: 0 }, { getValue });
			expect(result.style?.fillColor).toBeDefined();
		});

		it('recomputes data bar stats across multiple ranges', () => {
			const dataset = [10, 20, 30, 40];
			const engine = new ConditionalFormattingBatchEngine();
			const getValue = createGetValue(dataset);

			const rule: ConditionalFormattingRule = {
				id: 'data-bar-multi-range',
				type: 'data-bar',
				color: '#638ec6',
				gradient: false,
				ranges: [
					{ start: { row: 0, col: 0 }, end: { row: 1, col: 0 } },
					{ start: { row: 2, col: 0 }, end: { row: 3, col: 0 } },
				],
			};

			engine.addRule(rule.id!, rule);
			engine.markCellDirty({ row: 0, col: 0 });
			let result = engine.evaluateCellCF({ row: 3, col: 0 }, { getValue });
			const initialPercent = result.dataBar?.percent ?? 0;
			expect(initialPercent).toBeGreaterThan(0);

			dataset[3] = 5;
			engine.markCellDirty({ row: 3, col: 0 });
			result = engine.evaluateCellCF({ row: 3, col: 0 }, { getValue });
			const updatedPercent = result.dataBar?.percent ?? 0;
			expect(updatedPercent).toBeLessThan(initialPercent);
		});
	});
});
