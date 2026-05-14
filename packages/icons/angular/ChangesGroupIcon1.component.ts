import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'changes-group-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 24 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document */} <rect x="4" y="2" width="12" height="16" fill="none" stroke="#0078D4" strokeWidth="1.5" rx="1"/> <line x1="7" y1="6" x2="13" y2="6" stroke="#0078D4" strokeWidth="1"/> <line x1="7" y1="9" x2="13" y2="9" stroke="#0078D4" strokeWidth="1"/> <line x1="7" y1="12" x2="11" y2="12" stroke="#0078D4" strokeWidth="1"/> {/* Pencil overlay */} <path d="M15 10 L18 7 L20 9 L17 12 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/> <path d="M15 10 L14 13 L17 12 Z" fill="#FFE699"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangesGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
