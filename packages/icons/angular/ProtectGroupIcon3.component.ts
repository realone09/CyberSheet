import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'protect-group-icon3',
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
      {/* Grid cells with unlock icon */} <rect x="3" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="11" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="3" y="11" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> {/* Unlocked padlock */} <rect x="12" y="13" width="4" height="4" rx="0.5" fill="#107C10" /> <path d="M13 13 L13 11.5 Q13 10.5 14 10.5 Q15 10.5 15 11.5 L15 12" fill="none" stroke="#107C10" strokeWidth="1.2" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
