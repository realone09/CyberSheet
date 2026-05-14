import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon1 = React.forwardRef<SVGSVGElement, WindowGroupIcon1Props>(
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
        <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="2" y1="8" x2="18" y2="8" stroke="#0078D4" strokeWidth="2.5"/> <line x1="8" y1="2" x2="8" y2="18" stroke="#0078D4" strokeWidth="2.5"/>
      </svg>
    );
  }
);

WindowGroupIcon1.displayName = "WindowGroupIcon1";

export default WindowGroupIcon1;
