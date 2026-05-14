import React from "react";
import type { SVGProps } from "react";

export interface BordersGroupIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const BordersGroupIcon4 = React.forwardRef<SVGSVGElement, BordersGroupIcon4Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 16,
      height: props.height || 16
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <path d="M14 2l-12 12M13 1 l-1 1 1 1 1-1-1-1z"/> <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
  }
);

BordersGroupIcon4.displayName = "BordersGroupIcon4";

export default BordersGroupIcon4;
