import React from "react";
import type { SVGProps } from "react";

export interface CommentsGroupIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const CommentsGroupIcon5 = React.forwardRef<SVGSVGElement, CommentsGroupIcon5Props>(
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
        {/* Comment bubble with eye */} <rect x="2" y="5" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 15 L10 18 L12 15" fill="#0078D4" /> <ellipse cx="8" cy="10" rx="2.5" ry="1.5" fill="none" stroke="#0078D4" strokeWidth="1" /> <circle cx="8" cy="10" r="0.8" fill="#0078D4" />
      </svg>
    );
  }
);

CommentsGroupIcon5.displayName = "CommentsGroupIcon5";

export default CommentsGroupIcon5;
