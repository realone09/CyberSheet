import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'zoom-group-icon2',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text x="10" y="14" textAnchor="middle" fill="#0078D4" fontSize="12" fontWeight="bold">100</text> <text x="16" y="10" fill="#0078D4" fontSize="8">%</text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
