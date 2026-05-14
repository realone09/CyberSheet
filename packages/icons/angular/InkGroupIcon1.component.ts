import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ink-group-icon1',
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
      {/* Pen with slash icon */} <path d="M15 3 L17 5 L8 14 L5 15 L6 12 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <circle cx="16" cy="4" r="1.5" fill="#0078D4" /> {/* Slash through */} <line x1="3" y1="17" x2="17" y2="3" stroke="#D13438" strokeWidth="2" strokeLinecap="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InkGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
