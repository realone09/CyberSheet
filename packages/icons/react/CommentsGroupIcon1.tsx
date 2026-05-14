import React from "react";
import type { SVGProps } from "react";

export interface CommentsGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const CommentsGroupIcon1 = React.forwardRef<SVGSVGElement, CommentsGroupIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 20,
      height: props.height || 20
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        {/* Comment bubble with plus */} <rect x="2" y="4" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 14 L10 17 L12 14" fill="#0078D4" /> <line x1="9" y1="7" x2="9" y2="11" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="9" x2="11" y2="9" stroke="#0078D4" strokeWidth="1.5" />
      </svg>
    );
  }
);

CommentsGroupIcon1.displayName = "CommentsGroupIcon1";

export default CommentsGroupIcon1;
