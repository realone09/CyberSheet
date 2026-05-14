import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'window-group-icon4',
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
      <rect x="3" y="4" width="14" height="12" stroke="#888" strokeWidth="1.5" fill="none"/> <line x1="2" y1="2" x2="18" y2="18" stroke="#888" strokeWidth="2"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
