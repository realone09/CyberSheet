/**
 * @jest-environment node
 * 
 * Week 2 Day 5: Beta & Hypergeometric Distributions
 * Oracle tests comparing against Excel/statistical table outputs
 * 
 * Functions tested:
 * - BETA.DIST (CDF and PDF, with optional bounds)
 * - BETA.INV (inverse/quantile, with optional bounds)
 * - HYPGEOM.DIST (PMF and CDF for discrete hypergeometric)
 */

import { FormulaEngine, FormulaContext, Worksheet } from '../../src';

describe('Statistical Functions - Week 2 Day 5 (Beta & Hypergeometric)', () => {
  let engine: FormulaEngine;
  let worksheet: Worksheet;
  let context: FormulaContext;
  let evaluate: (formula: string) => any;

  beforeEach(() => {
    engine = new FormulaEngine();
    worksheet = new Worksheet('Sheet1', 100, 26);
    context = {
      worksheet,
      currentCell: { row: 10, col: 0 },
    };
    
    evaluate = (formula: string) => engine.evaluate(formula, context);
  });

  describe('BETA.DIST - Beta Distribution', () => {
    test('Oracle Test 1: CDF at x=0.4, α=2, β=3 (default bounds [0,1])', () => {
      // BETA.DIST(0.4, 2, 3, TRUE) or BETA.DIST(0.4, 2, 3, 0, 1, TRUE)
      // Oracle corrected via analytical integration:
      // I_0.4(2,3) = 12∫[0,0.4] t(1-t)^2 dt = 0.5248
      const result = evaluate('=BETA.DIST(0.4, 2, 3, TRUE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.5248, 4);
    });

    test('Oracle Test 2: PDF at x=0.4, α=2, β=3 (default bounds [0,1])', () => {
      // BETA.DIST(0.4, 2, 3, FALSE)
      // Oracle corrected: f(x) = 12·x·(1-x)^2 = 12·0.4·0.36 = 1.728
      const result = evaluate('=BETA.DIST(0.4, 2, 3, FALSE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(1.728, 4);
    });

    test('Oracle Test 3: CDF with custom bounds [1,3]', () => {
      // BETA.DIST(2, 8, 10, 1, 3, TRUE)
      const result = evaluate('=BETA.DIST(2, 8, 10, 1, 3, TRUE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.6854, 3);
    });

    test('Oracle Test 4: PDF at x=0.5, α=0.5, β=0.5 (U-shaped)', () => {
      // BETA.DIST(0.5, 0.5, 0.5, FALSE)
      const result = evaluate('=BETA.DIST(0.5, 0.5, 0.5, FALSE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.6366, 3);
    });

    test('Oracle Test 5: CDF at x=0, α>1', () => {
      // BETA.DIST(0, 2, 3, TRUE) = 0
      const result = evaluate('=BETA.DIST(0, 2, 3, TRUE)');
      expect(result).toBe(0);
    });

    test('Oracle Test 6: CDF at x=1', () => {
      // BETA.DIST(1, 2, 3, TRUE) = 1
      const result = evaluate('=BETA.DIST(1, 2, 3, TRUE)');
      expect(result).toBe(1);
    });

    test('Oracle Test 7: Error - x out of bounds', () => {
      const result = evaluate('=BETA.DIST(1.5, 2, 3, TRUE)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('Oracle Test 8: Error - invalid parameters', () => {
      const result = evaluate('=BETA.DIST(0.5, 0, 3, TRUE)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('BETA.INV - Inverse Beta Distribution', () => {
    test('Oracle Test 1: Inverse at p=0.6854, α=8, β=10, bounds=[1,3]', () => {
      // BETA.INV(0.6854, 8, 10, 1, 3)
      const result = evaluate('=BETA.INV(0.6854, 8, 10, 1, 3)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(2, 2);
    });

    test('Oracle Test 2: Inverse at p=0.5 (median), α=2, β=3', () => {
      // BETA.INV(0.5, 2, 3)
      // Oracle corrected: Median of Beta(2,3) via bisection
      // Expected value = 2/5 = 0.4, median slightly below (right-skewed)
      const result = evaluate('=BETA.INV(0.5, 2, 3)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.3857, 3);
    });

    test('Oracle Test 3: Round-trip symmetry', () => {
      // BETA.INV(BETA.DIST(x)) should approximately equal x
      const x = 0.4;
      const alpha = 2;
      const beta = 3;
      const p = evaluate(`=BETA.DIST(${x}, ${alpha}, ${beta}, TRUE)`);
      const xBack = evaluate(`=BETA.INV(${p}, ${alpha}, ${beta})`);
      expect(typeof xBack).toBe('number');
      expect(xBack as number).toBeCloseTo(x, 6);
    });

    test('Oracle Test 4: Edge case p=0', () => {
      const result = evaluate('=BETA.INV(0, 2, 3)');
      expect(result).toBe(0);
    });

    test('Oracle Test 5: Edge case p=1', () => {
      const result = evaluate('=BETA.INV(1, 2, 3)');
      expect(result).toBe(1);
    });

    test('Oracle Test 6: Error - p out of range', () => {
      const result = evaluate('=BETA.INV(1.5, 2, 3)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('HYPGEOM.DIST - Hypergeometric Distribution', () => {
    test('Oracle Test 1: PMF - drawing 1 success from sample of 4', () => {
      // HYPGEOM.DIST(1, 4, 8, 20, FALSE)
      // Population: 20 items, 8 successes
      // Sample: 4 items, want P(X=1)
      const result = evaluate('=HYPGEOM.DIST(1, 4, 8, 20, FALSE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.3633, 3);
    });

    test('Oracle Test 2: CDF - cumulative up to 1 success', () => {
      // HYPGEOM.DIST(1, 4, 8, 20, TRUE)
      const result = evaluate('=HYPGEOM.DIST(1, 4, 8, 20, TRUE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.4654, 3);
    });

    test('Oracle Test 3: PMF - drawing 2 successes from sample of 5', () => {
      // HYPGEOM.DIST(2, 5, 10, 25, FALSE)
      // Oracle corrected via combinatorial derivation:
      // P(X=2) = C(10,2)·C(15,3) / C(25,5) = 45·455/53130 = 0.38538
      const result = evaluate('=HYPGEOM.DIST(2, 5, 10, 25, FALSE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.3854, 4);
    });

    test('Oracle Test 4: CDF - cumulative up to 2 successes', () => {
      // HYPGEOM.DIST(2, 5, 10, 25, TRUE)
      // Oracle corrected: P(X≤2) = P(0) + P(1) + P(2) = 0.6988
      const result = evaluate('=HYPGEOM.DIST(2, 5, 10, 25, TRUE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(0.6988, 4);
    });

    test('Oracle Test 5: PMF at minimum possible value', () => {
      // HYPGEOM.DIST(0, 4, 8, 20, FALSE)
      const result = evaluate('=HYPGEOM.DIST(0, 4, 8, 20, FALSE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeGreaterThan(0);
      expect(result as number).toBeLessThan(1);
    });

    test('Oracle Test 6: CDF should sum to 1 at maximum', () => {
      // HYPGEOM.DIST(4, 4, 8, 20, TRUE) - all drawn are successes
      const result = evaluate('=HYPGEOM.DIST(4, 4, 8, 20, TRUE)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(1, 3);
    });

    test('Oracle Test 7: Error - impossible combination', () => {
      // Can't draw 10 successes from a sample of 4
      const result = evaluate('=HYPGEOM.DIST(10, 4, 8, 20, FALSE)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('Oracle Test 8: Error - sample larger than population', () => {
      const result = evaluate('=HYPGEOM.DIST(1, 25, 8, 20, FALSE)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('Integration Tests', () => {
    test('BETA.INV and BETA.DIST are inverses (multiple points)', () => {
      const testValues = [0.1, 0.3, 0.5, 0.7, 0.9];
      const alpha = 2;
      const beta = 3;
      
      for (const p of testValues) {
        const x = evaluate(`=BETA.INV(${p}, ${alpha}, ${beta})`);
        const pBack = evaluate(`=BETA.DIST(${x}, ${alpha}, ${beta}, TRUE)`);
        expect(typeof pBack).toBe('number');
        expect(pBack as number).toBeCloseTo(p, 6);
      }
    });

    test('Beta distribution with custom bounds', () => {
      // Test that custom bounds work correctly
      const A = 1;
      const B = 3;
      const x = 2;
      const alpha = 2;
      const beta = 3;
      
      const cdf = evaluate(`=BETA.DIST(${x}, ${alpha}, ${beta}, ${A}, ${B}, TRUE)`);
      const inv = evaluate(`=BETA.INV(${cdf}, ${alpha}, ${beta}, ${A}, ${B})`);
      
      expect(typeof inv).toBe('number');
      expect(inv as number).toBeCloseTo(x, 3);
    });

    test('Hypergeometric PMF sums to 1', () => {
      // Sum all possible outcomes should equal 1
      const n = 4; // sample size
      const K = 8; // successes in population
      const N = 20; // population size
      
      let sum = 0;
      for (let k = 0; k <= Math.min(n, K); k++) {
        const pmf = evaluate(`=HYPGEOM.DIST(${k}, ${n}, ${K}, ${N}, FALSE)`);
        if (typeof pmf === 'number') {
          sum += pmf;
        }
      }
      
      expect(sum).toBeCloseTo(1, 6);
    });

    test('Hypergeometric CDF increases monotonically', () => {
      const n = 5;
      const K = 10;
      const N = 25;
      
      let prevCDF = 0;
      for (let k = 0; k <= Math.min(n, K); k++) {
        const cdf = evaluate(`=HYPGEOM.DIST(${k}, ${n}, ${K}, ${N}, TRUE)`);
        expect(typeof cdf).toBe('number');
        expect(cdf as number).toBeGreaterThanOrEqual(prevCDF);
        prevCDF = cdf as number;
      }
    });

    test('Beta distribution symmetry', () => {
      // Beta(x; α, β) = Beta(1-x; β, α)
      const x = 0.3;
      const alpha = 2;
      const beta = 3;
      
      const cdf1 = evaluate(`=BETA.DIST(${x}, ${alpha}, ${beta}, TRUE)`);
      const cdf2 = evaluate(`=BETA.DIST(${1 - x}, ${beta}, ${alpha}, TRUE)`);
      
      expect(typeof cdf1).toBe('number');
      expect(typeof cdf2).toBe('number');
      expect((cdf1 as number) + (cdf2 as number)).toBeCloseTo(1, 6);
    });

    test('Beta special case: α=1, β=1 is uniform', () => {
      // Beta(1,1) is uniform distribution on [0,1]
      const x = 0.4;
      const cdf = evaluate('=BETA.DIST(0.4, 1, 1, TRUE)');
      expect(cdf).toBeCloseTo(x, 10);
      
      const pdf = evaluate('=BETA.DIST(0.4, 1, 1, FALSE)');
      expect(pdf).toBeCloseTo(1, 10);
    });
  });
});
