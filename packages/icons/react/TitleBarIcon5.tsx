import React from "react";
import type { SVGProps } from "react";

export interface TitleBarIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const TitleBarIcon5 = React.forwardRef<SVGSVGElement, TitleBarIcon5Props>(
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
        <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/> <path d="M9 9L13 13" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
  }
);

TitleBarIcon5.displayName = "TitleBarIcon5";

export default TitleBarIcon5;
