import React from "react";
import type { SVGProps } from "react";

export interface GetTransformDataGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const GetTransformDataGroupIcon1 = React.forwardRef<SVGSVGElement, GetTransformDataGroupIcon1Props>(
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
        <rect x="2" y="2" width="16" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <path d="M6 6 L10 10 L14 6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

GetTransformDataGroupIcon1.displayName = "GetTransformDataGroupIcon1";

export default GetTransformDataGroupIcon1;
