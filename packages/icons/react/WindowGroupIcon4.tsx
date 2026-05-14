import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon4 = React.forwardRef<SVGSVGElement, WindowGroupIcon4Props>(
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
        <rect x="3" y="4" width="14" height="12" stroke="#888" strokeWidth="1.5" fill="none"/> <line x1="2" y1="2" x2="18" y2="18" stroke="#888" strokeWidth="2"/>
      </svg>
    );
  }
);

WindowGroupIcon4.displayName = "WindowGroupIcon4";

export default WindowGroupIcon4;
