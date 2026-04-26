/**
 * Generic Dropdown Section Component
 * 
 * Prevents dropdown composition drift by standardizing section layout,
 * spacing, focus zones, and visual hierarchy across all dropdowns.
 * 
 * Problem without this:
 * - Font/Fill/Border dropdowns will slowly diverge in spacing
 * - Inconsistent section titles (font-size, color, weight)
 * - Focus management breaks across sections
 * - Separators become inconsistent
 * 
 * Usage:
 * ```tsx
 * <DropdownSection title="Presets">
 *   <BorderPresetGrid />
 * </DropdownSection>
 * 
 * <DropdownSection title="Line Style">
 *   <LineStyleGrid />
 * </DropdownSection>
 * ```
 */

import React from "react";

export interface DropdownSectionProps {
  /** Section title (e.g., "Theme Colors", "Line Style") */
  title?: string;

  /** Section content */
  children: React.ReactNode;

  /** Show separator line below this section */
  separator?: boolean;

  /** Custom CSS class for section container */
  className?: string;

  /** Subtitle (smaller text below title) */
  subtitle?: string;
}

/**
 * Standardized dropdown section with consistent spacing + typography
 */
export function DropdownSection({
  title,
  children,
  separator = false,
  className = "",
  subtitle,
}: DropdownSectionProps) {
  return (
    <>
      <div className={`cs-dropdown-section ${className}`}>
        {title && (
          <div className="cs-dropdown-section-title">{title}</div>
        )}
        {subtitle && (
          <div className="cs-dropdown-section-subtitle">{subtitle}</div>
        )}
        <div className="cs-dropdown-section-content">{children}</div>
      </div>
      {separator && <div className="cs-dropdown-separator" />}
    </>
  );
}

/**
 * CSS Variables (add to ribbon.css):
 * 
 * ```css
 * .cs-dropdown-section {
 *   margin-bottom: 12px;
 * }
 * 
 * .cs-dropdown-section:last-child {
 *   margin-bottom: 0;
 * }
 * 
 * .cs-dropdown-section-title {
 *   font-size: 11px;
 *   font-weight: 600;
 *   color: #605e5c;
 *   margin-bottom: 6px;
 * }
 * 
 * .cs-dropdown-section-subtitle {
 *   font-size: 10px;
 *   color: #605e5c;
 *   margin-top: 8px;
 *   margin-bottom: 4px;
 * }
 * 
 * .cs-dropdown-section-content {
 *   // Content inherits natural layout
 * }
 * 
 * .cs-dropdown-separator {
 *   height: 1px;
 *   background: #e1dfdd;
 *   margin: 8px 0;
 * }
 * ```
 */
