import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'proofing-group-icon1',
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
      {/* ABC with checkmark icon */} <text x="2" y="14" fill="#0078D4" fontSize="12" fontWeight="bold" fontFamily="Segoe UI" > ABC </text> <path d="M14 4 L16 6 L19 3" stroke="#107C10" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProofingGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
