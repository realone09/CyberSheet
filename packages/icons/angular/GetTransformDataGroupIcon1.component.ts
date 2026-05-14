import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'get-transform-data-group-icon1',
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
      <rect x="2" y="2" width="16" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <path d="M6 6 L10 10 L14 6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetTransformDataGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
