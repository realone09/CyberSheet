import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon6Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon6 = React.forwardRef<SVGSVGElement, WindowGroupIcon6Props>(
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
        <rect x="2" y="3" width="7" height="14" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="11" y="3" width="7" height="14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

WindowGroupIcon6.displayName = "WindowGroupIcon6";

export default WindowGroupIcon6;
