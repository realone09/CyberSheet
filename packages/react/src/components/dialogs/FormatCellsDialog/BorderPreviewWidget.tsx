import { BorderPreviewWidgetIcon1 } from '@cyber-sheet/icons/react';
import * as React from 'react';

export type BorderEdge = 'top' | 'bottom' | 'left' | 'right' | 
                         'diagonalUp' | 'diagonalDown' |
                         'horizontal' | 'vertical';

export interface BorderState {
  top?: { style: string; color: string };
  bottom?: { style: string; color: string };
  left?: { style: string; color: string };
  right?: { style: string; color: string };
  diagonalUp?: { style: string; color: string };
  diagonalDown?: { style: string; color: string };
  horizontal?: { style: string; color: string };
  vertical?: { style: string; color: string };
}

export interface BorderPreviewWidgetProps {
  borders: BorderState;
  onToggleEdge: (edge: BorderEdge) => void;
  currentStyle: string;
  currentColor: string;
}

const BorderPreviewWidget: React.FC<BorderPreviewWidgetProps> = ({
  borders,
  onToggleEdge,
  currentStyle,
  currentColor
}) => {
  const [hoverEdge, setHoverEdge] = React.useState<BorderEdge | null>(null);
  
  const getStrokeStyle = (edge: BorderEdge): React.CSSProperties => {
    const borderInfo = borders[edge];
    const isHovered = hoverEdge === edge;
    
    if (borderInfo) {
      return {
        stroke: borderInfo.color,
        strokeWidth: borderInfo.style === 'thick' ? 3 : borderInfo.style === 'double' ? 2 : 2,
        strokeDasharray: borderInfo.style === 'dashed' ? '5,5' : borderInfo.style === 'dotted' ? '2,2' : 'none',
        opacity: isHovered ? 0.7 : 1
      };
    }
    
    return {
      stroke: isHovered ? currentColor : '#ccc',
      strokeWidth: 1,
      strokeDasharray: 'none',
      opacity: isHovered ? 0.5 : 0.3
    };
  };
  
  const handleEdgeClick = (edge: BorderEdge) => {
    onToggleEdge(edge);
  };
  
  const handleMouseEnter = (edge: BorderEdge) => {
    setHoverEdge(edge);
  };
  
  const handleMouseLeave = () => {
    setHoverEdge(null);
  };
  
  return (
    <div style={{ width: '200px', height: '200px', position: 'relative' }}>
      <BorderPreviewWidgetIcon1 />
      
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center'
        }}
      >
        Click edges to toggle borders
      </div>
    </div>
  );
};

export default BorderPreviewWidget;
