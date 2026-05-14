import React from "react";
import type { SVGProps } from "react";

export interface CommentsGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const CommentsGroupIcon2 = React.forwardRef<SVGSVGElement, CommentsGroupIcon2Props>(
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
        {/* Trash can icon */} <rect x="4" y="5" width="8" height="9" rx="1" fill="none" stroke="#D13438" strokeWidth="1.5" /> <line x1="3" y1="5" x2="13" y2="5" stroke="#D13438" strokeWidth="1.5" /> <path d="M6 3 L10 3" stroke="#D13438" strokeWidth="1.5" strokeLinecap="round" /> <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="#D13438" strokeWidth="1" /> <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="#D13438" strokeWidth="1" />
      </svg>
    );
  }
);

CommentsGroupIcon2.displayName = "CommentsGroupIcon2";

export default CommentsGroupIcon2;
