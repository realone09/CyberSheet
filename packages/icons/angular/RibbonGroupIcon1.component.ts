import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ribbon-group-icon1',
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
      <path d="M11 11L7 7M7 7L3 3M7 7L11 3M7 7L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RibbonGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
