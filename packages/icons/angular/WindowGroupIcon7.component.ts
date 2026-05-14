import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'window-group-icon7',
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
      <rect x="2" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="2" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="2" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="10" width="6" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowGroupIcon7Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
