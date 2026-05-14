import React from "react";
import type { SVGProps } from "react";

export interface ProofingGroupIcon2Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ProofingGroupIcon2 = React.forwardRef<SVGSVGElement, ProofingGroupIcon2Props>(
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
        {/* Book icon */} <rect x="4" y="3" width="12" height="14" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="10" y1="3" x2="10" y2="17" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="7" x2="8" y2="7" stroke="#0078D4" strokeWidth="1" /> <line x1="7" y1="10" x2="8" y2="10" stroke="#0078D4" strokeWidth="1" /> <line x1="12" y1="7" x2="13" y2="7" stroke="#0078D4" strokeWidth="1" /> <line x1="12" y1="10" x2="13" y2="10" stroke="#0078D4" strokeWidth="1" />
      </svg>
    );
  }
);

ProofingGroupIcon2.displayName = "ProofingGroupIcon2";

export default ProofingGroupIcon2;
