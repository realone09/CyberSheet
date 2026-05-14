import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'get-transform-data-group-icon3',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 3 L10 7 L6 7 M10 3 C7 3 5 5 5 7 M10 13 L10 9 L14 9 M10 13 C13 13 15 11 15 9" stroke="#00A859" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetTransformDataGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
