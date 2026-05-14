import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'alignment-group-v2-icon6',
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
      <path d="M4 6h8v2H4V6z"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlignmentGroupV2Icon6Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
