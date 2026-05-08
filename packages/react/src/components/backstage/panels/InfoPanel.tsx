// src/components/backstage/panels/InfoPanel.tsx

import React, { useState, useCallback } from 'react';
import type { FileOperations, WorkbookMetadata } from '@cyber-sheet/core';

export interface InfoPanelProps {
  fileOperations: FileOperations;
  metadata: WorkbookMetadata;
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export const InfoPanel: React.FC<InfoPanelProps> = ({
  fileOperations,
  metadata,
}) => {
  const [protectStatus, setProtectStatus] = useState<ActionStatus>('idle');
  const [finalStatus, setFinalStatus] = useState<ActionStatus>('idle');
  const [inspectStatus, setInspectStatus] = useState<ActionStatus>('idle');
  const [accessibilityStatus, setAccessibilityStatus] = useState<ActionStatus>('idle');
  const [compatibilityStatus, setCompatibilityStatus] = useState<ActionStatus>('idle');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tags, setTags] = useState<string[]>(metadata.tags || []);
  const [newTag, setNewTag] = useState('');

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Protect Workbook handlers
  const handleSetPassword = useCallback(async () => {
    if (!password) {
      setPasswordError('Password cannot be empty.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setProtectStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      fileOperations.updateMetadata({ isProtected: true });
      setProtectStatus('success');
      setShowPasswordDialog(false);
      setPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setTimeout(() => setProtectStatus('idle'), 3000);
    } catch {
      setProtectStatus('error');
    }
  }, [password, confirmPassword, fileOperations]);

  const handleRemovePassword = useCallback(async () => {
    setProtectStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      fileOperations.updateMetadata({ isProtected: false });
      setProtectStatus('success');
      setTimeout(() => setProtectStatus('idle'), 3000);
    } catch {
      setProtectStatus('error');
    }
  }, [fileOperations]);

  // Mark as Final
  const handleMarkAsFinal = useCallback(async () => {
    setFinalStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      fileOperations.updateMetadata({ isMarkedFinal: true });
      setFinalStatus('success');
      setTimeout(() => setFinalStatus('idle'), 3000);
    } catch {
      setFinalStatus('error');
    }
  }, [fileOperations]);

  // Inspect Document
  const handleInspect = useCallback(async () => {
    setInspectStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInspectStatus('success');
      setTimeout(() => setInspectStatus('idle'), 4000);
    } catch {
      setInspectStatus('error');
    }
  }, []);

  // Accessibility Check
  const handleAccessibilityCheck = useCallback(async () => {
    setAccessibilityStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAccessibilityStatus('success');
      setTimeout(() => setAccessibilityStatus('idle'), 4000);
    } catch {
      setAccessibilityStatus('error');
    }
  }, []);

  // Compatibility Check
  const handleCompatibilityCheck = useCallback(async () => {
    setCompatibilityStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompatibilityStatus('success');
      setTimeout(() => setCompatibilityStatus('idle'), 4000);
    } catch {
      setCompatibilityStatus('error');
    }
  }, []);

  // Tag management
  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      setTags(updated);
      fileOperations.updateMetadata({ tags: updated });
    }
    setNewTag('');
  }, [newTag, tags, fileOperations]);

  const handleRemoveTag = useCallback((tag: string) => {
    const updated = tags.filter(t => t !== tag);
    setTags(updated);
    fileOperations.updateMetadata({ tags: updated });
  }, [tags, fileOperations]);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === 'Backspace' && !newTag && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  }, [handleAddTag, handleRemoveTag, newTag, tags]);

  // ─── Styles ──────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '32px 48px',
    maxWidth: 600,
    animation: 'fadeIn 200ms ease-out',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 24,
  };

  // Section card
  const sectionCardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8E8E8',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    transition: 'box-shadow 150ms',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const sectionIconStyle: React.CSSProperties = {
    fontSize: 18,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  };

  // Action row
  const actionRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F0F0F0',
  };

  const actionLabelStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#333333',
    fontWeight: 500,
  };

  const actionDescStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  };

  // Buttons
  const actionButtonStyle = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => ({
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 500,
    color: variant === 'danger' ? '#D13438' : variant === 'primary' ? '#0078D4' : '#555555',
    backgroundColor: 'transparent',
    border: `1px solid ${variant === 'danger' ? '#E4A9AA' : variant === 'primary' ? '#C7E0F4' : '#D1D1D1'}`,
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 150ms',
    whiteSpace: 'nowrap',
  });

  const successBadgeStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#107C10',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    animation: 'fadeIn 200ms',
  };

  const spinnerSmallStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    border: '2px solid #E0E0E0',
    borderTopColor: '#0078D4',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  };

  // Password dialog
  const dialogOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 150ms',
  };

  const dialogCardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    width: 380,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    animation: 'scaleIn 200ms ease-out',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #D1D1D1',
    borderRadius: 4,
    marginBottom: 8,
    outline: 'none',
    boxSizing: 'border-box',
  };

  // Properties grid
  const propertiesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '8px 12px',
    fontSize: 13,
  };

  const propLabelStyle: React.CSSProperties = {
    color: '#888888',
    fontWeight: 500,
  };

  const propValueStyle: React.CSSProperties = {
    color: '#1F1F1F',
  };

  // Tags
  const tagContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  };

  const tagStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    backgroundColor: '#E8F4FD',
    color: '#0078D4',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
  };

  const tagRemoveStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#0078D4',
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };

  const tagInputStyle: React.CSSProperties = {
    border: '1px dashed #D1D1D1',
    borderRadius: 12,
    padding: '4px 10px',
    fontSize: 12,
    outline: 'none',
    width: 80,
    minWidth: 80,
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Info</h1>

      {/* Protect Workbook */}
      <div style={sectionCardStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionIconStyle}>🔒</span>
          Protect Workbook
        </div>

        <div style={actionRowStyle}>
          <div>
            <div style={actionLabelStyle}>Encrypt with Password</div>
            <div style={actionDescStyle}>
              {metadata.isProtected 
                ? 'This workbook is password-protected.' 
                : 'Require a password to open this workbook.'}
            </div>
          </div>
          {protectStatus === 'loading' ? (
            <div style={spinnerSmallStyle} />
          ) : protectStatus === 'success' ? (
            <span style={successBadgeStyle}>✓ {metadata.isProtected ? 'Password removed' : 'Password set'}</span>
          ) : metadata.isProtected ? (
            <button
              style={actionButtonStyle('danger')}
              onClick={handleRemovePassword}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#FDECEA'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Remove Password
            </button>
          ) : (
            <button
              style={actionButtonStyle('primary')}
              onClick={() => setShowPasswordDialog(true)}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#E8F4FD'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Set Password...
            </button>
          )}
        </div>

        <div style={{ ...actionRowStyle, borderBottom: 'none' }}>
          <div>
            <div style={actionLabelStyle}>Mark as Final</div>
            <div style={actionDescStyle}>
              {metadata.isMarkedFinal 
                ? 'This workbook has been marked as final.' 
                : 'Let readers know the workbook is final and make it read-only.'}
            </div>
          </div>
          {finalStatus === 'loading' ? (
            <div style={spinnerSmallStyle} />
          ) : finalStatus === 'success' ? (
            <span style={successBadgeStyle}>✓ Marked as final</span>
          ) : !metadata.isMarkedFinal ? (
            <button
              style={actionButtonStyle('secondary')}
              onClick={handleMarkAsFinal}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Mark as Final
            </button>
          ) : null}
        </div>
      </div>

      {/* Inspect Workbook */}
      <div style={sectionCardStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionIconStyle}>🔍</span>
          Inspect Workbook
        </div>

        <div style={actionRowStyle}>
          <div>
            <div style={actionLabelStyle}>Document Inspector</div>
            <div style={actionDescStyle}>Check for hidden properties or personal information.</div>
          </div>
          {inspectStatus === 'loading' ? (
            <div style={spinnerSmallStyle} />
          ) : inspectStatus === 'success' ? (
            <span style={successBadgeStyle}>✓ No issues found</span>
          ) : (
            <button
              style={actionButtonStyle('secondary')}
              onClick={handleInspect}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Inspect
            </button>
          )}
        </div>

        <div style={actionRowStyle}>
          <div>
            <div style={actionLabelStyle}>Check Accessibility</div>
            <div style={actionDescStyle}>Check the workbook for content that people with disabilities might find difficult to read.</div>
          </div>
          {accessibilityStatus === 'loading' ? (
            <div style={spinnerSmallStyle} />
          ) : accessibilityStatus === 'success' ? (
            <span style={successBadgeStyle}>✓ No issues found</span>
          ) : (
            <button
              style={actionButtonStyle('secondary')}
              onClick={handleAccessibilityCheck}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Check Accessibility
            </button>
          )}
        </div>

        <div style={{ ...actionRowStyle, borderBottom: 'none' }}>
          <div>
            <div style={actionLabelStyle}>Check Compatibility</div>
            <div style={actionDescStyle}>Check for features not supported by earlier versions of Excel.</div>
          </div>
          {compatibilityStatus === 'loading' ? (
            <div style={spinnerSmallStyle} />
          ) : compatibilityStatus === 'success' ? (
            <span style={successBadgeStyle}>✓ No issues found</span>
          ) : (
            <button
              style={actionButtonStyle('secondary')}
              onClick={handleCompatibilityCheck}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Check Compatibility
            </button>
          )}
        </div>
      </div>

      {/* Properties */}
      <div style={sectionCardStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionIconStyle}>📋</span>
          Properties
        </div>

        <div style={propertiesGridStyle}>
          <div style={propLabelStyle}>Size</div>
          <div style={propValueStyle}>{formatSize(metadata.size)}</div>

          <div style={propLabelStyle}>Sheets</div>
          <div style={propValueStyle}>{metadata.sheets}</div>

          <div style={propLabelStyle}>Created</div>
          <div style={propValueStyle}>{formatDate(metadata.created)}</div>

          <div style={propLabelStyle}>Last Modified</div>
          <div style={propValueStyle}>{formatDate(metadata.lastModified)}</div>

          <div style={propLabelStyle}>Last Modified By</div>
          <div style={propValueStyle}>{metadata.lastModifiedBy}</div>

          <div style={propLabelStyle}>Author</div>
          <div style={propValueStyle}>{metadata.author}</div>

          <div style={propLabelStyle}>Location</div>
          <div style={propValueStyle}>{metadata.path}</div>

          {showAllProperties && (
            <>
              <div style={propLabelStyle}>ID</div>
              <div style={{ ...propValueStyle, fontSize: 11, fontFamily: 'monospace' }}>{metadata.id}</div>

              <div style={propLabelStyle}>Protected</div>
              <div style={propValueStyle}>{metadata.isProtected ? 'Yes' : 'No'}</div>

              <div style={propLabelStyle}>Marked Final</div>
              <div style={propValueStyle}>{metadata.isMarkedFinal ? 'Yes' : 'No'}</div>
            </>
          )}

          <div style={propLabelStyle}>Tags</div>
          <div style={tagContainerStyle}>
            {tags.map(tag => (
              <span key={tag} style={tagStyle}>
                {tag}
                <button
                  style={tagRemoveStyle}
                  onClick={() => handleRemoveTag(tag)}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setEditingTags(true)}
              onBlur={() => {
                setEditingTags(false);
                if (newTag.trim()) handleAddTag();
              }}
              placeholder={tags.length === 0 ? 'Add a tag...' : ''}
              style={tagInputStyle}
              aria-label="Add tag"
            />
          </div>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#0078D4',
            fontSize: 13,
            cursor: 'pointer',
            padding: '8px 0 0',
            marginTop: 12,
          }}
          onClick={() => setShowAllProperties(!showAllProperties)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = '#106EBE'; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = '#0078D4'; }}
        >
          {showAllProperties ? 'Show Less' : 'Show All Properties...'}
        </button>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div
          style={dialogOverlayStyle}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
              setShowPasswordDialog(false);
              setPasswordError(null);
            }
          }}
        >
          <div style={dialogCardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1F1F1F' }}>
              Set Password
            </h3>
            
            <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              style={inputStyle}
              placeholder="Enter password"
              autoFocus
            />
            
            <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4, marginTop: 8 }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              style={inputStyle}
              placeholder="Confirm password"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') handleSetPassword();
                if (e.key === 'Escape') {
                  setShowPasswordDialog(false);
                  setPasswordError(null);
                }
              }}
            />

            {passwordError && (
              <div style={{ color: '#D13438', fontSize: 12, marginTop: 4, marginBottom: 8 }}>
                {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  color: '#555',
                  backgroundColor: 'transparent',
                  border: '1px solid #D1D1D1',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#F0F0F0'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#0078D4',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={handleSetPassword}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#106EBE'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = '#0078D4'; }}
              >
                Set Password
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
