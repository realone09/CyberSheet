import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sort-filter-group-icon4',
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
      <path d="M1 2 L6 8 L6 12 L8 13 L8 8 L13 2 Z" stroke="#333" strokeWidth="1" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterGroupIcon4Component {
  @Input() className: string = '';
  @Input() width: string | number = 14;
  @Input() height: string | number = 14;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
