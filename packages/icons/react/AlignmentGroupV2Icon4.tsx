import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon4 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon4Props>(
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
        <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon4.displayName = "AlignmentGroupV2Icon4";

export default AlignmentGroupV2Icon4;
