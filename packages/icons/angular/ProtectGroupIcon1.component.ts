import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'protect-group-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield with checkmark icon */} <path d="M10 2 L4 4 L4 10 Q4 14 10 18 Q16 14 16 10 L16 4 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" /> <path d="M7 10 L9 12 L13 8" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
