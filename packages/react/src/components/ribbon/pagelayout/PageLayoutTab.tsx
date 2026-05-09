/**
 * PageLayoutTab.tsx
 *
 * Page Layout Tab - Main Component
 * Assembles all Page Layout groups: Themes, Page Setup, Scale to Fit, Sheet Options
 */

import React from 'react';
import { ThemesGroup } from './ThemesGroup';
import { PageSetupGroup } from './PageSetupGroup';
import { ScaleToFitGroup } from './ScaleToFitGroup';
import { SheetOptionsGroup } from './SheetOptionsGroup';

export interface PageLayoutTabProps {
  // Themes Group
  onThemeChange?: (theme: string) => void;
  onColorsChange?: (colors: string) => void;
  onFontsChange?: () => void;
  onEffectsChange?: () => void;

  // Page Setup Group
  onMarginsChange?: (margins: string) => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onSizeChange?: (size: string) => void;
  onPrintAreaSet?: () => void;
  onBreaksInsert?: (breakType: 'page' | 'remove') => void;
  onBackgroundSet?: () => void;
  onPrintTitlesSet?: () => void;

  // Scale to Fit Group
  onWidthChange?: (width: number | 'auto') => void;
  onHeightChange?: (height: number | 'auto') => void;
  onScaleChange?: (scale: number) => void;

  // Sheet Options Group
  onGridlinesViewChange?: (visible: boolean) => void;
  onGridlinesPrintChange?: (print: boolean) => void;
  onHeadingsViewChange?: (visible: boolean) => void;
  onHeadingsPrintChange?: (print: boolean) => void;
}

export const PageLayoutTab: React.FC<PageLayoutTabProps> = (props) => {
  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 0,
    padding: '8px 0',
    background: '#F9F9F9',
    borderBottom: '1px solid #D1D1D1',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    background: '#D1D1D1',
    margin: '4px 0',
  };

  return (
    <div style={tabContainerStyle}>
      {/* Themes Group */}
      <ThemesGroup
        onThemeChange={props.onThemeChange}
        onColorsChange={props.onColorsChange}
        onFontsChange={props.onFontsChange}
        onEffectsChange={props.onEffectsChange}
      />

      <div style={dividerStyle} />

      {/* Page Setup Group */}
      <PageSetupGroup
        onMarginsChange={props.onMarginsChange}
        onOrientationChange={props.onOrientationChange}
        onSizeChange={props.onSizeChange}
        onPrintAreaSet={props.onPrintAreaSet}
        onBreaksInsert={props.onBreaksInsert}
        onBackgroundSet={props.onBackgroundSet}
        onPrintTitlesSet={props.onPrintTitlesSet}
      />

      <div style={dividerStyle} />

      {/* Scale to Fit Group */}
      <ScaleToFitGroup
        onWidthChange={props.onWidthChange}
        onHeightChange={props.onHeightChange}
        onScaleChange={props.onScaleChange}
      />

      <div style={dividerStyle} />

      {/* Sheet Options Group */}
      <SheetOptionsGroup
        onGridlinesViewChange={props.onGridlinesViewChange}
        onGridlinesPrintChange={props.onGridlinesPrintChange}
        onHeadingsViewChange={props.onHeadingsViewChange}
        onHeadingsPrintChange={props.onHeadingsPrintChange}
      />
    </div>
  );
};
