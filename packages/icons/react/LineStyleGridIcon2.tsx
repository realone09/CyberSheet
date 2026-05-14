import React from "react";
import type { SVGProps } from "react";

export interface LineStyleGridIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const LineStyleGridIcon2 = React.forwardRef<SVGSVGElement, LineStyleGridIcon2Props>(
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
        <line x1="0" y1="6" x2="100" y2="6" stroke={color} strokeWidth={metadata.strokeWidth} strokeDasharray={metadata.strokeDasharray} />
      </svg>
    );
  }
);

LineStyleGridIcon2.displayName = "LineStyleGridIcon2";

export default LineStyleGridIcon2;
