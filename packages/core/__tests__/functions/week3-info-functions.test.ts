/**
 * week3-info-functions.test.ts
 * 
 * Week 3: ERROR.TYPE and ISOMITTED functions
 */

import { describe, test, expect } from '@jest/globals';
import { ERROR_TYPE, ISOMITTED } from '../../src/functions/information';

describe('Week 3 Information Functions', () => {
  // ============================================================================
  // ERROR.TYPE - Returns error type number
  // ============================================================================
  describe('ERROR.TYPE', () => {
    test('identifies #NULL! error', () => {
      expect(ERROR_TYPE(new Error('#NULL!'))).toBe(1);
    });

    test('identifies #DIV/0! error', () => {
      expect(ERROR_TYPE(new Error('#DIV/0!'))).toBe(2);
    });

    test('identifies #VALUE! error', () => {
      expect(ERROR_TYPE(new Error('#VALUE!'))).toBe(3);
    });

    test('identifies #REF! error', () => {
      expect(ERROR_TYPE(new Error('#REF!'))).toBe(4);
    });

    test('identifies #NAME? error', () => {
      expect(ERROR_TYPE(new Error('#NAME?'))).toBe(5);
    });

    test('identifies #NUM! error', () => {
      expect(ERROR_TYPE(new Error('#NUM!'))).toBe(6);
    });

    test('identifies #N/A error', () => {
      expect(ERROR_TYPE(new Error('#N/A'))).toBe(7);
    });

    test('identifies #GETTING_DATA error', () => {
      expect(ERROR_TYPE(new Error('#GETTING_DATA'))).toBe(8);
    });

    test('returns #N/A for non-error values', () => {
      const result = ERROR_TYPE(100);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#N/A');
    });

    test('returns #N/A for text', () => {
      const result = ERROR_TYPE("text");
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#N/A');
    });

    test('returns #N/A for boolean', () => {
      const result = ERROR_TYPE(true);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#N/A');
    });

    test('returns #N/A for null', () => {
      const result = ERROR_TYPE(null);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('#N/A');
    });
  });

  // ============================================================================
  // ISOMITTED - Checks if value is omitted
  // ============================================================================
  describe('ISOMITTED', () => {
    test('returns FALSE for numeric values', () => {
      expect(ISOMITTED(100)).toBe(false);
    });

    test('returns FALSE for text values', () => {
      expect(ISOMITTED("hello")).toBe(false);
    });

    test('returns FALSE for boolean values', () => {
      expect(ISOMITTED(true)).toBe(false);
    });

    test('returns FALSE for error values', () => {
      expect(ISOMITTED(new Error('#N/A'))).toBe(false);
    });

    test('returns FALSE for zero', () => {
      expect(ISOMITTED(0)).toBe(false);
    });

    test('returns FALSE for empty string', () => {
      expect(ISOMITTED("")).toBe(false);
    });

    test('returns TRUE for undefined', () => {
      expect(ISOMITTED(undefined as any)).toBe(true);
    });

    test('returns TRUE for null', () => {
      expect(ISOMITTED(null)).toBe(true);
    });
  });
});
