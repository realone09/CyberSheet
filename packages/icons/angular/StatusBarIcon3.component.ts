import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'status-bar-icon3',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="12" height="12" fill="none" stroke="currentColor"/> <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeDasharray="2"/> <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeDasharray="2"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
