// src/components/backstage/panels/MoveFilePanel.tsx

import React, { useState, useCallback, useMemo } from 'react';
import type { FileOperations, FolderNode } from '@cyber-sheet/core';

export interface MoveFilePanelProps {
  fileOperations: FileOperations;
  currentPath: string;
}

// Build a folder tree for demo; in production, this comes from FileOperations or API
const buildDefaultTree = (): FolderNode[] => [
  {
    name: 'OneDrive',
    path: '/onedrive',
    children: [
      {
        name: 'Documents',
        path: '/onedrive/documents',
        children: [
          { name: 'Archive', path: '/onedrive/documents/archive', children: [], isExpanded: false },
          { name: 'Projects', path: '/onedrive/documents/projects', children: [
            { name: '2025', path: '/onedrive/documents/projects/2025', children: [], isExpanded: false },
            { name: '2026', path: '/onedrive/documents/projects/2026', children: [], isExpanded: false },
          ], isExpanded: false },
          { name: 'Spreadsheets', path: '/onedrive/documents/spreadsheets', children: [], isExpanded: false, filesCount: 12 },
          { name: 'Reports', path: '/onedrive/documents/reports', children: [], isExpanded: false, filesCount: 5 },
        ],
        isExpanded: true,
      },
      {
        name: 'Pictures',
        path: '/onedrive/pictures',
        children: [],
        isExpanded: false,
      },
      {
        name: 'Shared',
        path: '/onedrive/shared',
        children: [],
        isExpanded: false,
        filesCount: 3,
      },
    ],
    isExpanded: true,
  },
  {
    name: 'This PC',
    path: '/local',
    children: [
      { name: 'Desktop', path: '/local/desktop', children: [], isExpanded: false },
      { name: 'Downloads', path: '/local/downloads', children: [], isExpanded: false, filesCount: 8 },
      { name: 'Documents', path: '/local/documents', children: [], isExpanded: false },
    ],
    isExpanded: false,
  },
];

export const MoveFilePanel: React.FC<MoveFilePanelProps> = ({
  fileOperations,
  currentPath,
}) => {
  const [folderTree, setFolderTree] = useState<FolderNode[]>(buildDefaultTree());
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [moveComplete, setMoveComplete] = useState(false);

  const currentLocationLabel = useMemo(() => {
    const parts = currentPath.replace(/^\//, '').split('/');
    return parts.join(' › ');
  }, [currentPath]);

  // Toggle folder expand/collapse
  const toggleFolder = useCallback((path: string) => {
    const update = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(node => ({
        ...node,
        isExpanded: node.path === path ? !node.isExpanded : node.isExpanded,
        children: update(node.children),
      }));
    setFolderTree(update(folderTree));
  }, [folderTree]);

  // Select a folder as destination
  const handleSelectFolder = useCallback((path: string) => {
    setSelectedPath(path);
    setNewFolderParent(null); // close new folder input
    setNewFolderName('');
    setMoveComplete(false);
  }, []);

  // Start creating a new folder
  const handleNewFolderStart = useCallback(() => {
    setNewFolderParent(selectedPath || currentPath);
    setNewFolderName('');
  }, [selectedPath, currentPath]);

  // Create new folder
  const handleCreateFolder = useCallback(() => {
    if (!newFolderParent || !newFolderName.trim()) return;

    const addFolder = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(node => ({
        ...node,
        children: node.path === newFolderParent
          ? [
              ...node.children,
              {
                name: newFolderName.trim(),
                path: `${newFolderParent}/${newFolderName.trim().toLowerCase()}`,
                children: [],
                isExpanded: false,
              },
            ].sort((a, b) => a.name.localeCompare(b.name))
          : addFolder(node.children),
      }));
    setFolderTree(addFolder(folderTree));

    setNewFolderParent(null);
    setNewFolderName('');
  }, [newFolderParent, newFolderName, folderTree]);

  // Move file
  const handleMove = useCallback(async () => {
    if (!selectedPath || selectedPath === currentPath) return;

    setIsMoving(true);
    // Simulate move
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsMoving(false);
    setMoveComplete(true);
    
    // Close after delay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('backstage-close'));
    }, 1500);
  }, [selectedPath, currentPath]);

  // Recursive tree rendering
  const renderFolderTree = (nodes: FolderNode[], depth: number = 0): React.ReactNode => {
    return nodes.map(node => {
      const isSelected = selectedPath === node.path;
      const isCurrentLocation = currentPath === node.path;
      const isShowingNewFolderInput = newFolderParent === node.path;

      return (
        <div key={node.path}>
          <FolderRow
            node={node}
            depth={depth}
            isSelected={isSelected}
            isCurrentLocation={isCurrentLocation}
            onToggle={() => toggleFolder(node.path)}
            onSelect={() => handleSelectFolder(node.path)}
          />
          
          {/* New folder input */}
          {isShowingNewFolderInput && (
            <div style={newFolderRowStyle(depth + 1)}>
              <span style={{ marginRight: 6 }}>📂</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setNewFolderParent(null);
                }}
                placeholder="Folder name..."
                autoFocus
                style={newFolderInputStyle}
              />
              <button
                style={newFolderButtonStyle}
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          )}

          {/* Children */}
          {node.isExpanded && node.children.length > 0 && (
            renderFolderTree(node.children, depth + 1)
          )}
        </div>
      );
    });
  };

  // ─── Styles ──────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '32px 48px',
    maxWidth: 560,
    animation: 'fadeIn 200ms ease-out',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    color: '#1F1F1F',
    marginBottom: 8,
  };

  const breadcrumbStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#888888',
    marginBottom: 24,
    padding: '8px 12px',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const treeContainerStyle: React.CSSProperties = {
    border: '1px solid #E8E8E8',
    borderRadius: 8,
    maxHeight: 'calc(100vh - 380px)',
    overflowY: 'auto',
    padding: '8px 0',
  };

  const newFolderContainerStyle: React.CSSProperties = {
    marginTop: 12,
    marginBottom: 20,
  };

  const newFolderLinkStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#0078D4',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 20,
  };

  const moveButtonStyle: React.CSSProperties = {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: moveComplete ? '#107C10' : 
      (!selectedPath || selectedPath === currentPath || isMoving) ? '#A0C4E8' : '#0078D4',
    border: 'none',
    borderRadius: 4,
    cursor: (!selectedPath || selectedPath === currentPath || isMoving || moveComplete) ? 'default' : 'pointer',
    transition: 'all 200ms',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const spinnerStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Move File</h1>
      
      {/* Current location breadcrumb */}
      <div style={breadcrumbStyle}>
        <span>📍</span>
        <span>Current: {currentLocationLabel}</span>
      </div>

      {/* Folder tree */}
      <div style={treeContainerStyle}>
        {renderFolderTree(folderTree)}
      </div>

      {/* New folder button */}
      <div style={newFolderContainerStyle}>
        <button
          style={newFolderLinkStyle}
          onClick={handleNewFolderStart}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = '#106EBE'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = '#0078D4'}
        >
          <span style={{ fontSize: 16 }}>+</span>
          New Folder
        </button>
      </div>

      {/* Action buttons */}
      <div style={buttonContainerStyle}>
        <button
          style={moveButtonStyle}
          onClick={handleMove}
          disabled={!selectedPath || selectedPath === currentPath || isMoving || moveComplete}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (selectedPath && selectedPath !== currentPath && !isMoving && !moveComplete) {
              e.currentTarget.style.backgroundColor = '#106EBE';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (selectedPath && selectedPath !== currentPath && !isMoving && !moveComplete) {
              e.currentTarget.style.backgroundColor = '#0078D4';
            }
          }}
        >
          {isMoving && <div style={spinnerStyle} />}
          {moveComplete ? '✓ Moved!' : isMoving ? 'Moving...' : 'Move Here'}
        </button>
        
        {moveComplete && (
          <span style={{ fontSize: 13, color: '#107C10' }}>
            File moved successfully
          </span>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ─── FolderRow Sub-component ──────────────────────────────

interface FolderRowProps {
  node: FolderNode;
  depth: number;
  isSelected: boolean;
  isCurrentLocation: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const FolderRow: React.FC<FolderRowProps> = ({
  node,
  depth,
  isSelected,
  isCurrentLocation,
  onToggle,
  onSelect,
}) => {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: `6px 12px 6px ${12 + depth * 20}px`,
    cursor: 'pointer',
    backgroundColor: isSelected ? '#E8F4FD' : 'transparent',
    borderLeft: isSelected ? '3px solid #0078D4' : '3px solid transparent',
    transition: 'background-color 100ms',
    userSelect: 'none',
  };

  const chevronStyle: React.CSSProperties = {
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#888888',
    transform: node.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 150ms ease',
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 16,
    flexShrink: 0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 14,
    color: isCurrentLocation ? '#0078D4' : '#1F1F1F',
    fontWeight: isCurrentLocation ? 600 : 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888888',
    marginLeft: 4,
  };

  return (
    <div
      style={rowStyle}
      onClick={() => {
        onSelect();
        if (node.children.length > 0) onToggle();
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = '#F5F5F5';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      role="treeitem"
      aria-expanded={node.isExpanded}
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
          if (node.children.length > 0) onToggle();
        }
        if (e.key === 'ArrowRight' && !node.isExpanded && node.children.length > 0) {
          e.preventDefault();
          onToggle();
        }
        if (e.key === 'ArrowLeft' && node.isExpanded) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Chevron */}
      <div style={chevronStyle}>
        {node.children.length > 0 ? '▶' : ''}
      </div>

      {/* Folder icon */}
      <span style={iconStyle}>
        {node.isExpanded ? '📂' : '📁'}
      </span>

      {/* Folder name */}
      <span style={nameStyle}>
        {node.name}
      </span>

      {/* File count badge */}
      {node.filesCount && (
        <span style={badgeStyle}>({node.filesCount})</span>
      )}

      {/* Current location indicator */}
      {isCurrentLocation && (
        <span style={{ fontSize: 11, color: '#0078D4', fontWeight: 600, marginLeft: 4 }}>
          (current)
        </span>
      )}
    </div>
  );
};

const newFolderRowStyle = (depth: number): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: `6px 12px 6px ${12 + depth * 20}px`,
});

const newFolderInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '4px 8px',
  fontSize: 13,
  border: '1px solid #0078D4',
  borderRadius: 4,
  outline: 'none',
  boxShadow: '0 0 0 2px rgba(0,120,212,0.15)',
};

const newFolderButtonStyle: React.CSSProperties = {
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: 500,
  color: '#FFFFFF',
  backgroundColor: '#0078D4',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};
