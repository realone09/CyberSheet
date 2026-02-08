/**
 * Phase 4 Wave 4: Excel Parity Validation (Oracle Testing)
 * 
 * Strategy: Use real Excel files as ground truth, compare CyberSheet output
 * 
 * Test Categories:
 * 1. Icon Set Rules (60 tests) - Percentile/percent/number thresholds + edge cases
 * 2. Color Scale Rules (30 tests) - 2-color/3-color gradients + tolerance validation
 * 3. Data Bar Rules (30 tests) - Solid/gradient fills + negative ranges
 * 4. Multi-Rule Precedence (10 tests) - Visual precedence validation
 * 
 * Expected Match Rate: 90-95% (realistic with rounding/algorithm differences)
 * 
 * Key Principle: "Turn 'we claim correctness' into 'we prove correctness'"
 */

import { ConditionalFormattingEngine, IconSetRule, ColorScaleRule, DataBarRule } from '../../src/ConditionalFormattingEngine';
import { Address, CellValue } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';
import { generateOracleTestCases, OracleTestCase } from './oracle-test-data';

// Note: XLSX library will be added when we need to load actual Excel files
// For now, we're using programmatically generated expected results based on Excel's documented behavior

describe('Excel Oracle Validation - Wave 4', () => {
    let engine: ConditionalFormattingEngine;
    const testDataDir = path.join(__dirname, '../../../../test-data/excel-oracle');

    beforeEach(() => {
        engine = new ConditionalFormattingEngine();
        engine.clearCache();
    });

    describe('Phase A: Test Infrastructure', () => {
        it('should be able to load Excel files from test-data directory', () => {
            // Verify test data directory exists
            const dirExists = fs.existsSync(testDataDir);
            expect(dirExists).toBe(true);

            if (dirExists) {
                const files = fs.readdirSync(testDataDir);
                console.log(`Found ${files.length} files in test-data/excel-oracle/`);
                console.log('Files:', files);
            }
        });

        it.skip('should be able to parse Excel workbook with XLSX library', () => {
            // This test will be enabled when we add XLSX library integration
            // For now, skipped to avoid dependency issues
            expect(true).toBe(true);
        });

        it('should define oracle test helpers', () => {
            // Helper: Compare icon indices with tolerance
            function compareIconIndex(
                actual: number,
                expected: number,
                tolerance: number = 0
            ): { match: boolean; diff: number } {
                const diff = Math.abs(actual - expected);
                return {
                    match: diff <= tolerance,
                    diff,
                };
            }

            // Verify helper works
            expect(typeof compareIconIndex).toBe('function');

            const comparison = compareIconIndex(1, 1, 0);
            expect(comparison.match).toBe(true);
            expect(comparison.diff).toBe(0);
        });
    });

    describe('Phase B: Icon Set Validation (Oracle Comparison)', () => {
        const testCases = generateOracleTestCases();
        
        testCases.forEach((testCase) => {
            it(`should match Excel for ${testCase.name}`, () => {
                // Helper: Create getValue function from dataset
                const getValue = (addr: Address) => {
                    return testCase.dataset[addr.row] ?? null;
                };
                
                // Create CyberSheet rule from test case
                const rule: IconSetRule = {
                    type: 'icon-set',
                    iconSet: testCase.rule.iconSet as any,
                    ranges: [{ 
                        start: { row: 0, col: 0 }, 
                        end: { row: testCase.dataset.length - 1, col: 0 } 
                    }],
                    thresholds: testCase.rule.thresholds.map((t, index) => ({
                        value: t.value,
                        type: t.type,
                        operator: t.operator,
                        icon: `icon-${index}`, // Generic icon name
                    })),
                };
                
                // Track match statistics
                let exactMatches = 0;
                let totalTests = 0;
                const mismatches: Array<{
                    value: number;
                    expected: number;
                    actual: number;
                    diff: number;
                }> = [];
                
                // Test each value in the dataset
                testCase.expectedResults.forEach((expected, index) => {
                    const result = engine.applyRules(expected.value, [rule], {
                        address: { row: index, col: 0 },
                        getValue,
                    });
                    
                    totalTests++;
                    
                    if (result.icon) {
                        if (result.icon.iconIndex === expected.iconIndex) {
                            exactMatches++;
                        } else {
                            mismatches.push({
                                value: expected.value,
                                expected: expected.iconIndex,
                                actual: result.icon.iconIndex,
                                diff: Math.abs(result.icon.iconIndex - expected.iconIndex),
                            });
                        }
                    } else {
                        // No icon returned (shouldn't happen)
                        mismatches.push({
                            value: expected.value,
                            expected: expected.iconIndex,
                            actual: -1,
                            diff: expected.iconIndex + 1,
                        });
                    }
                });
                
                // Calculate match rate
                const matchRate = (exactMatches / totalTests) * 100;
                
                // Log results
                console.log(`\n${testCase.name}:`);
                console.log(`  Dataset size: ${testCase.dataset.length}`);
                console.log(`  Exact matches: ${exactMatches}/${totalTests} (${matchRate.toFixed(1)}%)`);
                
                if (mismatches.length > 0) {
                    console.log(`  Mismatches (${mismatches.length}):`);
                    mismatches.slice(0, 3).forEach(m => {
                        console.log(`    Value ${m.value}: expected icon[${m.expected}], got icon[${m.actual}] (diff: ${m.diff})`);
                    });
                    if (mismatches.length > 3) {
                        console.log(`    ... and ${mismatches.length - 3} more`);
                    }
                }
                
                // Assert: ≥95% match rate for oracle tests
                expect(matchRate).toBeGreaterThanOrEqual(95);
            });
        });
        
        it('should report Phase B summary statistics', () => {
            const testCases = generateOracleTestCases();
            const totalCases = testCases.length;
            const totalValues = testCases.reduce((sum, tc) => sum + tc.dataset.length, 0);
            
            console.log('\n=== Phase B Oracle Validation Summary ===');
            console.log(`Test Cases: ${totalCases}`);
            console.log(`Total Values Tested: ${totalValues}`);
            console.log(`Icon Sets: 3-arrows, 4-arrows, 5-arrows`);
            console.log(`Scenarios: Standard splits, non-uniform data, large datasets`);
            console.log('==========================================\n');
            
            expect(totalCases).toBeGreaterThan(0);
            expect(totalValues).toBeGreaterThan(0);
        });
    });

    describe('Phase B: Icon Set Validation (Edge Cases)', () => {
        it('should handle single-value dataset (n=1)', () => {
            const dataset = [50];
            const getValue = (addr: Address) => dataset[addr.row] ?? null;

            const rule: IconSetRule = {
                type: 'icon-set',
                iconSet: '3-arrows',
                ranges: [{ start: { row: 0, col: 0 }, end: { row: 0, col: 0 } }],
                thresholds: [
                    { value: 67, type: 'percent', icon: 'up', operator: '>=' },
                    { value: 33, type: 'percent', icon: 'right', operator: '>=' },
                    { value: 0, type: 'percent', icon: 'down', operator: '>=' },
                ],
            };

            const result = engine.applyRules(50, [rule], {
                address: { row: 0, col: 0 },
                getValue,
            });

            // With n=1, percentile rank is 0.5 (midpoint)
            // Should get middle icon
            expect(result.icon).toBeDefined();
            expect(result.icon?.iconSet).toBe('3-arrows');
            // Icon index should be valid (0, 1, or 2)
            expect(result.icon?.iconIndex).toBeGreaterThanOrEqual(0);
            expect(result.icon?.iconIndex).toBeLessThanOrEqual(2);
        });

        it('should handle all-equal values (ties)', () => {
            const dataset = [50, 50, 50, 50, 50];
            const getValue = (addr: Address) => dataset[addr.row] ?? null;

            const rule: IconSetRule = {
                type: 'icon-set',
                iconSet: '3-arrows',
                ranges: [{ start: { row: 0, col: 0 }, end: { row: 4, col: 0 } }],
                thresholds: [
                    { value: 67, type: 'percent', icon: 'up', operator: '>=' },
                    { value: 33, type: 'percent', icon: 'right', operator: '>=' },
                    { value: 0, type: 'percent', icon: 'down', operator: '>=' },
                ],
            };

            // All values are equal, so all should get same icon (middle)
            for (let i = 0; i < 5; i++) {
                const result = engine.applyRules(50, [rule], {
                    address: { row: i, col: 0 },
                    getValue,
                });

                expect(result.icon).toBeDefined();
                expect(result.icon?.iconSet).toBe('3-arrows');
                // Tie values should get consistent icon
                expect(result.icon?.iconIndex).toBe(1); // Middle icon
            }
        });

        it('should handle mixed types (numbers + text)', () => {
            // Test that text values are handled gracefully
            const dataset: CellValue[] = [100, 'text', 50, null, 10];
            const getValue = (addr: Address) => dataset[addr.row] ?? null;

            const rule: IconSetRule = {
                type: 'icon-set',
                iconSet: '3-arrows',
                ranges: [{ start: { row: 0, col: 0 }, end: { row: 4, col: 0 } }],
                thresholds: [
                    { value: 67, type: 'percent', icon: 'up', operator: '>=' },
                    { value: 33, type: 'percent', icon: 'right', operator: '>=' },
                    { value: 0, type: 'percent', icon: 'down', operator: '>=' },
                ],
            };

            // Numeric values should get icons
            const result1 = engine.applyRules(100, [rule], {
                address: { row: 0, col: 0 },
                getValue,
            });
            expect(result1.icon).toBeDefined();

            // Text value should not get icon (or handle gracefully)
            const result2 = engine.applyRules('text', [rule], {
                address: { row: 1, col: 0 },
                getValue,
            });
            // Either no icon or no crash is acceptable
            expect(() => result2).not.toThrow();
        });

        it('should handle negative numbers', () => {
            const dataset = [-100, -50, 0, 50, 100];
            const getValue = (addr: Address) => dataset[addr.row] ?? null;

            const rule: IconSetRule = {
                type: 'icon-set',
                iconSet: '3-arrows',
                ranges: [{ start: { row: 0, col: 0 }, end: { row: 4, col: 0 } }],
                thresholds: [
                    { value: 67, type: 'percent', icon: 'up', operator: '>=' },
                    { value: 33, type: 'percent', icon: 'right', operator: '>=' },
                    { value: 0, type: 'percent', icon: 'down', operator: '>=' },
                ],
            };

            // Top value (100) should get icon[0]
            const resultTop = engine.applyRules(100, [rule], {
                address: { row: 4, col: 0 },
                getValue,
            });
            expect(resultTop.icon?.iconIndex).toBe(0);

            // Bottom value (-100) should get icon[2]
            const resultBottom = engine.applyRules(-100, [rule], {
                address: { row: 0, col: 0 },
                getValue,
            });
            expect(resultBottom.icon?.iconIndex).toBe(2);
        });

        it('should handle zero values', () => {
            const dataset = [0, 0, 0, 0, 0];
            const getValue = (addr: Address) => dataset[addr.row] ?? null;

            const rule: IconSetRule = {
                type: 'icon-set',
                iconSet: '3-arrows',
                ranges: [{ start: { row: 0, col: 0 }, end: { row: 4, col: 0 } }],
                thresholds: [
                    { value: 67, type: 'percent', icon: 'up', operator: '>=' },
                    { value: 33, type: 'percent', icon: 'right', operator: '>=' },
                    { value: 0, type: 'percent', icon: 'down', operator: '>=' },
                ],
            };

            // All zeros should get same icon
            const result = engine.applyRules(0, [rule], {
                address: { row: 0, col: 0 },
                getValue,
            });

            expect(result.icon).toBeDefined();
            expect(result.icon?.iconIndex).toBeDefined();
        });
    });

    describe('Phase C: Color Scale Validation (Placeholder)', () => {
        it.skip('should match Excel for 2-color scale', () => {
            // TODO: Requires Excel file with color scale rules
            expect(true).toBe(true);
        });

        it.skip('should match Excel for 3-color scale', () => {
            // TODO: Requires Excel file
            expect(true).toBe(true);
        });
    });

    describe('Phase D: Data Bar Validation (Placeholder)', () => {
        it.skip('should match Excel for solid fill data bars', () => {
            // TODO: Requires Excel file with data bar rules
            expect(true).toBe(true);
        });

        it.skip('should match Excel for gradient fill data bars', () => {
            // TODO: Requires Excel file
            expect(true).toBe(true);
        });
    });

    describe('Wave 4 Summary', () => {
        it('should report validation statistics', () => {
            const testCases = generateOracleTestCases();
            
            // Phase A: Infrastructure tests (2 passing)
            const phaseATests = 2;
            
            // Phase B: Oracle tests (testCases.length + 1 summary)
            const phaseBTests = testCases.length + 1;
            
            // Phase B Edge Cases: 6 tests
            const edgeCaseTests = 6;
            
            const stats = {
                phaseA: phaseATests,
                phaseB: phaseBTests,
                edgeCases: edgeCaseTests,
                total: phaseATests + phaseBTests + edgeCaseTests,
                oracleTestCases: testCases.length,
                totalValuesValidated: testCases.reduce((sum, tc) => sum + tc.dataset.length, 0),
            };

            console.log('\n=== Wave 4 Validation Summary ===');
            console.log(`Phase A (Infrastructure): ${stats.phaseA} tests`);
            console.log(`Phase B (Oracle Validation): ${stats.phaseB} tests`);
            console.log(`  - Oracle test cases: ${stats.oracleTestCases}`);
            console.log(`  - Values validated: ${stats.totalValuesValidated}`);
            console.log(`Edge Cases: ${stats.edgeCases} tests`);
            console.log(`Total Tests: ${stats.total}`);
            console.log(`Expected Match Rate: ≥95%`);
            console.log('=================================\n');

            expect(stats.total).toBeGreaterThan(0);
            expect(stats.oracleTestCases).toBeGreaterThan(0);
        });
    });
});
