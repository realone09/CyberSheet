import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sort-filter-group-icon5',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 8 5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0 L4 5 L8 0" fill="#333"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterGroupIcon5Component {
  @Input() className: string = '';
  @Input() width: string | number = 8;
  @Input() height: string | number = 5;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
