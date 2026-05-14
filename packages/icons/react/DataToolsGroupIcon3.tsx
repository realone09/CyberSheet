import React from "react";
import type { SVGProps } from "react";

export interface DataToolsGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataToolsGroupIcon3 = React.forwardRef<SVGSVGElement, DataToolsGroupIcon3Props>(
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
        {/* Text to columns icon - split arrow */} <rect x="2" y="2" width="6" height="12" fill="#0078D4" opacity="0.3"/> <path d="M10 4 L8 8 L10 8 L10 12 L12 8 L10 8 Z" fill="#0078D4"/> <rect x="14" y="2" width="2" height="12" fill="#0078D4" opacity="0.5"/> <rect x="17" y="2" width="1" height="12" fill="#0078D4" opacity="0.5"/>
      </svg>
    );
  }
);

DataToolsGroupIcon3.displayName = "DataToolsGroupIcon3";

export default DataToolsGroupIcon3;
