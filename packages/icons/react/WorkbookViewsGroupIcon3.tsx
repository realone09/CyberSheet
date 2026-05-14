import React from "react";
import type { SVGProps } from "react";

export interface WorkbookViewsGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WorkbookViewsGroupIcon3 = React.forwardRef<SVGSVGElement, WorkbookViewsGroupIcon3Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || 24,
      height: props.height || 24
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "none"}
        className={className}
        style={style}
        {...props}
      >
        <rect x="4" y="2" width="16" height="20" stroke="#0078D4" strokeWidth="2" fill="none"/> <rect x="6" y="4" width="12" height="14" fill="#E3F2FD"/> <line x1="4" y1="18" x2="20" y2="18" stroke="#0078D4" strokeWidth="1"/>
      </svg>
    );
  }
);

WorkbookViewsGroupIcon3.displayName = "WorkbookViewsGroupIcon3";

export default WorkbookViewsGroupIcon3;
