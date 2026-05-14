import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'data-tools-group-icon3',
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
      {/* Text to columns icon - split arrow */} <rect x="2" y="2" width="6" height="12" fill="#0078D4" opacity="0.3"/> <path d="M10 4 L8 8 L10 8 L10 12 L12 8 L10 8 Z" fill="#0078D4"/> <rect x="14" y="2" width="2" height="12" fill="#0078D4" opacity="0.5"/> <rect x="17" y="2" width="1" height="12" fill="#0078D4" opacity="0.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataToolsGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
