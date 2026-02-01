/**
 * Tests for Engineering Base Conversion Functions
 * BIN2DEC, BIN2HEX, BIN2OCT, DEC2BIN, DEC2HEX, DEC2OCT
 * HEX2BIN, HEX2DEC, HEX2OCT, OCT2BIN, OCT2DEC, OCT2HEX
 */

import { describe, test, expect } from '@jest/globals';
import * as EngineeringFunctions from '../../src/functions/engineering/engineering-functions';

const {
  BIN2DEC, BIN2HEX, BIN2OCT,
  DEC2BIN, DEC2HEX, DEC2OCT,
  HEX2BIN, HEX2DEC, HEX2OCT,
  OCT2BIN, OCT2DEC, OCT2HEX,
} = EngineeringFunctions;

describe('Engineering Base Conversion Functions', () => {
  // ========================================================================
  // BINARY CONVERSIONS
  // ========================================================================
  
  describe('BIN2DEC', () => {
    test('should convert simple binary to decimal', () => {
      expect(BIN2DEC('1010')).toBe(10);
      expect(BIN2DEC('1111')).toBe(15);
      expect(BIN2DEC('1')).toBe(1);
      expect(BIN2DEC('0')).toBe(0);
    });

    test('should convert 8-bit binary to decimal', () => {
      expect(BIN2DEC('11111111')).toBe(255);
      expect(BIN2DEC('10101010')).toBe(170);
      expect(BIN2DEC('00001111')).toBe(15);
    });

    test('should handle negative numbers (twos complement)', () => {
      expect(BIN2DEC('1111111111')).toBe(-1); // 10-bit two's complement
      expect(BIN2DEC('1111111110')).toBe(-2);
      expect(BIN2DEC('1000000000')).toBe(-512); // Most negative
    });

    test('should return #NUM! for invalid binary', () => {
      const result = BIN2DEC('102'); // Contains 2
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('should return #NUM! for binary longer than 10 digits', () => {
      const result = BIN2DEC('11111111111'); // 11 digits
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('should handle leading zeros', () => {
      expect(BIN2DEC('0001010')).toBe(10);
    });
  });

  describe('BIN2HEX', () => {
    test('should convert binary to hexadecimal', () => {
      expect(BIN2HEX('1010')).toBe('A');
      expect(BIN2HEX('1111')).toBe('F');
      expect(BIN2HEX('11111111')).toBe('FF');
    });

    test('should pad with zeros when places specified', () => {
      expect(BIN2HEX('1010', 4)).toBe('000A');
      expect(BIN2HEX('1111', 2)).toBe('0F');
    });

    test('should return #NUM! if result doesnt fit in places', () => {
      const result = BIN2HEX('11111111', 1); // FF cant fit in 1 place
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('BIN2OCT', () => {
    test('should convert binary to octal', () => {
      expect(BIN2OCT('1010')).toBe('12');
      expect(BIN2OCT('1111')).toBe('17');
      expect(BIN2OCT('11111111')).toBe('377');
    });

    test('should pad with zeros when places specified', () => {
      expect(BIN2OCT('1010', 4)).toBe('0012');
    });
  });

  // ========================================================================
  // DECIMAL CONVERSIONS
  // ========================================================================

  describe('DEC2BIN', () => {
    test('should convert decimal to binary', () => {
      expect(DEC2BIN(10)).toBe('1010');
      expect(DEC2BIN(15)).toBe('1111');
      expect(DEC2BIN(255)).toBe('11111111');
      expect(DEC2BIN(0)).toBe('0');
    });

    test('should convert negative numbers (twos complement)', () => {
      expect(DEC2BIN(-1)).toBe('1111111111'); // 10-bit two's complement
      expect(DEC2BIN(-2)).toBe('1111111110');
      expect(DEC2BIN(-512)).toBe('1000000000'); // Most negative
    });

    test('should pad with zeros when places specified', () => {
      expect(DEC2BIN(10, 8)).toBe('00001010');
      expect(DEC2BIN(1, 4)).toBe('0001');
    });

    test('should return #NUM! for out of range', () => {
      expect(DEC2BIN(512)).toBeInstanceOf(Error); // Max is 511
      expect(DEC2BIN(-513)).toBeInstanceOf(Error); // Min is -512
    });

    test('should return #NUM! for non-integer', () => {
      const result = DEC2BIN(10.5);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('should return #VALUE! for non-numeric', () => {
      const result = DEC2BIN('text' as any);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#VALUE!');
    });

    test('should return #NUM! if result doesnt fit in places', () => {
      const result = DEC2BIN(255, 4); // 11111111 cant fit in 4 places
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('DEC2HEX', () => {
    test('should convert decimal to hexadecimal', () => {
      expect(DEC2HEX(10)).toBe('A');
      expect(DEC2HEX(255)).toBe('FF');
      expect(DEC2HEX(4095)).toBe('FFF');
    });

    test('should convert negative numbers (twos complement)', () => {
      expect(DEC2HEX(-1)).toBe('FFFFFFFFFF'); // 40-bit two's complement
      expect(DEC2HEX(-2)).toBe('FFFFFFFFFE');
    });

    test('should pad with zeros when places specified', () => {
      expect(DEC2HEX(255, 4)).toBe('00FF');
      expect(DEC2HEX(10, 4)).toBe('000A');
    });

    test('should return uppercase letters', () => {
      expect(DEC2HEX(171)).toBe('AB'); // Not 'ab'
    });
  });

  describe('DEC2OCT', () => {
    test('should convert decimal to octal', () => {
      expect(DEC2OCT(8)).toBe('10');
      expect(DEC2OCT(10)).toBe('12');
      expect(DEC2OCT(255)).toBe('377');
    });

    test('should convert negative numbers (twos complement)', () => {
      expect(DEC2OCT(-1)).toBe('7777777777'); // 30-bit two's complement
      expect(DEC2OCT(-2)).toBe('7777777776');
    });

    test('should pad with zeros when places specified', () => {
      expect(DEC2OCT(8, 4)).toBe('0010');
    });
  });

  // ========================================================================
  // HEXADECIMAL CONVERSIONS
  // ========================================================================

  describe('HEX2DEC', () => {
    test('should convert hexadecimal to decimal', () => {
      expect(HEX2DEC('A')).toBe(10);
      expect(HEX2DEC('FF')).toBe(255);
      expect(HEX2DEC('FFF')).toBe(4095);
      expect(HEX2DEC('0')).toBe(0);
    });

    test('should handle lowercase input', () => {
      expect(HEX2DEC('a')).toBe(10);
      expect(HEX2DEC('ff')).toBe(255);
    });

    test('should handle negative numbers (twos complement)', () => {
      expect(HEX2DEC('FFFFFFFFFF')).toBe(-1); // 40-bit two's complement
      expect(HEX2DEC('FFFFFFFFFE')).toBe(-2);
    });

    test('should return #NUM! for invalid hex', () => {
      const result = HEX2DEC('G1'); // G is not valid hex
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('should return #NUM! for hex longer than 10 characters', () => {
      const result = HEX2DEC('12345678901'); // 11 characters
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('HEX2BIN', () => {
    test('should convert hexadecimal to binary', () => {
      expect(HEX2BIN('A')).toBe('1010');
      expect(HEX2BIN('F')).toBe('1111');
      expect(HEX2BIN('FF')).toBe('11111111');
    });

    test('should pad with zeros when places specified', () => {
      expect(HEX2BIN('A', 8)).toBe('00001010');
    });

    test('should return #NUM! if value out of binary range', () => {
      const result = HEX2BIN('FFF'); // 4095 > 511 (max for binary)
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });
  });

  describe('HEX2OCT', () => {
    test('should convert hexadecimal to octal', () => {
      expect(HEX2OCT('A')).toBe('12');
      expect(HEX2OCT('FF')).toBe('377');
    });

    test('should pad with zeros when places specified', () => {
      expect(HEX2OCT('A', 4)).toBe('0012');
    });
  });

  // ========================================================================
  // OCTAL CONVERSIONS
  // ========================================================================

  describe('OCT2DEC', () => {
    test('should convert octal to decimal', () => {
      expect(OCT2DEC('12')).toBe(10);
      expect(OCT2DEC('377')).toBe(255);
      expect(OCT2DEC('10')).toBe(8);
      expect(OCT2DEC('0')).toBe(0);
    });

    test('should handle negative numbers (twos complement)', () => {
      expect(OCT2DEC('7777777777')).toBe(-1); // 30-bit two's complement
      expect(OCT2DEC('7777777776')).toBe(-2);
    });

    test('should return #NUM! for invalid octal', () => {
      const result = OCT2DEC('89'); // 8 and 9 are not valid octal
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#NUM!');
    });

    test('should return #NUM! for octal longer than 10 characters', () => {
      const result = OCT2DEC('12345678901'); // 11 characters
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('OCT2BIN', () => {
    test('should convert octal to binary', () => {
      expect(OCT2BIN('12')).toBe('1010');
      expect(OCT2BIN('377')).toBe('11111111');
    });

    test('should pad with zeros when places specified', () => {
      expect(OCT2BIN('12', 8)).toBe('00001010');
    });

    test('should return #NUM! if value out of binary range', () => {
      const result = OCT2BIN('777'); // 511 decimal, but 777 octal = 511 decimal which is OK
      expect(result).toBe('111111111'); // This should work (511 = 111111111 binary)
      
      const result2 = OCT2BIN('1000'); // 512 decimal > 511 max
      expect(result2).toBeInstanceOf(Error);
    });
  });

  describe('OCT2HEX', () => {
    test('should convert octal to hexadecimal', () => {
      expect(OCT2HEX('12')).toBe('A');
      expect(OCT2HEX('377')).toBe('FF');
    });

    test('should pad with zeros when places specified', () => {
      expect(OCT2HEX('12', 4)).toBe('000A');
    });
  });

  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================

  describe('Round-trip conversions', () => {
    test('DEC -> BIN -> DEC should be identity', () => {
      expect(BIN2DEC(DEC2BIN(10) as string)).toBe(10);
      expect(BIN2DEC(DEC2BIN(255) as string)).toBe(255);
      expect(BIN2DEC(DEC2BIN(-1) as string)).toBe(-1);
    });

    test('DEC -> HEX -> DEC should be identity', () => {
      expect(HEX2DEC(DEC2HEX(255) as string)).toBe(255);
      expect(HEX2DEC(DEC2HEX(4095) as string)).toBe(4095);
      expect(HEX2DEC(DEC2HEX(-1) as string)).toBe(-1);
    });

    test('DEC -> OCT -> DEC should be identity', () => {
      expect(OCT2DEC(DEC2OCT(10) as string)).toBe(10);
      expect(OCT2DEC(DEC2OCT(255) as string)).toBe(255);
      expect(OCT2DEC(DEC2OCT(-1) as string)).toBe(-1);
    });

    test('BIN -> HEX -> BIN should be identity (within range)', () => {
      const bin = '1010';
      const hex = BIN2HEX(bin) as string;
      const binBack = HEX2BIN(hex) as string;
      expect(binBack).toBe(bin);
    });

    test('HEX -> OCT -> HEX should be identity', () => {
      const hex = 'FF';
      const oct = HEX2OCT(hex) as string;
      const hexBack = OCT2HEX(oct) as string;
      expect(hexBack).toBe(hex);
    });
  });

  describe('Cross-conversion consistency', () => {
    test('all paths from 10 decimal should match', () => {
      expect(BIN2DEC('1010')).toBe(10);
      expect(HEX2DEC('A')).toBe(10);
      expect(OCT2DEC('12')).toBe(10);
    });

    test('all paths to binary 1010 should match', () => {
      expect(DEC2BIN(10)).toBe('1010');
      expect(HEX2BIN('A')).toBe('1010');
      expect(OCT2BIN('12')).toBe('1010');
    });

    test('all paths to hex A should match', () => {
      expect(DEC2HEX(10)).toBe('A');
      expect(BIN2HEX('1010')).toBe('A');
      expect(OCT2HEX('12')).toBe('A');
    });

    test('all paths to octal 12 should match', () => {
      expect(DEC2OCT(10)).toBe('12');
      expect(BIN2OCT('1010')).toBe('12');
      expect(HEX2OCT('A')).toBe('12');
    });
  });
});
