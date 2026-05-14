import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'title-bar-icon5',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/> <path d="M9 9L13 13" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleBarIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
