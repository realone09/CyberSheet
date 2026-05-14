import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'workbook-views-group-icon2',
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
      <rect x="3" y="3" width="18" height="18" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="3" y1="12" x2="21" y2="12" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/> <line x1="12" y1="3" x2="12" y2="21" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbookViewsGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
