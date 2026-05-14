import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'get-transform-data-group-icon5',
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
      <rect x="2" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <rect x="12" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <path d="M8 8 L12 8" stroke="#00A859" strokeWidth="1.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetTransformDataGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
