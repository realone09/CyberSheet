import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sort-filter-group-icon3',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Multi-level sort icon */} <rect x="3" y="3" width="14" height="2" fill="#333"/> <rect x="5" y="7" width="12" height="2" fill="#666"/> <rect x="7" y="11" width="10" height="2" fill="#999"/> <rect x="9" y="15" width="8" height="2" fill="#BBB"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
