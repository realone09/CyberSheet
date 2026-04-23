/**
 * FormulaShiftingService.test.ts
 * 
 * Comprehensive test suite for token-based formula shifting
 * 
 * Test Categories:
 * 1. Column conversion utilities
 * 2. Relative reference shifting
 * 3. Absolute reference preservation
 * 4. Mixed references
 * 5. Range shifting
 * 6. Nested functions
 * 7. String literals (don't shift)
 * 8. Invalid references (#REF!)
 * 9. Complex formulas
 * 10. Edge cases
 */

import { FormulaShiftingService } from '../src/FormulaShiftingService';
import type { Address } from '../src/types';

describe('FormulaShiftingService', () => {
  // ==================== COLUMN CONVERSION ====================
  
  describe('Column Conversion Utilities', () => {
    describe('columnLettersToIndex', () => {
      test('Single letter columns', () => {
        expect(FormulaShiftingService.columnLettersToIndex('A')).toBe(0);
        expect(FormulaShiftingService.columnLettersToIndex('B')).toBe(1);
        expect(FormulaShiftingService.columnLettersToIndex('Z')).toBe(25);
      });

      test('Two letter columns', () => {
        expect(FormulaShiftingService.columnLettersToIndex('AA')).toBe(26);
        expect(FormulaShiftingService.columnLettersToIndex('AB')).toBe(27);
        expect(FormulaShiftingService.columnLettersToIndex('AZ')).toBe(51);
        expect(FormulaShiftingService.columnLettersToIndex('BA')).toBe(52);
      });

      test('Three letter columns', () => {
        expect(FormulaShiftingService.columnLettersToIndex('AAA')).toBe(702);
        expect(FormulaShiftingService.columnLettersToIndex('ZZZ')).toBe(18277);
      });
    });

    describe('columnIndexToLetters', () => {
      test('Single letter columns', () => {
        expect(FormulaShiftingService.columnIndexToLetters(0)).toBe('A');
        expect(FormulaShiftingService.columnIndexToLetters(1)).toBe('B');
        expect(FormulaShiftingService.columnIndexToLetters(25)).toBe('Z');
      });

      test('Two letter columns', () => {
        expect(FormulaShiftingService.columnIndexToLetters(26)).toBe('AA');
        expect(FormulaShiftingService.columnIndexToLetters(27)).toBe('AB');
        expect(FormulaShiftingService.columnIndexToLetters(51)).toBe('AZ');
        expect(FormulaShiftingService.columnIndexToLetters(52)).toBe('BA');
      });

      test('Three letter columns', () => {
        expect(FormulaShiftingService.columnIndexToLetters(702)).toBe('AAA');
        expect(FormulaShiftingService.columnIndexToLetters(18277)).toBe('ZZZ');
      });

      test('Round-trip conversion', () => {
        const testCases = [0, 1, 25, 26, 27, 51, 52, 100, 702, 1000, 18277];
        for (const index of testCases) {
          const letters = FormulaShiftingService.columnIndexToLetters(index);
          const roundTrip = FormulaShiftingService.columnLettersToIndex(letters);
          expect(roundTrip).toBe(index);
        }
      });
    });
  });

  // ==================== RELATIVE REFERENCES ====================
  
  describe('Relative Reference Shifting', () => {
    test('Simple cell reference - shift right+down', () => {
      const result = FormulaShiftingService.shift(
        '=A1',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2');
    });

    test('Simple cell reference - shift left+up', () => {
      const result = FormulaShiftingService.shift(
        '=C3',
        { row: 2, col: 2 },
        { row: 0, col: 0 }
      );
      expect(result).toBe('=A1');
    });

    test('Multiple references in formula', () => {
      const result = FormulaShiftingService.shift(
        '=A1+B2',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2+C3');
    });

    test('Large offset', () => {
      const result = FormulaShiftingService.shift(
        '=A1',
        { row: 0, col: 0 },
        { row: 100, col: 50 }
      );
      expect(result).toBe('=AY101');
    });

    test('No shift when source equals target', () => {
      const result = FormulaShiftingService.shift(
        '=A1+B2',
        { row: 5, col: 5 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=A1+B2');
    });
  });

  // ==================== ABSOLUTE REFERENCES ====================
  
  describe('Absolute Reference Preservation', () => {
    test('Absolute row and column - no shift', () => {
      const result = FormulaShiftingService.shift(
        '=$A$1',
        { row: 0, col: 0 },
        { row: 10, col: 10 }
      );
      expect(result).toBe('=$A$1');
    });

    test('Multiple absolute references', () => {
      const result = FormulaShiftingService.shift(
        '=$A$1+$B$2',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=$A$1+$B$2');
    });

    test('Mix of absolute and relative', () => {
      const result = FormulaShiftingService.shift(
        '=$A$1+B2',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=$A$1+C3');
    });
  });

  // ==================== MIXED REFERENCES ====================
  
  describe('Mixed References', () => {
    test('Absolute column, relative row', () => {
      const result = FormulaShiftingService.shift(
        '=$A1',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=$A6');
    });

    test('Relative column, absolute row', () => {
      const result = FormulaShiftingService.shift(
        '=A$1',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=F$1');
    });

    test('Multiple mixed references', () => {
      const result = FormulaShiftingService.shift(
        '=$A1+B$2',
        { row: 0, col: 0 },
        { row: 2, col: 3 }
      );
      expect(result).toBe('=$A3+E$2');
    });
  });

  // ==================== RANGE SHIFTING ====================
  
  describe('Range Shifting', () => {
    test('Simple range - relative', () => {
      const result = FormulaShiftingService.shift(
        '=SUM(A1:B2)',
        { row: 0, col: 0 },
        { row: 2, col: 2 }
      );
      expect(result).toBe('=SUM(C3:D4)');
    });

    test('Range with absolute anchors', () => {
      const result = FormulaShiftingService.shift(
        '=SUM($A$1:$B$2)',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=SUM($A$1:$B$2)');
    });

    test('Range with mixed references', () => {
      const result = FormulaShiftingService.shift(
        '=SUM($A1:B$2)',
        { row: 0, col: 0 },
        { row: 3, col: 3 }
      );
      expect(result).toBe('=SUM($A4:E$2)');
    });

    test('Multiple ranges in formula', () => {
      const result = FormulaShiftingService.shift(
        '=SUM(A1:B2)+AVERAGE(C3:D4)',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=SUM(B2:C3)+AVERAGE(D4:E5)');
    });

    test('Entire column range', () => {
      const result = FormulaShiftingService.shift(
        '=SUM(A:A)',
        { row: 0, col: 0 },
        { row: 0, col: 2 }
      );
      // Note: A:A notation not yet supported in V1, should pass through or handle gracefully
      // For now, test that it doesn't crash
      expect(typeof result).toBe('string');
    });
  });

  // ==================== NESTED FUNCTIONS ====================
  
  describe('Nested Functions', () => {
    test('Deeply nested functions', () => {
      const result = FormulaShiftingService.shift(
        '=IF(SUM(A1:B2)>10,AVERAGE(C3:D4),MAX(E5:F6))',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=IF(SUM(B2:C3)>10,AVERAGE(D4:E5),MAX(F6:G7))');
    });

    test('Multiple levels of nesting', () => {
      const result = FormulaShiftingService.shift(
        '=SUM(A1,IF(B2>0,C3,D4))',
        { row: 0, col: 0 },
        { row: 2, col: 2 }
      );
      expect(result).toBe('=SUM(C3,IF(D4>0,E5,F6))');
    });

    test('Array formula with nested functions', () => {
      const result = FormulaShiftingService.shift(
        '=SUM((A1:A10)*(B1:B10))',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('=SUM((F6:F15)*(G6:G15))');
    });
  });

  // ==================== STRING LITERALS ====================
  
  describe('String Literals (No Shifting Inside)', () => {
    test('String containing cell-like pattern', () => {
      const result = FormulaShiftingService.shift(
        '="Cell A1 value"',
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      expect(result).toBe('="Cell A1 value"');
    });

    test('Mixed string and references', () => {
      const result = FormulaShiftingService.shift(
        '=A1&" is in "&"cell A1"',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2&" is in "&"cell A1"');
    });

    test('Escaped quotes in string', () => {
      const result = FormulaShiftingService.shift(
        '=A1&""" is quote"""',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2&""" is quote"""');
    });

    test('Multiple strings', () => {
      const result = FormulaShiftingService.shift(
        '="Start"&A1&"Middle"&B2&"End"',
        { row: 0, col: 0 },
        { row: 2, col: 2 }
      );
      expect(result).toBe('="Start"&C3&"Middle"&D4&"End"');
    });
  });

  // ==================== INVALID REFERENCES (#REF!) ====================
  
  describe('Invalid References', () => {
    test('Shift left beyond column A', () => {
      const result = FormulaShiftingService.shift(
        '=B1',
        { row: 0, col: 1 },
        { row: 0, col: 0 }
      );
      expect(result).toBe('=A1');
      
      // One more left should produce #REF!
      const result2 = FormulaShiftingService.shift(
        '=A1',
        { row: 0, col: 0 },
        { row: 0, col: -1 }
      );
      expect(result2).toBe('=#REF!');
    });

    test('Shift up beyond row 1', () => {
      const result = FormulaShiftingService.shift(
        '=A2',
        { row: 1, col: 0 },
        { row: 0, col: 0 }
      );
      expect(result).toBe('=A1');
      
      // One more up should produce #REF!
      const result2 = FormulaShiftingService.shift(
        '=A1',
        { row: 0, col: 0 },
        { row: -1, col: 0 }
      );
      expect(result2).toBe('=#REF!');
    });
    
    test('CRITICAL: Column overflow beyond XFD (16384 columns)', () => {
      // XFD is column 16383 (0-indexed)
      const result = FormulaShiftingService.shift(
        '=XFD1',
        { row: 0, col: 16383 },
        { row: 0, col: 16384 }  // One beyond Excel limit
      );
      expect(result).toBe('=#REF!');
    });
    
    test('CRITICAL: Row overflow beyond 1048576', () => {
      const result = FormulaShiftingService.shift(
        '=A1048576',
        { row: 1048575, col: 0 },
        { row: 1048576, col: 0 }  // One beyond Excel limit
      );
      expect(result).toBe('=#REF!');
    });

    test('Range with invalid reference', () => {
      const result = FormulaShiftingService.shift(
        '=SUM(A1:B2)',
        { row: 0, col: 0 },
        { row: -1, col: 0 }
      );
      expect(result).toBe('=SUM(#REF!)');
    });
    
    test('CRITICAL: Range partial failure - start invalid', () => {
      // If start of range becomes invalid, entire range = #REF!
      const result = FormulaShiftingService.shift(
        '=SUM(A1:B2)',
        { row: 0, col: 0 },
        { row: 0, col: -1 }  // A1 → invalid, B2 → A2
      );
      expect(result).toBe('=SUM(#REF!)');
    });
    
    test('CRITICAL: Range partial failure - end invalid', () => {
      // If end of range becomes invalid, entire range = #REF!
      const result = FormulaShiftingService.shift(
        '=SUM(A1:XFD1)',
        { row: 0, col: 0 },
        { row: 0, col: 1 }  // A1 → B1, XFD1 → invalid
      );
      expect(result).toBe('=SUM(#REF!)');
    });

    test('Mixed valid and invalid references', () => {
      const result = FormulaShiftingService.shift(
        '=A1+B1',
        { row: 0, col: 0 },
        { row: 0, col: -1 }
      );
      // A1 becomes #REF!, B1 becomes A1
      expect(result).toBe('=#REF!+A1');
    });
  });

  // ==================== COMPLEX FORMULAS ====================
  
  describe('Complex Real-World Formulas', () => {
    test('VLOOKUP with range', () => {
      const result = FormulaShiftingService.shift(
        '=VLOOKUP(A2,$E$1:$G$100,2,FALSE)',
        { row: 1, col: 0 },
        { row: 2, col: 0 }
      );
      expect(result).toBe('=VLOOKUP(A3,$E$1:$G$100,2,FALSE)');
    });

    test('INDEX-MATCH combination', () => {
      const result = FormulaShiftingService.shift(
        '=INDEX($A$1:$A$100,MATCH(B2,$B$1:$B$100,0))',
        { row: 1, col: 1 },
        { row: 5, col: 1 }
      );
      expect(result).toBe('=INDEX($A$1:$A$100,MATCH(B6,$B$1:$B$100,0))');
    });

    test('SUMIF with criteria', () => {
      const result = FormulaShiftingService.shift(
        '=SUMIF($A$1:$A$100,">"&B2,$C$1:$C$100)',
        { row: 1, col: 1 },
        { row: 10, col: 1 }
      );
      expect(result).toBe('=SUMIF($A$1:$A$100,">"&B11,$C$1:$C$100)');
    });

    test('Array formula with multiple operations', () => {
      const result = FormulaShiftingService.shift(
        '=SUM((A1:A10-B1:B10)*(C1:C10))',
        { row: 0, col: 0 },
        { row: 5, col: 2 }
      );
      expect(result).toBe('=SUM((C6:C15-D6:D15)*(E6:E15))');
    });

    test('Conditional with multiple ranges', () => {
      const result = FormulaShiftingService.shift(
        '=IF(AND(A1>0,B1<100),SUM(C1:D1),AVERAGE(E1:F1))',
        { row: 0, col: 0 },
        { row: 3, col: 3 }
      );
      expect(result).toBe('=IF(AND(D4>0,E4<100),SUM(F4:G4),AVERAGE(H4:I4))');
    });
  });

  // ==================== EDGE CASES ====================
  
  describe('Edge Cases', () => {
    test('Formula with only numbers (no references)', () => {
      const result = FormulaShiftingService.shift(
        '=123+456',
        { row: 0, col: 0 },
        { row: 10, col: 10 }
      );
      expect(result).toBe('=123+456');
    });

    test('Formula with decimals', () => {
      const result = FormulaShiftingService.shift(
        '=A1*0.5+B2*1.23',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2*0.5+C3*1.23');
    });

    test('Empty formula (just =)', () => {
      const result = FormulaShiftingService.shift(
        '=',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=');
    });

    test('Formula with whitespace', () => {
      const result = FormulaShiftingService.shift(
        '= A1 + B2 ',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      // Whitespace must be preserved for token stability
      expect(result).toBe('= B2 + C3 ');
    });

    test('Formula with operators', () => {
      const result = FormulaShiftingService.shift(
        '=A1+B2-C3*D4/E5^F6',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2+C3-D4*E5/F6^G7');
    });

    test('Formula with comparison operators', () => {
      const result = FormulaShiftingService.shift(
        '=A1>B2',
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      expect(result).toBe('=B2>C3');
    });

    test('Formula with parentheses nesting', () => {
      const result = FormulaShiftingService.shift(
        '=((A1+B2)*(C3-D4))/((E5+F6)*(G7-H8))',
        { row: 0, col: 0 },
        { row: 2, col: 2 }
      );
      expect(result).toBe('=((C3+D4)*(E5-F6))/((G7+H8)*(I9-J10))');
    });

    test('Reference to multi-letter column', () => {
      const result = FormulaShiftingService.shift(
        '=AA1+AB2',
        { row: 0, col: 26 },
        { row: 1, col: 27 }
      );
      expect(result).toBe('=AB2+AC3');
    });

    test('Large column references', () => {
      const result = FormulaShiftingService.shift(
        '=ZZ1',
        { row: 0, col: 701 },
        { row: 0, col: 702 }
      );
      expect(result).toBe('=AAA1');
    });
  });

  // ==================== DETERMINISM & STABILITY ====================
  
  describe('Determinism & Stability', () => {
    test('CRITICAL: Identity guarantee - shift A→B then B→A = original', () => {
      const original = '=A1+B2';
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 0 },
        { row: 1, col: 1 }  // A1 → B2
      );
      const reversed = FormulaShiftingService.shift(
        shifted,
        { row: 1, col: 1 },
        { row: 0, col: 0 }  // B2 → A1
      );
      expect(reversed).toBe(original);
    });
    
    test('CRITICAL: Identity guarantee with ranges', () => {
      const original = '=SUM(A1:B2)+C3';
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 0 },
        { row: 5, col: 5 }
      );
      const reversed = FormulaShiftingService.shift(
        shifted,
        { row: 5, col: 5 },
        { row: 0, col: 0 }
      );
      expect(reversed).toBe(original);
    });
    
    test('CRITICAL: Identity guarantee with absolute refs', () => {
      const original = '=$A$1+B2';
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 1 },
        { row: 10, col: 10 }
      );
      const reversed = FormulaShiftingService.shift(
        shifted,
        { row: 10, col: 10 },
        { row: 0, col: 1 }
      );
      expect(reversed).toBe(original);
    });
    
    test('CRITICAL: Token stability - preserve whitespace', () => {
      const original = '=A1 +  B2';  // Multiple spaces
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 0 },
        { row: 1, col: 1 }
      );
      // Should preserve spacing pattern
      expect(shifted).toBe('=B2 +  C3');
    });
    
    test('CRITICAL: Token stability - preserve newlines in complex formulas', () => {
      const original = '=IF(A1>0,\n  B1,\n  C1)';
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 0 },
        { row: 1, col: 0 }
      );
      // Should preserve newlines and indentation
      expect(shifted).toBe('=IF(A2>0,\n  B2,\n  C2)');
    });
    
    test('Token stability - preserve tabs', () => {
      const original = '=A1\t+\tB1';
      const shifted = FormulaShiftingService.shift(
        original,
        { row: 0, col: 0 },
        { row: 0, col: 1 }
      );
      expect(shifted).toBe('=B1\t+\tC1');
    });
  });

  // ==================== PERFORMANCE ====================
  
  describe('Performance', () => {
    test('Complex formula completes in reasonable time', () => {
      const complexFormula = '=SUM(' + 
        Array.from({ length: 100 }, (_, i) => `A${i + 1}`).join('+') + 
        ')';
      
      const start = Date.now();
      const result = FormulaShiftingService.shift(
        complexFormula,
        { row: 0, col: 0 },
        { row: 10, col: 10 }
      );
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);  // Should complete in <100ms
      expect(result).toContain('K11');  // First ref shifted to K11
    });

    test('Many independent shifts are fast', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        FormulaShiftingService.shift(
          '=A1+B2',
          { row: 0, col: 0 },
          { row: i, col: i }
        );
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);  // 1000 shifts in <500ms
    });
  });
});
