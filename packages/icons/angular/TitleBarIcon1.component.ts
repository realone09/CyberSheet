import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'title-bar-icon1',
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
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#217346"/> <path d="M4 4L8 12L12 4" stroke="white" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleBarIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
