import { RangeStatsManager } from '../src/RangeStatsManager';
import { Address } from '../src/types';

describe('RangeStatsManager', () => {
	const manager = new RangeStatsManager();

	const makeGetValue = (values: Map<string, number | null>) => (address: Address): number | null => {
		const key = `${address.row},${address.col}`;
		return values.get(key) ?? null;
	};

	beforeEach(() => {
		manager.clear();
	});

	it('computes stats once per range and reuses cache', () => {
		const values = new Map<string, number | null>([
			['0,0', 10],
			['0,1', 20],
			['1,0', 30],
			['1,1', 40],
		]);
		const getValue = makeGetValue(values);

		const range = { start: { row: 0, col: 0 }, end: { row: 1, col: 1 } };
		const stats1 = manager.computeOnce(range, getValue);
		const stats2 = manager.computeOnce(range, getValue);

		expect(stats1).toBe(stats2);
		expect(stats1.min).toBe(10);
		expect(stats1.max).toBe(40);
		expect(stats1.avg).toBe(25);
	});

	it('invalidates cache when range is marked dirty', () => {
		const values = new Map<string, number | null>([
			['0,0', 5],
			['0,1', 15],
		]);
		const getValue = makeGetValue(values);

		const range = { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } };
		const stats1 = manager.computeOnce(range, getValue);

		values.set('0,1', 25);
		manager.markDirty(range);
		const stats2 = manager.computeOnce(range, getValue);

		expect(stats2).not.toBe(stats1);
		expect(stats2.max).toBe(25);
	});

	it('computes percentile.inc values consistently', () => {
		const values = new Map<string, number | null>([
			['0,0', 10],
			['0,1', 20],
			['0,2', 30],
			['0,3', 40],
			['0,4', 50],
		]);
		const getValue = makeGetValue(values);
		const range = { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } };

		const stats = manager.computeOnce(range, getValue);
		expect(stats.percentileInc(0)).toBe(10);
		expect(stats.percentileInc(100)).toBe(50);
		expect(stats.percentileInc(50)).toBe(30);
		// 25th percentile between 20 and 30
		expect(stats.percentileInc(25)).toBe(20);
	});

	it('aggregates stats across multiple ranges', () => {
		const values = new Map<string, number | null>([
			['0,0', 5],
			['0,1', 15],
			['2,0', 25],
			['2,1', 35],
		]);
		const getValue = makeGetValue(values);
		const ranges = [
			{ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
			{ start: { row: 2, col: 0 }, end: { row: 2, col: 1 } },
		];

		const stats = manager.computeOnceForRanges(ranges, getValue);
		expect(stats.min).toBe(5);
		expect(stats.max).toBe(35);
		expect(stats.count).toBe(4);
		expect(stats.avg).toBe(20);
	});

	it('invalidates multi-range cache when marked dirty', () => {
		const values = new Map<string, number | null>([
			['0,0', 1],
			['1,0', 3],
			['2,0', 5],
		]);
		const getValue = makeGetValue(values);
		const ranges = [
			{ start: { row: 0, col: 0 }, end: { row: 1, col: 0 } },
			{ start: { row: 2, col: 0 }, end: { row: 2, col: 0 } },
		];

		const stats1 = manager.computeOnceForRanges(ranges, getValue);
		values.set('2,0', 9);
		manager.markDirtyRanges(ranges);
		const stats2 = manager.computeOnceForRanges(ranges, getValue);

		expect(stats2).not.toBe(stats1);
		expect(stats2.max).toBe(9);
	});
});
