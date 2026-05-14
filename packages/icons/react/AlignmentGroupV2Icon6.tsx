import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon6Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon6 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon6Props>(
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
        <path d="M4 6h8v2H4V6z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon6.displayName = "AlignmentGroupV2Icon6";

export default AlignmentGroupV2Icon6;
