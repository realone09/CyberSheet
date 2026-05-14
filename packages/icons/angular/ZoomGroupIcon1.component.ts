import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'zoom-group-icon1',
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
      <rect x="3" y="3" width="14" height="14" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2" fill="none"/> <circle cx="15" cy="15" r="3" fill="#0078D4"/> <path d="M17 17 L19 19" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
