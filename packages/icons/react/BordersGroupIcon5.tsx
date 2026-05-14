import React from "react";
import type { SVGProps } from "react";

export interface BordersGroupIcon5Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const BordersGroupIcon5 = React.forwardRef<SVGSVGElement, BordersGroupIcon5Props>(
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
        <path d="M12 2L4 10l-2 4 4-2L14 4z M10 4l2 2"/>
      </svg>
    );
  }
);

BordersGroupIcon5.displayName = "BordersGroupIcon5";

export default BordersGroupIcon5;
