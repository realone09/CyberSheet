import type { Range, Address } from '@cyber-sheet/core';

/**
 * RangeFormatter
 * 
 * Pure functions for formatting ranges in A1 notation
 * Framework-agnostic - works in Vanilla, React, Vue, Angular, Svelte
 */

/**
 * Convert column number to letter (1 = A, 26 = Z, 27 = AA, etc.)
 */
export function columnNumberToLetter(col: number): string {
	let result = '';
	let num = col;
	
	while (num > 0) {
		const remainder = (num - 1) % 26;
		result = String.fromCharCode(65 + remainder) + result;
		num = Math.floor((num - 1) / 26);
	}
	
	return result;
}

/**
 * Format single address as A1 notation
 */
export function formatAddress(address: Address): string {
	return `${columnNumberToLetter(address.col)}${address.row}`;
}

/**
 * Format range as A1:B10 notation
 */
export function formatRange(range: Range): string {
	const start = formatAddress(range.start);
	const end = formatAddress(range.end);
	return `${start}:${end}`;
}

/**
 * Format multiple ranges as comma-separated A1 notation
 */
export function formatRanges(ranges: Range[]): string {
	if (!ranges || ranges.length === 0) return 'No range';
	return ranges.map(formatRange).join(', ');
}

/**
 * Parse A1 notation to address
 */
export function parseAddress(a1: string): Address | null {
	const match = a1.match(/^([A-Z]+)(\d+)$/);
	if (!match) return null;
	
	const [, letters, digits] = match;
	const col = letters.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
	const row = parseInt(digits, 10);
	
	return { col, row };
}

/**
 * Parse A1:B10 notation to range
 */
export function parseRange(a1: string): Range | null {
	const parts = a1.split(':');
	if (parts.length !== 2) return null;
	
	const start = parseAddress(parts[0]);
	const end = parseAddress(parts[1]);
	
	if (!start || !end) return null;
	
	return { start, end };
}
