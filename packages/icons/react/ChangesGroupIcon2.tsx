import React from "react";
import type { SVGProps } from "react";

export interface ChangesGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ChangesGroupIcon2 = React.forwardRef<SVGSVGElement, ChangesGroupIcon2Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 6,
      height: props.height || 4
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 6 4"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <path d="M0,0 L3,3 L6,0" stroke="#333" strokeWidth="1" fill="none"/>
      </svg>
    );
  }
);

ChangesGroupIcon2.displayName = "ChangesGroupIcon2";

export default ChangesGroupIcon2;
