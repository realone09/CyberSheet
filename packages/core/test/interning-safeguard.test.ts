/**
 * Interning Safeguard Tests
 * 
 * Validates Symbol-based safeguard prevents non-interned styles.
 * Protects against ecosystem integration drift during React/XLSX/toolbar integration.
 * 
 * Dev mode only (zero production cost).
 */

import { StyleCache, isInternedStyle, assertInternedStyle } from '../src/StyleCache';
import type { CellStyle } from '../src/types';

describe('Interning Safeguard', () => {
  let cache: StyleCache;

  beforeEach(() => {
    cache = new StyleCache();
  });

  describe('isInternedStyle()', () => {
    it('should return true for interned styles', () => {
      const style = cache.intern({ bold: true });
      
      expect(isInternedStyle(style)).toBe(true);
    });

    it('should return false for non-interned styles', () => {
      const style: CellStyle = { bold: true };
      
      expect(isInternedStyle(style)).toBe(false);
    });

    it('should return true for undefined (valid case)', () => {
      expect(isInternedStyle(undefined)).toBe(true);
    });

    it('should detect interned styles with Phase 1 properties', () => {
      const style = cache.intern({
        bold: true,
        strikethrough: true,
        superscript: true,
        indent: 5,
      });
      
      expect(isInternedStyle(style)).toBe(true);
    });

    it('should detect non-interned Phase 1 properties', () => {
      const style: CellStyle = {
        strikethrough: true,
        superscript: true,
      };
      
      expect(isInternedStyle(style)).toBe(false);
    });
  });

  describe('assertInternedStyle() - Dev Mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Force dev mode
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not throw for interned styles', () => {
      const style = cache.intern({ bold: true });
      
      expect(() => {
        assertInternedStyle(style, 'test');
      }).not.toThrow();
    });

    it('should not throw for undefined (valid case)', () => {
      expect(() => {
        assertInternedStyle(undefined, 'test');
      }).not.toThrow();
    });

    it('should throw for non-interned styles in dev mode', () => {
      const style: CellStyle = { bold: true };
      
      expect(() => {
        assertInternedStyle(style, 'CanvasRenderer.render');
      }).toThrow(/Non-interned style detected/);
      
      expect(() => {
        assertInternedStyle(style, 'CanvasRenderer.render');
      }).toThrow(/StyleCache\.intern\(\)/);
    });

    it('should throw for UI-created styles (common anti-pattern)', () => {
      // Simulate UI layer creating style directly (FORBIDDEN)
      const uiStyle: CellStyle = {
        bold: true,
        fontSize: 12,
        color: '#FF0000',
      };
      
      expect(() => {
        assertInternedStyle(uiStyle, 'ReactToolbar.applyBold');
      }).toThrow(/Non-interned style/);
    });

    it('should throw for spread operator styles (common anti-pattern)', () => {
      const originalStyle = cache.intern({ fontSize: 12 });
      
      // This is FORBIDDEN: spreading bypasses StyleCache
      const patchedStyle = { ...originalStyle, bold: true };
      
      expect(() => {
        assertInternedStyle(patchedStyle, 'ToolbarButton.onClick');
      }).toThrow(/Non-interned style/);
    });

    it('should include context in error message', () => {
      const style: CellStyle = { bold: true };
      
      try {
        assertInternedStyle(style, 'XlsxImporter.parseStyle');
        fail('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('XlsxImporter.parseStyle');
        expect(err.message).toContain('StyleCache.intern()');
        expect(err.message).toContain('canonical references');
      }
    });
  });

  describe('assertInternedStyle() - Production Mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Force production mode
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should NOT throw in production (zero runtime cost)', () => {
      const style: CellStyle = { bold: true }; // Non-interned
      
      // In production, safeguard is disabled for performance
      expect(() => {
        assertInternedStyle(style, 'CanvasRenderer.render');
      }).not.toThrow();
    });
  });

  describe('Integration: Correct UI Pattern', () => {
    it('should demonstrate correct read → patch → intern → assign pattern', () => {
      // Simulate cell with existing style
      const currentStyle = cache.intern({ fontSize: 12, bold: false });
      
      // ✅ CORRECT: UI constructs delta, interns through cache
      const patch = { ...currentStyle, bold: true }; // delta only
      const newStyle = cache.intern(patch); // canonical reference
      
      // Validate: newStyle is interned
      expect(isInternedStyle(newStyle)).toBe(true);
      
      // Validate: identity preserved
      const sameStyle = cache.intern({ fontSize: 12, bold: true });
      expect(newStyle === sameStyle).toBe(true);
    });

    it('should demonstrate forbidden patterns', () => {
      const currentStyle = cache.intern({ fontSize: 12 });
      
      // ❌ FORBIDDEN: Direct mutation
      // currentStyle.bold = true; // TypeScript error (frozen)
      
      // ❌ FORBIDDEN: Spread without intern
      const badStyle = { ...currentStyle, bold: true };
      expect(isInternedStyle(badStyle)).toBe(false);
      
      // ❌ FORBIDDEN: UI creates full style from scratch
      const uiStyle: CellStyle = { fontSize: 12, bold: true };
      expect(isInternedStyle(uiStyle)).toBe(false);
    });
  });

  describe('Symbol Property Characteristics', () => {
    it('should not affect hashing or equality', () => {
      const style1 = cache.intern({ bold: true });
      const style2 = cache.intern({ bold: true });
      
      // Identity preserved (Symbol doesn't fragment cache)
      expect(style1 === style2).toBe(true);
    });

    it('should not be enumerable', () => {
      const style = cache.intern({ bold: true, fontSize: 12 });
      
      // Symbol should not appear in enumeration
      const keys = Object.keys(style);
      expect(keys).toEqual(['bold', 'fontSize']);
      expect(keys).not.toContain(Symbol.for('__cyber_sheet_interned__'));
    });

    it('should not affect JSON serialization', () => {
      const style = cache.intern({ bold: true, fontSize: 12 });
      
      // Symbol should not appear in JSON
      const json = JSON.stringify(style);
      expect(json).toBe('{"bold":true,"fontSize":12}');
    });

    it('should be frozen (immutable)', () => {
      const style = cache.intern({ bold: true });
      
      // Cannot modify Symbol property
      expect(() => {
        (style as any)[Symbol.for('__cyber_sheet_interned__')] = false;
      }).toThrow();
    });
  });
});
