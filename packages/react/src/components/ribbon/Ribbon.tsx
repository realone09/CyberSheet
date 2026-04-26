import React, { useState } from 'react';
import { HomeTab } from './HomeTab';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './ribbon.css';

export interface RibbonProps {
  commandManager: any;
  selection: any;
}

/**
 * Ribbon - Main Ribbon container with tab navigation
 * 
 * Top-level component that manages tab switching and renders the active tab content.
 * Currently implements Home tab only. Future tabs:
 * - Insert
 * - Page Layout
 * - Formulas
 * - Data
 * - Review
 * - View
 * 
 * ⚠️ CRITICAL: This component sets up the global keyboard shortcut system
 * Only ONE instance should exist per application
 * 
 * @example
 * <Ribbon 
 *   commandManager={workbook.commandManager} 
 *   selection={getCurrentSelection()} 
 * />
 */
export const Ribbon: React.FC<RibbonProps> = ({ commandManager, selection }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'formulas'>('home');

  // Set up global keyboard shortcuts (single entry point)
  useKeyboardShortcuts({
    commandManager,
    selection,
    registerStandardShortcuts: true,
    enabled: true,
  });

  return (
    <div className="ribbon">
      {/* Tab Navigation (future enhancement) */}
      {/* 
      <div className="ribbon-tabs">
        <button 
          className={activeTab === 'home' ? 'active' : ''} 
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={activeTab === 'insert' ? 'active' : ''} 
          onClick={() => setActiveTab('insert')}
        >
          Insert
        </button>
        <button 
          className={activeTab === 'formulas' ? 'active' : ''} 
          onClick={() => setActiveTab('formulas')}
        >
          Formulas
        </button>
      </div>
      */}

      {/* Active Tab Content */}
      {activeTab === 'home' && (
        <HomeTab commandManager={commandManager} selection={selection} />
      )}
      
      {/* Future tabs will be added here */}
    </div>
  );
};
