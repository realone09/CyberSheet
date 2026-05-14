import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'data-tools-group-icon5',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Remove duplicates icon - two squares with X */} <rect x="2" y="2" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="6" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none" opacity="0.5"/> <path d="M4 4 L8 8 M8 4 L4 8" stroke="#E83E3E" strokeWidth="1.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataToolsGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
