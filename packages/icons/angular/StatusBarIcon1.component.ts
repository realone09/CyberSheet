import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'status-bar-icon1',
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
      <rect x="1" y="1" width="5" height="5"/> <rect x="8" y="1" width="5" height="5"/> <rect x="1" y="8" width="5" height="5"/> <rect x="8" y="8" width="5" height="5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
