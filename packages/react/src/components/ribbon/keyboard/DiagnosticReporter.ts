/**
 * Diagnostic Reporter - Converts raw failures into actionable reports
 * 
 * PURPOSE: Transform chaos testing noise into clear engineering decisions
 * 
 * WITHOUT THIS: Logs full of diffs, unclear priority
 * WITH THIS: Severity-ranked failures with root cause hypotheses
 */

import type {
  ReplayResult,
  SequenceAnalysis,
  ClassifiedFailure,
  FailureType,
  FailureSeverity,
} from './ShortcutEventRecorder';

/**
 * Print replay result summary (critical failures first)
 */
export function printReplayResult(result: ReplayResult): void {
  console.log('\n=== REPLAY RESULT ===');
  console.log(`Sequence: ${result.sequenceId}`);
  console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Matched: ${result.matchedEvents}/${result.totalEvents} events\n`);
  
  if (result.failures.length === 0) {
    console.log('✅ No failures detected');
    return;
  }
  
  // Print severity summary
  console.log('📊 Failure Summary:');
  console.log(`  🔴 Critical (4-5): ${result.criticalFailures.length}`);
  console.log(`  🟡 Medium (3): ${result.severityCounts[3]}`);
  console.log(`  🟢 Low (1-2): ${result.severityCounts[1] + result.severityCounts[2]}\n`);
  
  // Print critical failures first
  if (result.criticalFailures.length > 0) {
    console.log('🔴 CRITICAL FAILURES (fix these first):');
    for (const failure of result.criticalFailures) {
      printFailure(failure);
    }
  }
  
  // Print medium severity
  const mediumFailures = result.failures.filter(f => f.severity === 3);
  if (mediumFailures.length > 0) {
    console.log('\n🟡 MEDIUM SEVERITY:');
    for (const failure of mediumFailures) {
      printFailure(failure);
    }
  }
  
  // Print low severity (collapsed)
  const lowFailures = result.failures.filter(f => f.severity <= 2);
  if (lowFailures.length > 0) {
    console.log(`\n🟢 LOW SEVERITY: ${lowFailures.length} warnings (performance/timing)`);
  }
}

/**
 * Print sequence analysis summary
 */
export function printSequenceAnalysis(analysis: SequenceAnalysis): void {
  console.log('\n=== SEQUENCE ANALYSIS ===');
  console.log(`Total events: ${analysis.totalEvents}`);
  console.log(`Avg execution: ${analysis.averageExecutionTime.toFixed(2)}ms`);
  
  if (analysis.slowestEvent) {
    console.log(`Slowest: ${analysis.slowestEvent.key} (${analysis.slowestEvent.executionTimeMs.toFixed(2)}ms)\n`);
  }
  
  // Print quick stats
  console.log('📊 Issue Detection:');
  console.log(`  Context flips: ${analysis.contextFlips.length}`);
  console.log(`  Stale state reads: ${analysis.staleStateReads.length}`);
  console.log(`  Total failures: ${analysis.failures.length}\n`);
  
  // Print severity breakdown
  console.log('📊 Severity Breakdown:');
  console.log(`  🔴 Critical: ${analysis.severitySummary.critical}`);
  console.log(`  🟡 Medium: ${analysis.severitySummary.medium}`);
  console.log(`  🟢 Low: ${analysis.severitySummary.low}\n`);
  
  // Print root cause clusters (most common hypotheses)
  if (analysis.rootCauseClusters.length > 0) {
    console.log('🧠 Root Cause Clusters (most frequent):');
    for (const cluster of analysis.rootCauseClusters.slice(0, 5)) {
      console.log(`  [${cluster.count}x] ${cluster.hypothesis}`);
      console.log(`      Types: ${cluster.failureTypes.join(', ')}`);
    }
    console.log();
  }
  
  // Print critical failures
  const criticalFailures = analysis.failures.filter(f => f.severity >= 4);
  if (criticalFailures.length > 0) {
    console.log('🔴 CRITICAL FAILURES:');
    for (const failure of criticalFailures) {
      printFailure(failure);
    }
  }
}

/**
 * Print single failure (detailed)
 */
function printFailure(failure: ClassifiedFailure): void {
  const severityEmoji = getSeverityEmoji(failure.severity);
  console.log(`\n${severityEmoji} [${failure.type}] Event #${failure.eventIndex}`);
  console.log(`  ${failure.description}`);
  console.log(`  💡 Hypothesis: ${failure.rootCauseHypothesis}`);
  
  // Print evidence (truncated)
  if (typeof failure.evidence.expected === 'string' && 
      typeof failure.evidence.actual === 'string') {
    console.log(`  Expected: ${failure.evidence.expected}`);
    console.log(`  Actual: ${failure.evidence.actual}`);
  } else {
    console.log(`  Evidence: ${JSON.stringify(failure.evidence).slice(0, 100)}...`);
  }
}

/**
 * Get emoji for severity level
 */
function getSeverityEmoji(severity: FailureSeverity): string {
  if (severity >= 4) return '🔴';
  if (severity === 3) return '🟡';
  return '🟢';
}

/**
 * Export diagnostic report to markdown
 */
export function exportDiagnosticReport(
  result: ReplayResult | SequenceAnalysis,
  title: string
): string {
  const lines: string[] = [];
  
  lines.push(`# ${title}`);
  lines.push('');
  
  if ('matchedEvents' in result) {
    // ReplayResult
    lines.push(`**Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push(`**Matched**: ${result.matchedEvents}/${result.totalEvents} events`);
    lines.push('');
    
    lines.push('## Severity Summary');
    lines.push('');
    lines.push(`- 🔴 Critical (4-5): ${result.criticalFailures.length}`);
    lines.push(`- 🟡 Medium (3): ${result.severityCounts[3]}`);
    lines.push(`- 🟢 Low (1-2): ${result.severityCounts[1] + result.severityCounts[2]}`);
    lines.push('');
    
    if (result.criticalFailures.length > 0) {
      lines.push('## Critical Failures');
      lines.push('');
      for (const failure of result.criticalFailures) {
        lines.push(`### Event #${failure.eventIndex}: ${failure.type}`);
        lines.push('');
        lines.push(`**Description**: ${failure.description}`);
        lines.push('');
        lines.push(`**Root Cause Hypothesis**: ${failure.rootCauseHypothesis}`);
        lines.push('');
        lines.push('```json');
        lines.push(JSON.stringify(failure.evidence, null, 2));
        lines.push('```');
        lines.push('');
      }
    }
  } else {
    // SequenceAnalysis
    lines.push(`**Total Events**: ${result.totalEvents}`);
    lines.push(`**Avg Execution**: ${result.averageExecutionTime.toFixed(2)}ms`);
    lines.push('');
    
    lines.push('## Issue Detection');
    lines.push('');
    lines.push(`- Context flips: ${result.contextFlips.length}`);
    lines.push(`- Stale state reads: ${result.staleStateReads.length}`);
    lines.push(`- Total failures: ${result.failures.length}`);
    lines.push('');
    
    lines.push('## Severity Breakdown');
    lines.push('');
    lines.push(`- 🔴 Critical: ${result.severitySummary.critical}`);
    lines.push(`- 🟡 Medium: ${result.severitySummary.medium}`);
    lines.push(`- 🟢 Low: ${result.severitySummary.low}`);
    lines.push('');
    
    if (result.rootCauseClusters.length > 0) {
      lines.push('## Root Cause Clusters');
      lines.push('');
      for (const cluster of result.rootCauseClusters) {
        lines.push(`- **[${cluster.count}x]** ${cluster.hypothesis}`);
        lines.push(`  - Types: ${cluster.failureTypes.join(', ')}`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Console log API (for quick debugging)
 */
export const diagnostics = {
  printReplayResult,
  printSequenceAnalysis,
  exportDiagnosticReport,
};
