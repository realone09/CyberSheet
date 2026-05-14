import React from "react";
import type { SVGProps } from "react";

export interface RibbonGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const RibbonGroupIcon1 = React.forwardRef<SVGSVGElement, RibbonGroupIcon1Props>(
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
        <path d="M11 11L7 7M7 7L3 3M7 7L11 3M7 7L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
);

RibbonGroupIcon1.displayName = "RibbonGroupIcon1";

export default RibbonGroupIcon1;
