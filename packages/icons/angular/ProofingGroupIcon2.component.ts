import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'proofing-group-icon2',
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
      {/* Book icon */} <rect x="4" y="3" width="12" height="14" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="10" y1="3" x2="10" y2="17" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="7" x2="8" y2="7" stroke="#0078D4" strokeWidth="1" /> <line x1="7" y1="10" x2="8" y2="10" stroke="#0078D4" strokeWidth="1" /> <line x1="12" y1="7" x2="13" y2="7" stroke="#0078D4" strokeWidth="1" /> <line x1="12" y1="10" x2="13" y2="10" stroke="#0078D4" strokeWidth="1" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProofingGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
