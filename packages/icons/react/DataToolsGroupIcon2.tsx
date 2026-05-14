import React from "react";
import type { SVGProps } from "react";

export interface DataToolsGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataToolsGroupIcon2 = React.forwardRef<SVGSVGElement, DataToolsGroupIcon2Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 6,
      height: props.height || 4
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 6 4"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        <path d="M0 0 L3 4 L6 0" fill="#333"/>
      </svg>
    );
  }
);

DataToolsGroupIcon2.displayName = "DataToolsGroupIcon2";

export default DataToolsGroupIcon2;
