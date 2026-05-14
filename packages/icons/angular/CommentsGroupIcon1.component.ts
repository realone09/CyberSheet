import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'comments-group-icon1',
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
      {/* Comment bubble with plus */} <rect x="2" y="4" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 14 L10 17 L12 14" fill="#0078D4" /> <line x1="9" y1="7" x2="9" y2="11" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="9" x2="11" y2="9" stroke="#0078D4" strokeWidth="1.5" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
