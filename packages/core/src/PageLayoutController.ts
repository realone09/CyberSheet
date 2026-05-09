/**
 * PageLayoutController.ts
 *
 * Backend controller for managing page layout settings.
 * Handles margins, orientation, paper size, print area, scaling, gridlines, and headings.
 */

// ─── Simple event emitter ───────────────────────────────────────────────────

class EventEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  header: number;
  footer: number;
}

export interface PageSetupSettings {
  margins: PageMargins;
  orientation: 'portrait' | 'landscape';
  paperSize: string;
  printArea: string | null;
  pageBreaks: Array<{ row?: number; col?: number }>;
  backgroundImageUrl: string | null;
  printTitles: {
    rows: string | null; // e.g., "$1:$3"
    columns: string | null; // e.g., "$A:$B"
  };
  scaling: {
    fitToWidth: number | 'auto';
    fitToHeight: number | 'auto';
    scale: number; // 10-400%
  };
  gridlines: {
    view: boolean;
    print: boolean;
  };
  headings: {
    view: boolean;
    print: boolean;
  };
  theme: string;
  colorTheme: string;
}

type PageLayoutEvent = 
  | 'marginsChanged'
  | 'orientationChanged'
  | 'paperSizeChanged'
  | 'printAreaChanged'
  | 'breakAdded'
  | 'breakRemoved'
  | 'backgroundChanged'
  | 'printTitlesChanged'
  | 'scalingChanged'
  | 'gridlinesChanged'
  | 'headingsChanged'
  | 'themeChanged'
  | 'settingsChanged';

/**
 * PageLayoutController manages all page layout settings for a worksheet.
 * Provides methods to modify margins, orientation, scaling, gridlines, etc.
 */
export class PageLayoutController {
  private settings: PageSetupSettings;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  /**
   * Get default page setup settings
   */
  private getDefaultSettings(): PageSetupSettings {
    return {
      margins: {
        top: 0.75,
        right: 0.7,
        bottom: 0.75,
        left: 0.7,
        header: 0.3,
        footer: 0.3,
      },
      orientation: 'portrait',
      paperSize: 'Letter (8.5" x 11")',
      printArea: null,
      pageBreaks: [],
      backgroundImageUrl: null,
      printTitles: {
        rows: null,
        columns: null,
      },
      scaling: {
        fitToWidth: 'auto',
        fitToHeight: 'auto',
        scale: 100,
      },
      gridlines: {
        view: true,
        print: false,
      },
      headings: {
        view: true,
        print: true,
      },
      theme: 'Office',
      colorTheme: 'Office',
    };
  }

  /**
   * Set page margins (in inches)
   */
  setMargins(margins: Partial<PageMargins>): void {
    this.settings.margins = { ...this.settings.margins, ...margins };
    this.eventEmitter.emit('marginsChanged', this.settings.margins);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set margin preset
   */
  setMarginPreset(preset: 'Normal' | 'Wide' | 'Narrow'): void {
    const presets: Record<string, PageMargins> = {
      Normal: { top: 0.75, right: 0.7, bottom: 0.75, left: 0.7, header: 0.3, footer: 0.3 },
      Wide: { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0, header: 0.5, footer: 0.5 },
      Narrow: { top: 0.75, right: 0.25, bottom: 0.75, left: 0.25, header: 0.3, footer: 0.3 },
    };
    
    if (presets[preset]) {
      this.setMargins(presets[preset]);
    }
  }

  /**
   * Set page orientation
   */
  setOrientation(orientation: 'portrait' | 'landscape'): void {
    this.settings.orientation = orientation;
    this.eventEmitter.emit('orientationChanged', orientation);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set paper size
   */
  setPaperSize(size: string): void {
    this.settings.paperSize = size;
    this.eventEmitter.emit('paperSizeChanged', size);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set print area (e.g., "A1:G20")
   */
  setPrintArea(range: string): void {
    this.settings.printArea = range;
    this.eventEmitter.emit('printAreaChanged', range);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Clear print area
   */
  clearPrintArea(): void {
    this.settings.printArea = null;
    this.eventEmitter.emit('printAreaChanged', null);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Insert page break
   */
  insertPageBreak(row?: number, col?: number): void {
    const breakPoint = { row, col };
    this.settings.pageBreaks.push(breakPoint);
    this.eventEmitter.emit('breakAdded', breakPoint);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Remove all page breaks
   */
  removeAllPageBreaks(): void {
    this.settings.pageBreaks = [];
    this.eventEmitter.emit('breakRemoved');
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set background image
   */
  setBackground(imageUrl: string | null): void {
    this.settings.backgroundImageUrl = imageUrl;
    this.eventEmitter.emit('backgroundChanged', imageUrl);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set print titles (rows/columns that repeat on each printed page)
   */
  setPrintTitles(rows: string | null, columns: string | null): void {
    this.settings.printTitles = { rows, columns };
    this.eventEmitter.emit('printTitlesChanged', this.settings.printTitles);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set scaling options
   */
  setScaling(options: Partial<PageSetupSettings['scaling']>): void {
    this.settings.scaling = { ...this.settings.scaling, ...options };
    this.eventEmitter.emit('scalingChanged', this.settings.scaling);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set fit-to-page width
   */
  setFitToWidth(pages: number | 'auto'): void {
    this.settings.scaling.fitToWidth = pages;
    this.eventEmitter.emit('scalingChanged', this.settings.scaling);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set fit-to-page height
   */
  setFitToHeight(pages: number | 'auto'): void {
    this.settings.scaling.fitToHeight = pages;
    this.eventEmitter.emit('scalingChanged', this.settings.scaling);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set scale percentage (10-400%)
   */
  setScale(scale: number): void {
    if (scale < 10 || scale > 400) {
      console.warn('Scale must be between 10% and 400%');
      return;
    }
    this.settings.scaling.scale = scale;
    this.eventEmitter.emit('scalingChanged', this.settings.scaling);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set gridlines visibility
   */
  setGridlines(view: boolean, print: boolean): void {
    this.settings.gridlines = { view, print };
    this.eventEmitter.emit('gridlinesChanged', this.settings.gridlines);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set headings visibility
   */
  setHeadings(view: boolean, print: boolean): void {
    this.settings.headings = { view, print };
    this.eventEmitter.emit('headingsChanged', this.settings.headings);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set theme
   */
  setTheme(theme: string): void {
    this.settings.theme = theme;
    this.eventEmitter.emit('themeChanged', theme);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Set color theme
   */
  setColorTheme(colorTheme: string): void {
    this.settings.colorTheme = colorTheme;
    this.eventEmitter.emit('themeChanged', colorTheme);
    this.eventEmitter.emit('settingsChanged', this.settings);
  }

  /**
   * Get current page setup settings
   */
  getPageSetup(): PageSetupSettings {
    return { ...this.settings };
  }

  /**
   * Subscribe to page layout events
   */
  on(event: PageLayoutEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Unsubscribe from page layout events
   */
  off(event: PageLayoutEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Serialize page layout settings for export
   */
  serialize(): PageSetupSettings {
    return { ...this.settings };
  }

  /**
   * Deserialize page layout settings from import
   */
  deserialize(settings: Partial<PageSetupSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.eventEmitter.emit('settingsChanged', this.settings);
  }
}
