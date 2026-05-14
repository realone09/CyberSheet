import React from "react";
import type { SVGProps } from "react";

export interface SortFilterGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const SortFilterGroupIcon1 = React.forwardRef<SVGSVGElement, SortFilterGroupIcon1Props>(
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
        {/* A→Z icon with up arrow */} <text x="2" y="14" fontSize="10" fontWeight="bold" fill="#333">A</text> <text x="2" y="6" fontSize="8" fill="#666">Z</text> <path d="M15 12 L12 15 L15 12 L18 15 M15 5 L15 15" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

SortFilterGroupIcon1.displayName = "SortFilterGroupIcon1";

export default SortFilterGroupIcon1;
