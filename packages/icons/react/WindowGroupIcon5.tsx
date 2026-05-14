import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon5 = React.forwardRef<SVGSVGElement, WindowGroupIcon5Props>(
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
        <rect x="3" y="4" width="14" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="10" cy="10" r="3" fill="#E3F2FD" stroke="#0078D4" strokeWidth="1"/>
      </svg>
    );
  }
);

WindowGroupIcon5.displayName = "WindowGroupIcon5";

export default WindowGroupIcon5;
