import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon7Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon7 = React.forwardRef<SVGSVGElement, WindowGroupIcon7Props>(
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
        <rect x="2" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="2" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

WindowGroupIcon7.displayName = "WindowGroupIcon7";

export default WindowGroupIcon7;
