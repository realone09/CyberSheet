import React from "react";
import type { SVGProps } from "react";

export interface FillColorButtonIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const FillColorButtonIcon1 = React.forwardRef<SVGSVGElement, FillColorButtonIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 16
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
        <rect width="20" height="16" fill={fill.background} /> {/* Simplified pattern preview */} <text x="10" y="12" fontSize="10" textAnchor="middle" fill={fill.foreground}> ⊞ </text>
      </svg>
    );
  }
);

FillColorButtonIcon1.displayName = "FillColorButtonIcon1";

export default FillColorButtonIcon1;
