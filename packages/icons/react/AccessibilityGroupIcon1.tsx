import React from "react";
import type { SVGProps } from "react";

export interface AccessibilityGroupIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const AccessibilityGroupIcon1 = React.forwardRef<SVGSVGElement, AccessibilityGroupIcon1Props>(
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
        {/* Accessibility person icon with checkmark */} <circle cx="10" cy="5" r="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M6 9 L10 7 L14 9" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="10" y1="7" x2="10" y2="12" stroke="#0078D4" strokeWidth="1.5" /> <path d="M7 12 L10 12 L13 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="8" y1="12" x2="7" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <line x1="12" y1="12" x2="13" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> {/* Checkmark */} <path d="M14 3 L15.5 4.5 L18 2" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
);

AccessibilityGroupIcon1.displayName = "AccessibilityGroupIcon1";

export default AccessibilityGroupIcon1;
