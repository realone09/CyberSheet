import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pattern-grid-icon1',
  standalone: true,
  template: `
    <svg
      [attr.class]="className"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs> <pattern id={`pattern-${pattern.type}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" > <rect width="8" height="8" fill={backgroundColor} /> <path d={pattern.svgPattern} stroke={foregroundColor} fill="none" strokeWidth="1" /> </pattern> </defs> <rect width="24" height="24" fill={`url(#pattern-${pattern.type})`} />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternGridIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
