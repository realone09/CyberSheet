import type { Address, CellValue } from './types';
import { ConditionalFormattingDependencyGraph } from './ConditionalFormattingDependencyGraph';
import { RangeStatsManager, RangeStats } from './RangeStatsManager';

export type DirtyPropagationResult = {
	recomputedRangeStats: Map<string, RangeStats>;
	affectedRules: Set<string>;
};

export class CFDirtyPropagationEngine {
	constructor(
		private graph: ConditionalFormattingDependencyGraph,
		private rangeStatsManager: RangeStatsManager,
		private getValue: (address: Address) => CellValue
	) {}

	onCellChange(address: Address): void {
		this.graph.markCellDirty(address);
	}

	flush(): DirtyPropagationResult {
		const recomputedRangeStats = new Map<string, RangeStats>();
		const affectedRules = new Set<string>();

		const dirtyRangeStats = this.graph.getDirtyRangeStats();
		for (const rangeStatId of dirtyRangeStats) {
			const rangeNode = this.graph.getRangeStat(rangeStatId);
			if (!rangeNode) continue;

			this.rangeStatsManager.markDirty(rangeNode.range);
			const stats = this.rangeStatsManager.computeOnce(rangeNode.range, this.getValue);
			recomputedRangeStats.set(rangeStatId, stats);
			this.graph.clearRangeStatDirty(rangeStatId);

			for (const ruleId of this.graph.getAffectedRules(rangeStatId)) {
				affectedRules.add(ruleId);
			}
		}

		return { recomputedRangeStats, affectedRules };
	}
}
