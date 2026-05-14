import React from "react";
import type { SVGProps } from "react";

export interface ChangesGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ChangesGroupIcon3 = React.forwardRef<SVGSVGElement, ChangesGroupIcon3Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 20
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <circle cx="10" cy="10" r="7" fill="none" stroke="#0078D4" strokeWidth="1.5"/> <path d="M10 6 L10 10 L13 13" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/> <path d="M3 8 L1 10 L3 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
);

ChangesGroupIcon3.displayName = "ChangesGroupIcon3";

export default ChangesGroupIcon3;
