/**
 * ShapeGallery.tsx
 * 
 * Dropdown gallery for selecting shapes to insert.
 * Displays shape categories with thumbnails in a grid layout.
 */

import { ShapeGalleryIcon1 } from '@cyber-sheet/icons/react';
import React, { useState } from 'react';

interface ShapeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shapeType: string) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const SHAPE_CATEGORIES = [
  {
    name: 'Recently Used Shapes',
    shapes: ['rectangle', 'oval', 'arrowRight'],
  },
  {
    name: 'Lines',
    shapes: ['line', 'arrowRight', 'arrowLeft', 'arrowUp', 'arrowDown', 'elbowConnector', 'curve', 'freeform', 'scribble'],
  },
  {
    name: 'Rectangles',
    shapes: ['rectangle', 'roundedRectangle', 'snipSingle', 'snipSameCorner', 'snipDiagonal'],
  },
  {
    name: 'Basic Shapes',
    shapes: ['oval', 'triangle', 'diamond', 'parallelogram', 'trapezoid', 'pentagon', 'hexagon', 'heptagon', 'octagon',
      'plus', 'cross', 'cube', 'cylinder', 'brace', 'bracket', 'sun', 'moon', 'cloud', 'heart', 'lightning', 'smileyFace'],
  },
  {
    name: 'Block Arrows',
    shapes: ['arrowRight', 'arrowLeft', 'arrowUp', 'arrowDown', 'leftRight', 'upDown', 'quadArrow', 'circularArrow', 'stripedArrow', 'bentArrow', 'chevron', 'pentagonArrow'],
  },
  {
    name: 'Flowchart',
    shapes: ['process', 'decision', 'data', 'document', 'terminator', 'preparation', 'manualInput', 'manualOperation', 'connector', 'offPageConnector', 'card', 'punchedTape'],
  },
  {
    name: 'Stars and Banners',
    shapes: ['star', 'star5', 'star6', 'star7', 'star8', 'explosion1', 'explosion2', 'scroll', 'wave', 'upRibbon', 'downRibbon'],
  },
  {
    name: 'Callouts',
    shapes: ['rectangularCallout', 'roundedCallout', 'ovalCallout', 'cloudCallout', 'lineCallout', 'lineNoBorderCallout', 'doubleCallout', 'tripleCallout', 'accentCallout'],
  },
];

export const ShapeGallery: React.FC<ShapeGalleryProps> = ({ isOpen, onClose, onSelectShape, triggerRef }) => {
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate position below trigger
  const triggerRect = triggerRef.current?.getBoundingClientRect();
  const top = triggerRect ? triggerRect.bottom + 4 : 100;
  const left = triggerRect ? triggerRect.left : 100;

  return (
    <>
      {/* Backdrop to close on outside click */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'fixed',
        top,
        left,
        zIndex: 9999,
        backgroundColor: '#FFFFFF',
        border: '1px solid #D1D1D1',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '8px 0',
        maxHeight: 500,
        overflowY: 'auto',
        width: 260,
        animation: 'slideDown 150ms ease-out',
      }}>
        {SHAPE_CATEGORIES.map((category, catIndex) => (
          <div key={catIndex}>
            {catIndex > 0 && (
              <div style={{ height: 1, backgroundColor: '#EFEFEF', margin: '8px 12px' }} />
            )}
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#888',
              padding: '8px 12px 4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {category.name}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 2,
              padding: '0 8px 4px',
            }}>
              {category.shapes.map(shapeType => (
                <button
                  key={shapeType}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: hoveredShape === shapeType ? '1px solid #0078D4' : '1px solid transparent',
                    borderRadius: 4,
                    backgroundColor: hoveredShape === shapeType ? '#E8F4FD' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 100ms',
                  }}
                  onClick={() => {
                    onSelectShape(shapeType);
                    onClose();
                  }}
                  onMouseEnter={() => setHoveredShape(shapeType)}
                  onMouseLeave={() => setHoveredShape(null)}
                  title={shapeType}
                >
                  <ShapeThumbnail type={shapeType} size={20} />
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};

// Simple SVG shape thumbnails
const ShapeThumbnail: React.FC<{ type: string; size: number }> = ({ type, size }) => {
  const s = size;
  const pad = 2;
  const w = s - pad * 2;
  const h = s - pad * 2;

  const getPath = () => {
    switch (type) {
      case 'oval': return `<ellipse cx="${s/2}" cy="${s/2}" rx="${w/2}" ry="${h/2}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'triangle': return `<polygon points="${s/2},${pad} ${s-pad},${s-pad} ${pad},${s-pad}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'diamond': return `<polygon points="${s/2},${pad} ${s-pad},${s/2} ${s/2},${s-pad} ${pad},${s/2}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'pentagon': return `<polygon points="${s/2},${pad} ${s-pad},${s*0.4} ${s*0.8},${s-pad} ${s*0.2},${s-pad} ${pad},${s*0.4}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'hexagon': return `<polygon points="${s/2},${pad} ${s-pad},${s*0.3} ${s-pad},${s*0.7} ${s/2},${s-pad} ${pad},${s*0.7} ${pad},${s*0.3}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'star': return `<polygon points="${s/2},${pad} ${s*0.62},${s*0.38} ${s-pad},${s*0.38} ${s*0.68},${s*0.55} ${s*0.78},${s-pad} ${s/2},${s*0.68} ${s*0.22},${s-pad} ${s*0.32},${s*0.55} ${pad},${s*0.38} ${s*0.38},${s*0.38}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'cloud': return `<ellipse cx="${s*0.45}" cy="${s*0.55}" rx="${s*0.3}" ry="${s*0.25}" fill="#D1D1D1" stroke="#999" stroke-width="1"/><ellipse cx="${s*0.65}" cy="${s*0.5}" rx="${s*0.25}" ry="${s*0.28}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'heart': return `<path d="M${s/2},${s*0.85} C${s*0.1},${s*0.4} ${s*0.1},${s*0.1} ${s*0.35},${s*0.2} C${s*0.4},${s*0.1} ${s/2},${s*0.25} ${s/2},${s*0.35} C${s/2},${s*0.25} ${s*0.6},${s*0.1} ${s*0.65},${s*0.2} C${s*0.9},${s*0.1} ${s*0.9},${s*0.4} ${s/2},${s*0.85} Z" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'lightning': return `<polygon points="${s*0.55},${pad} ${s*0.25},${s*0.45} ${s*0.45},${s*0.42} ${s*0.2},${s-pad} ${s*0.7},${s*0.5} ${s*0.5},${s*0.52} ${s*0.65},${s*0.08}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'arrowRight': return `<polygon points="${pad},${s*0.3} ${s*0.6},${s*0.3} ${s*0.6},${pad} ${s-pad},${s/2} ${s*0.6},${s-pad} ${s*0.6},${s*0.7} ${pad},${s*0.7}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'arrowLeft': return `<polygon points="${s-pad},${s*0.3} ${s*0.4},${s*0.3} ${s*0.4},${pad} ${pad},${s/2} ${s*0.4},${s-pad} ${s*0.4},${s*0.7} ${s-pad},${s*0.7}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'arrowUp': return `<polygon points="${s*0.3},${s-pad} ${s*0.3},${s*0.4} ${pad},${s*0.4} ${s/2},${pad} ${s-pad},${s*0.4} ${s*0.7},${s*0.4} ${s*0.7},${s-pad}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'arrowDown': return `<polygon points="${s*0.3},${pad} ${s*0.3},${s*0.6} ${pad},${s*0.6} ${s/2},${s-pad} ${s-pad},${s*0.6} ${s*0.7},${s*0.6} ${s*0.7},${pad}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'roundedRectangle': return `<rect x="${pad}" y="${pad}" width="${w}" height="${h}" rx="${s*0.15}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
      case 'smileyFace': return `<circle cx="${s/2}" cy="${s/2}" r="${w/2}" fill="#D1D1D1" stroke="#999" stroke-width="1"/><circle cx="${s*0.35}" cy="${s*0.4}" r="1.5" fill="#333"/><circle cx="${s*0.65}" cy="${s*0.4}" r="1.5" fill="#333"/><path d="M${s*0.3},${s*0.6} Q${s/2},${s*0.7} ${s*0.7},${s*0.6}" stroke="#333" stroke-width="1" fill="none"/>`;
      case 'line': return `<line x1="${pad}" y1="${s-pad}" x2="${s-pad}" y2="${pad}" stroke="#999" stroke-width="2"/>`;
      default: return `<rect x="${pad}" y="${pad}" width="${w}" height="${h}" fill="#D1D1D1" stroke="#999" stroke-width="1"/>`;
    }
  };

  return <div dangerouslySetInnerHTML={{ __html: `<ShapeGalleryIcon1 />` }} />;
};
