import React from "react";
import type { SVGProps } from "react";

export interface StylesGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const StylesGroupIcon1 = React.forwardRef<SVGSVGElement, StylesGroupIcon1Props>(
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
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <rect x="2" y="2" width="12" height="3" fill="#4472C4" /> <rect x="2" y="5" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="7" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" /> <rect x="2" y="9" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="11" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" />
      </svg>
    );
  }
);

StylesGroupIcon1.displayName = "StylesGroupIcon1";

export default StylesGroupIcon1;
