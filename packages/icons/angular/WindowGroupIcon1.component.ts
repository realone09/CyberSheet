import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'window-group-icon1',
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
      <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="2" y1="8" x2="18" y2="8" stroke="#0078D4" strokeWidth="2.5"/> <line x1="8" y1="2" x2="8" y2="18" stroke="#0078D4" strokeWidth="2.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
