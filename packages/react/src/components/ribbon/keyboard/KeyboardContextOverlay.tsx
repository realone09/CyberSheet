/**
 * KeyboardContextOverlay - Live Context Visualization
 * 
 * PURPOSE: Remove guesswork from keyboard system debugging
 * 
 * DISPLAYS:
 * - Current interaction context (grid, cell-edit, ribbon, etc.)
 * - Context lock status
 * - Active shortcut (last pressed key)
 * - Shortcut resolution path
 * - Performance metrics
 * 
 * USAGE:
 * ```tsx
 * import { KeyboardContextOverlay } from '@cyber-sheet/react/components/ribbon';
 * 
 * <KeyboardContextOverlay
 *   enabled={process.env.NODE_ENV === 'development'}
 *   position="bottom-right"
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import type { InteractionContext } from './types';
import { contextResolver } from './ContextResolver';
import { shortcutRegistry } from './ShortcutRegistry';

export interface KeyboardContextOverlayProps {
  /** Enable overlay (default: false) */
  enabled?: boolean;
  
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /** Opacity (0-1) */
  opacity?: number;
}

interface OverlayState {
  currentContext: InteractionContext;
  contextLocked: boolean;
  lastKey: string | null;
  lastShortcutId: string | null;
  lastShortcutLabel: string | null;
  lastExecutionTime: number | null;
  totalShortcuts: number;
}

/**
 * Live keyboard context overlay
 */
export const KeyboardContextOverlay: React.FC<KeyboardContextOverlayProps> = ({
  enabled = false,
  position = 'bottom-right',
  opacity = 0.9,
}) => {
  const [state, setState] = useState<OverlayState>({
    currentContext: 'grid',
    contextLocked: false,
    lastKey: null,
    lastShortcutId: null,
    lastShortcutLabel: null,
    lastExecutionTime: null,
    totalShortcuts: 0,
  });

  // Use ref to avoid stale closure in interval/event handler
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!enabled) return;

    // Poll context at 60fps for real-time updates
    const interval = setInterval(() => {
      const context = contextResolver.getCurrentContext();
      const shortcuts = shortcutRegistry.getAllShortcuts();

      setState({
        ...stateRef.current,
        currentContext: context,
        totalShortcuts: shortcuts.length,
      });
    }, 16); // ~60fps

    // Listen for keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey ? 'Ctrl' : '',
        event.shiftKey ? 'Shift' : '',
        event.altKey ? 'Alt' : '',
        event.key,
      ].filter(Boolean).join('+');

      setState({
        ...stateRef.current,
        lastKey: key,
      });
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 16, left: 16 },
    'top-right': { top: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.6',
    zIndex: 999999,
    pointerEvents: 'none',
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    minWidth: '240px',
  };

  const labelStyle: React.CSSProperties = {
    color: '#888',
    marginRight: '8px',
  };

  const valueStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 600,
  };

  const contextColors: Record<InteractionContext, string> = {
    'grid': '#4CAF50',
    'cell-edit': '#FF9800',
    'formula-bar': '#2196F3',
    'ribbon': '#9C27B0',
    'dialog': '#F44336',
  };

  const contextColor = contextColors[state.currentContext] || '#888';

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
        🎹 Keyboard Context
      </div>

      <div style={{ marginBottom: '4px' }}>
        <span style={labelStyle}>Context:</span>
        <span style={{ ...valueStyle, color: contextColor }}>
          {state.currentContext.toUpperCase()}
        </span>
        {state.contextLocked && (
          <span style={{ marginLeft: '8px', color: '#F44336', fontSize: '10px' }}>
            🔒 LOCKED
          </span>
        )}
      </div>

      {state.lastKey && (
        <div style={{ marginBottom: '4px' }}>
          <span style={labelStyle}>Last Key:</span>
          <span style={{ ...valueStyle, color: '#FFC107' }}>
            {state.lastKey}
          </span>
        </div>
      )}

      {state.lastShortcutLabel && (
        <div style={{ marginBottom: '4px' }}>
          <span style={labelStyle}>Shortcut:</span>
          <span style={{ ...valueStyle, color: '#4CAF50' }}>
            {state.lastShortcutLabel}
          </span>
        </div>
      )}

      {state.lastExecutionTime !== null && (
        <div style={{ marginBottom: '4px' }}>
          <span style={labelStyle}>Exec Time:</span>
          <span style={{ ...valueStyle, color: state.lastExecutionTime > 10 ? '#FF9800' : '#4CAF50' }}>
            {state.lastExecutionTime.toFixed(2)}ms
          </span>
        </div>
      )}

      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <span style={{ ...labelStyle, fontSize: '10px' }}>Total Shortcuts:</span>
        <span style={{ ...valueStyle, fontSize: '10px' }}>
          {state.totalShortcuts}
        </span>
      </div>
    </div>
  );
};

/**
 * Simplified overlay for production debugging
 * Shows only critical info
 */
export const KeyboardContextBadge: React.FC<{ enabled?: boolean }> = ({ enabled = false }) => {
  const [context, setContext] = useState<InteractionContext>('grid');

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setContext(contextResolver.getCurrentContext());
    }, 100);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const colors: Record<InteractionContext, string> = {
    'grid': '#4CAF50',
    'cell-edit': '#FF9800',
    'formula-bar': '#2196F3',
    'ribbon': '#9C27B0',
    'dialog': '#F44336',
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    top: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: colors[context],
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    zIndex: 999999,
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  };

  return <div style={style}>{context}</div>;
};
