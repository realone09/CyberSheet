import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sort-filter-group-icon2',
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
      {/* Z→A icon with down arrow */} <text x="2" y="6" fontSize="10" fontWeight="bold" fill="#333">Z</text> <text x="2" y="14" fontSize="8" fill="#666">A</text> <path d="M15 8 L12 5 L15 8 L18 5 M15 15 L15 5" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterGroupIcon2Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
