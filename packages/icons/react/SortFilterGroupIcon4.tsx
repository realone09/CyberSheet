import React from "react";
import type { SVGProps } from "react";

export interface SortFilterGroupIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const SortFilterGroupIcon4 = React.forwardRef<SVGSVGElement, SortFilterGroupIcon4Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 14,
      height: props.height || 14
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 14 14"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <path d="M1 2 L6 8 L6 12 L8 13 L8 8 L13 2 Z" stroke="#333" strokeWidth="1" fill="none"/>
      </svg>
    );
  }
);

SortFilterGroupIcon4.displayName = "SortFilterGroupIcon4";

export default SortFilterGroupIcon4;
