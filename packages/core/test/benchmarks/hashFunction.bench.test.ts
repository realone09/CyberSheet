/**
 * Hash Function Benchmark (Step 0 - Critical)
 * 
 * BEFORE StyleCache implementation, validate hash quality.
 * 
 * Critical Metrics:
 * - Collision rate: <5% (indicates hash quality)
 * - Bucket distribution: Uniform (chi-squared test)
 * - Adversarial resistance: No catastrophic collisions
 * 
 * If ANY metric fails → Redesign hash function BEFORE continuing.
 */

import { hashStyle } from '../../src/StyleCache';
import type { CellStyle } from '../../src/types';

describe('Hash Function Quality Benchmarks', () => {
  /**
   * Test 1: Typical Formatting Patterns
   * 
   * 50 common styles (bold, colors, sizes)
   * Expected: Zero collisions (distinct patterns)
   */
  describe('Typical Patterns', () => {
    test('50 distinct styles → zero collisions', () => {
      const styles = generateTypicalStyles(50);
      const hashes = new Map<number, CellStyle[]>();
      
      for (const style of styles) {
        const hash = hashStyle(style);
        const bucket = hashes.get(hash) || [];
        bucket.push(style);
        hashes.set(hash, bucket);
      }
      
      // Count collisions and log them
      let collisions = 0;
      for (const [hash, bucket] of hashes.entries()) {
        if (bucket.length > 1) {
          console.log('[Collision] Hash:', hash, 'Styles:', bucket.length);
          bucket.forEach((s, i) => console.log(`  [${i}]:`, JSON.stringify(s)));
          collisions += bucket.length - 1;
        }
      }
      
      const collisionRate = collisions / styles.length;
      
      console.log('[Typical] Collision rate:', (collisionRate * 100).toFixed(2) + '%');
      console.log('[Typical] Unique hashes:', hashes.size, '/', styles.length);
      
      expect(collisionRate).toBe(0); // Zero collisions expected
    });
  });
  
  /**
   * Test 2: Sequential Colors (Adversarial)
   * 
   * 10k sequential colors (#000000 to #0027FF)
   * Expected: <5% collisions, uniform distribution
   */
  describe('Sequential Colors (Adversarial)', () => {
    test('10k sequential colors → <5% collisions', () => {
      const styles: CellStyle[] = [];
      
      for (let i = 0; i < 10000; i++) {
        const color = `#${i.toString(16).padStart(6, '0')}`;
        styles.push({ color });
      }
      
      const hashes = new Map<number, number>();
      
      for (const style of styles) {
        const hash = hashStyle(style);
        hashes.set(hash, (hashes.get(hash) || 0) + 1);
      }
      
      // Count collisions
      let collisions = 0;
      for (const count of hashes.values()) {
        if (count > 1) {
          collisions += count - 1;
        }
      }
      
      const collisionRate = collisions / styles.length;
      
      console.log('[Sequential Colors] Collision rate:', (collisionRate * 100).toFixed(2) + '%');
      console.log('[Sequential Colors] Unique hashes:', hashes.size, '/', styles.length);
      console.log('[Sequential Colors] Bucket count:', hashes.size);
      
      expect(collisionRate).toBeLessThan(0.05); // <5% collisions
    });
    
    test('Distribution is uniform (chi-squared test)', () => {
      const styles: CellStyle[] = [];
      
      for (let i = 0; i < 10000; i++) {
        const color = `#${i.toString(16).padStart(6, '0')}`;
        styles.push({ color });
      }
      
      // Group hashes into buckets (last 8 bits)
      const buckets = new Array(256).fill(0);
      
      for (const style of styles) {
        const hash = hashStyle(style);
        const bucketIdx = hash & 0xFF; // Last 8 bits
        buckets[bucketIdx]++;
      }
      
      // Chi-squared test for uniformity
      const expected = styles.length / buckets.length; // ~39 per bucket
      let chiSquared = 0;
      
      for (const count of buckets) {
        chiSquared += Math.pow(count - expected, 2) / expected;
      }
      
      // Critical value for 255 degrees of freedom, p=0.05: ~293
      const criticalValue = 293;
      
      console.log('[Distribution] Chi-squared:', chiSquared.toFixed(2));
      console.log('[Distribution] Critical value (p=0.05):', criticalValue);
      console.log('[Distribution] Uniform:', chiSquared < criticalValue ? 'YES' : 'NO');
      
      // If chi-squared > critical → non-uniform distribution
      expect(chiSquared).toBeLessThan(criticalValue);
    });
  });
  
  /**
   * Test 3: Designer Styles (5k unique)
   * 
   * Complex combinations (gradients, fonts, borders)
   * Expected: <5% collisions
   */
  describe('Designer Styles (5k unique)', () => {
    test('5000 unique styles → <5% collisions', () => {
      const styles = generateDesignerStyles(5000);
      const hashes = new Map<number, number>();
      
      for (const style of styles) {
        const hash = hashStyle(style);
        hashes.set(hash, (hashes.get(hash) || 0) + 1);
      }
      
      // Count collisions
      let collisions = 0;
      let maxBucketDepth = 0;
      
      for (const count of hashes.values()) {
        if (count > 1) {
          collisions += count - 1;
          maxBucketDepth = Math.max(maxBucketDepth, count);
        }
      }
      
      const collisionRate = collisions / styles.length;
      
      console.log('[Designer] Collision rate:', (collisionRate * 100).toFixed(2) + '%');
      console.log('[Designer] Unique hashes:', hashes.size, '/', styles.length);
      console.log('[Designer] Max bucket depth:', maxBucketDepth);
      
      expect(collisionRate).toBeLessThan(0.05); // <5% collisions
      expect(maxBucketDepth).toBeLessThan(10); // <10 styles per bucket
    });
  });
  
  /**
   * Test 4: Hash Performance
   * 
   * Measure hash computation speed
   * Expected: <0.01ms per hash (negligible overhead)
   */
  describe('Hash Performance', () => {
    test('Hash computation <0.01ms avg', () => {
      const styles = generateDesignerStyles(1000);
      
      const start = performance.now();
      
      for (const style of styles) {
        hashStyle(style);
      }
      
      const end = performance.now();
      const avgTime = (end - start) / styles.length;
      
      console.log('[Performance] Avg hash time:', avgTime.toFixed(4) + 'ms');
      console.log('[Performance] Total time:', (end - start).toFixed(2) + 'ms for 1000 styles');
      
      expect(avgTime).toBeLessThan(0.01); // <0.01ms per hash
    });
  });
});

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Generate typical spreadsheet styles
 * - Headers (bold, colors)
 * - Data rows (number formats, alignments)
 * - Totals (bold, borders)
 * - Conditional formatting (colors)
 */
function generateTypicalStyles(count: number): CellStyle[] {
  const styles: CellStyle[] = [];
  
  // Base styles
  styles.push({});
  styles.push({ bold: true });
  styles.push({ italic: true });
  styles.push({ underline: true });
  
  // Font sizes
  for (let size = 10; size <= 18; size += 2) {
    styles.push({ fontSize: size });
  }
  
  // Colors
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  for (const color of colors) {
    styles.push({ color });
    styles.push({ fill: color });
  }
  
  // Combinations
  styles.push({ bold: true, fontSize: 14 });
  styles.push({ bold: true, color: '#FF0000' });
  styles.push({ bold: true, fill: '#FFFF00' });
  styles.push({ italic: true, color: '#0000FF' });
  
  // Alignments
  styles.push({ align: 'left' });
  styles.push({ align: 'center' });
  styles.push({ align: 'right' });
  styles.push({ valign: 'top' });
  styles.push({ valign: 'middle' });
  styles.push({ valign: 'bottom' });
  
  // Number formats
  styles.push({ numberFormat: '#,##0' });
  styles.push({ numberFormat: '#,##0.00' });
  styles.push({ numberFormat: '$#,##0.00' });
  styles.push({ numberFormat: '0%' });
  
  // Borders
  styles.push({
    border: {
      top: '#000000',
      bottom: '#000000',
    },
  });
  
  return styles.slice(0, count);
}

/**
 * Generate designer styles (complex combinations)
 * - Many colors (gradients)
 * - Font variations (family + size + weight)
 * - Border patterns
 * - Number format variations
 */
function generateDesignerStyles(count: number): CellStyle[] {
  const styles: CellStyle[] = [];
  
  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana'];
  const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];
  const aligns = ['left', 'center', 'right'] as const;
  const valigns = ['top', 'middle', 'bottom'] as const;
  
  // Generate combinations
  for (let i = 0; i < count; i++) {
    const style: CellStyle = {};
    
    // Vary properties based on index
    if (i % 5 === 0) {
      style.bold = true;
    }
    if (i % 7 === 0) {
      style.italic = true;
    }
    if (i % 11 === 0) {
      style.underline = true;
    }
    
    // Color variation
    const colorValue = (i * 137) % 16777216; // Prime * i mod 16M colors
    style.color = `#${colorValue.toString(16).padStart(6, '0')}`;
    
    if (i % 3 === 0) {
      const fillValue = (i * 179) % 16777216;
      style.fill = `#${fillValue.toString(16).padStart(6, '0')}`;
    }
    
    // Font variation
    style.fontFamily = fonts[i % fonts.length];
    style.fontSize = sizes[i % sizes.length];
    
    // Alignment
    if (i % 2 === 0) {
      style.align = aligns[i % aligns.length];
    }
    if (i % 3 === 0) {
      style.valign = valigns[i % valigns.length];
    }
    
    // Rotation
    if (i % 13 === 0) {
      style.rotation = (i * 7) % 180; // 0-180 degrees
    }
    
    // Number format
    if (i % 4 === 0) {
      const formats = ['#,##0', '#,##0.00', '0%', '0.00%', '$#,##0.00'];
      style.numberFormat = formats[i % formats.length];
    }
    
    // Borders
    if (i % 6 === 0) {
      const borderColor = `#${((i * 211) % 16777216).toString(16).padStart(6, '0')}`;
      style.border = {
        top: borderColor,
        bottom: borderColor,
      };
    }
    
    styles.push(style);
  }
  
  return styles;
}
