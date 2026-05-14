import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'comments-group-icon4',
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
      {/* Down arrow */} <path d="M8 4 L8 12" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <path d="M5 9 L8 12 L11 9" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
