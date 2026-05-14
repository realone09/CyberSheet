import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon7Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon7 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon7Props>(
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
        <path d="M4 10h8v2H4v-2zm-2 3h12v2H2v-2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon7.displayName = "AlignmentGroupV2Icon7";

export default AlignmentGroupV2Icon7;
