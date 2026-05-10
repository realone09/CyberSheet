/**
 * ReviewTab.tsx
 *
 * Review Tab - Main shell integrating all review groups
 * Groups: Proofing | Accessibility | Comments | Changes | Protect | Ink
 */

import React from 'react';
import type { Workbook, Address } from '@cyber-sheet/core';
import { ProofingGroup } from './ProofingGroup';
import { AccessibilityGroup } from './AccessibilityGroup';
import { CommentsGroup } from './CommentsGroup';
import { ChangesGroup } from './ChangesGroup';
import { ProtectGroup } from './ProtectGroup';
import { InkGroup } from './InkGroup';

interface ReviewTabProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  workbook,
  selectedCells,
  onCommand,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        background: '#F0F0F0',
        padding: '8px 12px',
        borderBottom: '1px solid #D9D9D9',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* Proofing Group */}
      <ProofingGroup
        workbook={workbook}
        onCommand={onCommand}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Accessibility Group */}
      <AccessibilityGroup
        workbook={workbook}
        onCommand={onCommand}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Comments Group */}
      <CommentsGroup
        workbook={workbook}
        selectedCells={selectedCells}
        onCommand={onCommand}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Changes Group */}
      <ChangesGroup
        workbook={workbook}
        selectedCells={selectedCells}
        onCommand={onCommand}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Protect Group */}
      <ProtectGroup
        workbook={workbook}
        onCommand={onCommand}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 64, background: '#D9D9D9', margin: '4px 0' }} />

      {/* Ink Group */}
      <InkGroup
        workbook={workbook}
        onCommand={onCommand}
      />
    </div>
  );
};
