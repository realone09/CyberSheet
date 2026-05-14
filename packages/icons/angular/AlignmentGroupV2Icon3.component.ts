import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'alignment-group-v2-icon3',
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
      <path d="M4 3h10v2H4V3zm0 4h12v2H4V7zm0 4h10v2H4v-2z"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlignmentGroupV2Icon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
