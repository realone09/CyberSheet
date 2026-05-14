import React from "react";
import type { SVGProps } from "react";

export interface NumberFormatGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const NumberFormatGroupIcon1 = React.forwardRef<SVGSVGElement, NumberFormatGroupIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 18,
      height: props.height || 18
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <circle cx="4" cy="14" r="1.5" /> <text x="7" y="13" fontSize="12" fontWeight="600">0</text> <text x="12" y="11" fontSize="10" fontWeight="600" fill="#06c">+</text>
      </svg>
    );
  }
);

NumberFormatGroupIcon1.displayName = "NumberFormatGroupIcon1";

export default NumberFormatGroupIcon1;
