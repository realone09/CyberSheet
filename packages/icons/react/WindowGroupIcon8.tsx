import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon8Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon8 = React.forwardRef<SVGSVGElement, WindowGroupIcon8Props>(
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
        <rect x="3" y="3" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="5" y="5" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/>
      </svg>
    );
  }
);

WindowGroupIcon8.displayName = "WindowGroupIcon8";

export default WindowGroupIcon8;
