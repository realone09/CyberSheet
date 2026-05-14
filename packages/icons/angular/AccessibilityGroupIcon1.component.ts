import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'accessibility-group-icon1',
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
      {/* Accessibility person icon with checkmark */} <circle cx="10" cy="5" r="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M6 9 L10 7 L14 9" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="10" y1="7" x2="10" y2="12" stroke="#0078D4" strokeWidth="1.5" /> <path d="M7 12 L10 12 L13 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="8" y1="12" x2="7" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <line x1="12" y1="12" x2="13" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> {/* Checkmark */} <path d="M14 3 L15.5 4.5 L18 2" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
