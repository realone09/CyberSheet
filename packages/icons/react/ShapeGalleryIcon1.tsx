import React from "react";
import type { SVGProps } from "react";

export interface ShapeGalleryIcon1Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const ShapeGalleryIcon1 = React.forwardRef<SVGSVGElement, ShapeGalleryIcon1Props>(
  ({ size, className, style, ...props }, ref) => {
    const dimensions = size ? { width: size, height: size } : {
      width: props.width || ${s},
      height: props.height || ${s}
    };

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={dimensions.width}
        height={dimensions.height}
        fill={props.fill || "currentColor"}
        className={className}
        style={style}
        {...props}
      >
        ${getPath()}
      </svg>
    );
  }
);

ShapeGalleryIcon1.displayName = "ShapeGalleryIcon1";

export default ShapeGalleryIcon1;
