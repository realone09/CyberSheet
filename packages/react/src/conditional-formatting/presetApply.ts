import type { Worksheet } from '@cyber-sheet/core';
import type { ConditionalFormattingRule } from '@cyber-sheet/core';
import type { PresetRuleBundle } from './presets';
import type { SelectionRange } from './useConditionalFormattingInspector';

export type ApplyPresetOptions = {
	replace?: boolean;
	source?: 'preset' | 'manual';
	selection?: SelectionRange | null;
};

const inferTargetRange = (worksheet: Worksheet, selection?: SelectionRange | null) => {
	if (selection) {
		return {
			start: selection.start,
			end: selection.end,
		};
	}

	const used = worksheet.getUsedRange();
	const anchor = used?.start ?? { row: 0, col: 0 };
	const contiguous = worksheet.getContiguousRange(anchor);
	if (contiguous) return contiguous;

	if (used) return used;

	return { start: anchor, end: anchor };
};

const withRange = (rules: ConditionalFormattingRule[], range: { start: { row: number; col: number }; end: { row: number; col: number } }) => {
	return rules.map(rule => ({
		...rule,
		ranges: [range],
	}));
};

export const applyPresetBundle = (
	worksheet: Worksheet,
	bundle: PresetRuleBundle,
	options: ApplyPresetOptions = {}
) => {
	const range = inferTargetRange(worksheet, options.selection);
	const rules = withRange(bundle.rules, range);

	worksheet.setConditionalFormattingRules(range, rules, {
		replace: options.replace ?? true,
		source: options.source ?? 'preset',
	});
};
