import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'borders-group-icon3',
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
      <rect x="2" y="2" width="12" height="10" fill="none" stroke="currentColor" strokeWidth="2" /> <rect x="2" y="13" width="12" height="2" fill={currentBorderColor} />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BordersGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
