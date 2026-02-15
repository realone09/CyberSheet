/**
 * Financial Functions for Cyber Sheet Excel
 * Week 8 Days 4-5 Implementation
 * 
 * Implements Excel-compatible financial functions for:
 * - Time value of money (PV, FV, PMT, NPER, RATE)
 * - Loan calculations (IPMT, PPMT)
 * - Investment analysis (NPV, IRR, XNPV, XIRR)
 * - Interest rate conversions (EFFECT, NOMINAL)
 */

import { FormulaFunction, FormulaValue } from '../../types/formula-types';
import { filterNumbers, flattenArray } from '../../utils/array-utils';
import { toNumber } from '../../utils/type-utils';

/**
 * NPV - Net Present Value
 * Calculates the net present value of an investment based on a discount rate
 * and a series of future cash flows (periodic payments).
 * 
 * Formula: NPV = Σ(value_i / (1 + rate)^i) where i starts from 1
 * 
 * @param rate - The discount rate per period
 * @param values - Series of cash flows (can be positive or negative)
 * @returns Net present value
 * 
 * @example
 * =NPV(10%, 300, 400, 500) → 1000.51
 * =NPV(8%, -1000, 300, 300, 300, 300) → NPV starting at period 1
 */
export const NPV: FormulaFunction = (rate, ...values) => {
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  // Excel returns #NUM! for negative rates
  if (rateNum < 0) {
    return new Error('#NUM!');
  }
  
  // Flatten all value arguments and filter to numbers
  const cashFlows = filterNumbers(flattenArray(values));
  
  if (cashFlows.length === 0) {
    return new Error('#NUM!');
  }
  
  let npv = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    // Cash flows start at period 1 (not period 0)
    npv += cashFlows[i] / Math.pow(1 + rateNum, i + 1);
  }
  
  return npv;
};

/**
 * XNPV - Net Present Value with irregular dates
 * Calculates NPV for cash flows that occur at irregular intervals.
 * 
 * @param rate - The discount rate per year
 * @param values - Series of cash flows
 * @param dates - Dates corresponding to each cash flow
 * @returns Net present value with irregular dates
 * 
 * @example
 * =XNPV(10%, {-1000, 300, 400}, {"2024-01-01", "2024-06-15", "2024-12-31"})
 */
export const XNPV: FormulaFunction = (rate, values, dates) => {
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  // Excel returns #NUM! for negative rates
  if (rateNum < 0) {
    return new Error('#NUM!');
  }
  
  const cashFlows = filterNumbers(Array.isArray(values) ? values : [values]);
  const dateArray = flattenArray(Array.isArray(dates) ? dates : [dates]);
  
  if (cashFlows.length === 0 || dateArray.length === 0) {
    return new Error('#NUM!');
  }
  
  if (cashFlows.length !== dateArray.length) {
    return new Error('#NUM!');
  }
  
  // Convert dates to Date objects or Excel serial numbers
  const dateValues: number[] = [];
  for (let i = 0; i < dateArray.length; i++) {
    const dateVal = dateArray[i];
    
    if (typeof dateVal === 'number') {
      dateValues.push(dateVal);
    } else if (typeof dateVal === 'string') {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) {
        return new Error('#VALUE!');
      }
      // Convert to days since epoch (Excel uses days since 1900-01-01)
      dateValues.push(date.getTime() / (1000 * 60 * 60 * 24));
    } else if (dateVal instanceof Date) {
      dateValues.push(dateVal.getTime() / (1000 * 60 * 60 * 24));
    } else {
      return new Error('#VALUE!');
    }
  }
  
  // First date is the reference date (period 0)
  const firstDate = dateValues[0];
  let xnpv = 0;
  
  for (let i = 0; i < cashFlows.length; i++) {
    const daysDiff = dateValues[i] - firstDate;
    // Excel uses 365 days per year for XNPV (not 365.25)
    const yearsDiff = daysDiff / 365;
    xnpv += cashFlows[i] / Math.pow(1 + rateNum, yearsDiff);
  }
  
  return xnpv;
};

/**
 * PV - Present Value
 * Calculates the present value of an investment or loan based on constant
 * periodic payments and a constant interest rate.
 * 
 * Formula: PV = PMT × [(1 - (1 + rate)^(-nper)) / rate] + FV / (1 + rate)^nper
 * 
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pmt - Payment made each period (negative for payments you make)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Present value
 * 
 * @example
 * =PV(5%/12, 60, -200, 0, 0) → Present value of $200/month loan at 5% for 5 years
 */
export const PV: FormulaFunction = (rate, nper, pmt, fv = 0, type = 0) => {
  const rateNum = toNumber(rate);
  const nperNum = toNumber(nper);
  const pmtNum = toNumber(pmt);
  const fvNum = toNumber(fv);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (nperNum instanceof Error) return nperNum;
  if (pmtNum instanceof Error) return pmtNum;
  if (fvNum instanceof Error) return fvNum;
  if (typeNum instanceof Error) return typeNum;
  
  if (nperNum < 0) {
    return new Error('#NUM!');
  }
  
  // Special case: rate = 0
  if (rateNum === 0) {
    return -(pmtNum * nperNum + fvNum);
  }
  
  // Standard PV formula
  const pvifа = (1 - Math.pow(1 + rateNum, -nperNum)) / rateNum;
  const pvif = Math.pow(1 + rateNum, -nperNum);
  
  let pv = -(pmtNum * pvifа + fvNum * pvif);
  
  // Adjust for payment at beginning of period
  if (typeNum === 1) {
    pv = pv * (1 + rateNum);
  }
  
  return pv;
};

/**
 * FV - Future Value
 * Calculates the future value of an investment based on periodic constant
 * payments and a constant interest rate.
 * 
 * Formula: FV = PMT × [((1 + rate)^nper - 1) / rate] + PV × (1 + rate)^nper
 * 
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pmt - Payment made each period (negative for payments you make)
 * @param pv - Present value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Future value
 * 
 * @example
 * =FV(6%/12, 120, -100, 0, 0) → Future value of $100/month at 6% for 10 years
 */
export const FV: FormulaFunction = (rate, nper, pmt, pv = 0, type = 0) => {
  const rateNum = toNumber(rate);
  const nperNum = toNumber(nper);
  const pmtNum = toNumber(pmt);
  const pvNum = toNumber(pv);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (nperNum instanceof Error) return nperNum;
  if (pmtNum instanceof Error) return pmtNum;
  if (pvNum instanceof Error) return pvNum;
  if (typeNum instanceof Error) return typeNum;
  
  if (nperNum < 0) {
    return new Error('#NUM!');
  }
  
  // Special case: rate = 0
  if (rateNum === 0) {
    return -(pvNum + pmtNum * nperNum);
  }
  
  // Standard FV formula
  const fvifа = ((Math.pow(1 + rateNum, nperNum) - 1) / rateNum);
  const fvif = Math.pow(1 + rateNum, nperNum);
  
  let fv = -(pmtNum * fvifа + pvNum * fvif);
  
  // Adjust for payment at beginning of period
  if (typeNum === 1) {
    fv = fv * (1 + rateNum);
  }
  
  return fv;
};

/**
 * PMT - Payment
 * Calculates the periodic payment for a loan based on constant payments
 * and a constant interest rate.
 * 
 * Formula: PMT = (rate × PV) / (1 - (1 + rate)^(-nper)) + FV × rate / ((1 + rate)^nper - 1)
 * 
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Payment amount per period
 * 
 * @example
 * =PMT(4%/12, 360, 200000) → Monthly payment on $200k loan at 4% for 30 years
 */
export const PMT: FormulaFunction = (rate, nper, pv, fv = 0, type = 0) => {
  const rateNum = toNumber(rate);
  const nperNum = toNumber(nper);
  const pvNum = toNumber(pv);
  const fvNum = toNumber(fv);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (nperNum instanceof Error) return nperNum;
  if (pvNum instanceof Error) return pvNum;
  if (fvNum instanceof Error) return fvNum;
  if (typeNum instanceof Error) return typeNum;
  
  if (nperNum < 0) {
    return new Error('#NUM!');
  }
  
  // Special case: rate = 0
  if (rateNum === 0) {
    return -(pvNum + fvNum) / nperNum;
  }
  
  // Standard PMT formula
  const pvifа = (1 - Math.pow(1 + rateNum, -nperNum)) / rateNum;
  const fvif = Math.pow(1 + rateNum, -nperNum);
  
  let pmt = -(pvNum + fvNum * fvif) / pvifа;
  
  // Adjust for payment at beginning of period
  if (typeNum === 1) {
    pmt = pmt / (1 + rateNum);
  }
  
  return pmt;
};

/**
 * IPMT - Interest Payment
 * Calculates the interest portion of a payment for a specific period.
 * 
 * @param rate - Interest rate per period
 * @param per - Period for which you want to find the interest (1 to nper)
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Interest payment for the specified period
 * 
 * @example
 * =IPMT(4%/12, 1, 360, 200000) → Interest portion of first payment
 */
export const IPMT: FormulaFunction = (rate, per, nper, pv, fv = 0, type = 0) => {
  const rateNum = toNumber(rate);
  const perNum = toNumber(per);
  const nperNum = toNumber(nper);
  const pvNum = toNumber(pv);
  const fvNum = toNumber(fv);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (perNum instanceof Error) return perNum;
  if (nperNum instanceof Error) return nperNum;
  if (pvNum instanceof Error) return pvNum;
  if (fvNum instanceof Error) return fvNum;
  if (typeNum instanceof Error) return typeNum;
  
  if (perNum < 1 || perNum > nperNum) {
    return new Error('#NUM!');
  }
  
  // Calculate payment amount
  const pmt = PMT(rateNum, nperNum, pvNum, fvNum, typeNum);
  if (pmt instanceof Error) return pmt;
  
  // If payment at beginning and this is first period, interest is 0
  if (typeNum === 1 && perNum === 1) {
    return 0;
  }
  
  // Calculate remaining principal at start of period using PV of remaining payments
  // The remaining balance is the present value of the remaining (nper - per + 1) payments
  const remainingPeriods = nperNum - perNum + 1;
  
  let remainingBalance: number;
  if (rateNum === 0) {
    remainingBalance = (pmt as number) * remainingPeriods;
  } else {
    const pvifa = (1 - Math.pow(1 + rateNum, -remainingPeriods)) / rateNum;
    remainingBalance = -(pmt as number) * pvifa;
  }
  
  // Interest for this period is the remaining balance times the rate
  const ipmt = -(remainingBalance * rateNum);
  
  return ipmt;
};

/**
 * PPMT - Principal Payment
 * Calculates the principal portion of a payment for a specific period.
 * 
 * @param rate - Interest rate per period
 * @param per - Period for which you want to find the principal (1 to nper)
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Principal payment for the specified period
 * 
 * @example
 * =PPMT(4%/12, 1, 360, 200000) → Principal portion of first payment
 */
export const PPMT: FormulaFunction = (rate, per, nper, pv, fv = 0, type = 0) => {
  const pmt = PMT(rate, nper, pv, fv, type);
  if (pmt instanceof Error) return pmt;
  
  const ipmt = IPMT(rate, per, nper, pv, fv, type);
  if (ipmt instanceof Error) return ipmt;
  
  return (pmt as number) - (ipmt as number);
};

/**
 * IRR - Internal Rate of Return
 * Calculates the internal rate of return for a series of cash flows.
 * Uses Newton-Raphson method for iterative approximation.
 * 
 * Formula: Find r where NPV = 0 = Σ(CF_i / (1+r)^i)
 * 
 * @param values - Array of cash flows (must include at least one negative and one positive)
 * @param guess - Initial guess for the rate (default 0.1 = 10%)
 * @returns Internal rate of return
 * 
 * @example
 * =IRR({-1000, 300, 400, 500}) → ~0.16 (16%)
 * =IRR({-70000, 12000, 15000, 18000, 21000, 26000}) → ~0.086 (8.6%)
 */
export const IRR: FormulaFunction = (values, guess = 0.1) => {
  const guessNum = typeof guess === 'number' ? guess : toNumber(guess);
  if (guessNum instanceof Error) return guessNum;
  
  const cashFlows = filterNumbers(flattenArray(Array.isArray(values) ? values : [values]));
  
  if (cashFlows.length < 2) {
    return new Error('#NUM!');
  }
  
  // Check for at least one positive and one negative value
  const hasPositive = cashFlows.some(v => v > 0);
  const hasNegative = cashFlows.some(v => v < 0);
  if (!hasPositive || !hasNegative) {
    return new Error('#NUM!');
  }
  
  // Newton-Raphson iteration
  let rate = guessNum;
  const maxIterations = 100;
  const tolerance = 1e-7;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let npv = 0;
    let dnpv = 0; // Derivative of NPV
    
    for (let i = 0; i < cashFlows.length; i++) {
      const power = i; // IRR uses period 0 for first cash flow
      const denominator = Math.pow(1 + rate, power);
      
      // NPV calculation: CF_0/(1+r)^0 + CF_1/(1+r)^1 + ...
      npv += cashFlows[i] / denominator;
      
      // Derivative: d/dr[CF/(1+r)^i] = -i*CF/(1+r)^(i+1)
      if (power > 0) {
        dnpv -= power * cashFlows[i] / Math.pow(1 + rate, power + 1);
      }
    }
    
    // Check convergence
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    // Newton-Raphson step: r_new = r_old - f(r)/f'(r)
    if (Math.abs(dnpv) < 1e-10) {
      // Derivative too small, can't continue
      return new Error('#NUM!');
    }
    
    rate = rate - npv / dnpv;
    
    // Check for divergence
    if (!isFinite(rate) || rate < -0.99999) {
      return new Error('#NUM!');
    }
  }
  
  // Did not converge
  return new Error('#NUM!');
};

/**
 * XIRR - Internal Rate of Return for Irregular Cash Flows
 * Calculates IRR for a series of cash flows with irregular dates.
 * Uses modified Newton-Raphson method.
 * 
 * @param values - Array of cash flows
 * @param dates - Corresponding dates for each cash flow
 * @param guess - Initial guess for the rate (default 0.1)
 * @returns Internal rate of return (annualized)
 * 
 * @example
 * =XIRR({-1000, 300, 400, 500}, {date1, date2, date3, date4})
 */
export const XIRR: FormulaFunction = (values, dates, guess = 0.1) => {
  const guessNum = typeof guess === 'number' ? guess : toNumber(guess);
  if (guessNum instanceof Error) return guessNum;
  
  const cashFlows = filterNumbers(Array.isArray(values) ? values : [values]);
  const dateArray = flattenArray(Array.isArray(dates) ? dates : [dates]);
  
  if (cashFlows.length < 2 || dateArray.length < 2) {
    return new Error('#NUM!');
  }
  
  if (cashFlows.length !== dateArray.length) {
    return new Error('#NUM!');
  }
  
  // Check for at least one positive and one negative value
  const hasPositive = cashFlows.some(v => v > 0);
  const hasNegative = cashFlows.some(v => v < 0);
  if (!hasPositive || !hasNegative) {
    return new Error('#NUM!');
  }
  
  // Convert dates to numbers (days)
  const dateValues: number[] = [];
  for (let i = 0; i < dateArray.length; i++) {
    const dateVal = dateArray[i];
    
    if (typeof dateVal === 'number') {
      dateValues.push(dateVal);
    } else if (typeof dateVal === 'string') {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) {
        return new Error('#VALUE!');
      }
      dateValues.push(date.getTime() / (1000 * 60 * 60 * 24));
    } else if (dateVal instanceof Date) {
      dateValues.push(dateVal.getTime() / (1000 * 60 * 60 * 24));
    } else {
      return new Error('#VALUE!');
    }
  }
  
  // First date is reference (t=0)
  const firstDate = dateValues[0];
  
  // Newton-Raphson iteration
  let rate = guessNum;
  const maxIterations = 100;
  const tolerance = 1e-7;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let xnpv = 0;
    let dxnpv = 0; // Derivative
    
    for (let i = 0; i < cashFlows.length; i++) {
      const daysDiff = dateValues[i] - firstDate;
      const yearsDiff = daysDiff / 365;
      
      // XNPV calculation
      const denominator = Math.pow(1 + rate, yearsDiff);
      xnpv += cashFlows[i] / denominator;
      
      // Derivative: d/dr[CF/(1+r)^t] = -t*CF/(1+r)^(t+1)
      dxnpv -= yearsDiff * cashFlows[i] / Math.pow(1 + rate, yearsDiff + 1);
    }
    
    // Check convergence
    if (Math.abs(xnpv) < tolerance) {
      return rate;
    }
    
    // Newton-Raphson step
    if (Math.abs(dxnpv) < 1e-10) {
      return new Error('#NUM!');
    }
    
    rate = rate - xnpv / dxnpv;
    
    // Check for divergence
    if (!isFinite(rate) || rate < -0.99999) {
      return new Error('#NUM!');
    }
  }
  
  // Did not converge
  return new Error('#NUM!');
};

/**
 * NPER - Number of Periods
 * Calculates the number of periods for an investment based on periodic, constant payments
 * and a constant interest rate.
 * 
 * Formula: 
 * - If rate = 0: nper = -(pv + fv) / pmt
 * - If rate ≠ 0: nper = log((pmt * (1 + rate * type) - fv * rate) / (pv * rate + pmt * (1 + rate * type))) / log(1 + rate)
 * 
 * @param rate - Interest rate per period
 * @param pmt - Payment made each period (constant)
 * @param pv - Present value (loan amount or initial investment)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @returns Number of periods
 * 
 * @example
 * =NPER(0.12/12, -100, -1000, 10000) → Number of months to save $10k
 */
export const NPER: FormulaFunction = (rate, pmt, pv, fv = 0, type = 0) => {
  const rateNum = toNumber(rate);
  const pmtNum = toNumber(pmt);
  const pvNum = toNumber(pv);
  const fvNum = toNumber(fv);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (pmtNum instanceof Error) return pmtNum;
  if (pvNum instanceof Error) return pvNum;
  if (fvNum instanceof Error) return fvNum;
  if (typeNum instanceof Error) return typeNum;
  
  // Special case: zero interest rate
  if (rateNum === 0) {
    if (pmtNum === 0) {
      return new Error('#NUM!');
    }
    return -(pvNum + fvNum) / pmtNum;
  }
  
  // Adjust payment for timing
  const pmtAdjusted = pmtNum * (1 + rateNum * typeNum);
  
  // Calculate numerator and denominator
  const numerator = pmtAdjusted - fvNum * rateNum;
  const denominator = pvNum * rateNum + pmtAdjusted;
  
  // Check for invalid inputs - ratio must be positive for log
  if (denominator === 0 || (numerator / denominator) <= 0) {
    return new Error('#NUM!');
  }
  
  const nper = Math.log(numerator / denominator) / Math.log(1 + rateNum);
  
  if (!isFinite(nper) || nper < 0) {
    return new Error('#NUM!');
  }
  
  return nper;
};

/**
 * RATE - Interest Rate
 * Calculates the interest rate per period of an annuity using Newton-Raphson iteration
 * with smart initial guess and bisection fallback for robust convergence.
 * 
 * @param nper - Total number of payment periods
 * @param pmt - Payment made each period (constant)
 * @param pv - Present value (loan amount)
 * @param fv - Future value (default 0)
 * @param type - 0 = payment at end of period, 1 = payment at beginning (default 0)
 * @param guess - Initial guess for rate (default: smart calculation)
 * @returns Interest rate per period
 * 
 * @example
 * =RATE(360, -954.83, 200000) → Monthly rate for 30-year mortgage
 */
export const RATE: FormulaFunction = (nper, pmt, pv, fv = 0, type = 0, guess = null) => {
  const nperNum = toNumber(nper);
  const pmtNum = toNumber(pmt);
  const pvNum = toNumber(pv);
  const fvNum = toNumber(fv);
  const typeNum = toNumber(type);
  let guessNum = guess !== null ? toNumber(guess) : null;
  
  if (nperNum instanceof Error) return nperNum;
  if (pmtNum instanceof Error) return pmtNum;
  if (pvNum instanceof Error) return pvNum;
  if (fvNum instanceof Error) return fvNum;
  if (typeNum instanceof Error) return typeNum;
  if (guessNum instanceof Error) guessNum = null;
  
  if (nperNum <= 0) {
    return new Error('#NUM!');
  }
  
  // Special case: if PV + FV + PMT*nper ≈ 0, rate is 0
  if (Math.abs(pvNum + fvNum + pmtNum * nperNum) < 1e-10) {
    return 0;
  }
  
  // Smart initial guess if not provided
  if (guessNum === null) {
    if (Math.abs(pmtNum) < 1e-10) {
      // No payment case: simple interest formula
      if (Math.abs(pvNum) > 1e-10) {
        guessNum = Math.pow(Math.abs(fvNum / pvNum), 1 / nperNum) - 1;
      } else {
        guessNum = 0.1;
      }
    } else {
      // Estimate based on total payments vs total value change
      const totalPayments = pmtNum * nperNum;
      const totalChange = fvNum - pvNum;
      // Simple approximation: rate ≈ (totalChange / totalPayments) / nper
      guessNum = Math.abs((totalChange - totalPayments) / (pvNum * nperNum));
      // Clamp to reasonable range
      guessNum = Math.max(0.001, Math.min(guessNum, 0.5));
    }
  }
  
  // Helper function to evaluate the equation at a given rate
  const evaluateRate = (r: number): number => {
    if (Math.abs(r) < 1e-10) {
      // Near zero rate, use linear approximation
      return pvNum + pmtNum * nperNum + fvNum;
    } else {
      const term2 = Math.pow(1 + r, -nperNum);
      const pmtAdjusted = pmtNum * (1 + r * typeNum);
      return pvNum + pmtAdjusted * (1 - term2) / r + fvNum * term2;
    }
  };
  
  // Newton-Raphson iteration (primary method)
  let rate = guessNum;
  const maxNewtonIterations = 50;
  const tolerance = 1e-7;
  let lastRate = rate;
  
  for (let i = 0; i < maxNewtonIterations; i++) {
    let f: number;
    let df: number;
    
    if (Math.abs(rate) < 1e-10) {
      // Near zero rate, use linear approximation
      f = pvNum + pmtNum * nperNum + fvNum;
      df = -pmtNum * nperNum * (nperNum + 1) / 2 - fvNum * nperNum;
    } else {
      const term2 = Math.pow(1 + rate, -nperNum);
      const pmtAdjusted = pmtNum * (1 + rate * typeNum);
      
      f = pvNum + pmtAdjusted * (1 - term2) / rate + fvNum * term2;
      
      // Derivative calculation
      const dPVIFA = (nperNum * term2 / (rate * (1 + rate)) - (1 - term2) / (rate * rate));
      df = pmtAdjusted * dPVIFA + pmtNum * typeNum * (1 - term2) / rate - fvNum * nperNum * term2 / (1 + rate);
    }
    
    // Check for convergence
    if (Math.abs(f) < tolerance) {
      return rate;
    }
    
    // Check if derivative is too small
    if (Math.abs(df) < 1e-10) {
      break; // Switch to bisection
    }
    
    const newRate = rate - f / df;
    
    // Check for convergence by rate change
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    // Detect oscillation or divergence
    if (!isFinite(newRate) || newRate < -0.999 || newRate > 10.0) {
      break; // Switch to bisection
    }
    
    // Detect slow convergence (oscillation)
    if (i > 20 && Math.abs(newRate - lastRate) < Math.abs(newRate - rate) * 0.5) {
      break; // Switch to bisection
    }
    
    lastRate = rate;
    rate = newRate;
  }
  
  // Bisection method fallback (guaranteed convergence)
  let low = -0.99;
  let high = 2.0;
  
  // Find bounds where function changes sign
  const fLow = evaluateRate(low);
  const fHigh = evaluateRate(high);
  
  // If same sign, try to expand bounds
  if (fLow * fHigh > 0) {
    // Try different bounds
    low = 0.0001;
    high = 1.0;
    const fLow2 = evaluateRate(low);
    const fHigh2 = evaluateRate(high);
    
    if (fLow2 * fHigh2 > 0) {
      // One more attempt with wider range
      low = -0.5;
      high = 5.0;
      const fLow3 = evaluateRate(low);
      const fHigh3 = evaluateRate(high);
      
      if (fLow3 * fHigh3 > 0) {
        return new Error('#NUM!'); // Cannot find valid bounds
      }
    }
  }
  
  // Bisection iteration
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const fMid = evaluateRate(mid);
    
    if (Math.abs(fMid) < tolerance || Math.abs(high - low) < tolerance) {
      return mid;
    }
    
    const fLowCurrent = evaluateRate(low);
    
    if (fMid * fLowCurrent < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  // Return best estimate from bisection
  return (low + high) / 2;
};

/**
 * EFFECT - Effective Annual Interest Rate
 * Calculates the effective annual interest rate given the nominal rate and
 * number of compounding periods per year.
 * 
 * Formula: effect = (1 + nominal_rate / npery)^npery - 1
 * 
 * @param nominal_rate - Nominal annual interest rate
 * @param npery - Number of compounding periods per year
 * @returns Effective annual interest rate
 * 
 * @example
 * =EFFECT(0.05, 4) → Effective rate for 5% nominal compounded quarterly
 */
export const EFFECT: FormulaFunction = (nominal_rate, npery) => {
  const nominalNum = toNumber(nominal_rate);
  const nperyNum = toNumber(npery);
  
  if (nominalNum instanceof Error) return nominalNum;
  if (nperyNum instanceof Error) return nperyNum;
  
  // Validate inputs
  if (nominalNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (nperyNum < 1) {
    return new Error('#NUM!');
  }
  
  // Truncate npery to integer
  const nperyInt = Math.floor(nperyNum);
  
  // Calculate effective rate
  const effect = Math.pow(1 + nominalNum / nperyInt, nperyInt) - 1;
  
  return effect;
};

/**
 * NOMINAL - Nominal Annual Interest Rate
 * Calculates the nominal annual interest rate given the effective rate and
 * number of compounding periods per year.
 * 
 * Formula: nominal = ((1 + effect_rate)^(1/npery) - 1) * npery
 * 
 * @param effect_rate - Effective annual interest rate
 * @param npery - Number of compounding periods per year
 * @returns Nominal annual interest rate
 * 
 * @example
 * =NOMINAL(0.053543, 4) → Nominal rate for 5.3543% effective rate compounded quarterly
 */
export const NOMINAL: FormulaFunction = (effect_rate, npery) => {
  const effectNum = toNumber(effect_rate);
  const nperyNum = toNumber(npery);
  
  if (effectNum instanceof Error) return effectNum;
  if (nperyNum instanceof Error) return nperyNum;
  
  // Validate inputs
  if (effectNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (nperyNum < 1) {
    return new Error('#NUM!');
  }
  
  // Truncate npery to integer
  const nperyInt = Math.floor(nperyNum);
  
  // Calculate nominal rate
  const nominal = (Math.pow(1 + effectNum, 1 / nperyInt) - 1) * nperyInt;
  
  return nominal;
};

/**
 * MIRR - Modified Internal Rate of Return
 * Calculates the modified internal rate of return for a series of periodic cash flows,
 * considering both the cost of investment and the interest received on reinvestment of cash.
 * 
 * Formula: MIRR = (FV(positive, reinvest_rate) / PV(negative, finance_rate))^(1/n) - 1
 * 
 * @param values - Array of cash flows (must contain at least one positive and one negative)
 * @param finance_rate - Interest rate paid on money used in cash flows
 * @param reinvest_rate - Interest rate received on reinvested cash flows
 * @returns Modified internal rate of return
 * 
 * @example
 * =MIRR({-120000, 39000, 30000, 21000, 37000, 46000}, 0.10, 0.12) → 0.1260 (12.6%)
 */
export const MIRR: FormulaFunction = (values, finance_rate, reinvest_rate) => {
  const financeRate = toNumber(finance_rate);
  const reinvestRate = toNumber(reinvest_rate);
  
  if (financeRate instanceof Error) return financeRate;
  if (reinvestRate instanceof Error) return reinvestRate;
  
  const cashFlows = filterNumbers(Array.isArray(values) ? values : [values]);
  
  if (cashFlows.length < 2) {
    return new Error('#NUM!');
  }
  
  // Check for at least one positive and one negative value
  const hasPositive = cashFlows.some(v => v > 0);
  const hasNegative = cashFlows.some(v => v < 0);
  if (!hasPositive || !hasNegative) {
    return new Error('#NUM!');
  }
  
  const n = cashFlows.length;
  
  // Calculate NPV of negative cash flows (investments) at finance_rate
  let npvNegative = 0;
  for (let i = 0; i < n; i++) {
    if (cashFlows[i] < 0) {
      npvNegative += cashFlows[i] / Math.pow(1 + financeRate, i);
    }
  }
  
  // Calculate FV of positive cash flows (returns) at reinvest_rate
  let fvPositive = 0;
  for (let i = 0; i < n; i++) {
    if (cashFlows[i] > 0) {
      fvPositive += cashFlows[i] * Math.pow(1 + reinvestRate, n - i - 1);
    }
  }
  
  // MIRR formula
  if (npvNegative === 0 || fvPositive === 0) {
    return new Error('#NUM!');
  }
  
  const mirr = Math.pow(-fvPositive / npvNegative, 1 / (n - 1)) - 1;
  
  if (!isFinite(mirr)) {
    return new Error('#NUM!');
  }
  
  return mirr;
};

/**
 * FVSCHEDULE - Future Value with Variable Interest Rates
 * Calculates the future value of an initial principal after applying a series of compound interest rates.
 * 
 * Formula: FV = principal × (1 + rate1) × (1 + rate2) × ... × (1 + rateN)
 * 
 * @param principal - Present value (initial amount)
 * @param schedule - Array of interest rates to apply
 * @returns Future value
 * 
 * @example
 * =FVSCHEDULE(1, {0.09, 0.11, 0.10}) → 1.3308 (33.08% total growth)
 */
export const FVSCHEDULE: FormulaFunction = (principal, schedule) => {
  const principalNum = toNumber(principal);
  if (principalNum instanceof Error) return principalNum;
  
  const scheduleArray = flattenArray(Array.isArray(schedule) ? schedule : [schedule]);
  const rates = filterNumbers(scheduleArray);
  
  if (rates.length === 0) {
    return principalNum; // No rates = no change
  }
  
  let fv = principalNum;
  for (const rate of rates) {
    fv = fv * (1 + rate);
  }
  
  return fv;
};

/**
 * DISC - Discount Rate for a Security
 * Calculates the discount rate for a security (bill, bond, etc.).
 * 
 * Formula: DISC = (redemption - pr) / redemption × (B / DSM)
 * Where B = days in year (basis), DSM = days from settlement to maturity
 * 
 * @param settlement - Security's settlement date (when you buy it)
 * @param maturity - Security's maturity date (when it expires)
 * @param pr - Security's price per $100 face value
 * @param redemption - Security's redemption value per $100 face value
 * @param basis - Day count basis (0=30/360, 1=actual/actual, 2=actual/360, 3=actual/365, 4=30E/360)
 * @returns Annual discount rate
 * 
 * @example
 * =DISC(DATE(2021,1,25), DATE(2021,6,15), 97.975, 100, 1) → 0.0244 (2.44%)
 */
export const DISC: FormulaFunction = (settlement, maturity, pr, redemption, basis = 0) => {
  const settlementNum = toNumber(settlement);
  const maturityNum = toNumber(maturity);
  const prNum = toNumber(pr);
  const redemptionNum = toNumber(redemption);
  const basisNum = toNumber(basis);
  
  if (settlementNum instanceof Error) return settlementNum;
  if (maturityNum instanceof Error) return maturityNum;
  if (prNum instanceof Error) return prNum;
  if (redemptionNum instanceof Error) return redemptionNum;
  if (basisNum instanceof Error) return basisNum;
  
  // Validate inputs
  if (settlementNum >= maturityNum) {
    return new Error('#NUM!');
  }
  
  if (prNum <= 0 || redemptionNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }
  
  const basisInt = Math.floor(basisNum);
  
  // Calculate days between settlement and maturity
  const dsm = maturityNum - settlementNum;
  
  // Days in year based on basis
  let daysInYear: number;
  switch (basisInt) {
    case 0: // 30/360
    case 4: // 30E/360
      daysInYear = 360;
      break;
    case 1: // actual/actual
      // Use actual days in the year containing the maturity date
      daysInYear = 365; // Simplified - Excel uses more complex leap year logic
      break;
    case 2: // actual/360
      daysInYear = 360;
      break;
    case 3: // actual/365
      daysInYear = 365;
      break;
    default:
      daysInYear = 360;
  }
  
  // DISC formula
  const disc = ((redemptionNum - prNum) / redemptionNum) * (daysInYear / dsm);
  
  return disc;
};

/**
 * INTRATE - Interest Rate for a Fully Invested Security
 * Calculates the interest rate for a fully invested security.
 * 
 * Formula: INTRATE = (redemption - investment) / investment × (B / DSM)
 * Where B = days in year (basis), DSM = days from settlement to maturity
 * 
 * @param settlement - Security's settlement date
 * @param maturity - Security's maturity date
 * @param investment - Amount invested in the security
 * @param redemption - Amount to be received at maturity
 * @param basis - Day count basis (0=30/360, 1=actual/actual, 2=actual/360, 3=actual/365, 4=30E/360)
 * @returns Annual interest rate
 * 
 * @example
 * =INTRATE(DATE(2021,2,15), DATE(2021,5,15), 1000000, 1014420, 2) → 0.0578 (5.78%)
 */
export const INTRATE: FormulaFunction = (settlement, maturity, investment, redemption, basis = 0) => {
  const settlementNum = toNumber(settlement);
  const maturityNum = toNumber(maturity);
  const investmentNum = toNumber(investment);
  const redemptionNum = toNumber(redemption);
  const basisNum = toNumber(basis);
  
  if (settlementNum instanceof Error) return settlementNum;
  if (maturityNum instanceof Error) return maturityNum;
  if (investmentNum instanceof Error) return investmentNum;
  if (redemptionNum instanceof Error) return redemptionNum;
  if (basisNum instanceof Error) return basisNum;
  
  // Validate inputs
  if (settlementNum >= maturityNum) {
    return new Error('#NUM!');
  }
  
  if (investmentNum <= 0 || redemptionNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }
  
  const basisInt = Math.floor(basisNum);
  
  // Calculate days between settlement and maturity
  const dsm = maturityNum - settlementNum;
  
  // Days in year based on basis
  let daysInYear: number;
  switch (basisInt) {
    case 0: // 30/360
    case 4: // 30E/360
      daysInYear = 360;
      break;
    case 1: // actual/actual
      daysInYear = 365; // Simplified
      break;
    case 2: // actual/360
      daysInYear = 360;
      break;
    case 3: // actual/365
      daysInYear = 365;
      break;
    default:
      daysInYear = 360;
  }
  
  // INTRATE formula
  const intrate = ((redemptionNum - investmentNum) / investmentNum) * (daysInYear / dsm);
  
  return intrate;
};

/**
 * CUMIPMT - Cumulative Interest Paid Between Two Periods
 * Calculates the cumulative interest paid on a loan between two periods.
 * 
 * Formula: Sum of IPMT for each period from start_period to end_period
 * 
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount)
 * @param start_period - First period in the calculation (must be >= 1)
 * @param end_period - Last period in the calculation (must be <= nper)
 * @param type - 0 = payment at end of period, 1 = payment at beginning
 * @returns Cumulative interest paid (negative value)
 * 
 * @example
 * =CUMIPMT(0.09/12, 30*12, 125000, 13, 24, 0) → -11135.23 (interest paid in year 2)
 */
export const CUMIPMT: FormulaFunction = (rate, nper, pv, start_period, end_period, type = 0) => {
  const rateNum = toNumber(rate);
  const nperNum = toNumber(nper);
  const pvNum = toNumber(pv);
  const startNum = toNumber(start_period);
  const endNum = toNumber(end_period);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (nperNum instanceof Error) return nperNum;
  if (pvNum instanceof Error) return pvNum;
  if (startNum instanceof Error) return startNum;
  if (endNum instanceof Error) return endNum;
  if (typeNum instanceof Error) return typeNum;
  
  // Validate inputs
  if (rateNum <= 0 || nperNum <= 0 || pvNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (startNum < 1 || endNum < startNum || endNum > nperNum) {
    return new Error('#NUM!');
  }
  
  if (typeNum !== 0 && typeNum !== 1) {
    return new Error('#NUM!');
  }
  
  const typeInt = Math.floor(typeNum);
  const startInt = Math.floor(startNum);
  const endInt = Math.floor(endNum);
  
  // Sum IPMT for each period
  let cumipmt = 0;
  for (let period = startInt; period <= endInt; period++) {
    const ipmt = IPMT(rateNum, period, nperNum, pvNum, 0, typeInt);
    if (ipmt instanceof Error) return ipmt;
    cumipmt += ipmt as number;
  }
  
  return cumipmt;
};

/**
 * CUMPRINC - Cumulative Principal Paid Between Two Periods
 * Calculates the cumulative principal paid on a loan between two periods.
 * 
 * Formula: Sum of PPMT for each period from start_period to end_period
 * 
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount)
 * @param start_period - First period in the calculation (must be >= 1)
 * @param end_period - Last period in the calculation (must be <= nper)
 * @param type - 0 = payment at end of period, 1 = payment at beginning
 * @returns Cumulative principal paid (negative value)
 * 
 * @example
 * =CUMPRINC(0.09/12, 30*12, 125000, 13, 24, 0) → -934.11 (principal paid in year 2)
 */
export const CUMPRINC: FormulaFunction = (rate, nper, pv, start_period, end_period, type = 0) => {
  const rateNum = toNumber(rate);
  const nperNum = toNumber(nper);
  const pvNum = toNumber(pv);
  const startNum = toNumber(start_period);
  const endNum = toNumber(end_period);
  const typeNum = toNumber(type);
  
  if (rateNum instanceof Error) return rateNum;
  if (nperNum instanceof Error) return nperNum;
  if (pvNum instanceof Error) return pvNum;
  if (startNum instanceof Error) return startNum;
  if (endNum instanceof Error) return endNum;
  if (typeNum instanceof Error) return typeNum;
  
  // Validate inputs
  if (rateNum <= 0 || nperNum <= 0 || pvNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (startNum < 1 || endNum < startNum || endNum > nperNum) {
    return new Error('#NUM!');
  }
  
  if (typeNum !== 0 && typeNum !== 1) {
    return new Error('#NUM!');
  }
  
  const typeInt = Math.floor(typeNum);
  const startInt = Math.floor(startNum);
  const endInt = Math.floor(endNum);
  
  // Sum PPMT for each period
  let cumprinc = 0;
  for (let period = startInt; period <= endInt; period++) {
    const ppmt = PPMT(rateNum, period, nperNum, pvNum, 0, typeInt);
    if (ppmt instanceof Error) return ppmt;
    cumprinc += ppmt as number;
  }
  
  return cumprinc;
};

/**
 * DB - Declining Balance Depreciation
 * Returns the depreciation of an asset for a specified period using the fixed-declining balance method.
 * 
 * Formula: Depreciation = (cost - total_depreciation) * rate
 * Where rate = 1 - ((salvage / cost) ^ (1 / life)), rounded to 3 decimals
 * 
 * @param cost - Initial cost of the asset
 * @param salvage - Value at the end of depreciation (salvage value)
 * @param life - Number of periods over which the asset is depreciated
 * @param period - Period for which to calculate depreciation
 * @param month - Number of months in the first year (default 12)
 * @returns Depreciation for the specified period
 * 
 * @example
 * =DB(1000000, 100000, 6, 1, 7) → $186,083.33 (first year with 7 months)
 */
export const DB: FormulaFunction = (cost, salvage, life, period, month = 12) => {
  const costNum = toNumber(cost);
  const salvageNum = toNumber(salvage);
  const lifeNum = toNumber(life);
  const periodNum = toNumber(period);
  const monthNum = toNumber(month);
  
  if (costNum instanceof Error) return costNum;
  if (salvageNum instanceof Error) return salvageNum;
  if (lifeNum instanceof Error) return lifeNum;
  if (periodNum instanceof Error) return periodNum;
  if (monthNum instanceof Error) return monthNum;
  
  // Validate inputs
  if (costNum < 0 || salvageNum < 0 || lifeNum <= 0 || periodNum <= 0 || monthNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (salvageNum > costNum) {
    return new Error('#NUM!');
  }
  
  if (periodNum > lifeNum + 1) {
    return new Error('#NUM!');
  }
  
  if (monthNum > 12) {
    return new Error('#NUM!');
  }
  
  const lifeInt = Math.floor(lifeNum);
  const periodInt = Math.floor(periodNum);
  const monthInt = Math.floor(monthNum);
  
  // Calculate depreciation rate
  const rate = 1 - Math.pow(salvageNum / costNum, 1 / lifeInt);
  // Round to 3 decimal places as per Excel
  const roundedRate = Math.round(rate * 1000) / 1000;
  
  // Calculate depreciation for each period
  let totalDepreciation = 0;
  let depreciation = 0;
  
  for (let i = 1; i <= periodInt; i++) {
    if (i === 1) {
      // First period uses partial year based on month parameter
      depreciation = costNum * roundedRate * monthInt / 12;
    } else if (i === lifeInt + 1) {
      // Last period (partial year)
      depreciation = (costNum - totalDepreciation) * roundedRate * (12 - monthInt) / 12;
    } else {
      // Full year
      depreciation = (costNum - totalDepreciation) * roundedRate;
    }
    
    if (i === periodInt) {
      return depreciation;
    }
    
    totalDepreciation += depreciation;
  }
  
  return depreciation;
};

/**
 * DDB - Double-Declining Balance Depreciation
 * Returns the depreciation of an asset for a specified period using the double-declining balance method or another method you specify.
 * 
 * Formula: Depreciation = (cost - total_depreciation) * (factor / life)
 * Limited to not exceed (cost - salvage - total_depreciation) in final periods
 * 
 * @param cost - Initial cost of the asset
 * @param salvage - Value at the end of depreciation (salvage value)
 * @param life - Number of periods over which the asset is depreciated
 * @param period - Period for which to calculate depreciation
 * @param factor - Rate at which balance declines (default 2 for double-declining)
 * @returns Depreciation for the specified period
 * 
 * @example
 * =DDB(2400, 300, 10, 1, 2) → $480.00 (first year double-declining)
 */
export const DDB: FormulaFunction = (cost, salvage, life, period, factor = 2) => {
  const costNum = toNumber(cost);
  const salvageNum = toNumber(salvage);
  const lifeNum = toNumber(life);
  const periodNum = toNumber(period);
  const factorNum = toNumber(factor);
  
  if (costNum instanceof Error) return costNum;
  if (salvageNum instanceof Error) return salvageNum;
  if (lifeNum instanceof Error) return lifeNum;
  if (periodNum instanceof Error) return periodNum;
  if (factorNum instanceof Error) return factorNum;
  
  // Validate inputs
  if (costNum < 0 || salvageNum < 0 || lifeNum <= 0 || periodNum <= 0 || factorNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (salvageNum > costNum) {
    return new Error('#NUM!');
  }
  
  if (periodNum > lifeNum) {
    return new Error('#NUM!');
  }
  
  const periodInt = Math.floor(periodNum);
  
  // Calculate depreciation rate
  const rate = factorNum / lifeNum;
  
  // Calculate depreciation for each period up to the requested period
  let bookValue = costNum;
  let depreciation = 0;
  
  for (let i = 1; i <= periodInt; i++) {
    // Calculate depreciation for this period
    depreciation = bookValue * rate;
    
    // Don't depreciate below salvage value
    const remainingValue = bookValue - depreciation;
    if (remainingValue < salvageNum) {
      depreciation = bookValue - salvageNum;
    }
    
    if (i === periodInt) {
      return depreciation;
    }
    
    bookValue -= depreciation;
  }
  
  return depreciation;
};

/**
 * SLN - Straight-Line Depreciation
 * Returns depreciation per period using straight-line method
 * 
 * Formula: (cost - salvage) / life
 * 
 * @param cost - Initial cost of asset
 * @param salvage - Salvage value at end of life
 * @param life - Number of periods over which asset is depreciated
 * @returns Depreciation per period
 * 
 * @example
 * =SLN(30000, 7500, 10) → 2250 per period
 */
export function SLN(
  cost: FormulaValue,
  salvage: FormulaValue,
  life: FormulaValue
): FormulaValue {
  // Convert inputs to numbers
  const costNum = toNumber(cost);
  if (costNum instanceof Error) return costNum;
  
  const salvageNum = toNumber(salvage);
  if (salvageNum instanceof Error) return salvageNum;
  
  const lifeNum = toNumber(life);
  if (lifeNum instanceof Error) return lifeNum;

  // Validate inputs
  if (lifeNum <= 0) {
    return new Error('#NUM!');
  }

  if (costNum < 0 || salvageNum < 0) {
    return new Error('#NUM!');
  }

  // Straight-line depreciation formula
  const depreciation = (costNum - salvageNum) / lifeNum;

  return depreciation;
}

/**
 * SYD - Sum-of-Years' Digits Depreciation
 * Returns accelerated depreciation using sum-of-years' digits method
 * 
 * Formula: ((life - period + 1) / sum_of_years) * (cost - salvage)
 * where sum_of_years = life * (life + 1) / 2
 * 
 * @param cost - Initial cost of asset
 * @param salvage - Salvage value at end of life
 * @param life - Number of periods over which asset is depreciated
 * @param period - Period for which to calculate depreciation
 * @returns Depreciation for the specified period
 * 
 * @example
 * =SYD(30000, 7500, 10, 1) → 4090.91 (first period gets highest depreciation)
 * =SYD(30000, 7500, 10, 10) → 409.09 (last period gets lowest depreciation)
 */
export function SYD(
  cost: FormulaValue,
  salvage: FormulaValue,
  life: FormulaValue,
  period: FormulaValue
): FormulaValue {
  // Convert inputs to numbers
  const costNum = toNumber(cost);
  if (costNum instanceof Error) return costNum;
  
  const salvageNum = toNumber(salvage);
  if (salvageNum instanceof Error) return salvageNum;
  
  const lifeNum = toNumber(life);
  if (lifeNum instanceof Error) return lifeNum;
  
  const periodNum = toNumber(period);
  if (periodNum instanceof Error) return periodNum;

  // Validate inputs
  if (lifeNum <= 0 || periodNum <= 0 || periodNum > lifeNum) {
    return new Error('#NUM!');
  }

  if (costNum < 0 || salvageNum < 0) {
    return new Error('#NUM!');
  }

  // Convert period to integer
  const periodInt = Math.floor(periodNum);

  // Calculate sum of years' digits: n(n+1)/2
  const sumOfYears = (lifeNum * (lifeNum + 1)) / 2;

  // Calculate remaining life at start of period
  const remainingLife = lifeNum - periodInt + 1;

  // SYD depreciation formula
  const depreciation = ((remainingLife / sumOfYears) * (costNum - salvageNum));

  return depreciation;
}

/**
 * VDB - Variable Declining Balance Depreciation
 * Returns the depreciation of an asset for any period using the double-declining balance method
 * or another method you specify. Can automatically switch to straight-line when beneficial.
 * 
 * @param cost - Initial cost of the asset
 * @param salvage - Value at the end of depreciation
 * @param life - Number of periods over which the asset is depreciated
 * @param start_period - Starting period (can be fractional)
 * @param end_period - Ending period (can be fractional)
 * @param factor - Rate at which balance declines (default 2)
 * @param no_switch - If true, don't switch to straight-line (default false)
 * @returns Total depreciation between start_period and end_period
 * 
 * @example
 * =VDB(2400, 300, 10, 0, 1) → depreciation for first period
 * =VDB(2400, 300, 10, 0, 0.875) → partial period depreciation
 */
export function VDB(
  cost: FormulaValue,
  salvage: FormulaValue,
  life: FormulaValue,
  start_period: FormulaValue,
  end_period: FormulaValue,
  factor: FormulaValue = 2,
  no_switch: FormulaValue = false
): FormulaValue {
  // Convert inputs to numbers
  const costNum = toNumber(cost);
  if (costNum instanceof Error) return costNum;
  
  const salvageNum = toNumber(salvage);
  if (salvageNum instanceof Error) return salvageNum;
  
  const lifeNum = toNumber(life);
  if (lifeNum instanceof Error) return lifeNum;
  
  const startPeriod = toNumber(start_period);
  if (startPeriod instanceof Error) return startPeriod;
  
  const endPeriod = toNumber(end_period);
  if (endPeriod instanceof Error) return endPeriod;
  
  const factorNum = toNumber(factor);
  if (factorNum instanceof Error) return factorNum;
  
  // Convert no_switch to boolean
  let noSwitch = false;
  if (typeof no_switch === 'boolean') {
    noSwitch = no_switch;
  } else if (typeof no_switch === 'number') {
    noSwitch = no_switch !== 0;
  }

  // Validate inputs
  if (costNum < 0 || salvageNum < 0 || lifeNum <= 0 || factorNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (salvageNum > costNum) {
    return new Error('#NUM!');
  }
  
  if (startPeriod < 0 || endPeriod < 0 || endPeriod < startPeriod || endPeriod > lifeNum) {
    return new Error('#NUM!');
  }

  // Helper function to calculate depreciation for a single period using DDB
  const calcDDBDepreciation = (bookValue: number, rate: number, salvage: number): number => {
    let depreciation = bookValue * rate;
    
    // Don't depreciate below salvage value
    if (bookValue - depreciation < salvage) {
      depreciation = bookValue - salvage;
    }
    
    return Math.max(0, depreciation);
  };

  // Helper function to calculate when to switch to SLN
  const calcSLNDepreciation = (bookValue: number, salvage: number, periodsRemaining: number): number => {
    if (periodsRemaining <= 0) return 0;
    return (bookValue - salvage) / periodsRemaining;
  };

  const rate = factorNum / lifeNum;
  let totalDepreciation = 0;
  
  // Calculate book value at start_period
  let bookValue = costNum;
  let currentPeriod = 0;
  
  // Calculate book value up to start_period
  while (currentPeriod < startPeriod) {
    const periodsRemaining = lifeNum - currentPeriod;
    const ddbDep = calcDDBDepreciation(bookValue, rate, salvageNum);
    const slnDep = calcSLNDepreciation(bookValue, salvageNum, periodsRemaining);
    
    let periodDepreciation: number;
    if (noSwitch || ddbDep >= slnDep) {
      periodDepreciation = ddbDep;
    } else {
      periodDepreciation = slnDep;
    }
    
    const periodStep = Math.min(1, startPeriod - currentPeriod);
    const actualDepreciation = periodDepreciation * periodStep;
    
    bookValue -= actualDepreciation;
    currentPeriod += periodStep;
  }
  
  // Calculate depreciation from start_period to end_period
  currentPeriod = startPeriod;
  while (currentPeriod < endPeriod) {
    const periodsRemaining = lifeNum - currentPeriod;
    const ddbDep = calcDDBDepreciation(bookValue, rate, salvageNum);
    const slnDep = calcSLNDepreciation(bookValue, salvageNum, periodsRemaining);
    
    let periodDepreciation: number;
    if (noSwitch || ddbDep >= slnDep) {
      periodDepreciation = ddbDep;
    } else {
      periodDepreciation = slnDep;
    }
    
    const periodStep = Math.min(1, endPeriod - currentPeriod);
    const actualDepreciation = periodDepreciation * periodStep;
    
    totalDepreciation += actualDepreciation;
    bookValue -= actualDepreciation;
    currentPeriod += periodStep;
  }
  
  return totalDepreciation;
}

/**
 * AMORDEGRC - Depreciation for French Accounting System
 * Returns the depreciation for each accounting period using coefficients based on asset life.
 * Includes special depreciation coefficient for assets with life between 3-6 years.
 * 
 * @param cost - Cost of the asset
 * @param date_purchased - Date when asset was purchased
 * @param first_period - Date of end of first period
 * @param salvage - Salvage value at end of life
 * @param period - The period
 * @param rate - Rate of depreciation
 * @param basis - Day count basis (0-4)
 * @returns Depreciation for the specified period
 * 
 * @example
 * =AMORDEGRC(2400, DATE(2008,8,19), DATE(2008,12,31), 300, 1, 0.15, 1)
 */
export function AMORDEGRC(
  cost: FormulaValue,
  date_purchased: FormulaValue,
  first_period: FormulaValue,
  salvage: FormulaValue,
  period: FormulaValue,
  rate: FormulaValue,
  basis: FormulaValue = 0
): FormulaValue {
  // Convert inputs to numbers
  const costNum = toNumber(cost);
  if (costNum instanceof Error) return costNum;
  
  const datePurchased = toNumber(date_purchased);
  if (datePurchased instanceof Error) return datePurchased;
  
  const firstPeriod = toNumber(first_period);
  if (firstPeriod instanceof Error) return firstPeriod;
  
  const salvageNum = toNumber(salvage);
  if (salvageNum instanceof Error) return salvageNum;
  
  const periodNum = toNumber(period);
  if (periodNum instanceof Error) return periodNum;
  
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  const basisNum = toNumber(basis);
  if (basisNum instanceof Error) return basisNum;

  // Validate inputs
  if (costNum < 0 || salvageNum < 0 || rateNum <= 0 || periodNum < 0) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }

  // Calculate asset life from rate
  const life = 1 / rateNum;
  
  // Determine depreciation coefficient based on life
  let coefficient = 1.0;
  if (life > 3 && life <= 4) {
    coefficient = 1.5;
  } else if (life > 4 && life <= 6) {
    coefficient = 2.0;
  } else if (life > 6) {
    coefficient = 2.5;
  }

  const periodInt = Math.floor(periodNum);
  
  // Calculate number of months in first period (simplified - assumes full year = 12 months)
  const monthsInFirstPeriod = Math.min(12, Math.max(0, (firstPeriod - datePurchased) / 30));
  
  // Calculate depreciation
  let totalDepreciation = 0;
  let bookValue = costNum;
  
  for (let i = 0; i <= periodInt; i++) {
    let periodDepreciation: number;
    
    if (i === 0) {
      // First period - prorated
      periodDepreciation = (bookValue * rateNum * coefficient * monthsInFirstPeriod) / 12;
    } else {
      // Full periods
      periodDepreciation = bookValue * rateNum * coefficient;
    }
    
    // Don't depreciate below salvage
    if (bookValue - periodDepreciation < salvageNum) {
      periodDepreciation = bookValue - salvageNum;
    }
    
    if (i === periodInt) {
      return Math.max(0, periodDepreciation);
    }
    
    totalDepreciation += periodDepreciation;
    bookValue -= periodDepreciation;
  }
  
  return 0;
}

/**
 * AMORLINC - Linear Depreciation for French Accounting System
 * Returns the depreciation for each accounting period using linear depreciation.
 * Similar to AMORDEGRC but uses linear method instead of accelerated.
 * 
 * @param cost - Cost of the asset
 * @param date_purchased - Date when asset was purchased
 * @param first_period - Date of end of first period
 * @param salvage - Salvage value at end of life
 * @param period - The period
 * @param rate - Rate of depreciation
 * @param basis - Day count basis (0-4)
 * @returns Linear depreciation for the specified period
 * 
 * @example
 * =AMORLINC(2400, DATE(2008,8,19), DATE(2008,12,31), 300, 1, 0.15, 1)
 */
export function AMORLINC(
  cost: FormulaValue,
  date_purchased: FormulaValue,
  first_period: FormulaValue,
  salvage: FormulaValue,
  period: FormulaValue,
  rate: FormulaValue,
  basis: FormulaValue = 0
): FormulaValue {
  // Convert inputs to numbers
  const costNum = toNumber(cost);
  if (costNum instanceof Error) return costNum;
  
  const datePurchased = toNumber(date_purchased);
  if (datePurchased instanceof Error) return datePurchased;
  
  const firstPeriod = toNumber(first_period);
  if (firstPeriod instanceof Error) return firstPeriod;
  
  const salvageNum = toNumber(salvage);
  if (salvageNum instanceof Error) return salvageNum;
  
  const periodNum = toNumber(period);
  if (periodNum instanceof Error) return periodNum;
  
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  const basisNum = toNumber(basis);
  if (basisNum instanceof Error) return basisNum;

  // Validate inputs
  if (costNum < 0 || salvageNum < 0 || rateNum <= 0 || periodNum < 0) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }

  const periodInt = Math.floor(periodNum);
  
  // Calculate number of months in first period (simplified - assumes full year = 12 months)
  const monthsInFirstPeriod = Math.min(12, Math.max(0, (firstPeriod - datePurchased) / 30));
  
  // Calculate linear depreciation per period
  const depreciableAmount = costNum - salvageNum;
  const life = 1 / rateNum;
  const annualDepreciation = depreciableAmount / life;
  
  // Calculate depreciation for requested period
  let totalDepreciation = 0;
  let bookValue = costNum;
  
  for (let i = 0; i <= periodInt; i++) {
    let periodDepreciation: number;
    
    if (i === 0) {
      // First period - prorated based on months
      periodDepreciation = (annualDepreciation * monthsInFirstPeriod) / 12;
    } else {
      // Full periods - linear depreciation
      periodDepreciation = annualDepreciation;
    }
    
    // Don't depreciate below salvage
    if (bookValue - periodDepreciation < salvageNum) {
      periodDepreciation = bookValue - salvageNum;
    }
    
    if (i === periodInt) {
      return Math.max(0, periodDepreciation);
    }
    
    totalDepreciation += periodDepreciation;
    bookValue -= periodDepreciation;
  }
  
  return 0;
}

/**
 * ACCRINT - Accrued Interest for Security with Periodic Interest Payments
 * Returns the accrued interest for a security that pays periodic interest.
 * 
 * @param issue - Issue date of the security
 * @param first_interest - First interest date
 * @param settlement - Settlement date
 * @param rate - Annual coupon rate
 * @param par - Par value (default 1000)
 * @param frequency - Number of coupon payments per year (1, 2, or 4)
 * @param basis - Day count basis (0-4)
 * @param calc_method - Calculation method (default TRUE)
 * @returns Accrued interest
 * 
 * @example
 * =ACCRINT(DATE(2008,2,2), DATE(2008,3,15), DATE(2008,5,1), 0.1, 1000, 2, 0)
 */
export function ACCRINT(
  issue: FormulaValue,
  first_interest: FormulaValue,
  settlement: FormulaValue,
  rate: FormulaValue,
  par: FormulaValue = 1000,
  frequency: FormulaValue = 2,
  basis: FormulaValue = 0,
  calc_method: FormulaValue = true
): FormulaValue {
  // Convert inputs to numbers
  const issueDate = toNumber(issue);
  if (issueDate instanceof Error) return issueDate;
  
  const firstInterest = toNumber(first_interest);
  if (firstInterest instanceof Error) return firstInterest;
  
  const settlementDate = toNumber(settlement);
  if (settlementDate instanceof Error) return settlementDate;
  
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  const parNum = toNumber(par);
  if (parNum instanceof Error) return parNum;
  
  const freqNum = toNumber(frequency);
  if (freqNum instanceof Error) return freqNum;
  
  const basisNum = toNumber(basis);
  if (basisNum instanceof Error) return basisNum;

  // Validate inputs
  if (rateNum <= 0 || parNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (freqNum !== 1 && freqNum !== 2 && freqNum !== 4) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }
  
  if (issueDate >= settlementDate) {
    return new Error('#NUM!');
  }

  // Helper function to calculate days between dates based on basis
  const daysBetween = (start: number, end: number, basis: number): number => {
    const days = end - start;
    // Simplified day count - in real Excel, this uses complex day count conventions
    return days;
  };

  // Helper function to get days in year based on basis
  const daysInYear = (basis: number): number => {
    switch (basis) {
      case 0: // 30/360 US
      case 4: // 30/360 European
        return 360;
      case 1: // Actual/actual
      case 2: // Actual/360
        return 360;
      case 3: // Actual/365
        return 365;
      default:
        return 360;
    }
  };

  const freq = Math.floor(freqNum);
  const daysPerYear = daysInYear(basisNum);
  const couponPeriod = daysPerYear / freq;
  
  // Calculate accrued interest
  // Simplified calculation: count days from issue to settlement
  const daysAccrued = daysBetween(issueDate, settlementDate, basisNum);
  const couponPayment = parNum * rateNum / freq;
  
  // Calculate number of full periods and partial period
  const fullPeriods = Math.floor(daysAccrued / couponPeriod);
  const partialDays = daysAccrued - (fullPeriods * couponPeriod);
  
  // Accrued interest = (par * rate / freq) * (days_accrued / days_per_period)
  const accruedInterest = (parNum * rateNum / freq) * (daysAccrued / couponPeriod);
  
  return accruedInterest;
}

/**
 * ACCRINTM - Accrued Interest at Maturity
 * Returns the accrued interest for a security that pays interest at maturity.
 * 
 * @param issue - Issue date of the security
 * @param settlement - Maturity date
 * @param rate - Annual coupon rate
 * @param par - Par value (default 1000)
 * @param basis - Day count basis (0-4)
 * @returns Accrued interest at maturity
 * 
 * @example
 * =ACCRINTM(DATE(2008,4,1), DATE(2008,6,15), 0.1, 1000, 0)
 */
export function ACCRINTM(
  issue: FormulaValue,
  settlement: FormulaValue,
  rate: FormulaValue,
  par: FormulaValue = 1000,
  basis: FormulaValue = 0
): FormulaValue {
  // Convert inputs to numbers
  const issueDate = toNumber(issue);
  if (issueDate instanceof Error) return issueDate;
  
  const settlementDate = toNumber(settlement);
  if (settlementDate instanceof Error) return settlementDate;
  
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  const parNum = toNumber(par);
  if (parNum instanceof Error) return parNum;
  
  const basisNum = toNumber(basis);
  if (basisNum instanceof Error) return basisNum;

  // Validate inputs
  if (rateNum <= 0 || parNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }
  
  if (issueDate >= settlementDate) {
    return new Error('#NUM!');
  }

  // Helper function to get days in year based on basis
  const daysInYear = (basis: number): number => {
    switch (basis) {
      case 0: // 30/360 US
      case 4: // 30/360 European
        return 360;
      case 1: // Actual/actual
      case 2: // Actual/360
        return 360;
      case 3: // Actual/365
        return 365;
      default:
        return 360;
    }
  };

  const daysPerYear = daysInYear(basisNum);
  
  // Calculate days between issue and settlement (simplified)
  const daysAccrued = settlementDate - issueDate;
  
  // Accrued interest = par * rate * (days_accrued / days_per_year)
  const accruedInterest = parNum * rateNum * (daysAccrued / daysPerYear);
  
  return accruedInterest;
}

/**
 * PRICE - Price of Security Paying Periodic Interest
 * Returns the price per $100 face value of a security that pays periodic interest.
 * 
 * @param settlement - Settlement date
 * @param maturity - Maturity date
 * @param rate - Annual coupon rate
 * @param yld - Annual yield
 * @param redemption - Redemption value per $100 face value
 * @param frequency - Number of coupon payments per year (1, 2, or 4)
 * @param basis - Day count basis (0-4)
 * @returns Price per $100 face value
 * 
 * @example
 * =PRICE(DATE(2008,2,15), DATE(2017,11,15), 0.0575, 0.065, 100, 2, 0)
 */
export function PRICE(
  settlement: FormulaValue,
  maturity: FormulaValue,
  rate: FormulaValue,
  yld: FormulaValue,
  redemption: FormulaValue,
  frequency: FormulaValue,
  basis: FormulaValue = 0
): FormulaValue {
  // Convert inputs to numbers
  const settlementDate = toNumber(settlement);
  if (settlementDate instanceof Error) return settlementDate;
  
  const maturityDate = toNumber(maturity);
  if (maturityDate instanceof Error) return maturityDate;
  
  const rateNum = toNumber(rate);
  if (rateNum instanceof Error) return rateNum;
  
  const yldNum = toNumber(yld);
  if (yldNum instanceof Error) return yldNum;
  
  const redemptionNum = toNumber(redemption);
  if (redemptionNum instanceof Error) return redemptionNum;
  
  const freqNum = toNumber(frequency);
  if (freqNum instanceof Error) return freqNum;
  
  const basisNum = toNumber(basis);
  if (basisNum instanceof Error) return basisNum;

  // Validate inputs
  if (rateNum < 0 || yldNum < 0 || redemptionNum <= 0) {
    return new Error('#NUM!');
  }
  
  if (freqNum !== 1 && freqNum !== 2 && freqNum !== 4) {
    return new Error('#NUM!');
  }
  
  if (basisNum < 0 || basisNum > 4) {
    return new Error('#NUM!');
  }
  
  if (settlementDate >= maturityDate) {
    return new Error('#NUM!');
  }

  const freq = Math.floor(freqNum);
  
  // Helper function to get days in year based on basis
  const daysInYear = (basis: number): number => {
    switch (basis) {
      case 0: // 30/360 US
      case 4: // 30/360 European
        return 360;
      case 1: // Actual/actual
      case 2: // Actual/360
        return 360;
      case 3: // Actual/365
        return 365;
      default:
        return 360;
    }
  };

  const daysPerYear = daysInYear(basisNum);
  const couponPeriod = daysPerYear / freq;
  
  // Calculate days from settlement to maturity
  const daysToMaturity = maturityDate - settlementDate;
  
  // Calculate number of coupon periods
  const numPeriods = Math.ceil(daysToMaturity / couponPeriod);
  
  // Calculate fraction of period from settlement to next coupon
  const daysToNextCoupon = couponPeriod - (daysToMaturity % couponPeriod);
  const fractionToNextCoupon = daysToNextCoupon / couponPeriod;
  
  // Coupon payment per period
  const couponPayment = (rateNum / freq) * 100;
  
  // Calculate present value of all cash flows
  let price = 0;
  
  // Present value of coupon payments
  for (let i = 1; i <= numPeriods; i++) {
    const periods = i - 1 + fractionToNextCoupon;
    const discountFactor = Math.pow(1 + yldNum / freq, -periods);
    price += couponPayment * discountFactor;
  }
  
  // Present value of redemption
  const periodsToRedemption = numPeriods - 1 + fractionToNextCoupon;
  const redemptionPV = redemptionNum * Math.pow(1 + yldNum / freq, -periodsToRedemption);
  price += redemptionPV;
  
  // Subtract accrued interest
  const accruedInterest = couponPayment * (1 - fractionToNextCoupon);
  price -= accruedInterest;
  
  return price;
}


