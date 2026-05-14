import React from "react";
import type { SVGProps } from "react";

export interface GetTransformDataGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const GetTransformDataGroupIcon3 = React.forwardRef<SVGSVGElement, GetTransformDataGroupIcon3Props>(
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
        <path d="M10 3 L10 7 L6 7 M10 3 C7 3 5 5 5 7 M10 13 L10 9 L14 9 M10 13 C13 13 15 11 15 9" stroke="#00A859" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

GetTransformDataGroupIcon3.displayName = "GetTransformDataGroupIcon3";

export default GetTransformDataGroupIcon3;
