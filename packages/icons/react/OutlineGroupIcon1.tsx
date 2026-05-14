import React from "react";
import type { SVGProps } from "react";

export interface OutlineGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const OutlineGroupIcon1 = React.forwardRef<SVGSVGElement, OutlineGroupIcon1Props>(
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
        {/* Group icon - bracket with lines */} <path d="M4 3 L2 3 L2 13 L4 13" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/> <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/> <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/> <circle cx="16" cy="8" r="2" fill="#0078D4"/> <text x="15" y="10" fontSize="4" fill="#FFF" fontWeight="bold">-</text>
      </svg>
    );
  }
);

OutlineGroupIcon1.displayName = "OutlineGroupIcon1";

export default OutlineGroupIcon1;
