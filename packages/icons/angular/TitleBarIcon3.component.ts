import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'title-bar-icon3',
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
      <path d="M8 3H3.41L5.71 0.71L5 0L1 4L5 8L5.71 7.29L3.41 5H8C10.21 5 12 6.79 12 9C12 11.21 10.21 13 8 13H4V11H8C9.1 11 10 10.1 10 9C10 7.9 9.1 7 8 7H3.41L5.71 9.29L5 10L1 6"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleBarIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
