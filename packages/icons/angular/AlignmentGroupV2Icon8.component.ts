import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'alignment-group-v2-icon8',
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
      <path d="M10 2l4 4-4 4V7H6v6H4V7H2V5h8V2z"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlignmentGroupV2Icon8Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
