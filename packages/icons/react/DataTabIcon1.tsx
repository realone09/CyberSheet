import React from "react";
import type { SVGProps } from "react";

export interface DataTabIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DataTabIcon1 = React.forwardRef<SVGSVGElement, DataTabIcon1Props>(
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
        <path d="M6 8 L8 6 C9 5 11 5 12 6 L14 8 M14 8 L12 10 C11 11 9 11 8 10 L6 8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="6" cy="8" r="2" fill="#0078D4"/> <circle cx="14" cy="8" r="2" fill="#0078D4"/>
      </svg>
    );
  }
);

DataTabIcon1.displayName = "DataTabIcon1";

export default DataTabIcon1;
