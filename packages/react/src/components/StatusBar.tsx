/**
 * StatusBar.tsx
 * 
 * Excel-style status bar with statistics and zoom controls
 */

import { StatusBarIcon3, StatusBarIcon2, StatusBarIcon1 } from '@cyber-sheet/icons/react';
import React from 'react';

export interface StatusBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selection?: any;
  viewMode?: 'normal' | 'pageLayout' | 'pageBreak';
  onViewModeChange?: (mode: 'normal' | 'pageLayout' | 'pageBreak') => void;
}

/**
 * StatusBar - Application status bar
 * 
 * Displays:
 * - Ready status
 * - Selection statistics (Average, Count, Sum)
 * - View mode buttons
 * - Zoom controls (slider and buttons)
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  zoom,
  onZoomChange,
  selection,
  viewMode = 'normal',
  onViewModeChange,
}) => {
  // Calculate selection statistics (placeholder for now)
  const average = selection ? '—' : '—';
  const count = selection ? '—' : '—';
  const sum = selection ? '—' : '—';

  const handleZoomIn = () => {
    onZoomChange(Math.min(400, zoom + 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(10, zoom - 10));
  };

  const handleZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZoomChange(Number(e.target.value));
  };

  return (
    <footer className="status-bar">
      {/* Left: Status */}
      <div className="status-left">
        <span className="status-text">Ready</span>
      </div>

      {/* Center: Statistics */}
      <div className="status-center">
        <span className="status-item">Average: {average}</span>
        <span className="status-item">Count: {count}</span>
        <span className="status-item">Sum: {sum}</span>
      </div>

      {/* Right: View and Zoom */}
      <div className="status-right">
        {/* View Mode Buttons */}
        <div className="view-buttons">
          <button
            className={`view-btn ${viewMode === 'normal' ? 'active' : ''}`}
            title="Normal View"
            onClick={() => onViewModeChange?.('normal')}
          >
            <StatusBarIcon1 />
          </button>

          <button
            className={`view-btn ${viewMode === 'pageLayout' ? 'active' : ''}`}
            title="Page Layout View"
            onClick={() => onViewModeChange?.('pageLayout')}
          >
            <StatusBarIcon2 />
          </button>

          <button
            className={`view-btn ${viewMode === 'pageBreak' ? 'active' : ''}`}
            title="Page Break Preview"
            onClick={() => onViewModeChange?.('pageBreak')}
          >
            <StatusBarIcon3 />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button className="zoom-btn" title="Zoom Out" onClick={handleZoomOut}>
            −
          </button>
          <input
            type="range"
            min="10"
            max="400"
            value={zoom}
            onChange={handleZoomSlider}
            className="zoom-slider"
            title="Zoom"
          />
          <button className="zoom-btn" title="Zoom In" onClick={handleZoomIn}>
            +
          </button>
          <span className="zoom-level">{zoom}%</span>
        </div>
      </div>
    </footer>
  );
};
