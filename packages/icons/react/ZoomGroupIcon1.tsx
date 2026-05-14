import React from "react";
import type { SVGProps } from "react";

export interface ZoomGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ZoomGroupIcon1 = React.forwardRef<SVGSVGElement, ZoomGroupIcon1Props>(
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
        <rect x="3" y="3" width="14" height="14" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2" fill="none"/> <circle cx="15" cy="15" r="3" fill="#0078D4"/> <path d="M17 17 L19 19" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
);

ZoomGroupIcon1.displayName = "ZoomGroupIcon1";

export default ZoomGroupIcon1;
