import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon8Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon8 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon8Props>(
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
        <path d="M10 2l4 4-4 4V7H6v6H4V7H2V5h8V2z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon8.displayName = "AlignmentGroupV2Icon8";

export default AlignmentGroupV2Icon8;
