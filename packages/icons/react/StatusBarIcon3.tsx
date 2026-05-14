import React from "react";
import type { SVGProps } from "react";

export interface StatusBarIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const StatusBarIcon3 = React.forwardRef<SVGSVGElement, StatusBarIcon3Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 14,
      height: props.height || 14
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 14 14"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <rect x="1" y="1" width="12" height="12" fill="none" stroke="currentColor"/> <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeDasharray="2"/> <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeDasharray="2"/>
      </svg>
    );
  }
);

StatusBarIcon3.displayName = "StatusBarIcon3";

export default StatusBarIcon3;
