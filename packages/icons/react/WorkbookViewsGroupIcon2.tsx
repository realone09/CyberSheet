import React from "react";
import type { SVGProps } from "react";

export interface WorkbookViewsGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WorkbookViewsGroupIcon2 = React.forwardRef<SVGSVGElement, WorkbookViewsGroupIcon2Props>(
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
        <rect x="3" y="3" width="18" height="18" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="3" y1="12" x2="21" y2="12" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/> <line x1="12" y1="3" x2="12" y2="21" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
      </svg>
    );
  }
);

WorkbookViewsGroupIcon2.displayName = "WorkbookViewsGroupIcon2";

export default WorkbookViewsGroupIcon2;
