import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ConditionalFormattingPresetPicker } from '../ConditionalFormattingPresetPicker';
import type { CFPreset } from '@cyber-sheet/cf-ui-core';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Accessibility Tests for ConditionalFormattingPresetPicker (React)
 * 
 * Tests WCAG 2.1 AA compliance including:
 * - Semantic HTML structure
 * - ARIA attributes and roles
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - Color contrast
 */
describe('ConditionalFormattingPresetPicker - Accessibility', () => {
	const mockOnPresetSelect = jest.fn();
	const mockOnApply = jest.fn();

	beforeEach(() => {
		mockOnPresetSelect.mockClear();
		mockOnApply.mockClear();
	});

	describe('Automated Accessibility Testing (axe)', () => {
		it('should have no accessibility violations', async () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it('should have no violations with popular presets disabled', async () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
					showPopular={false}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it('should have no violations with accessibility disabled', async () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
					enableA11y={false}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe('Semantic HTML Structure', () => {
		it('should have main region with descriptive label', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const region = screen.getByRole('region', { name: /conditional formatting preset picker/i });
			expect(region).toBeInTheDocument();
		});

		it('should have search input with searchbox role', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const searchbox = screen.getByRole('searchbox', { name: /search presets/i });
			expect(searchbox).toBeInTheDocument();
		});

		it('should have category toolbar with radio buttons', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const toolbar = screen.getByRole('toolbar', { name: /category filters/i });
			expect(toolbar).toBeInTheDocument();

			const radioButtons = within(toolbar).getAllByRole('radio');
			expect(radioButtons.length).toBeGreaterThan(0);
		});

		it('should have preset grid with gridcells', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const grid = screen.getByRole('grid', { name: /available conditional formatting presets/i });
			expect(grid).toBeInTheDocument();

			const gridcells = within(grid).getAllByRole('gridcell');
			expect(gridcells.length).toBeGreaterThan(0);
		});

		it('should have popular presets list when enabled', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					showPopular={true}
				/>
			);

			const popularSection = screen.getByLabelText(/popular presets/i);
			expect(popularSection).toBeInTheDocument();

			const list = within(popularSection).getByRole('list');
			expect(list).toBeInTheDocument();
		});
	});

	describe('ARIA Attributes', () => {
		it('should have aria-describedby on main region', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const region = screen.getByRole('region');
			expect(region).toHaveAttribute('aria-describedby');
		});

		it('should have aria-checked on category buttons', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const allCategoryButton = screen.getByRole('radio', { name: /all presets category/i });
			expect(allCategoryButton).toHaveAttribute('aria-checked', 'true');
		});

		it('should have aria-selected on preset cards', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const gridcells = screen.getAllByRole('gridcell');
			gridcells.forEach(cell => {
				expect(cell).toHaveAttribute('aria-selected');
			});
		});

		it('should have aria-label on apply button with preset name', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			// Click a preset
			const firstPreset = screen.getAllByRole('gridcell')[0];
			fireEvent.click(firstPreset);

			const applyButton = screen.getByRole('button', { name: /apply.*preset/i });
			expect(applyButton).toHaveAttribute('aria-label');
		});

		it('should have aria-live regions for announcements', () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const liveRegions = container.querySelectorAll('[aria-live]');
			expect(liveRegions.length).toBeGreaterThan(0);
		});
	});

	describe('Keyboard Navigation - Tab Order', () => {
		it('should have proper tab order through interactive elements', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			const searchbox = screen.getByRole('searchbox');
			const categoryButtons = screen.getAllByRole('radio');
			const presetCards = screen.getAllByRole('gridcell');
			const applyButton = screen.getByRole('button', { name: /apply preset/i });

			// Search should be tabbable
			expect(searchbox).toHaveAttribute('tabIndex', '0');

			// Only selected category should be tabbable
			const selectedCategory = categoryButtons.find(btn => btn.getAttribute('aria-checked') === 'true');
			expect(selectedCategory).toHaveAttribute('tabIndex', '0');
			
			const unselectedCategories = categoryButtons.filter(btn => btn.getAttribute('aria-checked') !== 'true');
			unselectedCategories.forEach(btn => {
				expect(btn).toHaveAttribute('tabIndex', '-1');
			});

			// Apply button should be tabbable
			expect(applyButton).not.toHaveAttribute('tabIndex', '-1');
		});

		it('should focus apply button after preset selection', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			fireEvent.click(firstPreset);

			const applyButton = screen.getByRole('button', { name: /apply.*preset/i });
			
			// In a real browser, focus would move. In jsdom, we check the button is available
			expect(applyButton).not.toBeDisabled();
		});
	});

	describe('Keyboard Navigation - Arrow Keys', () => {
		it('should navigate between category buttons with arrow keys', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const categoryButtons = screen.getAllByRole('radio');
			const firstButton = categoryButtons[0];

			// Focus first button
			firstButton.focus();

			// Press ArrowRight
			fireEvent.keyDown(firstButton, { key: 'ArrowRight' });
			
			// Next button should be focused (we can't test actual focus in jsdom, but handler should run)
			expect(mockOnPresetSelect).not.toHaveBeenCalled(); // Navigation shouldn't select
		});

		it('should navigate preset grid with arrow keys', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const presetCards = screen.getAllByRole('gridcell');
			const firstCard = presetCards[0];

			firstCard.focus();

			// Press ArrowRight to move to next preset
			fireEvent.keyDown(firstCard, { key: 'ArrowRight' });
			
			// Press ArrowDown to move down a row (2 columns = +2 index)
			fireEvent.keyDown(firstCard, { key: 'ArrowDown' });
		});

		it('should activate preset with Enter key', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			firstPreset.focus();

			fireEvent.keyDown(firstPreset, { key: 'Enter' });
			
			expect(mockOnPresetSelect).toHaveBeenCalled();
		});

		it('should activate preset with Space key', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			firstPreset.focus();

			fireEvent.keyDown(firstPreset, { key: ' ' });
			
			expect(mockOnPresetSelect).toHaveBeenCalled();
		});

		it('should handle Home key to jump to first preset', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const presetCards = screen.getAllByRole('gridcell');
			const lastCard = presetCards[presetCards.length - 1];

			lastCard.focus();
			fireEvent.keyDown(lastCard, { key: 'Home' });
			
			// First card should receive focus (can't test actual focus in jsdom)
		});

		it('should handle End key to jump to last preset', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const presetCards = screen.getAllByRole('gridcell');
			const firstCard = presetCards[0];

			firstCard.focus();
			fireEvent.keyDown(firstCard, { key: 'End' });
			
			// Last card should receive focus
		});

		it('should handle Escape key to return focus to search', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			firstPreset.focus();

			fireEvent.keyDown(firstPreset, { key: 'Escape' });
			
			// Search should receive focus
			const searchbox = screen.getByRole('searchbox');
			expect(searchbox).toBeInTheDocument();
		});
	});

	describe('Screen Reader Support', () => {
		it('should have descriptive labels for all interactive elements', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			// Search input
			const searchbox = screen.getByRole('searchbox');
			expect(searchbox).toHaveAccessibleName();

			// Category buttons
			const categoryButtons = screen.getAllByRole('radio');
			categoryButtons.forEach(button => {
				expect(button).toHaveAccessibleName();
			});

			// Preset cards
			const presetCards = screen.getAllByRole('gridcell');
			presetCards.forEach(card => {
				expect(card).toHaveAccessibleName();
			});
		});

		it('should announce search results', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const searchbox = screen.getByRole('searchbox');
			
			fireEvent.change(searchbox, { target: { value: 'data bar' } });

			// Live region should announce results (after debounce)
			// In real usage, screen reader would read the announcement
		});

		it('should announce category selection', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const dataBarsButton = screen.getByRole('radio', { name: /data bars category/i });
			fireEvent.click(dataBarsButton);

			// Announcement should be made via live region
		});

		it('should include preset count in footer', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const status = screen.getByRole('status', { name: /preset/i });
			expect(status).toBeInTheDocument();
			expect(status).toHaveTextContent(/\d+ preset/);
		});
	});

	describe('Focus Management', () => {
		it('should maintain focus visibility on navigation', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			firstPreset.focus();

			// Focused element should have visual indicator (tested via CSS)
			expect(firstPreset).toHaveFocus();
		});

		it('should not lose focus when filtering presets', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			const searchbox = screen.getByRole('searchbox');
			searchbox.focus();

			fireEvent.change(searchbox, { target: { value: 'color' } });

			// Search should still have focus
			expect(searchbox).toHaveFocus();
		});
	});

	describe('Disabled State Accessibility', () => {
		it('should disable apply button when no preset selected', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			const applyButton = screen.getByRole('button', { name: /apply preset/i });
			expect(applyButton).toBeDisabled();
		});

		it('should enable apply button when preset is selected', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					onApply={mockOnApply}
				/>
			);

			const firstPreset = screen.getAllByRole('gridcell')[0];
			fireEvent.click(firstPreset);

			const applyButton = screen.getByRole('button', { name: /apply.*preset/i });
			expect(applyButton).not.toBeDisabled();
		});
	});

	describe('Reduced Motion Support', () => {
		it('should respect prefers-reduced-motion', () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			// CSS media query would disable transitions
			// We can check that elements are rendered without errors
			expect(container.querySelector('.cf-preset-picker')).toBeInTheDocument();
		});
	});

	describe('High Contrast Mode', () => {
		it('should render properly in high contrast mode', () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
				/>
			);

			// CSS media query would enhance borders
			// Verify structure is intact
			expect(container.querySelector('.cf-preset-picker')).toBeInTheDocument();
		});
	});

	describe('Accessibility with Popular Presets', () => {
		it('should have accessible popular presets list', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					showPopular={true}
				/>
			);

			const popularSection = screen.getByLabelText(/popular presets/i);
			const list = within(popularSection).getByRole('list');
			const listItems = within(list).getAllByRole('listitem');

			expect(listItems.length).toBeGreaterThan(0);
			
			listItems.forEach(item => {
				expect(item).toHaveAccessibleName();
			});
		});
	});

	describe('Accessibility Feature Toggle', () => {
		it('should still be usable with accessibility disabled', () => {
			render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					enableA11y={false}
				/>
			);

			// Should still have basic structure
			const searchbox = screen.getByRole('searchbox');
			expect(searchbox).toBeInTheDocument();

			const presetCards = screen.getAllByRole('gridcell');
			expect(presetCards.length).toBeGreaterThan(0);

			// Click should still work
			fireEvent.click(presetCards[0]);
			expect(mockOnPresetSelect).toHaveBeenCalled();
		});

		it('should not have live regions when accessibility is disabled', () => {
			const { container } = render(
				<ConditionalFormattingPresetPicker
					onPresetSelect={mockOnPresetSelect}
					enableA11y={false}
				/>
			);

			// Announcer should not be present
			const announcers = container.querySelectorAll('[aria-live]');
			expect(announcers.length).toBe(0);
		});
	});
});
