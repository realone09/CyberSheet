import React from "react";
import type { SVGProps } from "react";

export interface DataToolsGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataToolsGroupIcon1 = React.forwardRef<SVGSVGElement, DataToolsGroupIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 16
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 20 16"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        {/* Data validation icon - check mark with exclamation */} <path d="M2 8 L6 12 L14 2" stroke="#00A859" strokeWidth="2" fill="none"/> <circle cx="16" cy="12" r="3" fill="#E83E3E"/> <text x="15.5" y="14.5" fontSize="5" fill="#FFF" fontWeight="bold">!</text>
      </svg>
    );
  }
);

DataToolsGroupIcon1.displayName = "DataToolsGroupIcon1";

export default DataToolsGroupIcon1;
