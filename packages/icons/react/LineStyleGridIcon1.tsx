import React from "react";
import type { SVGProps } from "react";

export interface LineStyleGridIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const LineStyleGridIcon1 = React.forwardRef<SVGSVGElement, LineStyleGridIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 100,
      height: props.height || 12
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
        <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="1" /> <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="1" />
      </svg>
    );
  }
);

LineStyleGridIcon1.displayName = "LineStyleGridIcon1";

export default LineStyleGridIcon1;
