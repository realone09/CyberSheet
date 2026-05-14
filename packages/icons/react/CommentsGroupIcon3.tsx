import React from "react";
import type { SVGProps } from "react";

export interface CommentsGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const CommentsGroupIcon3 = React.forwardRef<SVGSVGElement, CommentsGroupIcon3Props>(
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
        {/* Up arrow */} <path d="M8 4 L8 12" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <path d="M5 7 L8 4 L11 7" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
);

CommentsGroupIcon3.displayName = "CommentsGroupIcon3";

export default CommentsGroupIcon3;
