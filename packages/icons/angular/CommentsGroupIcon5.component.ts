import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'comments-group-icon5',
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
      {/* Comment bubble with eye */} <rect x="2" y="5" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 15 L10 18 L12 15" fill="#0078D4" /> <ellipse cx="8" cy="10" rx="2.5" ry="1.5" fill="none" stroke="#0078D4" strokeWidth="1" /> <circle cx="8" cy="10" r="0.8" fill="#0078D4" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
