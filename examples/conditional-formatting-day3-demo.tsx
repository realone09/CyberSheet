import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConditionalFormattingIntegratedPanel } from '../packages/react/src/conditional-formatting/ConditionalFormattingIntegratedPanel';

/**
 * Week 1, Day 3: Rule Management Panel Demo
 * 
 * This example demonstrates the complete UI flow:
 * 1. Rule Manager: List, reorder, enable/disable, edit, delete, duplicate
 * 2. Rule Builder: Create/edit all 11 rule types
 * 3. Integration: Seamless switching between manager and builder
 * 
 * Features:
 * - ✅ Drag & drop reordering (updates priority)
 * - ✅ Enable/disable toggle
 * - ✅ Edit/delete/duplicate actions
 * - ✅ stopIfTrue visualization
 * - ✅ Rule type badges with color coding
 * - ✅ Priority display (higher = first)
 * - ✅ Empty state handling
 * - ✅ Complete builder integration
 */

const App = () => {
	return (
		<div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
			<h1>Conditional Formatting - Week 1, Day 3 Demo</h1>
			<p style={{ color: '#666', marginBottom: '20px' }}>
				Create rules, reorder by dragging, enable/disable with toggle, edit/delete/duplicate.
				Excel-complete rule management!
			</p>
			
			<ConditionalFormattingIntegratedPanel />

			<div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
				<h3>🎯 Testing Checklist (Day 3)</h3>
				<ul>
					<li>✅ Create new rule (click "+ New Rule")</li>
					<li>✅ Select different rule types (all 11 types)</li>
					<li>✅ Save rule and see it appear in manager</li>
					<li>✅ Drag & drop to reorder (priority updates)</li>
					<li>✅ Toggle enable/disable (visual feedback)</li>
					<li>✅ Edit existing rule (opens builder with data)</li>
					<li>✅ Duplicate rule (creates copy)</li>
					<li>✅ Delete rule (removes from list)</li>
					<li>✅ stopIfTrue badge shows for marked rules</li>
					<li>✅ Priority numbers display correctly</li>
				</ul>
			</div>

			<div style={{ marginTop: '20px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
				<h3>📋 Next Steps</h3>
				<ul>
					<li><strong>Day 4:</strong> Rule Inspector (hover UX) - show applied rule details on cell hover</li>
					<li><strong>Day 5:</strong> Toolbar Integration + Preset Picker - add CF button to toolbar</li>
					<li><strong>Week 2:</strong> Polish, testing, accessibility, docs + 10+ examples</li>
					<li><strong>Week 3:</strong> Excel comparison, stress testing, 100% declaration</li>
				</ul>
			</div>
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
