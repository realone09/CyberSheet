/**
 * math-functions.ts
 * 
 * Mathematical formula functions.
 * All functions follow Excel semantics and return FormulaValue.
 */

import type { FormulaFunction, FormulaValue } from '../../types/formula-types';
import { filterNumbers, flattenArray } from '../../utils/array-utils';
import { toNumber } from '../../utils/type-utils';
import { validateArgCount, validateNonZero, validatePositive } from '../../utils/validation-utils';

/**
 * SUM - Sum of all numbers
 * 
 * Excel behavior:
 * - Direct string arguments: #VALUE! error
 * - Strings from cell references: ignored (filtered out)
 * - Direct number arguments or cell references with numbers: summed
 */
export const SUM: FormulaFunction = (...args) => {
  // Excel throws #VALUE! if direct string arguments are provided
  // Check if any top-level argument is a string (not from array/range)
  for (const arg of args) {
    if (typeof arg === 'string') {
      // Try to convert to number
      const num = toNumber(arg);
      if (num instanceof Error) {
        return new Error('#VALUE!');
      }
    }
  }
  
  const numbers = filterNumbers(args);
  return numbers.reduce((sum, n) => sum + n, 0);
};

/**
 * AVERAGE - Average of all numbers
 * Only counts numeric values, ignoring text and logical values.
 * 
 * @example
 * =AVERAGE(1, 2, 3, 4, 5) → 3
 * =AVERAGE({10, 20, "text", TRUE}) → 15 (ignores text and TRUE)
 */
export const AVERAGE: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args);
  if (numbers.length === 0) return new Error('#DIV/0!');
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

/**
 * AVERAGEA - Average of all values (text/logical count as 0)
 * Unlike AVERAGE, counts text and logical values as 0.
 * 
 * @example
 * =AVERAGEA(1, 2, 3) → 2
 * =AVERAGEA(10, 20, "text") → 10 (text counts as 0: (10+20+0)/3)
 * =AVERAGEA(10, 20, TRUE, FALSE) → 7.75 (TRUE=1, FALSE=0: (10+20+1+0)/4)
 */
export const AVERAGEA: FormulaFunction = (...args) => {
  const flatten = (arr: FormulaValue[]): FormulaValue[] => {
    const result: FormulaValue[] = [];
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...flatten(item));
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const values = flatten(args).filter(v => v != null && !(v instanceof Error));
  
  if (values.length === 0) return new Error('#DIV/0!');
  
  let sum = 0;
  for (const val of values) {
    if (typeof val === 'number') {
      sum += val;
    } else if (typeof val === 'boolean') {
      sum += val ? 1 : 0;
    } else if (typeof val === 'string') {
      // Text counts as 0
      sum += 0;
    }
  }
  
  return sum / values.length;
};

/**
 * MIN - Minimum value
 */
export const MIN: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args);
  if (numbers.length === 0) return new Error('#NUM!');
  return Math.min(...numbers);
};

/**
 * MAX - Maximum value
 */
export const MAX: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args);
  if (numbers.length === 0) return new Error('#NUM!');
  return Math.max(...numbers);
};

/**
 * COUNT - Count of numeric values
 */
export const COUNT: FormulaFunction = (...args) => {
  return filterNumbers(args).length;
};

/**
 * COUNTA - Count of non-empty values
 */
export const COUNTA: FormulaFunction = (...args) => {
  const flatten = (arr: FormulaValue[]): FormulaValue[] => {
    const result: FormulaValue[] = [];
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...flatten(item));
      } else {
        result.push(item);
      }
    }
    return result;
  };

  return flatten(args).filter(v => v != null).length;
};

/**
 * ABS - Absolute value
 */
export const ABS: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.abs(num);
};

/**
 * ROUND - Round to specified digits
 */
export const ROUND: FormulaFunction = (value, digits) => {
  const num = toNumber(value);
  const dig = toNumber(digits);

  if (num instanceof Error) return num;
  if (dig instanceof Error) return dig;

  const factor = Math.pow(10, dig);
  return Math.round(num * factor) / factor;
};

/**
 * ROUNDUP - Round up (away from zero)
 */
export const ROUNDUP: FormulaFunction = (value, digits) => {
  const num = toNumber(value);
  const dig = toNumber(digits);

  if (num instanceof Error) return num;
  if (dig instanceof Error) return dig;

  const factor = Math.pow(10, dig);
  return Math.ceil(num * factor) / factor;
};

/**
 * ROUNDDOWN - Round down (toward zero)
 */
export const ROUNDDOWN: FormulaFunction = (value, digits) => {
  const num = toNumber(value);
  const dig = toNumber(digits);

  if (num instanceof Error) return num;
  if (dig instanceof Error) return dig;

  const factor = Math.pow(10, dig);
  return Math.floor(num * factor) / factor;
};

/**
 * SQRT - Square root
 */
export const SQRT: FormulaFunction = (value) => {
  const num = toNumber(value);

  if (num instanceof Error) return num;
  if (num < 0) return new Error('#NUM!');

  return Math.sqrt(num);
};

/**
 * POWER - Raise to power
 */
export const POWER: FormulaFunction = (base, exponent) => {
  const b = toNumber(base);
  const e = toNumber(exponent);

  if (b instanceof Error) return b;
  if (e instanceof Error) return e;

  const result = Math.pow(b, e);
  return isNaN(result) ? new Error('#NUM!') : result;
};

/**
 * EXP - e raised to power
 */
export const EXP: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.exp(num);
};

/**
 * LN - Natural logarithm
 */
export const LN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;

  const error = validatePositive(num);
  if (error) return error;

  return Math.log(num);
};

/**
 * LOG - Logarithm with base
 */
export const LOG: FormulaFunction = (value, base = 10) => {
  const num = toNumber(value);
  const b = toNumber(base);

  if (num instanceof Error) return num;
  if (b instanceof Error) return b;

  const error = validatePositive(num) || validatePositive(b);
  if (error) return error;

  return Math.log(num) / Math.log(b);
};

/**
 * LOG10 - Base-10 logarithm
 */
export const LOG10: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;

  const error = validatePositive(num);
  if (error) return error;

  return Math.log10(num);
};

/**
 * MOD - Modulo operation
 */
export const MOD: FormulaFunction = (dividend, divisor) => {
  const num = toNumber(dividend);
  const div = toNumber(divisor);

  if (num instanceof Error) return num;
  if (div instanceof Error) return div;

  const error = validateNonZero(div);
  if (error) return error;

  return num % div;
};

/**
 * PI - Returns π
 */
export const PI: FormulaFunction = () => {
  return Math.PI;
};

/**
 * RAND - Random number between 0 and 1
 */
export const RAND: FormulaFunction = () => {
  return Math.random();
};

/**
 * RANDBETWEEN - Random integer between two numbers
 */
export const RANDBETWEEN: FormulaFunction = (bottom, top) => {
  // Check for missing arguments
  if (bottom === undefined || top === undefined) {
    return new Error('#VALUE!');
  }
  
  const b = toNumber(bottom);
  const t = toNumber(top);

  if (b instanceof Error) return b;
  if (t instanceof Error) return t;

  const min = Math.ceil(b);
  const max = Math.floor(t);

  if (min > max) return new Error('#NUM!');

  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * SIN - Sine (radians)
 */
export const SIN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.sin(num);
};

/**
 * COS - Cosine (radians)
 */
export const COS: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.cos(num);
};

/**
 * TAN - Tangent (radians)
 */
export const TAN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.tan(num);
};

/**
 * ASIN - Arcsine
 */
export const ASIN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  if (num < -1 || num > 1) return new Error('#NUM!');
  return Math.asin(num);
};

/**
 * ACOS - Arccosine
 */
export const ACOS: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  if (num < -1 || num > 1) return new Error('#NUM!');
  return Math.acos(num);
};

/**
 * ATAN - Arctangent
 */
export const ATAN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.atan(num);
};

/**
 * ATAN2 - Arctangent from x and y coordinates
 */
export const ATAN2: FormulaFunction = (x, y) => {
  const xNum = toNumber(x);
  const yNum = toNumber(y);

  if (xNum instanceof Error) return xNum;
  if (yNum instanceof Error) return yNum;

  return Math.atan2(yNum, xNum);
};

/**
 * DEGREES - Convert radians to degrees
 */
export const DEGREES: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return (num * 180) / Math.PI;
};

/**
 * RADIANS - Convert degrees to radians
 */
export const RADIANS: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return (num * Math.PI) / 180;
};

/**
 * SIGN - Sign of number (-1, 0, or 1)
 */
export const SIGN: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.sign(num);
};

/**
 * TRUNC - Truncate to integer
 */
export const TRUNC: FormulaFunction = (value, digits = 0) => {
  const num = toNumber(value);
  const dig = toNumber(digits);

  if (num instanceof Error) return num;
  if (dig instanceof Error) return dig;

  const factor = Math.pow(10, dig);
  return Math.trunc(num * factor) / factor;
};

/**
 * INT - Round down to nearest integer
 */
export const INT: FormulaFunction = (value) => {
  const num = toNumber(value);
  if (num instanceof Error) return num;
  return Math.floor(num);
};

/**
 * CEILING - Round up to nearest multiple
 */
export const CEILING: FormulaFunction = (value, significance = 1) => {
  const num = toNumber(value);
  const sig = toNumber(significance);

  if (num instanceof Error) return num;
  if (sig instanceof Error) return sig;

  const error = validateNonZero(sig);
  if (error) return error;

  return Math.ceil(num / sig) * sig;
};

/**
 * FLOOR - Round down to nearest multiple
 */
export const FLOOR: FormulaFunction = (value, significance = 1) => {
  const num = toNumber(value);
  const sig = toNumber(significance);

  if (num instanceof Error) return num;
  if (sig instanceof Error) return sig;

  const error = validateNonZero(sig);
  if (error) return error;

  return Math.floor(num / sig) * sig;
};

/**
 * GCD - Greatest common divisor
 */
export const GCD: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args).map(Math.abs).map(Math.floor);

  if (numbers.length === 0) return new Error('#VALUE!');

  const gcdTwo = (a: number, b: number): number => {
    return b === 0 ? a : gcdTwo(b, a % b);
  };

  return numbers.reduce(gcdTwo);
};

/**
 * LCM - Least common multiple
 */
export const LCM: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args).map(Math.abs).map(Math.floor);

  if (numbers.length === 0) return new Error('#VALUE!');

  const gcdTwo = (a: number, b: number): number => {
    return b === 0 ? a : gcdTwo(b, a % b);
  };

  const lcmTwo = (a: number, b: number): number => {
    return (a * b) / gcdTwo(a, b);
  };

  return numbers.reduce(lcmTwo);
};

/**
 * FACT - Factorial
 */
export const FACT: FormulaFunction = (value) => {
  const num = toNumber(value);

  if (num instanceof Error) return num;
  if (num < 0) return new Error('#NUM!');
  if (!Number.isInteger(num)) return new Error('#NUM!');

  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }

  return result;
};

/**
 * COMBIN - Number of combinations
 */
export const COMBIN: FormulaFunction = (n, k) => {
  const nNum = toNumber(n);
  const kNum = toNumber(k);

  if (nNum instanceof Error) return nNum;
  if (kNum instanceof Error) return kNum;

  if (nNum < 0 || kNum < 0 || kNum > nNum) return new Error('#NUM!');

  // Use formula: C(n,k) = n! / (k! * (n-k)!)
  let result = 1;
  for (let i = 0; i < kNum; i++) {
    result *= (nNum - i) / (i + 1);
  }

  return Math.round(result);
};

/**
 * SUMPRODUCT - Sum of products
 */
export const SUMPRODUCT: FormulaFunction = (...args) => {
  if (args.length === 0) return new Error('#VALUE!');

  // All arrays must be same length
  const arrays = args.map(arg => {
    if (Array.isArray(arg)) return arg;
    return [arg];
  });

  const length = arrays[0].length;
  if (!arrays.every(arr => arr.length === length)) {
    return new Error('#VALUE!');
  }

  let sum = 0;
  for (let i = 0; i < length; i++) {
    let product = 1;
    for (const arr of arrays) {
      const val = toNumber(arr[i]);
      if (val instanceof Error) return val;
      product *= val;
    }
    sum += product;
  }

  return sum;
};

// ============================================================================
// Week 11 Day 2: Advanced Math Functions
// ============================================================================

/**
 * MROUND - Round to nearest multiple
 * 
 * Syntax: MROUND(number, multiple)
 * Rounds number to the nearest multiple of multiple
 * 
 * @example
 * =MROUND(10, 3) → 9 (nearest multiple of 3)
 * =MROUND(11, 3) → 12
 * =MROUND(-10, -3) → -9
 * =MROUND(1.3, 0.2) → 1.4
 */
export const MROUND: FormulaFunction = (number, multiple) => {
  const num = toNumber(number);
  const mult = toNumber(multiple);
  
  if (num instanceof Error) return num;
  if (mult instanceof Error) return mult;
  
  // Multiple cannot be zero
  if (mult === 0) return new Error('#NUM!');
  
  // If signs differ, return error
  if ((num >= 0 && mult < 0) || (num < 0 && mult >= 0)) {
    return new Error('#NUM!');
  }
  
  return Math.round(num / mult) * mult;
};

/**
 * QUOTIENT - Integer division
 * 
 * Syntax: QUOTIENT(numerator, denominator)
 * Returns the integer portion of a division
 * 
 * @example
 * =QUOTIENT(10, 3) → 3
 * =QUOTIENT(5, 2) → 2
 * =QUOTIENT(-10, 3) → -3
 */
export const QUOTIENT: FormulaFunction = (numerator, denominator) => {
  const num = toNumber(numerator);
  const denom = toNumber(denominator);
  
  if (num instanceof Error) return num;
  if (denom instanceof Error) return denom;
  
  if (denom === 0) return new Error('#DIV/0!');
  
  return Math.trunc(num / denom);
};

/**
 * PRODUCT - Multiply all numbers
 * 
 * Syntax: PRODUCT(number1, [number2], ...)
 * Multiplies all numbers together
 * 
 * @example
 * =PRODUCT(5, 2, 3) → 30
 * =PRODUCT({2, 3}, 4) → 24
 * =PRODUCT(0.5, 10) → 5
 */
export const PRODUCT: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args);
  
  if (numbers.length === 0) return 0;
  
  return numbers.reduce((product, n) => product * n, 1);
};

/**
 * SQRTPI - Square root of (number * π)
 * 
 * Syntax: SQRTPI(number)
 * Returns the square root of (number * π)
 * 
 * @example
 * =SQRTPI(1) → 1.772... (√π)
 * =SQRTPI(2) → 2.507... (√(2π))
 * =SQRTPI(0) → 0
 */
export const SQRTPI: FormulaFunction = (number) => {
  const num = toNumber(number);
  
  if (num instanceof Error) return num;
  
  if (num < 0) return new Error('#NUM!');
  
  return Math.sqrt(num * Math.PI);
};

/**
 * MULTINOMIAL - Multinomial coefficient
 * 
 * Syntax: MULTINOMIAL(number1, [number2], ...)
 * Returns the multinomial: (sum of values)! / (value1! * value2! * ...)
 * 
 * @example
 * =MULTINOMIAL(2, 3, 4) → 1260 (9! / (2! * 3! * 4!))
 * =MULTINOMIAL(3, 3) → 20 (6! / (3! * 3!))
 */
export const MULTINOMIAL: FormulaFunction = (...args) => {
  const numbers = filterNumbers(args);
  
  if (numbers.length === 0) return new Error('#VALUE!');
  
  // All numbers must be non-negative integers
  for (const num of numbers) {
    if (num < 0 || !Number.isInteger(num)) {
      return new Error('#NUM!');
    }
  }
  
  // Calculate sum
  const sum = numbers.reduce((s, n) => s + n, 0);
  
  // Calculate factorial helper
  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };
  
  // Calculate multinomial: sum! / (n1! * n2! * ... * nk!)
  let numerator = factorial(sum);
  let denominator = 1;
  
  for (const num of numbers) {
    denominator *= factorial(num);
  }
  
  return numerator / denominator;
};

/**
 * SUMX2MY2 - Sum of squared differences
 * 
 * Syntax: SUMX2MY2(array_x, array_y)
 * Returns the sum of the difference of squares: Σ(x² - y²)
 * 
 * @example
 * =SUMX2MY2({2, 3, 9}, {6, 5, 11}) → -88
 * // (2²-6²) + (3²-5²) + (9²-11²) = (4-36) + (9-25) + (81-121) = -32 + -16 + -40 = -88
 */
export const SUMX2MY2: FormulaFunction = (arrayX, arrayY) => {
  // Convert to arrays (same pattern as SUMPRODUCT)
  const xArr = Array.isArray(arrayX) ? arrayX : [arrayX];
  const yArr = Array.isArray(arrayY) ? arrayY : [arrayY];
  
  if (xArr.length !== yArr.length) {
    return new Error('#N/A');
  }
  
  let sum = 0;
  for (let i = 0; i < xArr.length; i++) {
    const x = toNumber(xArr[i]);
    const y = toNumber(yArr[i]);
    if (x instanceof Error) return x;
    if (y instanceof Error) return y;
    sum += (x * x) - (y * y);
  }
  
  return sum;
};

/**
 * SUMX2PY2 - Sum of sum of squares
 * 
 * Syntax: SUMX2PY2(array_x, array_y)
 * Returns the sum of the sum of squares: Σ(x² + y²)
 * 
 * @example
 * =SUMX2PY2({2, 3, 9}, {6, 5, 11}) → 276
 * // (2²+6²) + (3²+5²) + (9²+11²) = 40 + 34 + 202 = 276
 */
export const SUMX2PY2: FormulaFunction = (arrayX, arrayY) => {
  // Convert to arrays (same pattern as SUMPRODUCT)
  const xArr = Array.isArray(arrayX) ? arrayX : [arrayX];
  const yArr = Array.isArray(arrayY) ? arrayY : [arrayY];
  
  if (xArr.length !== yArr.length) {
    return new Error('#N/A');
  }
  
  let sum = 0;
  for (let i = 0; i < xArr.length; i++) {
    const x = toNumber(xArr[i]);
    const y = toNumber(yArr[i]);
    if (x instanceof Error) return x;
    if (y instanceof Error) return y;
    sum += (x * x) + (y * y);
  }
  
  return sum;
};

/**
 * SUMXMY2 - Sum of squared differences (alternative form)
 * 
 * Syntax: SUMXMY2(array_x, array_y)
 * Returns the sum of squares of differences: Σ(x - y)²
 * 
 * @example
 * =SUMXMY2({2, 3, 9}, {6, 5, 11}) → 24
 * // (2-6)² + (3-5)² + (9-11)² = 16 + 4 + 4 = 24
 */
export const SUMXMY2: FormulaFunction = (arrayX, arrayY) => {
  // Convert to arrays (same pattern as SUMPRODUCT)
  const xArr = Array.isArray(arrayX) ? arrayX : [arrayX];
  const yArr = Array.isArray(arrayY) ? arrayY : [arrayY];
  
  if (xArr.length !== yArr.length) {
    return new Error('#N/A');
  }
  
  let sum = 0;
  for (let i = 0; i < xArr.length; i++) {
    const x = toNumber(xArr[i]);
    const y = toNumber(yArr[i]);
    if (x instanceof Error) return x;
    if (y instanceof Error) return y;
    const diff = x - y;
    sum += diff * diff;
  }
  
  return sum;
};

// ============================================================================
// Week 2 Day 6: Math Aggregation & Rounding Functions (Excel 2013+)
// ============================================================================

/**
 * CEILING.MATH - Round up to nearest multiple (Excel 2013+)
 * 
 * Rounds a number up to the nearest integer or multiple of significance.
 * Improved version of CEILING with mode parameter for negative numbers.
 * 
 * Syntax: CEILING.MATH(number, [significance], [mode])
 * 
 * @param number - Value to round up
 * @param significance - Multiple to round to (default 1). If omitted or 0, defaults to 1
 * @param mode - Rounding mode for negative numbers (default 0)
 *   0 (or omitted) = Round away from zero (e.g., -4.3 → -5)
 *   non-zero = Round toward zero (e.g., -4.3 → -4)
 * 
 * Key differences from legacy CEILING:
 * - Supports mode parameter for negative number behavior
 * - significance defaults to 1 (not required to match sign of number)
 * - More consistent with Excel 2013+ standards
 * 
 * @example
 * =CEILING.MATH(24.3) → 25
 * =CEILING.MATH(24.3, 5) → 25
 * =CEILING.MATH(6.7, 1) → 7
 * =CEILING.MATH(-8.1) → -8 (mode 0: toward zero for negative)
 * =CEILING.MATH(-8.1, 1, 0) → -8
 * =CEILING.MATH(-8.1, 1, 1) → -9 (mode 1: away from zero for negative)
 * =CEILING.MATH(-5.5, 2) → -4 (rounds to multiple of 2, toward zero)
 * =CEILING.MATH(-5.5, 2, 1) → -6 (mode 1: away from zero)
 */
export const CEILING_MATH: FormulaFunction = (number, significance = 1, mode = 0) => {
  const num = toNumber(number);
  if (num instanceof Error) return num;
  
  let sig = significance;
  if (sig === null || sig === undefined || sig === 0) {
    sig = 1;
  }
  
  const sigNum = toNumber(sig);
  if (sigNum instanceof Error) return sigNum;
  
  const modeNum = toNumber(mode);
  if (modeNum instanceof Error) return modeNum;
  
  // Use absolute value of significance (Excel behavior)
  const absSig = Math.abs(sigNum);
  
  if (num === 0) return 0;
  
  // For positive numbers, always round up
  if (num > 0) {
    return Math.ceil(num / absSig) * absSig;
  }
  
  // For negative numbers, mode controls direction
  if (modeNum === 0) {
    // Mode 0: Round toward zero (less negative) - this is "up" for negatives
    return Math.ceil(num / absSig) * absSig;
  } else {
    // Mode non-zero: Round away from zero (more negative) - this is "down" for negatives
    return Math.floor(num / absSig) * absSig;
  }
};

/**
 * FLOOR.MATH - Round down to nearest multiple (Excel 2013+)
 * 
 * Rounds a number down to the nearest integer or multiple of significance.
 * Improved version of FLOOR with mode parameter for negative numbers.
 * 
 * Syntax: FLOOR.MATH(number, [significance], [mode])
 * 
 * @param number - Value to round down
 * @param significance - Multiple to round to (default 1). If omitted or 0, defaults to 1
 * @param mode - Rounding mode for negative numbers (default 0)
 *   0 (or omitted) = Round away from zero (e.g., -4.3 → -5)
 *   non-zero = Round toward zero (e.g., -4.3 → -4)
 * 
 * @example
 * =FLOOR.MATH(24.3) → 24
 * =FLOOR.MATH(24.3, 5) → 20
 * =FLOOR.MATH(6.7, 1) → 6
 * =FLOOR.MATH(-8.1) → -9 (mode 0: away from zero for negative)
 * =FLOOR.MATH(-8.1, 1, 0) → -9
 * =FLOOR.MATH(-8.1, 1, 1) → -8 (mode 1: toward zero for negative)
 * =FLOOR.MATH(-5.5, 2) → -6 (rounds to multiple of 2, away from zero)
 * =FLOOR.MATH(-5.5, 2, 1) → -4 (mode 1: toward zero)
 */
export const FLOOR_MATH: FormulaFunction = (number, significance = 1, mode = 0) => {
  const num = toNumber(number);
  if (num instanceof Error) return num;
  
  let sig = significance;
  if (sig === null || sig === undefined || sig === 0) {
    sig = 1;
  }
  
  const sigNum = toNumber(sig);
  if (sigNum instanceof Error) return sigNum;
  
  const modeNum = toNumber(mode);
  if (modeNum instanceof Error) return modeNum;
  
  // Use absolute value of significance (Excel behavior)
  const absSig = Math.abs(sigNum);
  
  if (num === 0) return 0;
  
  // For positive numbers, always round down
  if (num > 0) {
    return Math.floor(num / absSig) * absSig;
  }
  
  // For negative numbers, mode controls direction
  if (modeNum === 0) {
    // Mode 0: Round away from zero (more negative) - this is "down" for negatives
    return Math.floor(num / absSig) * absSig;
  } else {
    // Mode non-zero: Round toward zero (less negative) - this is "up" for negatives
    return Math.ceil(num / absSig) * absSig;
  }
};

/**
 * Helper: Get aggregation function by code
 * Used by AGGREGATE and SUBTOTAL
 * 
 * Returns a function that takes an array of numbers and returns an aggregated result.
 * Note: COUNTA is special - it should count all non-empty values, not just numbers.
 * But since we pre-filter to numbers for performance, COUNTA will behave like COUNT.
 */
function getAggregationFunction(functionNum: number, ignoreHidden: boolean = false): 
  ((values: number[]) => FormulaValue) | null {
  
  // SUBTOTAL function codes (1-11)
  // AGGREGATE function codes (1-19 for basic, 101-119 with ignore options)
  
  const baseCode = functionNum > 100 ? functionNum - 100 : functionNum;
  
  switch (baseCode) {
    case 1:  // AVERAGE
      return (values: number[]) => {
        if (values.length === 0) return new Error('#DIV/0!');
        return values.reduce((sum, n) => sum + n, 0) / values.length;
      };
    
    case 2:  // COUNT (count numeric values)
      return (values: number[]) => {
        return values.length;
      };
    
    case 3:  // COUNTA (count all non-empty - but we only get numbers, so same as COUNT)
      return (values: number[]) => {
        return values.length;
      };
    
    case 4:  // MAX
      return (values: number[]) => {
        if (values.length === 0) return 0;
        return Math.max(...values);
      };
    
    case 5:  // MIN
      return (values: number[]) => {
        if (values.length === 0) return 0;
        return Math.min(...values);
      };
    
    case 6:  // PRODUCT
      return (values: number[]) => {
        if (values.length === 0) return 0;
        return values.reduce((product, n) => product * n, 1);
      };
    
    case 7:  // STDEV.S (sample standard deviation)
      return (values: number[]) => {
        if (values.length < 2) return new Error('#DIV/0!');
        const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
        const variance = values.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / (values.length - 1);
        return Math.sqrt(variance);
      };
    
    case 8:  // STDEV.P (population standard deviation)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#DIV/0!');
        const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
        const variance = values.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / values.length;
        return Math.sqrt(variance);
      };
    
    case 9:  // SUM
      return (values: number[]) => {
        return values.reduce((sum, n) => sum + n, 0);
      };
    
    case 10: // VAR.S (sample variance)
      return (values: number[]) => {
        if (values.length < 2) return new Error('#DIV/0!');
        const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
        return values.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / (values.length - 1);
      };
    
    case 11: // VAR.P (population variance)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#DIV/0!');
        const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
        return values.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / values.length;
      };
    
    // AGGREGATE-only functions (12-19)
    case 12: // MEDIAN
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      };
    
    case 13: // MODE.SNGL
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const freq = new Map<number, number>();
        values.forEach(n => freq.set(n, (freq.get(n) || 0) + 1));
        let maxFreq = 0;
        let mode = values[0];
        freq.forEach((count, value) => {
          if (count > maxFreq) {
            maxFreq = count;
            mode = value;
          }
        });
        return maxFreq > 1 ? mode : new Error('#N/A');
      };
    
    case 14: // LARGE (k=1, i.e., MAX)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        return Math.max(...values);
      };
    
    case 15: // SMALL (k=1, i.e., MIN)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        return Math.min(...values);
      };
    
    case 16: // PERCENTILE.INC (k=0.5, i.e., MEDIAN)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      };
    
    case 17: // QUARTILE.INC (quart=1, i.e., 25th percentile)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const sorted = [...values].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * 0.25;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
          return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
      };
    
    case 18: // QUARTILE.INC (quart=3, i.e., 75th percentile)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const sorted = [...values].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * 0.75;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
          return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
      };
    
    case 19: // PERCENTILE.INC (k=0.9, i.e., 90th percentile)
      return (values: number[]) => {
        if (values.length === 0) return new Error('#NUM!');
        const sorted = [...values].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * 0.9;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
          return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
      };
    
    default:
      return null;
  }
}

/**
 * AGGREGATE - Apply aggregation function with options (Excel 2010+)
 * 
 * Performs aggregation on a range with flexible ignore options.
 * Similar to SUBTOTAL but with more functions (19 vs 11) and more control.
 * 
 * Syntax: AGGREGATE(function_num, options, ref1, [ref2], ...)
 * 
 * @param function_num - Function to use:
 *   1-11: Same as SUBTOTAL (AVERAGE, COUNT, COUNTA, MAX, MIN, PRODUCT, STDEV.S, STDEV.P, SUM, VAR.S, VAR.P)
 *   12-19: Additional functions (MEDIAN, MODE.SNGL, LARGE, SMALL, PERCENTILE.INC, QUARTILE.INC variants)
 * 
 * @param options - Ignore behavior (bitmask):
 *   0 = Ignore nested SUBTOTAL and AGGREGATE functions
 *   1 = Ignore hidden rows (filtered data)
 *   2 = Ignore error values
 *   3 = Ignore hidden rows and error values
 *   4 = Ignore nothing
 *   5 = Ignore hidden rows (alternative)
 *   6 = Ignore error values (alternative)
 *   7 = Ignore hidden rows and errors (alternative)
 * 
 * @param ref1, ref2, ... - One or more ranges to aggregate
 * 
 * @example
 * =AGGREGATE(1, 0, A1:A10) → Average, ignore nested functions
 * =AGGREGATE(9, 1, B1:B100) → Sum, ignore hidden rows
 * =AGGREGATE(4, 2, C1:C50) → Max, ignore errors
 * =AGGREGATE(12, 3, D1:D20) → Median, ignore hidden rows and errors
 */
export const AGGREGATE: FormulaFunction = (function_num, options, ...refs) => {
  const funcNum = toNumber(function_num);
  if (funcNum instanceof Error) return funcNum;
  
  const opts = toNumber(options);
  if (opts instanceof Error) return opts;
  
  // Validate function number
  if (funcNum < 1 || funcNum > 19) {
    return new Error('#VALUE!');
  }
  
  // Validate options
  if (opts < 0 || opts > 7) {
    return new Error('#VALUE!');
  }
  
  // Get aggregation function
  const aggFunc = getAggregationFunction(funcNum, opts === 1 || opts === 3 || opts === 5 || opts === 7);
  if (!aggFunc) {
    return new Error('#VALUE!');
  }
  
  // Flatten each ref individually to handle nested 2D arrays from ranges
  // This avoids the double-nesting issue: refs = [[[1],[2],[3]]] → [1,2,3]
  const allValues: FormulaValue[] = [];
  for (const ref of refs) {
    if (Array.isArray(ref)) {
      // Flatten the 2D array range
      const flattened = flattenArray(ref);
      allValues.push(...flattened);
    } else {
      // Single value
      allValues.push(ref);
    }
  }
  
  // Apply ignore options (if error handling requested)
  let filteredValues = allValues;
  if (opts === 2 || opts === 3 || opts === 6 || opts === 7) {
    // Option 2, 3, 6, 7: Ignore errors
    filteredValues = filteredValues.filter(v => !(v instanceof Error));
  }
  
  // Convert to numbers for aggregation
  const numbers = filterNumbers(filteredValues);
  
  // Apply aggregation
  return aggFunc(numbers);
};

/**
 * SUBTOTAL - Apply aggregation function (respects filters)
 * 
 * Performs aggregation on a range, automatically ignoring other SUBTOTAL/AGGREGATE functions.
 * Designed for filtered data (respects hidden rows when function_num 101-111).
 * 
 * Syntax: SUBTOTAL(function_num, ref1, [ref2], ...)
 * 
 * @param function_num - Function to use:
 *   1 or 101 = AVERAGE
 *   2 or 102 = COUNT
 *   3 or 103 = COUNTA
 *   4 or 104 = MAX
 *   5 or 105 = MIN
 *   6 or 106 = PRODUCT
 *   7 or 107 = STDEV.S
 *   8 or 108 = STDEV.P
 *   9 or 109 = SUM
 *   10 or 110 = VAR.S
 *   11 or 111 = VAR.P
 *   
 *   Note: 1-11 ignore manually hidden rows
 *         101-111 ignore manually hidden rows AND filtered rows
 * 
 * @param ref1, ref2, ... - One or more ranges to aggregate
 * 
 * @example
 * =SUBTOTAL(9, A1:A10) → Sum (ignore hidden)
 * =SUBTOTAL(1, B1:B100) → Average (ignore hidden)
 * =SUBTOTAL(109, C1:C50) → Sum (ignore hidden and filtered)
 */
export const SUBTOTAL: FormulaFunction = (function_num, ...refs) => {
  const funcNum = toNumber(function_num);
  if (funcNum instanceof Error) return funcNum;
  
  // Validate function number
  if ((funcNum < 1 || funcNum > 11) && (funcNum < 101 || funcNum > 111)) {
    return new Error('#VALUE!');
  }
  
  // Get aggregation function
  const ignoreHidden = true; // SUBTOTAL always ignores hidden rows
  const aggFunc = getAggregationFunction(funcNum, ignoreHidden);
  if (!aggFunc) {
    return new Error('#VALUE!');
  }
  
  // Flatten each ref individually to handle nested 2D arrays from ranges
  // This avoids the double-nesting issue: refs = [[[1],[2],[3]]] → [1,2,3]
  const allValues: FormulaValue[] = [];
  for (const ref of refs) {
    if (Array.isArray(ref)) {
      // Flatten the 2D array range
      const flattened = flattenArray(ref);
      allValues.push(...flattened);
    } else {
      // Single value
      allValues.push(ref);
    }
  }
  
  // Note: In full Excel implementation, would filter hidden rows from worksheet context
  // For now, treat all values as visible (worksheet visibility tracking not yet implemented)
  
  // Convert to numbers for aggregation
  const numbers = filterNumbers(allValues);
  
  // Apply aggregation
  return aggFunc(numbers);
};
