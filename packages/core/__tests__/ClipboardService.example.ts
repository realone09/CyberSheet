/**
 * ClipboardService Payload Example
 * 
 * Demonstration of a clipboard payload structure.
 */

import { ClipboardService } from '../src/ClipboardService';
import { Worksheet } from '../src/worksheet';

// Create test worksheet
const ws = new Worksheet('Demo', 100, 26);

// Set up sample data
ws.setCellValue({ row: 5, col: 5 }, 'Name');
ws.setCellStyle({ row: 5, col: 5 }, { bold: true, color: '#0000FF' });

ws.setCellValue({ row: 5, col: 6 }, 'Value');
ws.setCellStyle({ row: 5, col: 6 }, { bold: true });

ws.setCellValue({ row: 6, col: 5 }, 'Alice');
ws.setCellFormula({ row: 6, col: 6 }, '=B1*2');

// Create clipboard service
const clipboard = new ClipboardService();

// Copy range
const payload = clipboard.copy(ws, {
  start: { row: 5, col: 5 },
  end: { row: 6, col: 6 }
});

// Display payload structure
console.log('Clipboard Payload Example:');
console.log(JSON.stringify(payload, null, 2));

/**
 * Expected output:
 * {
 *   "sourceRange": { "start": { "row": 5, "col": 5 }, "end": { "row": 6, "col": 6 } },
 *   "width": 2,
 *   "height": 2,
 *   "cells": [
 *     {
 *       "rowOffset": 0,
 *       "colOffset": 0,
 *       "value": "Name",
 *       "style": { "bold": true, "color": "#0000FF" }
 *     },
 *     {
 *       "rowOffset": 0,
 *       "colOffset": 1,
 *       "value": "Value",
 *       "style": { "bold": true }
 *     },
 *     {
 *       "rowOffset": 1,
 *       "colOffset": 0,
 *       "value": "Alice"
 *     },
 *     {
 *       "rowOffset": 1,
 *       "colOffset": 1,
 *       "value": null,
 *       "formula": "B1*2"
 *     }
 *   ],
 *   "isCut": false
 * }
 */
