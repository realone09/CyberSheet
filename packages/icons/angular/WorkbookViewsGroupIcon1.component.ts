import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'workbook-views-group-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="4" y1="10" x2="20" y2="10" stroke="#0078D4" strokeWidth="1"/> <line x1="10" y1="4" x2="10" y2="20" stroke="#0078D4" strokeWidth="1"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbookViewsGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
