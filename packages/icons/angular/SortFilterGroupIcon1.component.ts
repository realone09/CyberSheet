import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sort-filter-group-icon1',
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
      {/* A→Z icon with up arrow */} <text x="2" y="14" fontSize="10" fontWeight="bold" fill="#333">A</text> <text x="2" y="6" fontSize="8" fill="#666">Z</text> <path d="M15 12 L12 15 L15 12 L18 15 M15 5 L15 15" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 20;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
