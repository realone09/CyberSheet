import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'data-tools-group-icon4',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flash fill icon - lightning bolt */} <path d="M10 2 L6 8 L10 8 L8 14 L14 6 L10 6 L12 2 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataToolsGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
