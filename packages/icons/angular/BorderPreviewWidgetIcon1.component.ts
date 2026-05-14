import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'border-preview-widget-icon1',
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
      {/* Outer rectangle (cell preview) */} <rect x="40" y="40" width="120" height="120" fill="none" stroke="#e0e0e0" strokeWidth="1" /> {/* Top edge */} <line x1="40" y1="40" x2="160" y2="40" {...getStrokeStyle('top')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('top')} onMouseEnter={() => handleMouseEnter('top')} onMouseLeave={handleMouseLeave} /> {/* Bottom edge */} <line x1="40" y1="160" x2="160" y2="160" {...getStrokeStyle('bottom')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('bottom')} onMouseEnter={() => handleMouseEnter('bottom')} onMouseLeave={handleMouseLeave} /> {/* Left edge */} <line x1="40" y1="40" x2="40" y2="160" {...getStrokeStyle('left')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('left')} onMouseEnter={() => handleMouseEnter('left')} onMouseLeave={handleMouseLeave} /> {/* Right edge */} <line x1="160" y1="40" x2="160" y2="160" {...getStrokeStyle('right')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('right')} onMouseEnter={() => handleMouseEnter('right')} onMouseLeave={handleMouseLeave} /> {/* Horizontal middle (for inside borders) */} <line x1="40" y1="100" x2="160" y2="100" {...getStrokeStyle('horizontal')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('horizontal')} onMouseEnter={() => handleMouseEnter('horizontal')} onMouseLeave={handleMouseLeave} /> {/* Vertical middle (for inside borders) */} <line x1="100" y1="40" x2="100" y2="160" {...getStrokeStyle('vertical')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('vertical')} onMouseEnter={() => handleMouseEnter('vertical')} onMouseLeave={handleMouseLeave} /> {/* Diagonal Up */} <line x1="40" y1="160" x2="160" y2="40" {...getStrokeStyle('diagonalUp')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('diagonalUp')} onMouseEnter={() => handleMouseEnter('diagonalUp')} onMouseLeave={handleMouseLeave} /> {/* Diagonal Down */} <line x1="40" y1="40" x2="160" y2="160" {...getStrokeStyle('diagonalDown')} style={{ cursor: 'pointer' }} onClick={() => handleEdgeClick('diagonalDown')} onMouseEnter={() => handleMouseEnter('diagonalDown')} onMouseLeave={handleMouseLeave} />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorderPreviewWidgetIcon1Component {
  @Input() className: string = '';
  @Input() width: string | number = 200;
  @Input() height: string | number = 200;
  @Input() fill: string = 'currentColor';
  @Input() stroke: string = '';
}
