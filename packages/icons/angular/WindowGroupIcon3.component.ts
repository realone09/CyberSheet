import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'window-group-icon3',
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
      <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="2" y1="10" x2="18" y2="10" stroke="#0078D4" strokeWidth="2"/> <line x1="10" y1="2" x2="10" y2="18" stroke="#0078D4" strokeWidth="2"/> <circle cx="10" cy="10" r="2" fill="#0078D4"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
