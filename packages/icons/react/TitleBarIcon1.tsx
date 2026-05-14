import React from "react";
import type { SVGProps } from "react";

export interface TitleBarIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const TitleBarIcon1 = React.forwardRef<SVGSVGElement, TitleBarIcon1Props>(
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
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#217346"/> <path d="M4 4L8 12L12 4" stroke="white" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

TitleBarIcon1.displayName = "TitleBarIcon1";

export default TitleBarIcon1;
