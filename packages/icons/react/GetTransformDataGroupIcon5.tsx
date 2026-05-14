import React from "react";
import type { SVGProps } from "react";

export interface GetTransformDataGroupIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const GetTransformDataGroupIcon5 = React.forwardRef<SVGSVGElement, GetTransformDataGroupIcon5Props>(
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
        <rect x="2" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <rect x="12" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <path d="M8 8 L12 8" stroke="#00A859" strokeWidth="1.5"/>
      </svg>
    );
  }
);

GetTransformDataGroupIcon5.displayName = "GetTransformDataGroupIcon5";

export default GetTransformDataGroupIcon5;
