import React from "react";
import type { SVGProps } from "react";

export interface ProtectGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ProtectGroupIcon1 = React.forwardRef<SVGSVGElement, ProtectGroupIcon1Props>(
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
        {/* Shield with checkmark icon */} <path d="M10 2 L4 4 L4 10 Q4 14 10 18 Q16 14 16 10 L16 4 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" /> <path d="M7 10 L9 12 L13 8" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
);

ProtectGroupIcon1.displayName = "ProtectGroupIcon1";

export default ProtectGroupIcon1;
