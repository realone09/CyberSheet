import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'borders-group-icon1',
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
      <rect x="4" y="4" width="16" height="16" fill="none" stroke={hasBorder('top') || hasBorder('bottom') || hasBorder('left') || hasBorder('right') ? '#ccc' : 'none'} strokeWidth="0.5" /> {/* Top border */} {hasBorder('top') && ( <line x1="4" y1="4" x2="20" y2="4" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'top' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Bottom border */} {hasBorder('bottom') && ( <line x1="4" y1="20" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'bottom' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Left border */} {hasBorder('left') && ( <line x1="4" y1="4" x2="4" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'left' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Right border */} {hasBorder('right') && ( <line x1="20" y1="4" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'right' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Inside horizontal */} {preset.borders.some(b => b.edge === 'insideHorizontal') && ( <line x1="4" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1" /> )} {/* Inside vertical */} {preset.borders.some(b => b.edge === 'insideVertical') && ( <line x1="12" y1="4" x2="12" y2="20" stroke="#000" strokeWidth="1" /> )}
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BordersGroupIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
