import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'status-bar-icon2',
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
      <rect x="2" y="1" width="10" height="12" fill="none" stroke="currentColor"/> <line x1="4" y1="4" x2="10" y2="4" stroke="currentColor"/> <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor"/> <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
