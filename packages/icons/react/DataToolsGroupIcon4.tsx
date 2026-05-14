import React from "react";
import type { SVGProps } from "react";

export interface DataToolsGroupIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataToolsGroupIcon4 = React.forwardRef<SVGSVGElement, DataToolsGroupIcon4Props>(
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
        {/* Flash fill icon - lightning bolt */} <path d="M10 2 L6 8 L10 8 L8 14 L14 6 L10 6 L12 2 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/>
      </svg>
    );
  }
);

DataToolsGroupIcon4.displayName = "DataToolsGroupIcon4";

export default DataToolsGroupIcon4;
