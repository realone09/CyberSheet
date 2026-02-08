/**
 * Phase B: Generate Test Data for Icon Set Oracle Validation
 * 
 * Since creating actual Excel files with CF rules is complex,
 * we'll generate expected results data based on Excel's documented behavior.
 * 
 * This simulates what Excel would output for various datasets and rules.
 */

export interface OracleExpectedResult {
    value: number;
    iconSet: string;
    iconIndex: number;
    percentileRank?: number;
}

export interface OracleTestCase {
    name: string;
    description: string;
    dataset: number[];
    rule: {
        iconSet: string;
        thresholds: Array<{
            value: number;
            type: 'percent' | 'percentile' | 'number';
            operator: '>=' | '>' | '<=' | '<' | '=';
        }>;
    };
    expectedResults: OracleExpectedResult[];
}

/**
 * Excel's percentile calculation (PERCENTILE.INC method)
 * Formula: rank = (position - 1) / (n - 1)
 * For midpoint of tied values: use average of first and last occurrence
 */
function calculateExcelPercentileRank(value: number, sortedDataset: number[]): number {
    const n = sortedDataset.length;
    
    if (n === 1) {
        return 0.5; // Single value: midpoint
    }
    
    // Find first occurrence
    const firstIndex = sortedDataset.findIndex(v => v >= value);
    if (firstIndex === -1) {
        return value > sortedDataset[n - 1] ? 1.0 : 0.0;
    }
    
    // Find last occurrence of same value
    let lastIndex = firstIndex;
    for (let i = firstIndex + 1; i < n; i++) {
        if (sortedDataset[i] === value) {
            lastIndex = i;
        } else {
            break;
        }
    }
    
    // Use midpoint for ties
    const midpoint = (firstIndex + lastIndex) / 2;
    return midpoint / (n - 1);
}

/**
 * Determine icon index based on percentile rank and thresholds
 * Excel logic: First matching threshold (top to bottom)
 */
function getIconIndex(percentileRank: number, thresholds: number[]): number {
    const percentValue = percentileRank * 100;
    
    for (let i = 0; i < thresholds.length; i++) {
        if (percentValue >= thresholds[i]) {
            return i;
        }
    }
    
    return thresholds.length - 1;
}

/**
 * Generate Oracle Test Cases
 * These represent what Excel SHOULD output for various scenarios
 */
export function generateOracleTestCases(): OracleTestCase[] {
    const testCases: OracleTestCase[] = [];
    
    // Test Case 1: 3-Arrows with standard 67/33/0 split
    testCases.push({
        name: '3-arrows-percentile-standard',
        description: 'Standard 3-arrow icon set with 67%, 33%, 0% thresholds',
        dataset: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        rule: {
            iconSet: '3-arrows',
            thresholds: [
                { value: 67, type: 'percent', operator: '>=' },
                { value: 33, type: 'percent', operator: '>=' },
                { value: 0, type: 'percent', operator: '>=' },
            ],
        },
        expectedResults: [
            { value: 100, iconSet: '3-arrows', iconIndex: 0 }, // Top 33% → up-arrow
            { value: 90, iconSet: '3-arrows', iconIndex: 0 },
            { value: 80, iconSet: '3-arrows', iconIndex: 0 },
            { value: 70, iconSet: '3-arrows', iconIndex: 1 }, // Middle 33% → right-arrow
            { value: 60, iconSet: '3-arrows', iconIndex: 1 },
            { value: 50, iconSet: '3-arrows', iconIndex: 1 },
            { value: 40, iconSet: '3-arrows', iconIndex: 1 },
            { value: 30, iconSet: '3-arrows', iconIndex: 2 }, // Bottom 33% → down-arrow
            { value: 20, iconSet: '3-arrows', iconIndex: 2 },
            { value: 10, iconSet: '3-arrows', iconIndex: 2 },
        ],
    });
    
    // Test Case 2: 4-Arrows with 75/50/25/0 split
    testCases.push({
        name: '4-arrows-percentile-standard',
        description: 'Standard 4-arrow icon set with 75%, 50%, 25%, 0% thresholds',
        dataset: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        rule: {
            iconSet: '4-arrows',
            thresholds: [
                { value: 75, type: 'percent', operator: '>=' },
                { value: 50, type: 'percent', operator: '>=' },
                { value: 25, type: 'percent', operator: '>=' },
                { value: 0, type: 'percent', operator: '>=' },
            ],
        },
        expectedResults: [
            { value: 100, iconSet: '4-arrows', iconIndex: 0 }, // 100%: ≥75%
            { value: 90, iconSet: '4-arrows', iconIndex: 0 },  // 88.9%: ≥75%
            { value: 80, iconSet: '4-arrows', iconIndex: 0 },  // 77.8%: ≥75%
            { value: 70, iconSet: '4-arrows', iconIndex: 1 },  // 66.7%: ≥50%
            { value: 60, iconSet: '4-arrows', iconIndex: 1 },  // 55.6%: ≥50%
            { value: 50, iconSet: '4-arrows', iconIndex: 2 },  // 44.4%: ≥25%
            { value: 40, iconSet: '4-arrows', iconIndex: 2 },  // 33.3%: ≥25%
            { value: 30, iconSet: '4-arrows', iconIndex: 3 },  // 22.2%: ≥0% (NOT ≥25%)
            { value: 20, iconSet: '4-arrows', iconIndex: 3 },  // 11.1%: ≥0%
            { value: 10, iconSet: '4-arrows', iconIndex: 3 },  // 0%: ≥0%
        ],
    });
    
    // Test Case 3: 5-Arrows with 80/60/40/20/0 split
    testCases.push({
        name: '5-arrows-percentile-standard',
        description: 'Standard 5-arrow icon set with 80%, 60%, 40%, 20%, 0% thresholds',
        dataset: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        rule: {
            iconSet: '5-arrows',
            thresholds: [
                { value: 80, type: 'percent', operator: '>=' },
                { value: 60, type: 'percent', operator: '>=' },
                { value: 40, type: 'percent', operator: '>=' },
                { value: 20, type: 'percent', operator: '>=' },
                { value: 0, type: 'percent', operator: '>=' },
            ],
        },
        expectedResults: [
            { value: 100, iconSet: '5-arrows', iconIndex: 0 }, // Top 20%
            { value: 90, iconSet: '5-arrows', iconIndex: 0 },
            { value: 80, iconSet: '5-arrows', iconIndex: 1 }, // 60-80%
            { value: 70, iconSet: '5-arrows', iconIndex: 1 },
            { value: 60, iconSet: '5-arrows', iconIndex: 2 }, // 40-60%
            { value: 50, iconSet: '5-arrows', iconIndex: 2 },
            { value: 40, iconSet: '5-arrows', iconIndex: 3 }, // 20-40%
            { value: 30, iconSet: '5-arrows', iconIndex: 3 },
            { value: 20, iconSet: '5-arrows', iconIndex: 4 }, // Bottom 20%
            { value: 10, iconSet: '5-arrows', iconIndex: 4 },
        ],
    });
    
    // Test Case 4: Non-uniform dataset (realistic data)
    testCases.push({
        name: '3-arrows-non-uniform',
        description: '3-arrow with non-uniform dataset (realistic scenario)',
        dataset: [5, 12, 18, 25, 45, 67, 89, 92, 98, 100],
        rule: {
            iconSet: '3-arrows',
            thresholds: [
                { value: 67, type: 'percent', operator: '>=' },
                { value: 33, type: 'percent', operator: '>=' },
                { value: 0, type: 'percent', operator: '>=' },
            ],
        },
        expectedResults: [
            { value: 100, iconSet: '3-arrows', iconIndex: 0 },
            { value: 98, iconSet: '3-arrows', iconIndex: 0 },
            { value: 92, iconSet: '3-arrows', iconIndex: 0 },
            { value: 89, iconSet: '3-arrows', iconIndex: 1 },
            { value: 67, iconSet: '3-arrows', iconIndex: 1 },
            { value: 45, iconSet: '3-arrows', iconIndex: 1 },
            { value: 25, iconSet: '3-arrows', iconIndex: 1 },
            { value: 18, iconSet: '3-arrows', iconIndex: 2 },
            { value: 12, iconSet: '3-arrows', iconIndex: 2 },
            { value: 5, iconSet: '3-arrows', iconIndex: 2 },
        ],
    });
    
    // Test Case 5: Large dataset (100 values)
    const largeDataset = Array.from({ length: 100 }, (_, i) => i + 1);
    testCases.push({
        name: '3-arrows-large-dataset',
        description: '3-arrow with large dataset (100 values)',
        dataset: largeDataset,
        rule: {
            iconSet: '3-arrows',
            thresholds: [
                { value: 67, type: 'percent', operator: '>=' },
                { value: 33, type: 'percent', operator: '>=' },
                { value: 0, type: 'percent', operator: '>=' },
            ],
        },
        expectedResults: [
            { value: 100, iconSet: '3-arrows', iconIndex: 0 }, // Top
            { value: 75, iconSet: '3-arrows', iconIndex: 0 },
            { value: 50, iconSet: '3-arrows', iconIndex: 1 }, // Middle
            { value: 25, iconSet: '3-arrows', iconIndex: 2 }, // Bottom
            { value: 1, iconSet: '3-arrows', iconIndex: 2 },
        ],
    });
    
    return testCases;
}

/**
 * Calculate expected results for a test case
 * This simulates Excel's behavior
 */
export function calculateExpectedResults(testCase: OracleTestCase): OracleExpectedResult[] {
    const sorted = [...testCase.dataset].sort((a, b) => a - b);
    const results: OracleExpectedResult[] = [];
    
    for (const value of testCase.dataset) {
        const percentileRank = calculateExcelPercentileRank(value, sorted);
        const thresholds = testCase.rule.thresholds.map(t => t.value);
        const iconIndex = getIconIndex(percentileRank, thresholds);
        
        results.push({
            value,
            iconSet: testCase.rule.iconSet,
            iconIndex,
            percentileRank,
        });
    }
    
    return results;
}
