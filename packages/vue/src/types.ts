/**
 * types.ts
 * 
 * TypeScript type definitions for Vue components
 */

import type { UseCyberSheetOptions } from './useCyberSheet';

export interface CyberSheetProps extends UseCyberSheetOptions {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: Record<string, any>;
}
