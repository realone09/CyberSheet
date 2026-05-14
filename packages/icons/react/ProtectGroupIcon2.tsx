import React from "react";
import type { SVGProps } from "react";

export interface ProtectGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ProtectGroupIcon2 = React.forwardRef<SVGSVGElement, ProtectGroupIcon2Props>(
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
        {/* Workbook with lock icon */} <rect x="3" y="2" width="12" height="15" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="6" y1="5" x2="12" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="6" y1="8" x2="10" y2="8" stroke="#0078D4" strokeWidth="1" /> {/* Lock */} <rect x="13" y="11" width="5" height="6" rx="0.5" fill="#0078D4" /> <path d="M14 11 L14 9.5 Q14 8 15.5 8 Q17 8 17 9.5 L17 11" fill="none" stroke="#0078D4" strokeWidth="1.2" />
      </svg>
    );
  }
);

ProtectGroupIcon2.displayName = "ProtectGroupIcon2";

export default ProtectGroupIcon2;
