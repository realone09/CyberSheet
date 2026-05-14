import React from "react";
import type { SVGProps } from "react";

export interface DataToolsGroupIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataToolsGroupIcon5 = React.forwardRef<SVGSVGElement, DataToolsGroupIcon5Props>(
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
        {/* Remove duplicates icon - two squares with X */} <rect x="2" y="2" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="6" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none" opacity="0.5"/> <path d="M4 4 L8 8 M8 4 L4 8" stroke="#E83E3E" strokeWidth="1.5"/>
      </svg>
    );
  }
);

DataToolsGroupIcon5.displayName = "DataToolsGroupIcon5";

export default DataToolsGroupIcon5;
