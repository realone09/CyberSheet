import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'styles-group-icon1',
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
      <rect x="2" y="2" width="12" height="3" fill="#4472C4" /> <rect x="2" y="5" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="7" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" /> <rect x="2" y="9" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="11" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StylesGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 16;
  @Input() height: string | number = 16;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
