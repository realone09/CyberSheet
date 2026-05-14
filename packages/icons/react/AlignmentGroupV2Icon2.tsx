import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon2 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon2Props>(
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
        <path d="M4 3h8v2H4V3zm2 4h4v2H6V7zm2 4h4v2H8v-2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon2.displayName = "AlignmentGroupV2Icon2";

export default AlignmentGroupV2Icon2;
