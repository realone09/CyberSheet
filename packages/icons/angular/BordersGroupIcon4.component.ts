import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'borders-group-icon4',
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
      <path d="M14 2l-12 12M13 1 l-1 1 1 1 1-1-1-1z"/> <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BordersGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
