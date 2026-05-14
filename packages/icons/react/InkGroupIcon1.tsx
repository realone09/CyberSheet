import React from "react";
import type { SVGProps } from "react";

export interface InkGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const InkGroupIcon1 = React.forwardRef<SVGSVGElement, InkGroupIcon1Props>(
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
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        {/* Pen with slash icon */} <path d="M15 3 L17 5 L8 14 L5 15 L6 12 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <circle cx="16" cy="4" r="1.5" fill="#0078D4" /> {/* Slash through */} <line x1="3" y1="17" x2="17" y2="3" stroke="#D13438" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
);

InkGroupIcon1.displayName = "InkGroupIcon1";

export default InkGroupIcon1;
