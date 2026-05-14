import React from "react";
import type { SVGProps } from "react";

export interface WorkbookViewsGroupIcon4Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WorkbookViewsGroupIcon4 = React.forwardRef<SVGSVGElement, WorkbookViewsGroupIcon4Props>(
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
        <rect x="3" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="3" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
);

WorkbookViewsGroupIcon4.displayName = "WorkbookViewsGroupIcon4";

export default WorkbookViewsGroupIcon4;
