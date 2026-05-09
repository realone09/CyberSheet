/**
 * IllustrationsGroup.tsx
 *
 * Insert Tab - Illustrations Group
 * Contains: Pictures, Shapes, Icons, 3D Models
 */

import React, { useState, useRef } from 'react';
import type { DrawingLayer, ShapeObject, PictureObject } from '@cyber-sheet/core';
import { ShapeGallery } from './ShapeGallery';

export interface IllustrationsGroupProps {
  drawingLayer?: DrawingLayer;
  onInsertPicture?: () => void;
  onInsertShape?: (shapeType: string) => void;
  onInsertIcon?: () => void;
  onObjectChange?: () => void;
}

export const IllustrationsGroup: React.FC<IllustrationsGroupProps> = ({
  drawingLayer,
  onInsertPicture,
  onInsertShape,
  onInsertIcon,
  onObjectChange,
}) => {
  const [showPictureDropdown, setShowPictureDropdown] = useState(false);
  const [shapeGalleryOpen, setShapeGalleryOpen] = useState(false);
  const shapesButtonRef = useRef(null as HTMLButtonElement | null);
  const fileInputRef = useRef(null as HTMLInputElement | null);

  // Handle shape selection from gallery
  const handleSelectShape = (shapeType: string) => {
    if (!drawingLayer) return;
    
    const shape: ShapeObject = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      name: shapeType,
      shapeType: shapeType as any,
      position: { x: 100, y: 100 },
      size: { width: 100, height: 80 },
      rotation: 0,
      zIndex: drawingLayer.getAllObjects().length + 1,
      locked: false,
      visible: true,
      altText: shapeType,
      fill: { type: 'solid', color: '#4472C4', transparency: 0 },
      line: { color: '#4472C4', width: 1, style: 'solid' },
    };
    
    drawingLayer.addObject(shape);
    onObjectChange?.();
    onInsertShape?.(shapeType);
  };

  // Handle picture upload
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !drawingLayer) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const picture: PictureObject = {
        id: `pic_${Date.now()}`,
        type: 'picture',
        name: file.name,
        source: reader.result as string,
        sourceType: 'dataUri',
        naturalWidth: 0,
        naturalHeight: 0,
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        rotation: 0,
        zIndex: drawingLayer.getAllObjects().length + 1,
        locked: false,
        visible: true,
        altText: file.name,
      };
      
      // Load image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        picture.naturalWidth = img.naturalWidth;
        picture.naturalHeight = img.naturalHeight;
        (picture as any).loadedImage = img;
        const maxDim = 400;
        if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
          const ratio = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
          picture.size = { width: img.naturalWidth * ratio, height: img.naturalHeight * ratio };
        } else {
          picture.size = { width: img.naturalWidth, height: img.naturalHeight };
        }
        drawingLayer.addObject(picture);
        onObjectChange?.();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
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
    minWidth: 200,
    marginTop: 2,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    borderBottom: '1px solid #F0F0F0',
  };

  const shapeGalleryStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#FFFFFF',
    border: '1px solid #D1D1D1',
    borderRadius: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 300,
    maxHeight: 400,
    overflow: 'auto',
    marginTop: 2,
    padding: 8,
  };

  const shapeCategoryStyle: React.CSSProperties = {
    marginBottom: 12,
  };

  const shapeCategoryTitleStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#444',
    marginBottom: 6,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  };

  const shapeGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 4,
  };

  const shapeButtonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    border: '1px solid #D1D1D1',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  };

  const basicShapes = [
    { type: 'rectangle', icon: '▭' },
    { type: 'oval', icon: '⭕' },
    { type: 'triangle', icon: '△' },
    { type: 'diamond', icon: '◇' },
    { type: 'pentagon', icon: '⬟' },
    { type: 'hexagon', icon: '⬢' },
  ];

  const arrows = [
    { type: 'rightArrow', icon: '➡' },
    { type: 'leftArrow', icon: '⬅' },
    { type: 'upArrow', icon: '⬆' },
    { type: 'downArrow', icon: '⬇' },
  ];

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
        {/* Pictures */}
        <div style={{ position: 'relative' }}>
          <button
            style={buttonStyle}
            onClick={() => {
              setShowPictureDropdown(!showPictureDropdown);
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
          >
            <span style={iconStyle}>🖼️</span>
            <span>Pictures</span>
          </button>

          {showPictureDropdown && (
            <div style={dropdownStyle}>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  setShowPictureDropdown(false);
                  fileInputRef.current?.click();
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                This Device...
              </div>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  setShowPictureDropdown(false);
                  console.log('Stock Images');
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                Stock Images...
              </div>
              <div
                style={{ ...dropdownItemStyle, borderBottom: 'none' }}
                onClick={() => {
                  setShowPictureDropdown(false);
                  console.log('Online Pictures');
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#E8F4FD';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                Online Pictures...
              </div>
            </div>
          )}
        </div>

        {/* Shapes */}
        <button
          ref={shapesButtonRef}
          style={buttonStyle}
          onClick={() => setShapeGalleryOpen(true)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>◯△▭</span>
          <span>Shapes</span>
        </button>

        <ShapeGallery
          isOpen={shapeGalleryOpen}
          onClose={() => setShapeGalleryOpen(false)}
          onSelectShape={handleSelectShape}
          triggerRef={shapesButtonRef}
        />

        {/* Icons */}
        <button
          style={buttonStyle}
          onClick={() => onInsertIcon?.()}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, true)}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonHover(e, false)}
        >
          <span style={iconStyle}>⭐</span>
          <span>Icons</span>
        </button>
      </div>

      <div style={labelStyle}>Illustrations</div>

      {/* Hidden file input for picture upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePictureUpload}
      />
    </div>
  );
};
