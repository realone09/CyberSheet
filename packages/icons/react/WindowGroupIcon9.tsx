import React from "react";
import type { SVGProps } from "react";

export interface WindowGroupIcon9Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WindowGroupIcon9 = React.forwardRef<SVGSVGElement, WindowGroupIcon9Props>(
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
        <rect x="2" y="4" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="8" y="8" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/> <path d="M15 10 L17 12 L15 14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

WindowGroupIcon9.displayName = "WindowGroupIcon9";

export default WindowGroupIcon9;
