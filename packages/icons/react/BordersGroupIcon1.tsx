import React from "react";
import type { SVGProps } from "react";

export interface BordersGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const BordersGroupIcon1 = React.forwardRef<SVGSVGElement, BordersGroupIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 24,
      height: props.height || 24
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
        <rect x="4" y="4" width="16" height="16" fill="none" stroke={hasBorder('top') || hasBorder('bottom') || hasBorder('left') || hasBorder('right') ? '#ccc' : 'none'} strokeWidth="0.5" /> {/* Top border */} {hasBorder('top') && ( <line x1="4" y1="4" x2="20" y2="4" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'top' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Bottom border */} {hasBorder('bottom') && ( <line x1="4" y1="20" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'bottom' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Left border */} {hasBorder('left') && ( <line x1="4" y1="4" x2="4" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'left' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Right border */} {hasBorder('right') && ( <line x1="20" y1="4" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'right' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Inside horizontal */} {preset.borders.some(b => b.edge === 'insideHorizontal') && ( <line x1="4" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1" /> )} {/* Inside vertical */} {preset.borders.some(b => b.edge === 'insideVertical') && ( <line x1="12" y1="4" x2="12" y2="20" stroke="#000" strokeWidth="1" /> )}
      </svg>
    );
  }
);

BordersGroupIcon1.displayName = "BordersGroupIcon1";

export default BordersGroupIcon1;
