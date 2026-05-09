/**
 * TextGroup.tsx
 *
 * Insert Tab - Text Group
 * Contains: Text Box, Header & Footer, WordArt, Signature Line, Object
 */

import React from 'react';
import type { DrawingLayer, TextBoxObject } from '@cyber-sheet/core';

export interface TextGroupProps {
  drawingLayer?: DrawingLayer;
  onInsertTextBox?: () => void;
  onInsertHeaderFooter?: () => void;
  onInsertWordArt?: () => void;
  onObjectChange?: () => void;
}

export const TextGroup: React.FC<TextGroupProps> = ({
  drawingLayer,
  onInsertTextBox,
  onInsertHeaderFooter,
  onInsertWordArt,
  onObjectChange,
}) => {
  // Handle text box insertion
  const handleInsertTextBox = () => {
    if (!drawingLayer) return;
    
    const textBox: TextBoxObject = {
      id: `textbox_${Date.now()}`,
      type: 'textBox',
      name: 'Text Box',
      text: 'Text Box',
      position: { x: 100, y: 100 },
      size: { width: 150, height: 60 },
      rotation: 0,
      zIndex: drawingLayer.getAllObjects().length + 1,
      locked: false,
      visible: true,
      altText: 'Text Box',
      textStyle: {
        fontFamily: 'Calibri',
        fontSize: 11,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
        valign: 'top',
      },
      fill: { type: 'solid', color: '#FFFFFF', transparency: 0 },
      border: { color: '#000000', width: 1, style: 'solid' },
    };
    drawingLayer.addObject(textBox);
    onObjectChange?.();
    onInsertTextBox?.();
  };
  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 8px',
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

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean): void => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (isEnter) {
      btn.style.background = '#E8E8E8';
      btn.style.borderColor = '#D1D1D1';
    } else {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'transparent';
    }
  };

  return (
    <div style={groupStyle}>
      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={handleInsertTextBox}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>📝</span>
          <span>Text Box</span>
        </button>

        <button
          style={buttonStyle}
          onClick={() => onInsertHeaderFooter?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>📄</span>
          <span>Header &<br/>Footer</span>
        </button>

        <button
          style={buttonStyle}
          onClick={() => onInsertWordArt?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>🎨</span>
          <span>WordArt</span>
        </button>
      </div>

      <div style={labelStyle}>Text</div>
    </div>
  );
};
