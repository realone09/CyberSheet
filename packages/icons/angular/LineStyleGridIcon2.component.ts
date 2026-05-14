import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'line-style-grid-icon2',
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
      <line x1="0" y1="6" x2="100" y2="6" stroke={color} strokeWidth={metadata.strokeWidth} strokeDasharray={metadata.strokeDasharray} />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineStyleGridIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 100;
  @Input() height: string | number = 12;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
