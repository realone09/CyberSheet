import React from "react";
import type { SVGProps } from "react";

export interface AlignmentGroupV2Icon12Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AlignmentGroupV2Icon12 = React.forwardRef<SVGSVGElement, AlignmentGroupV2Icon12Props>(
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
        <path d="M2 2v12h12V2H2zm10 10H4V4h8v8z"/>
      </svg>
    );
  }
);

AlignmentGroupV2Icon12.displayName = "AlignmentGroupV2Icon12";

export default AlignmentGroupV2Icon12;
