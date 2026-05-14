import React from "react";
import type { SVGProps } from "react";

export interface OutlineGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const OutlineGroupIcon3 = React.forwardRef<SVGSVGElement, OutlineGroupIcon3Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 16
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 20 16"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        {/* Ungroup icon - open bracket */} <path d="M4 3 L2 3 L2 13 L4 13" stroke="#999" strokeWidth="1.5" fill="none" strokeDasharray="2,1"/> <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/> <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/> <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/> <circle cx="16" cy="8" r="2" fill="#E83E3E"/> <text x="14.5" y="10" fontSize="4" fill="#FFF" fontWeight="bold">+</text>
      </svg>
    );
  }
);

OutlineGroupIcon3.displayName = "OutlineGroupIcon3";

export default OutlineGroupIcon3;
