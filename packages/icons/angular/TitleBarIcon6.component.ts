import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'title-bar-icon6',
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
      <path d="M10 9C9.4 9 8.9 9.2 8.5 9.6L5.9 8.1C5.97 7.75 5.97 7.25 5.9 6.9L8.5 5.4C8.9 5.8 9.4 6 10 6C11.1 6 12 5.1 12 4C12 2.9 11.1 2 10 2C8.9 2 8 2.9 8 4C8 4.18 8.03 4.35 8.07 4.5L5.5 6C5.1 5.6 4.6 5.4 4 5.4C2.9 5.4 2 6.3 2 7.4C2 8.5 2.9 9.4 4 9.4C4.6 9.4 5.1 9.2 5.5 8.8L8.1 10.3C8.03 10.5 8 10.7 8 10.9C8 12 8.9 12.9 10 12.9C11.1 12.9 12 12 12 10.9C12 9.8 11.1 9 10 9Z"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleBarIcon6Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
