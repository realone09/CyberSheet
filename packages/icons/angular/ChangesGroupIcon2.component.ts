import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'changes-group-icon2',
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
      <path d="M0,0 L3,3 L6,0" stroke="#333" strokeWidth="1" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangesGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 6;
  @Input() height: string | number = 4;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
