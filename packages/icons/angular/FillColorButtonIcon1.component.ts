import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'fill-color-button-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="16" fill={fill.background} /> {/* Simplified pattern preview */} <text x="10" y="12" fontSize="10" textAnchor="middle" fill={fill.foreground}> ⊞ </text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FillColorButtonIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
