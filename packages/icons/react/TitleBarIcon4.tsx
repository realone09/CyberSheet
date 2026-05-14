import React from "react";
import type { SVGProps } from "react";

export interface TitleBarIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const TitleBarIcon4 = React.forwardRef<SVGSVGElement, TitleBarIcon4Props>(
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
        <path d="M6 3H10.59L8.29 0.71L9 0L13 4L9 8L8.29 7.29L10.59 5H6C3.79 5 2 6.79 2 9C2 11.21 3.79 13 6 13H10V11H6C4.9 11 4 10.1 4 9C4 7.9 4.9 7 6 7H10.59L8.29 9.29L9 10L13 6"/>
      </svg>
    );
  }
);

TitleBarIcon4.displayName = "TitleBarIcon4";

export default TitleBarIcon4;
