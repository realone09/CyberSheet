/**
 * Performance Benchmark Tests
 * 
 * Measures execution time for cyber-sheet functions across various dataset sizes
 * to establish performance baselines and identify optimization opportunities.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FormulaEngine } from '../../src/FormulaEngine';
import { Worksheet } from '../../src/worksheet';

interface BenchmarkResult {
  operation: string;
  datasetSize: number;
  iterations: number;
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
}

/**
 * Benchmark helper - runs operation multiple times and measures performance
 */
function benchmark(
  operation: string,
  fn: () => any,
  iterations: number = 100
): BenchmarkResult {
  // Warm-up run to avoid JIT compilation effects
  fn();

  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  const opsPerSecond = (1000 / averageTime).toFixed(2);

  return {
    operation,
    datasetSize: 0,
    iterations,
    totalTime: parseFloat(totalTime.toFixed(3)),
    averageTime: parseFloat(averageTime.toFixed(3)),
    opsPerSecond: parseFloat(opsPerSecond)
  };
}

/**
 * Generate numeric array of specified size
 */
function generateNumbers(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1);
}

/**
 * Generate text array of specified size
 */
function generateText(size: number): string[] {
  return Array.from({ length: size }, (_, i) => `Text${i}`);
}

describe('Performance Benchmark Suite', () => {
  let engine: FormulaEngine;
  let worksheet: Worksheet;

  beforeEach(() => {
    worksheet = new Worksheet('TestSheet', 100, 26);
    engine = new FormulaEngine();
  });

  // Helper to create formula context
  const getContext = () => ({
    worksheet,
    currentCell: { row: 0, col: 0 },
    getCellValue: (addr: any) => worksheet.getCell(addr)?.value
  });

  describe('Math Functions - Small Dataset (100 items)', () => {
    const smallData = generateNumbers(100);

    it('should benchmark SUM with 100 numbers', () => {
      const ctx = getContext();
      const result = benchmark(
        'SUM(100 numbers)',
        () => engine.evaluate(`SUM(${smallData.join(',')})`, ctx),
        1000
      );

      console.log('\n📊 SUM Performance (100 items):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      // Should complete in reasonable time (< 5ms average)
      expect(result.averageTime).toBeLessThan(5);
    });

    it('should benchmark AVERAGE with 100 numbers', () => {
      const ctx = getContext();
      const result = benchmark(
        'AVERAGE(100 numbers)',
        () => engine.evaluate(`AVERAGE(${smallData.join(',')})`, ctx),
        1000
      );

      console.log('\n📊 AVERAGE Performance (100 items):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(5);
    });

    it('should benchmark PRODUCT with 20 numbers', () => {
      const productData = generateNumbers(20); // Smaller to avoid overflow
      const ctx = getContext();
      const result = benchmark(
        'PRODUCT(20 numbers)',
        () => engine.evaluate(`PRODUCT(${productData.join(',')})`, ctx),
        1000
      );

      console.log('\n📊 PRODUCT Performance (20 items):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(5);
    });
  });

  describe('Statistical Functions - Medium Dataset (1K items)', () => {
    const mediumData = generateNumbers(1000);

    it('should benchmark MEDIAN with 1000 numbers', () => {
      const ctx = getContext();
      const result = benchmark(
        'MEDIAN(1000 numbers)',
        () => engine.evaluate(`MEDIAN(${mediumData.join(',')})`, ctx),
        100
      );

      console.log('\n📊 MEDIAN Performance (1K items):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      // MEDIAN requires sorting, so slightly slower is acceptable
      expect(result.averageTime).toBeLessThan(20);
    });

    it('should benchmark STDEV.S with 1000 numbers', () => {
      const ctx = getContext();
      const result = benchmark(
        'STDEV.S(1000 numbers)',
        () => engine.evaluate(`STDEV.S(${mediumData.join(',')})`, ctx),
        100
      );

      console.log('\n📊 STDEV.S Performance (1K items):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(20);
    });
  });

  describe('Text Functions - Small Dataset', () => {
    const textData = generateText(50);

    it('should benchmark CONCAT with 50 strings', () => {
      const ctx = getContext();
      const result = benchmark(
        'CONCAT(50 strings)',
        () => engine.evaluate(`CONCAT(${textData.map(t => `"${t}"`).join(',')})`, ctx),
        500
      );

      console.log('\n📊 CONCAT Performance (50 strings):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(10);
    });

    it('should benchmark TEXTJOIN with 100 strings', () => {
      const ctx = getContext();
      const result = benchmark(
        'TEXTJOIN(100 strings)',
        () => engine.evaluate(`TEXTJOIN(",", TRUE, ${textData.map(t => `"${t}"`).join(',')})`, ctx),
        500
      );

      console.log('\n📊 TEXTJOIN Performance (50 strings):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(10);
    });
  });

  describe('Date Functions - Repeated Calculations', () => {
    it('should benchmark DATE function (1000 calls)', () => {
      const ctx = getContext();
      const result = benchmark(
        'DATE(2026, 2, 9)',
        () => engine.evaluate('DATE(2026, 2, 9)', ctx),
        1000
      );

      console.log('\n📊 DATE Performance (single date):');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      // DATE calculation should be very fast
      expect(result.averageTime).toBeLessThan(1);
    });

    it('should benchmark YEAR extraction (1000 calls)', () => {
      const ctx = getContext();
      const result = benchmark(
        'YEAR(DATE(2026, 2, 9))',
        () => engine.evaluate('YEAR(DATE(2026, 2, 9))', ctx),
        1000
      );

      console.log('\n📊 YEAR Performance:');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(2);
    });

    it('should benchmark nested date operations (1000 calls)', () => {
      const ctx = getContext();
      const result = benchmark(
        'Complex date formula',
        () => engine.evaluate('DAY(DATE(YEAR(DATE(2026, 2, 9)), MONTH(DATE(2026, 2, 9)), 9))', ctx),
        1000
      );

      console.log('\n📊 Nested Date Operations:');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(5);
    });
  });

  describe('Complex Formulas - Real-World Scenarios', () => {
    it('should benchmark nested IF statements', () => {
      const ctx = getContext();
      const result = benchmark(
        'Nested IF formula',
        () => engine.evaluate('IF(SUM(1,2,3) > 5, IF(AVERAGE(1,2,3) < 3, "Low", "Medium"), "High")', ctx),
        1000
      );

      console.log('\n📊 Nested IF Performance:');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(3);
    });

    it('should benchmark mixed function types', () => {
      const ctx = getContext();
      const result = benchmark(
        'Mixed formula',
        () => engine.evaluate('ROUND(AVERAGE(10, 20, 30) + SQRT(SUM(1, 2, 3, 4)), 2)', ctx),
        1000
      );

      console.log('\n📊 Mixed Formula Performance:');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      expect(result.averageTime).toBeLessThan(3);
    });
  });

  describe('Error Handling Performance', () => {
    it('should benchmark error detection', () => {
      const ctx = getContext();
      const result = benchmark(
        'Error handling',
        () => engine.evaluate('SUM(1, 2, "not a number")', ctx),
        1000
      );

      console.log('\n📊 Error Handling Performance:');
      console.log(`   Average: ${result.averageTime}ms`);
      console.log(`   Ops/sec: ${result.opsPerSecond}`);

      // Error detection should not significantly slow down execution
      expect(result.averageTime).toBeLessThan(2);
    });
  });

  // Summary report after all tests
  afterAll(() => {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE BENCHMARK SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ All performance benchmarks completed');
    console.log('📝 Review logs above for detailed metrics');
    console.log('\n💡 Optimization Opportunities:');
    console.log('   - Functions > 5ms average: Consider optimization');
    console.log('   - Functions > 20ms average: Priority optimization');
    console.log('\n🎯 Performance Goals:');
    console.log('   - Simple operations: < 1ms');
    console.log('   - Complex operations: < 5ms');
    console.log('   - Large dataset operations: < 20ms');
    console.log('\n' + '='.repeat(60) + '\n');
  });
});
