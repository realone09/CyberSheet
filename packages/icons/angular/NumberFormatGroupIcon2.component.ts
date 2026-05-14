import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'number-format-group-icon2',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4" cy="14" r="1.5" /> <text x="7" y="13" fontSize="12" fontWeight="600">0</text> <text x="12" y="12" fontSize="10" fontWeight="600" fill="#c00">−</text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFormatGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 18;
  @Input() height: string | number = 18;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
