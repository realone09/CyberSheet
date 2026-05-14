import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon9Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon9 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon9Props>(
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
        <path d="M2 3h12v2H2V3zm0 3h10c1.1 0 2 .9 2 2s-.9 2-2 2H9l2-2-2-2v4H7V7h3c.55 0 1-.45 1-1H2V6zm0 5h8v2H2v-2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon9.displayName = "AlignmentGroupV2Icon9";

export default AlignmentGroupV2Icon9;
