import React from "react";
import type { SVGProps } from "react";

export interface OrientationWidgetIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const OrientationWidgetIcon1 = React.forwardRef<SVGSVGElement, OrientationWidgetIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 150,
      height: props.height || 150
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        {/* Background circle */} <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e0e0e0" strokeWidth="1" /> {/* Tick marks at 0, 45, -45, 90, -90 */} {[0, 45, -45, 90, -90].map((deg) => { const tickStart = getLineEndPoint(deg); const tickRadians = (deg - 90) * (Math.PI / 180); const tickEndX = centerX + (radius - 8) * Math.cos(tickRadians); const tickEndY = centerY + (radius - 8) * Math.sin(tickRadians); return ( <line key={deg} x1={tickStart.x} y1={tickStart.y} x2={tickEndX} y2={tickEndY} stroke="#999" strokeWidth="1" /> ); })} {/* Orientation line */} <line x1={centerX} y1={centerY} x2={endPoint.x} y2={endPoint.y} stroke="#0078d4" strokeWidth="3" strokeLinecap="round" /> {/* Draggable handle */} <circle cx={endPoint.x} cy={endPoint.y} r="8" fill="#0078d4" stroke="#fff" strokeWidth="2" style={{ cursor: isDragging ? 'grabbing' : 'grab' }} /> {/* "Text" label at center */} <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#333" pointerEvents="none" > Text </text>
      </svg>
    );
  }
);

OrientationWidgetIcon1.displayName = "OrientationWidgetIcon1";

export default OrientationWidgetIcon1;
