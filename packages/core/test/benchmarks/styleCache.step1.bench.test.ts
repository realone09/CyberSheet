/**
 * StyleCache Step 1 Benchmark: Minimal Cache Performance
 * 
 * Testing JUST intern() + deepEquals() performance.
 * NO freeze, NO refCount yet.
 * 
 * Gate Conditions:
 * - Hit rate ≥99.95% (typical, 50 styles)
 * - Intern time <0.1ms avg (cold cache)
 * - Intern time <0.05ms avg (hot cache)
 * - Max bucket size ≤3
 * - deepEquals ≤10% of total runtime
 */

import { StyleCache } from '../../src/StyleCache';
import type { CellStyle } from '../../src/types';

describe('StyleCache Step 1: Minimal Cache Benchmarks', () => {
  /**
   * Benchmark 1: Cold Cache (50 unique styles, 100k lookups)
   * 
   * Measures: hash + deepEquals + bucket lookup cost
   * Target: <0.1ms avg
   */
  describe('Cold Cache Performance', () => {
    test('100k cells, 50 unique styles → 99.95% hit rate, <0.1ms avg', () => {
      const cache = new StyleCache();
      const styles = generateTypicalStyles(50);
      
      const start = performance.now();
      
      // Intern 100k cells (2000 cells per style)
      for (let i = 0; i < 100000; i++) {
        const style = styles[i % 50];
        cache.intern(style);
      }
      
      const end = performance.now();
      const metrics = cache.getMetrics();
      
      const hitRate = metrics.hitCount / (metrics.hitCount + metrics.missCount);
      const avgInternTime = metrics.totalInternTime / (metrics.hitCount + metrics.missCount);
      
      console.log('[Cold Cache] Hit rate:', (hitRate * 100).toFixed(2) + '%');
      console.log('[Cold Cache] Avg intern:', avgInternTime.toFixed(4) + 'ms');
      console.log('[Cold Cache] Total time:', (end - start).toFixed(2) + 'ms');
      console.log('[Cold Cache] Cache size:', metrics.cacheSize);
      console.log('[Cold Cache] Max bucket depth:', metrics.maxBucketDepth);
      
      expect(hitRate).toBeGreaterThanOrEqual(0.9995); // 99.95%
      expect(avgInternTime).toBeLessThan(0.1); // <0.1ms
      expect(metrics.maxBucketDepth).toBeLessThanOrEqual(3); // ≤3 styles per bucket
    });
  });
  
  /**
   * Benchmark 2: Hot Cache (same style repeated 100k times)
   * 
   * Measures: Pure lookup cost (no deepEquals)
   * Target: <0.05ms avg
   */
  describe('Hot Cache Performance', () => {
    test('100k lookups, same style → <0.05ms avg', () => {
      const cache = new StyleCache();
      const style: CellStyle = { bold: true, fontSize: 14, color: '#FF0000' };
      
      const start = performance.now();
      
      // Intern same style 100k times
      for (let i = 0; i < 100000; i++) {
        cache.intern(style);
      }
      
      const end = performance.now();
      const metrics = cache.getMetrics();
      
      const avgInternTime = metrics.totalInternTime / (metrics.hitCount + metrics.missCount);
      
      console.log('[Hot Cache] Avg intern:', avgInternTime.toFixed(4) + 'ms');
      console.log('[Hot Cache] Total time:', (end - start).toFixed(2) + 'ms');
      console.log('[Hot Cache] Hit count:', metrics.hitCount);
      console.log('[Hot Cache] Miss count:', metrics.missCount);
      
      expect(avgInternTime).toBeLessThan(0.05); // <0.05ms (hot path)
      expect(metrics.hitCount).toBe(99999); // First is miss, rest are hits
      expect(metrics.missCount).toBe(1);
    });
  });
  
  /**
   * Benchmark 3: Bucket Distribution
   * 
   * Verify hash quality: max bucket depth ≤3
   */
  describe('Bucket Distribution', () => {
    test('1000 unique styles → max bucket depth ≤3', () => {
      const cache = new StyleCache();
      const styles = generateDesignerStyles(1000);
      
      // Intern all styles
      for (const style of styles) {
        cache.intern(style);
      }
      
      const metrics = cache.getMetrics();
      
      console.log('[Buckets] Cache size:', metrics.cacheSize);
      console.log('[Buckets] Bucket count:', metrics.bucketCount);
      console.log('[Buckets] Max depth:', metrics.maxBucketDepth);
      console.log('[Buckets] Avg depth:', (metrics.cacheSize / metrics.bucketCount).toFixed(2));
      console.log('[Buckets] Collision rate:', (metrics.collisionCount / metrics.missCount * 100).toFixed(2) + '%');
      
      expect(metrics.maxBucketDepth).toBeLessThanOrEqual(3);
      expect(metrics.collisionCount / metrics.missCount).toBeLessThan(0.05); // <5%
    });
  });
});

// ============================================================================
// Test Fixtures (reuse from hash benchmark)
// ============================================================================

function generateTypicalStyles(count: number): CellStyle[] {
  const styles: CellStyle[] = [];
  
  styles.push({});
  styles.push({ bold: true });
  styles.push({ italic: true });
  styles.push({ underline: true });
  
  for (let size = 10; size <= 18; size += 2) {
    styles.push({ fontSize: size });
  }
  
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  for (const color of colors) {
    styles.push({ color });
    styles.push({ fill: color });
  }
  
  styles.push({ bold: true, fontSize: 14 });
  styles.push({ bold: true, color: '#FF0000' });
  styles.push({ bold: true, fill: '#FFFF00' });
  styles.push({ italic: true, color: '#0000FF' });
  
  styles.push({ align: 'left' });
  styles.push({ align: 'center' });
  styles.push({ align: 'right' });
  styles.push({ valign: 'top' });
  styles.push({ valign: 'middle' });
  styles.push({ valign: 'bottom' });
  
  styles.push({ numberFormat: '#,##0' });
  styles.push({ numberFormat: '#,##0.00' });
  styles.push({ numberFormat: '$#,##0.00' });
  styles.push({ numberFormat: '0%' });
  
  styles.push({
    border: {
      top: '#000000',
      bottom: '#000000',
    },
  });
  
  return styles.slice(0, count);
}

function generateDesignerStyles(count: number): CellStyle[] {
  const styles: CellStyle[] = [];
  
  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana'];
  const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];
  const aligns = ['left', 'center', 'right'] as const;
  const valigns = ['top', 'middle', 'bottom'] as const;
  
  for (let i = 0; i < count; i++) {
    const style: CellStyle = {};
    
    if (i % 5 === 0) style.bold = true;
    if (i % 7 === 0) style.italic = true;
    if (i % 11 === 0) style.underline = true;
    
    const colorValue = (i * 137) % 16777216;
    style.color = `#${colorValue.toString(16).padStart(6, '0')}`;
    
    if (i % 3 === 0) {
      const fillValue = (i * 179) % 16777216;
      style.fill = `#${fillValue.toString(16).padStart(6, '0')}`;
    }
    
    style.fontFamily = fonts[i % fonts.length];
    style.fontSize = sizes[i % sizes.length];
    
    if (i % 2 === 0) {
      style.align = aligns[i % aligns.length];
    }
    if (i % 3 === 0) {
      style.valign = valigns[i % valigns.length];
    }
    
    if (i % 13 === 0) {
      style.rotation = (i * 7) % 180;
    }
    
    if (i % 4 === 0) {
      const formats = ['#,##0', '#,##0.00', '0%', '0.00%', '$#,##0.00'];
      style.numberFormat = formats[i % formats.length];
    }
    
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
