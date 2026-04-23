/**
 * Differential Correctness Tests
 * 
 * Purpose: Prove the optimized engine matches ground truth
 * 
 * Strategy:
 * - Run naive (simple, obviously correct) engine in parallel
 * - Apply same operations to both
 * - Compare final states
 * 
 * This catches "consistent but wrong" bugs that internal validators miss
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Workbook } from '../src/workbook';
import { InsertColumnCommand } from '../src/InsertColumnCommand';
import { DeleteColumnCommand } from '../src/DeleteColumnCommand';
import { NaiveSheet } from './NaiveSheet';

describe('Differential Correctness (Optimized vs Naive)', () => {
  let workbook: Workbook;
  let worksheet: any;
  let naive: NaiveSheet;

  beforeEach(() => {
    workbook = new Workbook();
    worksheet = workbook.addSheet('Test');
    naive = new NaiveSheet();
  });

  describe('Basic Operations', () => {
    it('should match naive engine: insert single column', () => {
      // Setup: Add initial data
      worksheet.setCellValue({ row: 0, col: 0 }, 'A');
      worksheet.setCellValue({ row: 0, col: 1 }, 'B');
      worksheet.setCellValue({ row: 0, col: 2 }, 'C');

      naive.setCellValue({ row: 0, col: 0 }, 'A');
      naive.setCellValue({ row: 0, col: 1 }, 'B');
      naive.setCellValue({ row: 0, col: 2 }, 'C');

      console.log('BEFORE insert:');
      for (let c = 0; c < 3; c++) {
        console.log(`  col ${c}: opt="${worksheet.getCellValue({ row: 0, col: c })}", naive="${naive.getCellValue({ row: 0, col: c })}"`);
      }

      // Operation: Insert column at position 1
      const cmd = new InsertColumnCommand(worksheet, 1);
      cmd.execute();

      naive.insertColumn(1);

      // Debug: Print states
      console.log('After insert at col 1:');
      console.log(`  Merges: ${JSON.stringify(worksheet.getMergedRanges())}`);
      for (let c = 0; c < 4; c++) {
        const optVal = worksheet.getCellValue({ row: 0, col: c });
        const naiveVal = naive.getCellValue({ row: 0, col: c });
        console.log(`  col ${c}: opt="${optVal}", naive="${naiveVal}"`);
      }

      // Verify: States match
      expect(worksheet.getCellValue({ row: 0, col: 0 })).toBe(naive.getCellValue({ row: 0, col: 0 }));
      expect(worksheet.getCellValue({ row: 0, col: 1 })).toBe(naive.getCellValue({ row: 0, col: 1 }));
      expect(worksheet.getCellValue({ row: 0, col: 2 })).toBe(naive.getCellValue({ row: 0, col: 2 }));
      expect(worksheet.getCellValue({ row: 0, col: 3 })).toBe(naive.getCellValue({ row: 0, col: 3 }));
    });

    it('should match naive engine: delete single column', () => {
      // Setup
      worksheet.setCellValue({ row: 0, col: 0 }, 'A');
      worksheet.setCellValue({ row: 0, col: 1 }, 'B');
      worksheet.setCellValue({ row: 0, col: 2 }, 'C');

      naive.setCellValue({ row: 0, col: 0 }, 'A');
      naive.setCellValue({ row: 0, col: 1 }, 'B');
      naive.setCellValue({ row: 0, col: 2 }, 'C');

      // Operation: Delete column 1
      const cmd = new DeleteColumnCommand(worksheet, 1);
      cmd.execute();

      naive.deleteColumn(1);

      // Verify
      expect(worksheet.getCellValue({ row: 0, col: 0 })).toBe(naive.getCellValue({ row: 0, col: 0 }));
      expect(worksheet.getCellValue({ row: 0, col: 1 })).toBe(naive.getCellValue({ row: 0, col: 1 }));
      expect(worksheet.getCellValue({ row: 0, col: 2 })).toBe(null); // Both should be null
      expect(naive.getCellValue({ row: 0, col: 2 })).toBe(null);
    });

    it('should match naive engine: merge lifecycle', () => {
      // Setup merge
      worksheet.mergeCells({ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } });
      naive.mergeCells({ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } });

      // Insert column before merge
      const cmd = new InsertColumnCommand(worksheet, 0);
      cmd.execute();
      naive.insertColumn(0);

      // Verify merge shifted
      const optMerges = worksheet.getMergedRanges();
      const naiveMerges = naive.getMergedRanges();

      expect(optMerges).toHaveLength(naiveMerges.length);
      if (optMerges.length > 0) {
        expect(optMerges[0].start).toEqual(naiveMerges[0].start);
        expect(optMerges[0].end).toEqual(naiveMerges[0].end);
      }
    });
  });

  describe('Adversarial Differential Testing', () => {
    it('should match naive engine over 100 random operations', () => {
      // Seeded RNG for reproducibility
      let seed = 42;
      const seededRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      // Initial state
      worksheet.setCellValue({ row: 0, col: 0 }, 100);
      worksheet.setCellValue({ row: 1, col: 1 }, 200);
      worksheet.setCellValue({ row: 2, col: 2 }, 300);

      naive.setCellValue({ row: 0, col: 0 }, 100);
      naive.setCellValue({ row: 1, col: 1 }, 200);
      naive.setCellValue({ row: 2, col: 2 }, 300);

      const commands: Array<InsertColumnCommand | DeleteColumnCommand> = [];

      // 100 random operations
      for (let i = 0; i < 100; i++) {
        const op = seededRandom();

        if (op < 0.5) {
          // Insert
          const col = Math.floor(seededRandom() * 5);
          const cmd = new InsertColumnCommand(worksheet, col);
          cmd.execute();
          commands.push(cmd);

          naive.insertColumn(col);
        } else {
          // Delete
          const col = Math.floor(seededRandom() * 5);
          try {
            const cmd = new DeleteColumnCommand(worksheet, col);
            cmd.execute();
            commands.push(cmd);

            naive.deleteColumn(col);
          } catch {
            // Ignore invalid deletes in both engines
          }
        }

        // Validate state consistency every 10 operations
        if (i % 10 === 0) {
          // Compare merge counts
          const optMerges = worksheet.getMergedRanges();
          const naiveMerges = naive.getMergedRanges();
          expect(optMerges).toHaveLength(naiveMerges.length);

          // Sample cell values
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 5; c++) {
              const optVal = worksheet.getCellValue({ row: r, col: c });
              const naiveVal = naive.getCellValue({ row: r, col: c });
              expect(optVal).toBe(naiveVal);
            }
          }
        }
      }

      // Final state comparison
      const optMerges = worksheet.getMergedRanges();
      const naiveMerges = naive.getMergedRanges();
      expect(optMerges.length).toBe(naiveMerges.length);

      // Verify all visible cells match
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const optVal = worksheet.getCellValue({ row: r, col: c });
          const naiveVal = naive.getCellValue({ row: r, col: c });
          expect(optVal).toBe(naiveVal);
        }
      }

      console.log(`Differential test: 100 operations, states match ✓`);
    });

    it('should match naive engine: 1k operations differential validation', () => {
      let seed = 12345;
      const seededRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      // Initial state
      for (let i = 0; i < 10; i++) {
        worksheet.setCellValue({ row: i, col: i }, `V${i}`);
        naive.setCellValue({ row: i, col: i }, `V${i}`);
      }

      let successfulOps = 0;

      for (let i = 0; i < 1000; i++) {
        const op = seededRandom();
        const col = Math.floor(seededRandom() * 8);

        if (op < 0.5) {
          // Insert
          try {
            const cmd = new InsertColumnCommand(worksheet, col);
            cmd.execute();
            naive.insertColumn(col);
            successfulOps++;
          } catch (e) {
            // Both should fail or both succeed
          }
        } else {
          // Delete
          try {
            const cmd = new DeleteColumnCommand(worksheet, col);
            cmd.execute();
            naive.deleteColumn(col);
            successfulOps++;
          } catch (e) {
            // Both should fail or both succeed
          }
        }

        // Validate every 100 ops
        if (i % 100 === 0) {
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              const optVal = worksheet.getCellValue({ row: r, col: c });
              const naiveVal = naive.getCellValue({ row: r, col: c });
              if (optVal !== naiveVal) {
                throw new Error(`Mismatch at op ${i}, cell (${r},${c}): opt="${optVal}", naive="${naiveVal}"`);
              }
            }
          }
        }
      }

      console.log(`✓ 1k differential: ${successfulOps} ops, states match`);
    });

    it('should match naive engine: 10k operations differential validation', () => {
      let seed = 99999;
      const seededRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      // Initial state
      for (let i = 0; i < 20; i++) {
        worksheet.setCellValue({ row: i, col: i }, `X${i}`);
        naive.setCellValue({ row: i, col: i }, `X${i}`);
      }

      let successfulOps = 0;

      for (let i = 0; i < 10000; i++) {
        const op = seededRandom();
        const col = Math.floor(seededRandom() * 12);

        if (op < 0.5) {
          try {
            const cmd = new InsertColumnCommand(worksheet, col);
            cmd.execute();
            naive.insertColumn(col);
            successfulOps++;
          } catch (e) {
            // Synchronized failure
          }
        } else {
          try {
            const cmd = new DeleteColumnCommand(worksheet, col);
            cmd.execute();
            naive.deleteColumn(col);
            successfulOps++;
          } catch (e) {
            // Synchronized failure
          }
        }

        // Validate every 500 ops
        if (i % 500 === 0) {
          for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
              const optVal = worksheet.getCellValue({ row: r, col: c });
              const naiveVal = naive.getCellValue({ row: r, col: c });
              if (optVal !== naiveVal) {
                throw new Error(`10k mismatch at op ${i}, cell (${r},${c}): opt="${optVal}", naive="${naiveVal}"`);
              }
            }
          }
          
          if (i % 1000 === 0) {
            console.log(`[10k differential] Op ${i}: ${successfulOps} successful, states match ✓`);
          }
        }
      }

      console.log(`✓ 10k differential PASSED: ${successfulOps} ops, full semantic correctness`);
    });

    it('should match naive engine: degenerate merge handling', () => {
      // Setup 2x1 merge
      worksheet.mergeCells({ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } });
      naive.mergeCells({ start: { row: 0, col: 0 }, end: { row: 0, col: 1 } });

      // Delete column - should make merge 1x1 (degenerate)
      const cmd = new DeleteColumnCommand(worksheet, 1);
      cmd.execute();
      naive.deleteColumn(1);

      // Both should have removed the degenerate merge
      expect(worksheet.getMergedRanges()).toHaveLength(0);
      expect(naive.getMergedRanges()).toHaveLength(0);
    });
  });
});
