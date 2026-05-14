import React from "react";
import type { SVGProps } from "react";

export interface WorkbookViewsGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WorkbookViewsGroupIcon1 = React.forwardRef<SVGSVGElement, WorkbookViewsGroupIcon1Props>(
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
        <rect x="4" y="4" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="4" y1="10" x2="20" y2="10" stroke="#0078D4" strokeWidth="1"/> <line x1="10" y1="4" x2="10" y2="20" stroke="#0078D4" strokeWidth="1"/>
      </svg>
    );
  }
);

WorkbookViewsGroupIcon1.displayName = "WorkbookViewsGroupIcon1";

export default WorkbookViewsGroupIcon1;
