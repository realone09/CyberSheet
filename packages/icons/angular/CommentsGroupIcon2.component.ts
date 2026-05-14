import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'comments-group-icon2',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trash can icon */} <rect x="4" y="5" width="8" height="9" rx="1" fill="none" stroke="#D13438" strokeWidth="1.5" /> <line x1="3" y1="5" x2="13" y2="5" stroke="#D13438" strokeWidth="1.5" /> <path d="M6 3 L10 3" stroke="#D13438" strokeWidth="1.5" strokeLinecap="round" /> <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="#D13438" strokeWidth="1" /> <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="#D13438" strokeWidth="1" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
