import React from "react";
import type { SVGProps } from "react";

export interface TitleBarIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const TitleBarIcon2 = React.forwardRef<SVGSVGElement, TitleBarIcon2Props>(
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
        <path d="M11 1H3C1.9 1 1 1.9 1 3V11C1 12.1 1.9 13 3 13H11C12.1 13 13 12.1 13 11V3C13 1.9 12.1 1 11 1ZM7 11C5.9 11 5 10.1 5 9C5 7.9 5.9 7 7 7C8.1 7 9 7.9 9 9C9 10.1 8.1 11 7 11ZM9 5H3V3H9V5Z"/>
      </svg>
    );
  }
);

TitleBarIcon2.displayName = "TitleBarIcon2";

export default TitleBarIcon2;
