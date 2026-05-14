import React from "react";
import type { SVGProps } from "react";

export interface SortFilterGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const SortFilterGroupIcon2 = React.forwardRef<SVGSVGElement, SortFilterGroupIcon2Props>(
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
        {/* Z→A icon with down arrow */} <text x="2" y="6" fontSize="10" fontWeight="bold" fill="#333">Z</text> <text x="2" y="14" fontSize="8" fill="#666">A</text> <path d="M15 8 L12 5 L15 8 L18 5 M15 15 L15 5" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

SortFilterGroupIcon2.displayName = "SortFilterGroupIcon2";

export default SortFilterGroupIcon2;
