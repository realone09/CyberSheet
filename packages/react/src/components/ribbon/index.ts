/**
 * Excel 365-like Ribbon UI Components
 * 
 * Production-level implementation matching Excel Online exactly:
 * - Fluent UI icons (@fluentui/react-icons)
 * - Exact color palette extracted from Excel
 * - Proper component abstractions (no maintenance chaos)
 * - Command Pattern integration with @cyber-sheet/core
 * - WCAG 2.1 AA accessibility compliance
 * 
 * Implementation Status:
 * ✅ Phase 1, Week 1: Undo/Redo + Font Formatting + Font Color Picker
 * 
 * Usage:
 * ```tsx
 * import { Ribbon } from '@cyber-sheet/react/components/ribbon';
 * 
 * <Ribbon 
 *   commandManager={workbook.commandManager} 
 *   selection={getCurrentSelection()} 
 * />
 * ```
 */

// Main components
export { Ribbon, type RibbonProps } from './Ribbon';
export { HomeTab, type HomeTabProps } from './HomeTab';

// Building blocks
export { RibbonButton, type RibbonButtonProps } from './RibbonButton';
export { RibbonGroup, type RibbonGroupProps } from './RibbonGroup';
export { RibbonSelect, type RibbonSelectProps } from './RibbonSelect';
export { RibbonRow, type RibbonRowProps } from './RibbonRow';

// Color picker components
export { FontColorButton, type FontColorButtonProps } from './FontColorButton';
export { FillColorButton, type FillColorButtonProps } from './FillColorButton';
export { BorderButton, type BorderButtonProps } from './BorderButton';
export { ColorGrid, type ColorGridProps } from './ColorGrid';
export { ColorDropdown, type ColorDropdownProps } from './ColorDropdown';
export { PatternGrid, type PatternGridProps } from './PatternGrid';
export { LineStyleGrid, type LineStyleGridProps } from './LineStyleGrid';
export { BorderPresetGrid, type BorderPresetGridProps } from './BorderPresetGrid';
export { BorderDropdown, type BorderDropdownProps } from './BorderDropdown';

// Hooks
export { useRecentColors } from './hooks/useRecentColors';
export { useRecentFills } from './hooks/useRecentFills';

// Utilities
export { resolveColor, isValidHexColor, normalizeColor, isMixedState, getDisplayColor } from './colorUtils';
export { resolveFill, isMixedFill, getDisplayFill, fillEquals, serializeFill, deserializeFill, getPrimaryColor } from './fillUtils';
export { resolveBorder, borderEquals, serializeBorder, deserializeBorder, isMixedBorder, getDisplayBorder, getBorderColor, withBorderColor, withBorderStyle, getBorderOperationDescription } from './borderUtils';

// Constants
export { THEME_COLORS, STANDARD_COLORS, AUTOMATIC_COLOR, NO_FILL_COLOR } from './colors';
export { PATTERN_TYPES, GRADIENT_PRESETS, NO_FILL, solidFill, patternFill, gradientFill, isSolidFill, isPatternFill, isGradientFill } from './fillTypes';
export { LINE_STYLES, BORDER_PRESETS, borderValue, getDefaultBorder, getPresetById, resolvePreset, getLineStyleMetadata } from './borderTypes';
export type { Fill, PatternType, GradientStop, GradientDirection, PatternMetadata } from './fillTypes';
export type { BorderStyle, BorderPosition, BorderPreset, BorderValue, BorderPayload, BorderPresetConfig } from './borderTypes';

// Types
export type {
  ColorValue,
  StyleState,
  FontColorCommand,
  FillColorCommand,
  BorderCommand,
  SelectionState,
  CommandManager,
} from './types';

    }
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  execute(command: any) {
    this.undoStack.push(command.toString());
    this.redoStack = [];
    console.log('Execute:', command);
  }
}

export const App: React.FC = () => {
  const [commandManager] = useState(() => new MockCommandManager());
  
  const [selection, setSelection] = useState({
    fontFamily: 'Calibri',
    fontSize: 11,
    bold: false,
    italic: false,
    underline: false,
  });

  // Simulate selection changes (for testing active states)
  const toggleBold = useCallback(() => {
    setSelection((prev) => ({ ...prev, bold: !prev.bold }));
  }, []);

  const toggleItalic = useCallback(() => {
    setSelection((prev) => ({ ...prev, italic: !prev.italic }));
  }, []);

  const toggleUnderline = useCallback(() => {
    setSelection((prev) => ({ ...prev, underline: !prev.underline }));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fff' }}>
      <Ribbon commandManager={commandManager} selection={selection} />
      
      {/* Demo Controls */}
      <div style={{ padding: '20px' }}>
        <h2>Excel 365 Ribbon Demo</h2>
        <p>Phase 1, Week 1: Undo/Redo + Font Formatting</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Current Selection:</h3>
          <pre>{JSON.stringify(selection, null, 2)}</pre>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Test Controls:</h3>
          <button onClick={toggleBold}>Toggle Bold</button>
          <button onClick={toggleItalic} style={{ marginLeft: '8px' }}>
            Toggle Italic
          </button>
          <button onClick={toggleUnderline} style={{ marginLeft: '8px' }}>
            Toggle Underline
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Next Steps:</h3>
          <ul>
            <li>✅ Ribbon infrastructure complete</li>
            <li>✅ Undo/Redo buttons functional</li>
            <li>✅ Font dropdowns complete</li>
            <li>✅ Bold/Italic/Underline buttons with active states</li>
            <li>⏳ Connect to real CommandManager from @cyber-sheet/core</li>
            <li>⏳ Add Font Color picker</li>
            <li>⏳ Add Grow/Shrink font buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
