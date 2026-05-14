import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon10Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon10 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon10Props>(
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
        <path d="M2 3h12v2H2V3zm4 4h8v2H6V7zm0 4h8v2H6v-2zM2 6v6l3-3-3-3z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon10.displayName = "AlignmentGroupV2Icon10";

export default AlignmentGroupV2Icon10;
