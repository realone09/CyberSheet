import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'borders-group-icon5',
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
      <path d="M12 2L4 10l-2 4 4-2L14 4z M10 4l2 2"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BordersGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
