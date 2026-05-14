import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'outline-group-icon3',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 20 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ungroup icon - open bracket */} <path d="M4 3 L2 3 L2 13 L4 13" stroke="#999" strokeWidth="1.5" fill="none" strokeDasharray="2,1"/> <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/> <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/> <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/> <circle cx="16" cy="8" r="2" fill="#E83E3E"/> <text x="14.5" y="10" fontSize="4" fill="#FFF" fontWeight="bold">+</text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutlineGroupIcon3Component {
  @Input() className: string = '';
  @Input() width: string | number = 20;
  @Input() height: string | number = 16;
  @Input() fill: string = 'none';
  @Input() stroke: string = '';
}
