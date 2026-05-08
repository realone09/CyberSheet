// src/components/backstage/panels/VersionHistoryPanel.tsx

import React, { useState, useCallback, useMemo } from 'react';
import type { FileOperations, VersionSummary, VersionChange } from '@cyber-sheet/core';

export interface VersionHistoryPanelProps {
  fileOperations: FileOperations;
  onVersionRestored?: () => void;
}

// Demo version data — in production, comes from FileOperations
const DEMO_VERSIONS: VersionSummary[] = [
  {
    id: 'v8',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    author: 'You',
    message: undefined,
    isAutoSave: false,
    changeCount: 3,
  },
  {
    id: 'v7',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    author: 'Alice Johnson',
    authorAvatar: '👩‍💼',
    message: 'Updated Q2 revenue figures',
    isAutoSave: false,
    changeCount: 12,
  },
  {
    id: 'v6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    author: 'Bob Smith',
    authorAvatar: '👨‍💻',
    message: 'Added new Summary sheet',
    isAutoSave: false,
    changeCount: 7,
  },
  {
    id: 'v5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: 'You',
    message: undefined,
    isAutoSave: true,
    changeCount: 2,
  },
  {
    id: 'v4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    author: 'You',
    message: undefined,
    isAutoSave: true,
    changeCount: 4,
  },
  {
    id: 'v3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    author: 'Alice Johnson',
    authorAvatar: '👩‍💼',
    message: 'Added conditional formatting for sales targets',
    isAutoSave: false,
    changeCount: 8,
  },
  {
    id: 'v2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    author: 'You',
    message: undefined,
    isAutoSave: true,
    changeCount: 1,
  },
  {
    id: 'v1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    author: 'You',
    message: 'Initial version',
    isAutoSave: false,
    changeCount: 0,
  },
];

const DEMO_CHANGES: Record<string, VersionChange[]> = {
  v8: [
    {
      type: 'cell_change',
      description: 'Updated Q3 forecast value',
      address: 'C12',
      oldValue: '5000000',
      newValue: '5300000',
    },
    {
      type: 'format_change',
      description: 'Changed number format to currency',
      address: 'C12:C15',
    },
    {
      type: 'formula_change',
      description: 'Updated SUM range in totals',
      address: 'C20',
      oldValue: '=SUM(C10:C15)',
      newValue: '=SUM(C8:C18)',
    },
  ],
  v7: [
    {
      type: 'cell_change',
      description: 'Updated Q2 revenue figures for all regions',
      address: 'B2:B12',
      oldValue: 'Multiple',
      newValue: 'Multiple',
    },
    {
      type: 'sheet_added',
      address: undefined,
      description: 'Added Regional Breakdown sheet',
      sheetName: 'Regional Breakdown',
    },
    {
      type: 'format_change',
      description: 'Applied conditional formatting to revenue column',
      address: 'B2:B24',
    },
    {
      type: 'cell_change',
      description: 'Changed North America Q2 from 1.2M to 1.45M',
      address: 'B4',
      oldValue: '1200000',
      newValue: '1450000',
    },
  ],
  v6: [
    {
      type: 'sheet_added',
      description: 'Added Summary sheet',
      sheetName: 'Summary',
    },
    {
      type: 'sheet_renamed',
      description: 'Renamed Sheet1 to Raw Data',
      sheetName: 'Raw Data',
      oldValue: 'Sheet1',
      newValue: 'Raw Data',
    },
    {
      type: 'merge_change',
      description: 'Merged cells A1:D1 for title',
      address: 'A1:D1',
    },
  ],
  v5: [
    {
      type: 'cell_change',
      description: 'Updated tax rate to 8.5%',
      address: 'D5',
      oldValue: '0.08',
      newValue: '0.085',
    },
    {
      type: 'formula_change',
      description: 'Adjusted tax calculation formula',
      address: 'D10:D20',
    },
  ],
  v4: [
    {
      type: 'range_insert',
      description: 'Inserted 5 rows for new products',
      address: 'A15:A19',
    },
    {
      type: 'cell_change',
      description: 'Added new product entries',
      address: 'A15:C19',
    },
    {
      type: 'format_change',
      description: 'Extended table formatting to new rows',
      address: 'A15:C19',
    },
  ],
};

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  fileOperations,
  onVersionRestored,
}) => {
  const [versions] = useState<VersionSummary[]>(DEMO_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(versions[0].id);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreComplete, setRestoreComplete] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  const currentVersionId = versions[0].id;
  const selectedVersion = useMemo(
    () => versions.find(v => v.id === selectedVersionId),
    [versions, selectedVersionId]
  );
  const changes = useMemo(
    () => DEMO_CHANGES[selectedVersionId] || [],
    [selectedVersionId]
  );

  // Group versions by date
  const groupedVersions = useMemo(() => {
    const groups: { label: string; versions: VersionSummary[] }[] = [];
    const now = new Date();

    versions.forEach(version => {
      const diff = now.getTime() - version.timestamp.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      let label: string;
      if (days === 0) label = 'Today';
      else if (days === 1) label = 'Yesterday';
      else if (days < 7) label = 'This Week';
      else if (days < 30) label = 'Last Month';
      else label = 'Older';

      const existingGroup = groups.find(g => g.label === label);
      if (existingGroup) {
        existingGroup.versions.push(version);
      } else {
        groups.push({ label, versions: [version] });
      }
    });

    return groups;
  }, [versions]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSelectVersion = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    setShowConfirmRestore(false);
  }, []);

  const handleRestoreClick = useCallback(() => {
    setShowConfirmRestore(true);
  }, []);

  const handleConfirmRestore = useCallback(async () => {
    setIsRestoring(true);
    setShowConfirmRestore(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setRestoreComplete(true);
      
      setTimeout(() => {
        onVersionRestored?.();
        window.dispatchEvent(new CustomEvent('backstage-close'));
      }, 1500);
    } catch {
      setIsRestoring(false);
    }
  }, [onVersionRestored]);

  const getChangeIcon = (type: string): string => {
    switch (type) {
      case 'cell_change': return '✏️';
      case 'format_change': return '🎨';
      case 'formula_change': return '📐';
      case 'sheet_added': return '➕';
      case 'sheet_deleted': return '➖';
      case 'sheet_renamed': return '🏷️';
      case 'range_insert': return '📥';
      case 'range_delete': return '📤';
      case 'merge_change': return '🔗';
      default: return '•';
    }
  };

  const getChangeColor = (type: string): string => {
    switch (type) {
      case 'cell_change': return '#0078D4';
      case 'format_change': return '#8764B8';
      case 'formula_change': return '#D13438';
      case 'sheet_added': return '#107C10';
      case 'sheet_deleted': return '#D13438';
      case 'sheet_renamed': return '#FF8C00';
      case 'range_insert': return '#107C10';
      case 'merge_change': return '#8764B8';
      default: return '#666666';
    }
  };

  // ─── Styles ──────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: 0,
    display: 'flex',
    height: 'calc(100vh - 48px)',
    animation: 'fadeIn 200ms ease-out',
  };

  // Left panel: Timeline
  const timelinePanelStyle: React.CSSProperties = {
    width: 320,
    borderRight: '1px solid #E8E8E8',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const timelineHeaderStyle: React.CSSProperties = {
    padding: '24px 24px 16px',
    borderBottom: '1px solid #F0F0F0',
  };

  const timelineTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 4,
  };

  const timelineSubtitleStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888888',
  };

  const timelineListStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  };

  const groupLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px 24px 6px',
  };

  const versionRowStyle = (isSelected: boolean, isCurrent: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 24px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#E8F4FD' : 'transparent',
    borderLeft: isSelected ? '3px solid #0078D4' : '3px solid transparent',
    transition: 'background-color 100ms',
    position: 'relative',
  });

  const timelineDotStyle = (isCurrent: boolean, isAutoSave: boolean): React.CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: isCurrent ? '#0078D4' : '#CCCCCC',
    border: isAutoSave ? '2px solid #E0E0E0' : '2px solid transparent',
    marginTop: 4,
    flexShrink: 0,
  });

  const versionInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const versionTimeStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 2,
  };

  const versionAuthorStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888888',
  };

  const versionMessageStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const autoSaveBadgeStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 2,
  };

  // Right panel: Preview
  const previewPanelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const previewHeaderStyle: React.CSSProperties = {
    padding: '24px 32px 16px',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const previewTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1F1F1F',
  };

  const previewSubtitleStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  };

  const previewContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    backgroundColor: '#FAFAFA',
  };

  // Mini spreadsheet preview placeholder
  const previewPlaceholderStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const previewGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
    backgroundColor: '#E8E8E8',
    border: '1px solid #D1D1D1',
    borderRadius: 4,
    overflow: 'hidden',
  };

  const previewCellStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    padding: '6px 8px',
    fontSize: 11,
    color: '#555555',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minHeight: 20,
  };

  const previewHeaderCellStyle: React.CSSProperties = {
    ...previewCellStyle,
    backgroundColor: '#F5F5F5',
    fontWeight: 600,
    fontSize: 10,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };

  // Changes list
  const changesSectionStyle: React.CSSProperties = {
    marginTop: 16,
  };

  const changesTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const changeItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    border: '1px solid #F0F0F0',
    fontSize: 13,
    color: '#333333',
  };

  const changeDotStyle = (color: string): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: color,
    marginTop: 4,
    flexShrink: 0,
  });

  // Restore button
  const restoreButtonStyle: React.CSSProperties = {
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: isRestoring ? '#A0C4E8' : restoreComplete ? '#107C10' : '#0078D4',
    border: 'none',
    borderRadius: 4,
    cursor: isRestoring || restoreComplete ? 'default' : 'pointer',
    transition: 'all 200ms',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const spinnerSmallStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  };

  // Confirm dialog
  const dialogOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10002,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 150ms',
  };

  const dialogCardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    width: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    animation: 'scaleIn 200ms ease-out',
  };

  return (
    <div style={containerStyle}>
      {/* Timeline Panel */}
      <div style={timelinePanelStyle}>
        <div style={timelineHeaderStyle}>
          <div style={timelineTitleStyle}>Version History</div>
          <div style={timelineSubtitleStyle}>{versions.length} versions</div>
        </div>

        <div style={timelineListStyle}>
          {groupedVersions.map((group: { label: string; versions: VersionSummary[] }) => (
            <div key={group.label}>
              <div style={groupLabelStyle}>{group.label}</div>
              {group.versions.map((version: VersionSummary) => (
                <div
                  key={version.id}
                  style={versionRowStyle(
                    selectedVersionId === version.id,
                    version.id === currentVersionId
                  )}
                  onClick={() => handleSelectVersion(version.id)}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (selectedVersionId !== version.id) {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (selectedVersionId !== version.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-current={selectedVersionId === version.id ? 'true' : undefined}
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectVersion(version.id);
                    }
                  }}
                >
                  <div style={timelineDotStyle(
                    version.id === currentVersionId,
                    version.isAutoSave
                  )} />
                  <div style={versionInfoStyle}>
                    <div style={versionTimeStyle}>
                      {formatTime(version.timestamp)}
                      {version.id === currentVersionId && (
                        <span style={{ 
                          marginLeft: 8, 
                          fontSize: 10, 
                          color: '#0078D4', 
                          fontWeight: 600,
                          backgroundColor: '#E8F4FD',
                          padding: '1px 6px',
                          borderRadius: 8,
                        }}>
                          Current
                        </span>
                      )}
                    </div>
                    <div style={versionAuthorStyle}>
                      {version.authorAvatar && (
                        <span style={{ marginRight: 4 }}>{version.authorAvatar}</span>
                      )}
                      {version.author}
                    </div>
                    {version.message && (
                      <div style={versionMessageStyle}>{version.message}</div>
                    )}
                    {version.isAutoSave && !version.message && (
                      <div style={autoSaveBadgeStyle}>Auto-saved</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Panel */}
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>
          <div>
            <div style={previewTitleStyle}>
              {selectedVersion?.id === currentVersionId 
                ? 'Current Version' 
                : `Version from ${formatDate(selectedVersion!.timestamp)}`}
            </div>
            <div style={previewSubtitleStyle}>
              {selectedVersion?.author} • {formatTime(selectedVersion!.timestamp)}
              {selectedVersion?.isAutoSave && ' • Auto-saved'}
            </div>
          </div>
          
          {selectedVersionId !== currentVersionId && !restoreComplete && (
            <button
              style={restoreButtonStyle}
              onClick={handleRestoreClick}
              disabled={isRestoring}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isRestoring) e.currentTarget.style.backgroundColor = '#106EBE';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isRestoring) e.currentTarget.style.backgroundColor = '#0078D4';
              }}
            >
              {isRestoring && <div style={spinnerSmallStyle} />}
              {isRestoring ? 'Restoring...' : 'Restore This Version'}
            </button>
          )}

          {restoreComplete && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#107C10',
              fontSize: 14,
              fontWeight: 600,
              animation: 'fadeIn 200ms',
            }}>
              ✓ Version Restored
            </div>
          )}
        </div>

        <div style={previewContentStyle}>
          {/* Mini spreadsheet preview */}
          <div style={previewPlaceholderStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#888888', marginBottom: 8 }}>
              📊 Spreadsheet Preview — {selectedVersion?.id === currentVersionId ? 'Current' : 'Version'} State
            </div>
            <div style={previewGridStyle}>
              {['', 'A', 'B', 'C'].map((header, i) => (
                <div key={`h-${i}`} style={previewHeaderCellStyle}>
                  {header}
                </div>
              ))}
              {[
                ['1', 'Revenue', '$1,450,000', '$2,100,000'],
                ['2', 'Costs', '$890,000', '$1,200,000'],
                ['3', 'Profit', '$560,000', '$900,000'],
              ].map((row, ri) => (
                row.map((cell, ci) => (
                  <div 
                    key={`${ri}-${ci}`} 
                    style={{
                      ...previewCellStyle,
                      fontWeight: ci === 0 ? 600 : 400,
                      color: ci === 0 ? '#888888' : 
                             ci === 3 && selectedVersionId === 'v7' ? '#D13438' : '#555555',
                      backgroundColor: ci === 3 && selectedVersionId === 'v7' 
                        ? '#FDECEA' : '#FFFFFF',
                    }}
                  >
                    {ci === 3 && selectedVersionId === 'v7' && cell === '$2,100,000'
                      ? '$1,850,000' 
                      : cell}
                  </div>
                ))
              ))}
            </div>
            {selectedVersionId !== currentVersionId && (
              <div style={{ 
                fontSize: 11, 
                color: '#D13438', 
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span>⬤</span>
                Changed values highlighted
              </div>
            )}
          </div>

          {/* Changes list */}
          {changes.length > 0 ? (
            <div style={changesSectionStyle}>
              <div style={changesTitleStyle}>
                <span>📝 Changes in this version</span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 400, 
                  color: '#888888',
                }}>
                  ({changes.length} change{changes.length !== 1 ? 's' : ''})
                </span>
              </div>
              {changes.map((change: VersionChange, index: number) => (
                <div key={index} style={changeItemStyle}>
                  <div style={changeDotStyle(getChangeColor(change.type))} />
                  <div style={{ flex: 1 }}>
                    <span>{getChangeIcon(change.type)} </span>
                    {change.description}
                    {change.address && (
                      <span style={{ 
                        marginLeft: 6,
                        fontSize: 11,
                        color: '#888888',
                        fontFamily: 'monospace',
                        backgroundColor: '#F5F5F5',
                        padding: '1px 4px',
                        borderRadius: 3,
                      }}>
                        {change.address}
                      </span>
                    )}
                    {change.oldValue && change.newValue && change.type === 'cell_change' && (
                      <div style={{ fontSize: 11, marginTop: 3, color: '#888888' }}>
                        Value: <span style={{ color: '#D13438', textDecoration: 'line-through' }}>
                          {change.oldValue}
                        </span>
                        {' → '}
                        <span style={{ color: '#107C10' }}>
                          {change.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: 40, 
              color: '#888888',
              fontSize: 14,
            }}>
              No detailed changes recorded for this version.
            </div>
          )}
        </div>
      </div>

      {/* Confirm Restore Dialog */}
      {showConfirmRestore && (
        <div 
          style={dialogOverlayStyle}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) setShowConfirmRestore(false);
          }}
        >
          <div style={dialogCardStyle}>
            <div style={{ fontSize: 28, marginBottom: 12, textAlign: 'center' }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F1F1F', textAlign: 'center', marginBottom: 8 }}>
              Restore this version?
            </h3>
            <p style={{ fontSize: 13, color: '#666666', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              This will replace the current version of the workbook with the selected version from{' '}
              <strong>{formatDate(selectedVersion!.timestamp)}</strong>.
              <br /><br />
              A new version will be created with the current state before restoring, so you can undo this if needed.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                style={{
                  padding: '8px 20px',
                  fontSize: 13,
                  color: '#555',
                  backgroundColor: 'transparent',
                  border: '1px solid #D1D1D1',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => setShowConfirmRestore(false)}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#0078D4',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={handleConfirmRestore}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#106EBE'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#0078D4'; }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
