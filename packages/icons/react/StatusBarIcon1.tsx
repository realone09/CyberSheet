import React from "react";
import type { SVGProps } from "react";

export interface StatusBarIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const StatusBarIcon1 = React.forwardRef<SVGSVGElement, StatusBarIcon1Props>(
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
        <rect x="1" y="1" width="5" height="5"/> <rect x="8" y="1" width="5" height="5"/> <rect x="1" y="8" width="5" height="5"/> <rect x="8" y="8" width="5" height="5"/>
      </svg>
    );
  }
);

StatusBarIcon1.displayName = "StatusBarIcon1";

export default StatusBarIcon1;
