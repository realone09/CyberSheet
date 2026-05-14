import React from "react";
import type { SVGProps } from "react";

export interface ProofingGroupIcon3Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ProofingGroupIcon3 = React.forwardRef<SVGSVGElement, ProofingGroupIcon3Props>(
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
        {/* Magnifying glass over document icon */} <rect x="3" y="2" width="10" height="13" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="5" y1="5" x2="11" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="5" y1="8" x2="9" y2="8" stroke="#0078D4" strokeWidth="1" /> <circle cx="13" cy="11" r="3" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="15" y1="13" x2="17.5" y2="15.5" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
);

ProofingGroupIcon3.displayName = "ProofingGroupIcon3";

export default ProofingGroupIcon3;
