import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon3 = React.forwardRef<SVGSVGElement, WindowGroupIcon3Props>(
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
        <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="2" y1="10" x2="18" y2="10" stroke="#0078D4" strokeWidth="2"/> <line x1="10" y1="2" x2="10" y2="18" stroke="#0078D4" strokeWidth="2"/> <circle cx="10" cy="10" r="2" fill="#0078D4"/>
      </svg>
    );
  }
);

WindowGroupIcon3.displayName = "WindowGroupIcon3";

export default WindowGroupIcon3;
