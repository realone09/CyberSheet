import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'changes-group-icon3',
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
      <circle cx="10" cy="10" r="7" fill="none" stroke="#0078D4" strokeWidth="1.5"/> <path d="M10 6 L10 10 L13 13" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/> <path d="M3 8 L1 10 L3 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangesGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
