import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'window-group-icon5',
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
      <rect x="3" y="4" width="14" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="10" cy="10" r="3" fill="#E3F2FD" stroke="#0078D4" strokeWidth="1"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
