import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon2 = React.forwardRef<SVGSVGElement, WindowGroupIcon2Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 8,
      height: props.height || 5
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 8 5"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <path d="M0 0 L4 4 L8 0" fill="#333"/>
      </svg>
    );
  }
);

WindowGroupIcon2.displayName = "WindowGroupIcon2";

export default WindowGroupIcon2;
