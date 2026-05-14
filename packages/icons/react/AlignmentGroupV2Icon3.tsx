import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon3 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon3Props>(
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
        <path d="M4 3h10v2H4V3zm0 4h12v2H4V7zm0 4h10v2H4v-2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon3.displayName = "AlignmentGroupV2Icon3";

export default AlignmentGroupV2Icon3;
