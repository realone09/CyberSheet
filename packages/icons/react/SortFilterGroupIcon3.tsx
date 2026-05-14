import React from "react";
import type { SVGProps } from "react";

export interface SortFilterGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const SortFilterGroupIcon3 = React.forwardRef<SVGSVGElement, SortFilterGroupIcon3Props>(
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
        {/* Multi-level sort icon */} <rect x="3" y="3" width="14" height="2" fill="#333"/> <rect x="5" y="7" width="12" height="2" fill="#666"/> <rect x="7" y="11" width="10" height="2" fill="#999"/> <rect x="9" y="15" width="8" height="2" fill="#BBB"/>
      </svg>
    );
  }
);

SortFilterGroupIcon3.displayName = "SortFilterGroupIcon3";

export default SortFilterGroupIcon3;
