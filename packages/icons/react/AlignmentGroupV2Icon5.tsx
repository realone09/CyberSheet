import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon5 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon5Props>(
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
        <path d="M2 2h12v2H2V2zm2 4h8v2H4V6z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon5.displayName = "AlignmentGroupV2Icon5";

export default AlignmentGroupV2Icon5;
