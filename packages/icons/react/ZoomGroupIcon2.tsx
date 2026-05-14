import React from "react";
import type { SVGProps } from "react";

export interface ZoomGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ZoomGroupIcon2 = React.forwardRef<SVGSVGElement, ZoomGroupIcon2Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 20
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <text x="10" y="14" textAnchor="middle" fill="#0078D4" fontSize="12" fontWeight="bold">100</text> <text x="16" y="10" fill="#0078D4" fontSize="8">%</text>
      </svg>
    );
  }
);

ZoomGroupIcon2.displayName = "ZoomGroupIcon2";

export default ZoomGroupIcon2;
