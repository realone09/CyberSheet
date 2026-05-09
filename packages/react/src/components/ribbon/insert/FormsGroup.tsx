/**
 * FormsGroup.tsx
 *
 * Insert Tab - Forms Group
 * Contains: Checkbox, Button, Combo Box, List Box, Spin Button, ScrollBar, Option Button, Group Box, Label
 */

import React, { useState } from 'react';
import type { DrawingLayer, FormControlObject } from '@cyber-sheet/core';

export interface FormsGroupProps {
  drawingLayer?: DrawingLayer;
  onInsertControl?: (controlType: string) => void;
  onObjectChange?: () => void;
}

export const FormsGroup: React.FC<FormsGroupProps> = ({
  drawingLayer,
  onInsertControl,
  onObjectChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle checkbox insertion
  const handleInsertCheckbox = () => {
    if (!drawingLayer) return;
    
    const checkbox: FormControlObject = {
      id: `checkbox_${Date.now()}`,
      type: 'formControl',
      name: 'Checkbox',
      controlType: 'checkbox',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 24 },
      rotation: 0,
      zIndex: drawingLayer.getAllObjects().length + 1,
      locked: false,
      visible: true,
      altText: 'Checkbox',
      linkedCell: undefined,
      controlProperties: {
        enabled: true,
        printObject: true,
        checked: false,
        label: 'Checkbox',
      },
    };
    drawingLayer.addObject(checkbox);
    onObjectChange?.();
    onInsertControl?.('checkbox');
  };

  // Handle button insertion
  const handleInsertButton = () => {
    if (!drawingLayer) return;
    
    const button: FormControlObject = {
      id: `button_${Date.now()}`,
      type: 'formControl',
      name: 'Button',
      controlType: 'button',
      position: { x: 100, y: 100 },
      size: { width: 80, height: 28 },
      rotation: 0,
      zIndex: drawingLayer.getAllObjects().length + 1,
      locked: false,
      visible: true,
      altText: 'Button',
      linkedCell: undefined,
      controlProperties: {
        enabled: true,
        printObject: true,
        buttonText: 'Button',
      },
    };
    drawingLayer.addObject(button);
    onObjectChange?.();
    onInsertControl?.('button');
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
    position: 'relative',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#333',
    minWidth: 50,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 24,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#FFFFFF',
    border: '1px solid #D1D1D1',
    borderRadius: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 180,
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const controls = [
    { type: 'checkbox', icon: '☑', label: 'Checkbox' },
    { type: 'button', icon: '🔘', label: 'Button' },
    { type: 'comboBox', icon: '▾', label: 'Combo Box' },
    { type: 'listBox', icon: '▨', label: 'List Box' },
    { type: 'spinButton', icon: '↕', label: 'Spin Button' },
    { type: 'scrollBar', icon: '═══', label: 'Scroll Bar' },
    { type: 'optionButton', icon: '○', label: 'Option Button' },
    { type: 'groupBox', icon: '┌─┐', label: 'Group Box' },
    { type: 'label', icon: 'Aa', label: 'Label' },
  ];

  return (
    <div style={groupStyle}>
      <div style={buttonContainerStyle}>
        {/* Checkbox - Primary button */}
        <button
          style={buttonStyle}
          onClick={handleInsertCheckbox}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D1D1';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          }}
        >
          <span style={iconStyle}>☑</span>
          <span>Checkbox</span>
        </button>

        {/* More Controls Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              ...buttonStyle,
              minWidth: 30,
              padding: '6px 6px',
            }}
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E8';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D1D1';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
          >
            <span style={{ fontSize: 16 }}>▼</span>
          </button>

          {showDropdown && (
            <div style={dropdownStyle}>
              {controls.map((control, index) => (
                <div
                  key={control.type}
                  style={{
                    ...dropdownItemStyle,
                    borderBottom: index === controls.length - 1 ? 'none' : '1px solid #F0F0F0',
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    onInsertControl?.(control.type);
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{control.icon}</span>
                  <span>{control.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={labelStyle}>Forms</div>
    </div>
  );
};
