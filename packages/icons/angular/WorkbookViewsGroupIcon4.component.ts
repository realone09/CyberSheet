import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'workbook-views-group-icon4',
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
      <rect x="3" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="3" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbookViewsGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
