import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'title-bar-icon4',
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
      <path d="M6 3H10.59L8.29 0.71L9 0L13 4L9 8L8.29 7.29L10.59 5H6C3.79 5 2 6.79 2 9C2 11.21 3.79 13 6 13H10V11H6C4.9 11 4 10.1 4 9C4 7.9 4.9 7 6 7H10.59L8.29 9.29L9 10L13 6"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleBarIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
