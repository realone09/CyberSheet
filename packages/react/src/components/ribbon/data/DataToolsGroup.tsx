import { DataToolsGroupIcon5, DataToolsGroupIcon4, DataToolsGroupIcon3, DataToolsGroupIcon2, DataToolsGroupIcon1 } from '@cyber-sheet/icons/react';
import React, { useState, useCallback } from 'react';
import type { Workbook, Address, Range } from '@cyber-sheet/core';

interface DataToolsGroupProps {
  workbook: Workbook;
  selectedCells: Address[];
  onCommand?: (command: any) => void;
}

export const DataToolsGroup: React.FC<DataToolsGroupProps> = ({ workbook, selectedCells, onCommand }) => {
  const [showDataValidationDropdown, setShowDataValidationDropdown] = useState(false);
  const [showDataValidationDialog, setShowDataValidationDialog] = useState(false);
  const [showRemoveDuplicatesDialog, setShowRemoveDuplicatesDialog] = useState(false);
  const [showTextToColumnsWizard, setShowTextToColumnsWizard] = useState(false);

  const handleDataValidation = useCallback(() => {
    setShowDataValidationDialog(true);
    setShowDataValidationDropdown(false);
  }, []);

  const handleCircleInvalidData = useCallback(() => {
    const command = {
      type: 'circleInvalidData',
    };
    onCommand?.(command);
    setShowDataValidationDropdown(false);
    console.log('Circle Invalid Data');
  }, [onCommand]);

  const handleClearValidationCircles = useCallback(() => {
    const command = {
      type: 'clearValidationCircles',
    };
    onCommand?.(command);
    setShowDataValidationDropdown(false);
    console.log('Clear Validation Circles');
  }, [onCommand]);

  const handleTextToColumns = useCallback(() => {
    setShowTextToColumnsWizard(true);
  }, []);

  const handleFlashFill = useCallback(() => {
    if (selectedCells.length === 0) {
      console.warn('No column selected for Flash Fill');
      return;
    }

    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };

    const command = {
      type: 'flashFill',
      columnIndex: selection.start.col,
      startRow: selection.start.row,
      endRow: selection.end.row,
    };

    onCommand?.(command);
    console.log('Flash Fill:', selection.start.col);
  }, [selectedCells, onCommand]);

  const handleRemoveDuplicates = useCallback(() => {
    setShowRemoveDuplicatesDialog(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px', position: 'relative' }}>
      {/* Tools Row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
        {/* Data Validation Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDataValidationDropdown(!showDataValidationDropdown)}
            title="Data Validation"
            style={{
              width: 48,
              height: 32,
              border: 'none',
              background: '#F0F0F0',
              cursor: 'pointer',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontFamily: 'Segoe UI, sans-serif',
              color: '#333',
              padding: '2px 4px',
              position: 'relative',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
          >
            <DataToolsGroupIcon1 />
            <span style={{ fontSize: 8, marginTop: 2 }}>Data</span>
            <span style={{ fontSize: 8 }}>Validation</span>
            {/* Dropdown arrow */}
            <div style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <DataToolsGroupIcon2 />
            </div>
          </button>

          {/* Data Validation Dropdown */}
          {showDataValidationDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 2,
                background: '#FFFFFF',
                border: '1px solid #D9D9D9',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: 180,
              }}
            >
              <button
                onClick={handleDataValidation}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'Segoe UI, sans-serif',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = 'transparent'}
              >
                Data Validation...
              </button>
              <div style={{ height: 1, background: '#E0E0E0', margin: '4px 0' }} />
              <button
                onClick={handleCircleInvalidData}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'Segoe UI, sans-serif',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = 'transparent'}
              >
                Circle Invalid Data
              </button>
              <button
                onClick={handleClearValidationCircles}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'Segoe UI, sans-serif',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = 'transparent'}
              >
                Clear Validation Circles
              </button>
            </div>
          )}
        </div>

        {/* Text to Columns Button */}
        <button
          onClick={handleTextToColumns}
          title="Text to Columns"
          style={{
            width: 48,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
            padding: '2px 4px',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <DataToolsGroupIcon3 />
          <span style={{ fontSize: 8, marginTop: 2 }}>Text to</span>
          <span style={{ fontSize: 8 }}>Columns</span>
        </button>

        {/* Flash Fill Button */}
        <button
          onClick={handleFlashFill}
          title="Flash Fill (Ctrl+E)"
          style={{
            width: 48,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
            padding: '2px 4px',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <DataToolsGroupIcon4 />
          <span style={{ fontSize: 8, marginTop: 2 }}>Flash</span>
          <span style={{ fontSize: 8 }}>Fill</span>
        </button>

        {/* Remove Duplicates Button */}
        <button
          onClick={handleRemoveDuplicates}
          title="Remove Duplicates"
          style={{
            width: 48,
            height: 32,
            border: 'none',
            background: '#F0F0F0',
            cursor: 'pointer',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
            padding: '2px 4px',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#E0E0E0'}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#F0F0F0'}
        >
          <DataToolsGroupIcon5 />
          <span style={{ fontSize: 8, marginTop: 2 }}>Remove</span>
          <span style={{ fontSize: 8 }}>Duplicates</span>
        </button>
      </div>

      {/* Group Label */}
      <div style={{ fontSize: 10, color: '#666', marginTop: 2, fontFamily: 'Segoe UI, sans-serif' }}>
        Data Tools
      </div>

      {/* Data Validation Dialog */}
      {showDataValidationDialog && (
        <DataValidationDialog
          workbook={workbook}
          selectedCells={selectedCells}
          onClose={() => setShowDataValidationDialog(false)}
          onApply={(rule) => {
            if (selectedCells.length === 0) return;

            const selection: Range = {
              start: selectedCells[0],
              end: selectedCells[selectedCells.length - 1],
            };

            const command = {
              type: 'setDataValidation',
              range: selection,
              rule,
            };
            onCommand?.(command);
            setShowDataValidationDialog(false);
          }}
        />
      )}

      {/* Remove Duplicates Dialog */}
      {showRemoveDuplicatesDialog && (
        <RemoveDuplicatesDialog
          workbook={workbook}
          selectedCells={selectedCells}
          onClose={() => setShowRemoveDuplicatesDialog(false)}
          onRemove={(columns) => {
            if (selectedCells.length === 0) return;

            const selection: Range = {
              start: selectedCells[0],
              end: selectedCells[selectedCells.length - 1],
            };

            const command = {
              type: 'removeDuplicates',
              range: selection,
              columns,
            };
            onCommand?.(command);
            setShowRemoveDuplicatesDialog(false);
          }}
        />
      )}

      {/* Text to Columns Wizard */}
      {showTextToColumnsWizard && (
        <TextToColumnsWizard
          workbook={workbook}
          selectedCells={selectedCells}
          onClose={() => setShowTextToColumnsWizard(false)}
          onApply={(config) => {
            if (selectedCells.length === 0) return;

            const selection: Range = {
              start: selectedCells[0],
              end: selectedCells[selectedCells.length - 1],
            };

            const command = {
              type: 'textToColumns',
              range: selection,
              config,
            };
            onCommand?.(command);
            setShowTextToColumnsWizard(false);
          }}
        />
      )}
    </div>
  );
};

// Data Validation Dialog
interface DataValidationDialogProps {
  workbook: Workbook;
  selectedCells: Address[];
  onClose: () => void;
  onApply: (rule: any) => void;
}

const DataValidationDialog: React.FC<DataValidationDialogProps> = ({ workbook, selectedCells, onClose, onApply }) => {
  const [validationType, setValidationType] = useState<string>('list');
  const [operator, setOperator] = useState<string>('between');
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [listSource, setListSource] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ignoreBlank, setIgnoreBlank] = useState(true);
  const [showInputMessage, setShowInputMessage] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(true);

  const handleApply = () => {
    const rule = {
      type: validationType,
      operator,
      value1,
      value2,
      listSource,
      inputMessage: showInputMessage ? inputMessage : undefined,
      errorMessage: showErrorAlert ? errorMessage : undefined,
      ignoreBlank,
    };
    onApply(rule);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          width: 520,
          maxHeight: '80vh',
          overflow: 'auto',
          fontFamily: 'Segoe UI, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Data Validation</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#666' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          {/* Settings Tab */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Validation criteria</h4>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Allow:</label>
              <select
                value={validationType}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValidationType(e.target.value)}
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11 }}
              >
                <option value="any">Any value</option>
                <option value="whole">Whole number</option>
                <option value="decimal">Decimal</option>
                <option value="list">List</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="textLength">Text length</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {validationType === 'list' ? (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Source:</label>
                <input
                  type="text"
                  value={listSource}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setListSource(e.target.value)}
                  placeholder="Enter values separated by commas"
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11 }}
                />
                <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                  Enter a comma-separated list or a range reference (e.g., $A$1:$A$10)
                </div>
              </div>
            ) : validationType !== 'any' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Data:</label>
                  <select
                    value={operator}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setOperator(e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11 }}
                  >
                    <option value="between">between</option>
                    <option value="notBetween">not between</option>
                    <option value="equal">equal to</option>
                    <option value="notEqual">not equal to</option>
                    <option value="greater">greater than</option>
                    <option value="less">less than</option>
                    <option value="greaterOrEqual">greater than or equal to</option>
                    <option value="lessOrEqual">less than or equal to</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      {operator === 'between' || operator === 'notBetween' ? 'Minimum:' : 'Value:'}
                    </label>
                    <input
                      type="text"
                      value={value1}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValue1(e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11 }}
                    />
                  </div>
                  {(operator === 'between' || operator === 'notBetween') && (
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Maximum:</label>
                      <input
                        type="text"
                        value={value2}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValue2(e.target.value)}
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11 }}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : null}

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIgnoreBlank(e.target.checked)} />
              Ignore blank
            </label>
          </div>

          {/* Input Message */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
              <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowInputMessage(e.target.checked)} />
              <strong>Show input message when cell is selected</strong>
            </label>
            {showInputMessage && (
              <textarea
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                placeholder="Enter message to display when cell is selected"
                style={{ width: '100%', height: 60, padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11, resize: 'vertical' }}
              />
            )}
          </div>

          {/* Error Alert */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
              <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowErrorAlert(e.target.checked)} />
              <strong>Show error alert after invalid data is entered</strong>
            </label>
            {showErrorAlert && (
              <textarea
                value={errorMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setErrorMessage(e.target.value)}
                placeholder="Enter error message to display"
                style={{ width: '100%', height: 60, padding: '4px 8px', border: '1px solid #D9D9D9', borderRadius: 2, fontSize: 11, resize: 'vertical' }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              border: '1px solid #D9D9D9',
              background: '#F0F0F0',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: '6px 16px',
              border: '1px solid #0078D4',
              background: '#0078D4',
              color: '#FFFFFF',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Remove Duplicates Dialog
interface RemoveDuplicatesDialogProps {
  workbook: Workbook;
  selectedCells: Address[];
  onClose: () => void;
  onRemove: (columns: number[]) => void;
}

const RemoveDuplicatesDialog: React.FC<RemoveDuplicatesDialogProps> = ({ workbook, selectedCells, onClose, onRemove }) => {
  const sheet = workbook.activeSheet;
  
  // Calculate column count from selection
  let columnCount = 5; // default
  if (sheet && selectedCells.length > 0) {
    const selection: Range = {
      start: selectedCells[0],
      end: selectedCells[selectedCells.length - 1],
    };
    columnCount = selection.end.col - selection.start.col + 1;
  }
  
  const [selectedColumns, setSelectedColumns] = useState<boolean[]>(Array(columnCount).fill(true));

  const toggleColumn = (index: number) => {
    const newSelected = [...selectedColumns];
    newSelected[index] = !newSelected[index];
    setSelectedColumns(newSelected);
  };

  const selectAll = () => setSelectedColumns(Array(columnCount).fill(true));
  const deselectAll = () => setSelectedColumns(Array(columnCount).fill(false));

  const handleRemove = () => {
    const columns = selectedColumns.map((selected, index) => (selected ? index : -1)).filter(i => i >= 0);
    onRemove(columns);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          width: 400,
          fontFamily: 'Segoe UI, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Remove Duplicates</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#666' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
            To delete duplicate values, select one or more columns that contain duplicates.
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={selectAll}
              style={{
                padding: '4px 12px',
                border: '1px solid #D9D9D9',
                background: '#F0F0F0',
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              style={{
                padding: '4px 12px',
                border: '1px solid #D9D9D9',
                background: '#F0F0F0',
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Unselect All
            </button>
          </div>

          <div style={{ border: '1px solid #D9D9D9', borderRadius: 2, maxHeight: 200, overflow: 'auto', padding: 8 }}>
            {Array.from({ length: columnCount }, (_, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={selectedColumns[i]}
                  onChange={() => toggleColumn(i)}
                />
                Column {String.fromCharCode(65 + i)}
              </label>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginTop: 12 }}>
            <input type="checkbox" defaultChecked />
            My data has headers
          </label>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              border: '1px solid #D9D9D9',
              background: '#F0F0F0',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            style={{
              padding: '6px 16px',
              border: '1px solid #0078D4',
              background: '#0078D4',
              color: '#FFFFFF',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Text to Columns Wizard (Simplified)
interface TextToColumnsWizardProps {
  workbook: Workbook;
  selectedCells: Address[];
  onClose: () => void;
  onApply: (config: any) => void;
}

const TextToColumnsWizard: React.FC<TextToColumnsWizardProps> = ({ workbook, selectedCells, onClose, onApply }) => {
  const [step, setStep] = useState(1);
  const [dataType, setDataType] = useState<'delimited' | 'fixedWidth'>('delimited');
  const [delimiters, setDelimiters] = useState({ tab: true, semicolon: false, comma: false, space: false, other: false });
  const [otherDelimiter, setOtherDelimiter] = useState('');

  const handleApply = () => {
    const config = {
      dataType,
      delimiters: Object.entries(delimiters)
        .filter(([key, value]) => value)
        .map(([key]) => key === 'other' ? otherDelimiter : key),
    };
    onApply(config);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          width: 500,
          fontFamily: 'Segoe UI, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Convert Text to Columns Wizard - Step {step} of 3</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#666' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 16, minHeight: 200 }}>
          {step === 1 && (
            <div>
              <div style={{ fontSize: 11, marginBottom: 12 }}>
                The Text Wizard has determined that your data is {dataType === 'delimited' ? 'Delimited' : 'Fixed Width'}.
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Original data type:</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
                <input
                  type="radio"
                  checked={dataType === 'delimited'}
                  onChange={() => setDataType('delimited')}
                />
                Delimited - Characters such as commas or tabs separate each field
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <input
                  type="radio"
                  checked={dataType === 'fixedWidth'}
                  onChange={() => setDataType('fixedWidth')}
                />
                Fixed width - Fields are aligned in columns with spaces between each field
              </label>
            </div>
          )}

          {step === 2 && dataType === 'delimited' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Delimiters:</div>
              {Object.entries(delimiters).map(([key, value]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDelimiters({ ...delimiters, [key]: e.target.checked })}
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {key === 'other' && (
                    <input
                      type="text"
                      value={otherDelimiter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setOtherDelimiter(e.target.value)}
                      disabled={!delimiters.other}
                      style={{
                        width: 40,
                        padding: '2px 4px',
                        border: '1px solid #D9D9D9',
                        borderRadius: 2,
                        fontSize: 11,
                        marginLeft: 8,
                      }}
                      maxLength={1}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontSize: 11, marginBottom: 12 }}>
                This screen lets you select each column and set the Data Format.
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Column data format:</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
                <input type="radio" defaultChecked />
                General
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 8 }}>
                <input type="radio" />
                Text
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <input type="radio" />
                Date: MDY
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              border: '1px solid #D9D9D9',
              background: '#F0F0F0',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '6px 16px',
                  border: '1px solid #D9D9D9',
                  background: '#F0F0F0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  padding: '6px 16px',
                  border: '1px solid #0078D4',
                  background: '#0078D4',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleApply}
                style={{
                  padding: '6px 16px',
                  border: '1px solid #0078D4',
                  background: '#0078D4',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
