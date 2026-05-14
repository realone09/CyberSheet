import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'shape-gallery-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${getPath()}
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShapeGalleryIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = ${s};
  @Input() height: string | number = ${s};
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
