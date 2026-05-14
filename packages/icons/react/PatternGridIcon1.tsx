import React from "react";
import type { SVGProps } from "react";

export interface PatternGridIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const PatternGridIcon1 = React.forwardRef<SVGSVGElement, PatternGridIcon1Props>(
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
        <defs> <pattern id={`pattern-${pattern.type}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" > <rect width="8" height="8" fill={backgroundColor} /> <path d={pattern.svgPattern} stroke={foregroundColor} fill="none" strokeWidth="1" /> </pattern> </defs> <rect width="24" height="24" fill={`url(#pattern-${pattern.type})`} />
      </svg>
    );
  }
);

PatternGridIcon1.displayName = "PatternGridIcon1";

export default PatternGridIcon1;
