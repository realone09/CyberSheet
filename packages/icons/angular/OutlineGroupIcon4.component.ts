import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'outline-group-icon4',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 6 4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0 L3 4 L6 0" fill="#333"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutlineGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 6;
  @Input() height: string | number = 4;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
