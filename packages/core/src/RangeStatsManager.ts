import type { Address, CellValue, Range } from './types';

export type RangeStats = {
	min: number;
	max: number;
	avg: number;
	count: number;
	values: number[];
	percentileInc: (p: number) => number;
};

type RangeStatsCacheEntry = {
	stats: RangeStats;
	rangeKey: string;
	timestamp: number;
};

export class RangeStatsManager {
	private cache = new Map<string, RangeStatsCacheEntry>();
	private dirtyRanges = new Set<string>();

	computeOnce(range: Range, getValue: (address: Address) => CellValue): RangeStats {
		const rangeKey = this.getRangeKey(range);
		const cached = this.cache.get(rangeKey);

		if (cached && !this.dirtyRanges.has(rangeKey)) {
			return cached.stats;
		}

		const values = this.collectNumericValues(range, getValue);
		const stats = this.buildStats(values);

		this.cache.set(rangeKey, {
			stats,
			rangeKey,
			timestamp: Date.now(),
		});
		this.dirtyRanges.delete(rangeKey);

		return stats;
	}

	computeOnceForRanges(ranges: Range[], getValue: (address: Address) => CellValue): RangeStats {
		const rangesKey = this.getRangesKey(ranges);
		const cached = this.cache.get(rangesKey);

		if (cached && !this.dirtyRanges.has(rangesKey)) {
			return cached.stats;
		}

		const values = ranges.flatMap(range => this.collectNumericValues(range, getValue));
		const stats = this.buildStats(values);

		this.cache.set(rangesKey, {
			stats,
			rangeKey: rangesKey,
			timestamp: Date.now(),
		});
		this.dirtyRanges.delete(rangesKey);

		return stats;
	}

	markDirty(range: Range): void {
		this.dirtyRanges.add(this.getRangeKey(range));
	}

	markDirtyRanges(ranges: Range[]): void {
		this.dirtyRanges.add(this.getRangesKey(ranges));
		for (const range of ranges) {
			this.dirtyRanges.add(this.getRangeKey(range));
		}
	}

	get(range: Range): RangeStats | undefined {
		return this.cache.get(this.getRangeKey(range))?.stats;
	}

	getForRanges(ranges: Range[]): RangeStats | undefined {
		return this.cache.get(this.getRangesKey(ranges))?.stats;
	}

	clear(): void {
		this.cache.clear();
		this.dirtyRanges.clear();
	}

	getDirtyRanges(): string[] {
		return Array.from(this.dirtyRanges.values());
	}

	private collectNumericValues(range: Range, getValue: (address: Address) => CellValue): number[] {
		const values: number[] = [];
		for (let row = range.start.row; row <= range.end.row; row++) {
			for (let col = range.start.col; col <= range.end.col; col++) {
				const value = getValue({ row, col });
				if (typeof value === 'number' && !Number.isNaN(value)) {
					values.push(value);
				}
			}
		}
		return values;
	}

	private buildStats(values: number[]): RangeStats {
		if (values.length === 0) {
			return {
				min: 0,
				max: 0,
				avg: 0,
				count: 0,
				values: [],
				percentileInc: () => 0,
			};
		}

		const sorted = [...values].sort((a, b) => a - b);
		const sum = sorted.reduce((acc, value) => acc + value, 0);
		const min = sorted[0];
		const max = sorted[sorted.length - 1];
		const avg = sum / sorted.length;

		const percentileInc = (p: number): number => {
			const percentile = Math.max(0, Math.min(100, p));
			if (sorted.length === 1) {
				return sorted[0];
			}

			const rank = (percentile / 100) * (sorted.length - 1);
			const lowerIndex = Math.floor(rank);
			const upperIndex = Math.ceil(rank);
			if (lowerIndex === upperIndex) {
				return sorted[lowerIndex];
			}

			const lowerValue = sorted[lowerIndex];
			const upperValue = sorted[upperIndex];
			const weight = rank - lowerIndex;
			return lowerValue + (upperValue - lowerValue) * weight;
		};

		return {
			min,
			max,
			avg,
			count: sorted.length,
			values: sorted,
			percentileInc,
		};
	}

	private getRangeKey(range: Range): string {
		return `R${range.start.row}C${range.start.col}:R${range.end.row}C${range.end.col}`;
	}

	private getRangesKey(ranges: Range[]): string {
		return ranges
			.map(range => this.getRangeKey(range))
			.sort()
			.join('|');
	}
}
