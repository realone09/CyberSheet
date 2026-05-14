import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'data-tab-icon1',
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
      <path d="M6 8 L8 6 C9 5 11 5 12 6 L14 8 M14 8 L12 10 C11 11 9 11 8 10 L6 8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="6" cy="8" r="2" fill="#0078D4"/> <circle cx="14" cy="8" r="2" fill="#0078D4"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTabIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
