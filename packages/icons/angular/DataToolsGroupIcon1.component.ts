import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'data-tools-group-icon1',
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
      {/* Data validation icon - check mark with exclamation */} <path d="M2 8 L6 12 L14 2" stroke="#00A859" strokeWidth="2" fill="none"/> <circle cx="16" cy="12" r="3" fill="#E83E3E"/> <text x="15.5" y="14.5" fontSize="5" fill="#FFF" fontWeight="bold">!</text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataToolsGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
