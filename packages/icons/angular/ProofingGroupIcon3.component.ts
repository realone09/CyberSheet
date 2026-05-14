import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'proofing-group-icon3',
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
      {/* Magnifying glass over document icon */} <rect x="3" y="2" width="10" height="13" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="5" y1="5" x2="11" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="5" y1="8" x2="9" y2="8" stroke="#0078D4" strokeWidth="1" /> <circle cx="13" cy="11" r="3" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="15" y1="13" x2="17.5" y2="15.5" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProofingGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
