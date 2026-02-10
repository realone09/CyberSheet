/**
 * Financial Functions - Week 1 Day 3: Oracle Tests
 * Tests for CUMIPMT, CUMPRINC, DB, DDB
 * 
 * These tests validate against Excel's actual output to ensure 100% parity.
 */

import { FormulaEngine, FormulaContext, Worksheet } from '../../src';

describe('Financial Functions - Week 1 Day 3 (CUMIPMT, CUMPRINC, DB, DDB)', () => {
  let engine: FormulaEngine;
  let worksheet: Worksheet;
  let context: FormulaContext;

  beforeEach(() => {
    engine = new FormulaEngine();
    worksheet = new Worksheet('Sheet1', 100, 26);
    context = {
      worksheet,
      currentCell: { row: 10, col: 0 },
    };
  });

  const evaluate = (formula: string) => {
    const result = engine.evaluate(formula, context);
    return result;
  };

  describe('CUMIPMT - Cumulative Interest Payment', () => {
    test('Oracle Test 1: 30-year mortgage year 2 interest', () => {
      // $125,000 mortgage at 9% annual (0.75% monthly) for 30 years
      // Interest paid in year 2 (periods 13-24)
      // Excel: =CUMIPMT(0.09/12, 30*12, 125000, 13, 24, 0)
      // Expected: -11135.23
      
      const result = evaluate('=CUMIPMT(0.09/12, 360, 125000, 13, 24, 0)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-11135.23, 2);
    });

    test('Oracle Test 2: First year interest', () => {
      // Interest paid in first year (periods 1-12)
      const result = evaluate('=CUMIPMT(0.09/12, 360, 125000, 1, 12, 0)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-11215.34, 2);
    });

    test('Oracle Test 3: Single period equals IPMT', () => {
      // Period 5 only - should match IPMT for period 5
      const cumipmt = evaluate('=CUMIPMT(0.09/12, 360, 125000, 5, 5, 0)') as number;
      const ipmt = evaluate('=IPMT(0.09/12, 5, 360, 125000, 0, 0)') as number;
      
      expect(cumipmt).toBeCloseTo(ipmt, 2);
    });

    test('Oracle Test 4: Payment at beginning of period', () => {
      // Type = 1 (payment at beginning)
      const result = evaluate('=CUMIPMT(0.09/12, 360, 125000, 1, 12, 1)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-10201.33, 2);
    });

    test('Oracle Test 5: Returns #NUM! for invalid period range', () => {
      // start_period > end_period
      const result = evaluate('=CUMIPMT(0.09/12, 360, 125000, 25, 24, 0)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('Oracle Test 6: Returns #NUM! for period out of range', () => {
      // end_period > nper
      const result = evaluate('=CUMIPMT(0.09/12, 360, 125000, 1, 361, 0)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('CUMPRINC - Cumulative Principal Payment', () => {
    test('Oracle Test 1: 30-year mortgage year 2 principal', () => {
      // $125,000 mortgage at 9% annual for 30 years
      // Principal paid in year 2 (periods 13-24)
      // Excel: =CUMPRINC(0.09/12, 30*12, 125000, 13, 24, 0)
      // Expected: -934.11
      
      const result = evaluate('=CUMPRINC(0.09/12, 360, 125000, 13, 24, 0)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-934.11, 2);
    });

    test('Oracle Test 2: First year principal', () => {
      // Principal paid in first year (periods 1-12)
      const result = evaluate('=CUMPRINC(0.09/12, 360, 125000, 1, 12, 0)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-854.00, 2);
    });

    test('Oracle Test 3: Single period equals PPMT', () => {
      // Period 5 only - should match PPMT for period 5
      const cumprinc = evaluate('=CUMPRINC(0.09/12, 360, 125000, 5, 5, 0)') as number;
      const ppmt = evaluate('=PPMT(0.09/12, 5, 360, 125000, 0, 0)') as number;
      
      expect(cumprinc).toBeCloseTo(ppmt, 2);
    });

    test('Oracle Test 4: CUMIPMT + CUMPRINC equals total payments', () => {
      // For any period range, interest + principal should equal total payment * periods
      const cumipmt = evaluate('=CUMIPMT(0.09/12, 360, 125000, 1, 12, 0)') as number;
      const cumprinc = evaluate('=CUMPRINC(0.09/12, 360, 125000, 1, 12, 0)') as number;
      const pmt = evaluate('=PMT(0.09/12, 360, 125000, 0, 0)') as number;
      
      expect(cumipmt + cumprinc).toBeCloseTo(pmt * 12, 2);
    });

    test('Oracle Test 5: Payment at beginning of period', () => {
      // Type = 1 (payment at beginning)
      const result = evaluate('=CUMPRINC(0.09/12, 360, 125000, 1, 12, 1)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(-1778.16, 2);
    });

    test('Oracle Test 6: Returns #NUM! for start_period < 1', () => {
      const result = evaluate('=CUMPRINC(0.09/12, 360, 125000, 0, 12, 0)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('DB - Declining Balance Depreciation', () => {
    test('Oracle Test 1: Classic depreciation example first year', () => {
      // Asset cost $1,000,000, salvage $100,000, 6 year life, first 7 months
      // Excel: =DB(1000000, 100000, 6, 1, 7)
      // Expected: $186,083.33
      
      const result = evaluate('=DB(1000000, 100000, 6, 1, 7)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(186083.33, 2);
    });

    test('Oracle Test 2: Second year depreciation', () => {
      // Same asset, period 2
      const result = evaluate('=DB(1000000, 100000, 6, 2)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(217239, 0);
    });

    test('Oracle Test 3: Last year depreciation', () => {
      // Period 6
      const result = evaluate('=DB(1000000, 100000, 6, 6)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(46722.52, 2);
    });

    test('Oracle Test 4: Full year (12 months default)', () => {
      // Default month parameter = 12
      const result = evaluate('=DB(10000, 1000, 5, 1)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(3690.00, 2);
    });

    test('Oracle Test 5: Returns #NUM! for salvage > cost', () => {
      const result = evaluate('=DB(100000, 150000, 6, 1)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('Oracle Test 6: Returns #NUM! for period > life + 1', () => {
      const result = evaluate('=DB(100000, 10000, 6, 8)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('DDB - Double-Declining Balance Depreciation', () => {
    test('Oracle Test 1: Classic DDB example first year', () => {
      // Asset cost $2,400, salvage $300, 10 year life, factor 2 (double-declining)
      // Excel: =DDB(2400, 300, 10, 1, 2)
      // Expected: $480.00
      
      const result = evaluate('=DDB(2400, 300, 10, 1, 2)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(480.00, 2);
    });

    test('Oracle Test 2: Second year depreciation', () => {
      // Same asset, period 2
      const result = evaluate('=DDB(2400, 300, 10, 2, 2)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(384.00, 2);
    });

    test('Oracle Test 3: Last year depreciation', () => {
      // Period 10 - should not go below salvage value
      const result = evaluate('=DDB(2400, 300, 10, 10, 2)');
      expect(typeof result).toBe('number');
      // Final period brings book value to salvage
      expect(result as number).toBeGreaterThanOrEqual(0);
      expect(result as number).toBeLessThanOrEqual(300);
    });

    test('Oracle Test 4: Default factor = 2', () => {
      // Omit factor parameter, defaults to 2
      const result1 = evaluate('=DDB(2400, 300, 10, 1, 2)') as number;
      const result2 = evaluate('=DDB(2400, 300, 10, 1)') as number;
      
      expect(result1).toBeCloseTo(result2, 2);
    });

    test('Oracle Test 5: Custom factor (1.5)', () => {
      // 150% declining balance
      const result = evaluate('=DDB(2400, 300, 10, 1, 1.5)');
      expect(typeof result).toBe('number');
      expect(result as number).toBeCloseTo(360.00, 2);
    });

    test('Oracle Test 6: Returns #NUM! for negative cost', () => {
      const result = evaluate('=DDB(-2400, 300, 10, 1)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('Oracle Test 7: Returns #NUM! for period > life', () => {
      const result = evaluate('=DDB(2400, 300, 10, 11)');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('Integration Tests', () => {
    test('Total depreciation over asset life (DB)', () => {
      // Sum of all periods should approximately equal (cost - salvage)
      let totalDepreciation = 0;
      for (let period = 1; period <= 6; period++) {
        const dep = evaluate(`=DB(1000000, 100000, 6, ${period})`) as number;
        totalDepreciation += dep;
      }
      
      // Should be close to 900,000 (cost - salvage), allow small rounding difference
      expect(totalDepreciation).toBeCloseTo(900000, -3); // Within 500
    });

    test('Total depreciation over asset life (DDB)', () => {
      // Sum of all periods should not exceed (cost - salvage)
      let totalDepreciation = 0;
      for (let period = 1; period <= 10; period++) {
        const dep = evaluate(`=DDB(2400, 300, 10, ${period})`) as number;
        totalDepreciation += dep;
      }
      
      // Should be exactly 2100 (cost - salvage)
      expect(totalDepreciation).toBeCloseTo(2100, 0);
    });

    test('CUMIPMT + CUMPRINC covers full loan life', () => {
      // Total interest + principal over all 360 periods
      const totalInterest = evaluate('=CUMIPMT(0.09/12, 360, 125000, 1, 360, 0)') as number;
      const totalPrincipal = evaluate('=CUMPRINC(0.09/12, 360, 125000, 1, 360, 0)') as number;
      
      // Total principal should equal loan amount
      expect(Math.abs(totalPrincipal)).toBeCloseTo(125000, 0);
      
      // Total interest should be positive
      expect(Math.abs(totalInterest)).toBeGreaterThan(100000);
    });
  });
});
