import React from "react";
import type { SVGProps } from "react";

export interface ProofingGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ProofingGroupIcon1 = React.forwardRef<SVGSVGElement, ProofingGroupIcon1Props>(
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
        {/* ABC with checkmark icon */} <text x="2" y="14" fill="#0078D4" fontSize="12" fontWeight="bold" fontFamily="Segoe UI" > ABC </text> <path d="M14 4 L16 6 L19 3" stroke="#107C10" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
);

ProofingGroupIcon1.displayName = "ProofingGroupIcon1";

export default ProofingGroupIcon1;
