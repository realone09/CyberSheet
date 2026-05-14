import React from "react";
import type { SVGProps } from "react";

export interface StatusBarIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const StatusBarIcon2 = React.forwardRef<SVGSVGElement, StatusBarIcon2Props>(
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
        <rect x="2" y="1" width="10" height="12" fill="none" stroke="currentColor"/> <line x1="4" y1="4" x2="10" y2="4" stroke="currentColor"/> <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor"/> <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor"/>
      </svg>
    );
  }
);

StatusBarIcon2.displayName = "StatusBarIcon2";

export default StatusBarIcon2;
