/**
 * TitleBar.tsx
 * 
 * Excel-style title bar with quick access toolbar and window controls
 */

import { TitleBarIcon6, TitleBarIcon5, TitleBarIcon4, TitleBarIcon3, TitleBarIcon2, TitleBarIcon1 } from '@cyber-sheet/icons/react';
import React, { useState } from 'react';

export interface TitleBarProps {
  fileName?: string;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  autoSave?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
}

/**
 * TitleBar - Excel application title bar
 * 
 * Features:
 * - Excel icon
 * - Quick Access Toolbar (Save, Undo, Redo)
 * - File name display
 * - Search button
 * - Share button
 * - User avatar
 * - Window controls
 */
export const TitleBar: React.FC<TitleBarProps> = ({
  fileName = 'Book1 - Excel',
  onSave,
  onUndo,
  onRedo,
  onMinimize,
  onMaximize,
  onClose,
  autoSave = false,
  onAutoSaveToggle,
}) => {
  const [isAutoSave, setIsAutoSave] = useState(autoSave);

  const handleAutoSaveToggle = () => {
    const newValue = !isAutoSave;
    setIsAutoSave(newValue);
    onAutoSaveToggle?.(newValue);
  };

  return (
    <header className="title-bar">
      <div className="title-bar-left">
        {/* Excel Icon */}
        <button className="title-btn" title="File">
          <TitleBarIcon1 />
        </button>

        {/* Quick Access Toolbar */}
        <div className="quick-access-toolbar">
          {/* AutoSave Toggle */}
          <button 
            className="qat-btn" 
            title="AutoSave"
            onClick={handleAutoSaveToggle}
          >
            <span className={`toggle-switch ${isAutoSave ? 'active' : ''}`}></span>
            <span className="qat-label">AutoSave</span>
          </button>

          {/* Save */}
          <button className="qat-btn" title="Save" onClick={onSave}>
            <TitleBarIcon2 />
          </button>

          {/* Undo */}
          <button className="qat-btn" title="Undo (Ctrl+Z)" onClick={onUndo}>
            <TitleBarIcon3 />
          </button>

          {/* Redo */}
          <button className="qat-btn" title="Redo (Ctrl+Y)" onClick={onRedo}>
            <TitleBarIcon4 />
          </button>
        </div>
      </div>

      {/* File Name */}
      <div className="title-bar-center">
        <span className="file-name">{fileName}</span>
      </div>

      {/* Right Side Controls */}
      <div className="title-bar-right">
        {/* Search */}
        <button className="title-btn search-btn">
          <TitleBarIcon5 />
          <span>Search</span>
        </button>

        {/* Share */}
        <button className="title-btn share-btn">
          <TitleBarIcon6 />
          <span>Share</span>
        </button>

        {/* User Avatar */}
        <div className="user-avatar" title="User Account">
          <span>U</span>
        </div>

        {/* Window Controls */}
        <button className="window-btn minimize" title="Minimize" onClick={onMinimize}>
          <span>─</span>
        </button>
        <button className="window-btn maximize" title="Maximize" onClick={onMaximize}>
          <span>□</span>
        </button>
        <button className="window-btn close" title="Close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>
    </header>
  );
};
