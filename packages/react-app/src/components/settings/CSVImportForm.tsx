import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

interface CSVImportFormProps {
  onImportComplete?: () => void;
}

interface ImportStep {
  step: 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';
}

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  [csvField: string]: string | null;
}

const supportedExchanges = [
  { value: 'hyperliquid', label: 'HyperLiquid' },
  { value: 'binance', label: 'Binance' },
  { value: 'coinbase', label: 'Coinbase' },
  { value: 'custom', label: 'Custom Mapping' }
];

const requiredFields = [
  { key: 'datetime', label: 'Date/Time', description: 'When the transaction occurred' },
  { key: 'instrument_ticker', label: 'Instrument/Ticker', description: 'The trading symbol (e.g., BTC, ETH)' },
  { key: 'action', label: 'Action', description: 'Buy/Sell or equivalent' },
  { key: 'quantity', label: 'Quantity', description: 'Amount traded' },
  { key: 'price', label: 'Price', description: 'Price per unit' },
  { key: 'fees', label: 'Fees', description: 'Transaction fees (optional)' }
];

const optionalFields = [
  { key: 'closedPnl', label: 'Closed P&L', description: 'Actual profit/loss for leveraged positions (optional)' }
];

const CSVImportForm: React.FC<CSVImportFormProps> = ({ onImportComplete }) => {
  const accounts = useAppStore(s => s.accounts);
  const selectedAccountId = useAppStore(s => s.selectedAccountId);
  const handleTradeDataChange = useAppStore(s => s.handleTradeDataChange);
  
  const [importStep, setImportStep] = useState<ImportStep['step']>('upload');
  const [selectedExchange, setSelectedExchange] = useState<string>('hyperliquid');
  const [selectedAccount, setSelectedAccount] = useState<number>(selectedAccountId || (accounts.length > 0 ? accounts[0].account_id : 0));
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [importResults, setImportResults] = useState<{ successful: number; failed: number; skipped: number; errors: string[] }>({ successful: 0, failed: 0, skipped: 0, errors: [] });

  const getHyperLiquidMapping = (headers: string[]): FieldMapping => {
    const mapping: FieldMapping = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader === 'time') mapping[header] = 'datetime';
      else if (lowerHeader === 'coin') mapping[header] = 'instrument_ticker';
      else if (lowerHeader === 'dir') mapping[header] = 'action';
      else if (lowerHeader === 'sz') mapping[header] = 'quantity';
      else if (lowerHeader === 'px') mapping[header] = 'price';
      else if (lowerHeader === 'fee') mapping[header] = 'fees';
      else if (lowerHeader === 'closedpnl') mapping[header] = 'closedPnl';
      // Skip calculated fields - these are computed automatically by the program:
      // - 'ntl' (notional) = quantity × price
      else if (lowerHeader === 'ntl') mapping[header] = null;
      else mapping[header] = null;
    });
    
    return mapping;
  };

  // Helper to parse HyperLiquid date strings
  function parseHyperLiquidDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' - ');
    const [month, day, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportStatus({ message: 'Please select a CSV file', type: 'error' });
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (result.errors && result.errors.length > 0) {
        setImportStatus({ message: `CSV parsing error: ${result.errors[0].message}`, type: 'error' });
        return;
      }
      const data = result.data as CSVRow[];
      if (!data.length) {
        setImportStatus({ message: 'CSV file must contain at least a header row and one data row', type: 'error' });
        return;
      }
      const headers = result.meta.fields || [];
      setCsvHeaders(headers);
      setCsvData(data);
      // Auto-set field mapping based on selected exchange
      if (selectedExchange === 'hyperliquid') {
        setFieldMapping(getHyperLiquidMapping(headers));
      } else {
        // Initialize empty mapping for custom
        const emptyMapping: FieldMapping = {};
        headers.forEach(header => {
          emptyMapping[header] = null;
        });
        setFieldMapping(emptyMapping);
      }
      setImportStep('mapping');
      setImportStatus(null);
    };
    reader.readAsText(file);
  };

  const handleFieldMappingChange = (csvField: string, targetField: string | null) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvField]: targetField
    }));
  };

  const validateMapping = (): boolean => {
    const mappedFields = Object.values(fieldMapping).filter(field => field !== null);
    const requiredMapped = requiredFields.filter(field => 
      field.key !== 'fees' // fees is optional
    ).every(field => mappedFields.includes(field.key));

    if (!requiredMapped) {
      setImportStatus({ message: 'Please map all required fields', type: 'error' });
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateMapping()) return;
    setImportStep('preview');
    setImportStatus(null);
  };

  const handleImport = async () => {
    if (!validateMapping()) return;

    setImportStep('importing');
    setImportStatus({ message: 'Importing transactions...', type: 'info' });

    try {
      const results = { successful: 0, failed: 0, skipped: 0, errors: [] as string[] };

      // Sort CSV data by datetime before processing to ensure chronological order
      const sortedCsvData = [...csvData].sort((a, b) => {
        const dateTimeField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'datetime');
        if (!dateTimeField) return 0;
        
        const aDateTime = a[dateTimeField];
        const bDateTime = b[dateTimeField];
        
        if (selectedExchange === 'hyperliquid') {
          const aDate = parseHyperLiquidDate(aDateTime);
          const bDate = parseHyperLiquidDate(bDateTime);
          return aDate.getTime() - bDate.getTime();
        } else {
          // Standard date parsing
          return new Date(aDateTime).getTime() - new Date(bDateTime).getTime();
        }
      });

      console.log(`[CSV_IMPORT] Processing ${sortedCsvData.length} transactions in chronological order`);

      for (const row of sortedCsvData) {
        try {
          // For HyperLiquid imports, filter out spot trading transactions (/USDC pairs)
          if (selectedExchange === 'hyperliquid') {
            const instrumentField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'instrument_ticker');
            if (instrumentField && row[instrumentField]) {
              const instrument = row[instrumentField];
              // Skip spot trading pairs (e.g., SOL/USDC, ETH/USDC, etc.)
              if (instrument.includes('/USDC') || instrument.includes('/USD')) {
                console.log(`[CSV_IMPORT] Skipping spot trading transaction: ${instrument}`);
                results.skipped++;
                continue; // Skip this row
              }
            }
          }

          // Transform the row based on field mapping
          const transformedData: Record<string, unknown> = {
            account_id: selectedAccount,
            emotion_ids: []
          };

          Object.entries(fieldMapping).forEach(([csvField, targetField]) => {
            if (targetField && row[csvField]) {
              const value = row[csvField];

              // Transform the data based on the target field
              switch (targetField) {
                case 'datetime':
                  // Parse HyperLiquid datetime format: "7/12/2025 - 09:37:01"
                  if (selectedExchange === 'hyperliquid') {
                    const date = parseHyperLiquidDate(value);
                    transformedData.datetime = date.toISOString().slice(0, 16);
                  } else {
                    transformedData.datetime = value;
                  }
                  break;
                case 'action':
                  // Pass through the raw action - let the enhanced position tracker handle it
                  transformedData.action = value;
                  break;
                case 'instrument_ticker':
                  // Clean up ticker (remove /USDC suffix for some exchanges)
                  transformedData.instrument_ticker = value.replace('/USDC', '').toUpperCase();
                  break;
                case 'quantity':
                  transformedData.quantity = parseFloat(value);
                  break;
                case 'price':
                  transformedData.price = parseFloat(value);
                  break;
                case 'fees':
                  transformedData.fees_for_transaction = Math.abs(parseFloat(value || '0'));
                  break;
                default:
                  transformedData[targetField] = value;
              }
            }
          });

          // Set default values
          transformedData.asset_class = 'Cryptocurrency'; // Default for most exchanges
          transformedData.exchange = selectedExchange === 'hyperliquid' ? 'HyperLiquid' : 'Unknown';
          transformedData.notes_for_transaction = `Imported from ${selectedExchange} CSV`;

          // Call the electron API to log the CSV transaction (uses CSV-specific processing)
          const result = await window.electronAPI.logCSVTransaction(transformedData);
          
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`Row ${sortedCsvData.indexOf(row) + 1}: ${result.message}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${sortedCsvData.indexOf(row) + 1}: ${(error as Error).message}`);
        }
      }

      setImportResults(results);
      setImportStep('complete');
      
      if (results.successful > 0) {
        let message = `Successfully imported ${results.successful} transaction(s)`;
        if (results.skipped > 0) message += `, ${results.skipped} skipped (spot trading)`;
        if (results.failed > 0) message += `, ${results.failed} failed`;
        
        setImportStatus({ 
          message, 
          type: results.failed > 0 ? 'error' : 'success' 
        });
        
        // Refresh trades list so they appear on the Trades page
        await handleTradeDataChange();
      } else {
        setImportStatus({ message: 'No transactions were imported', type: 'error' });
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportStatus({ message: `Import failed: ${(error as Error).message}`, type: 'error' });
      setImportStep('preview');
    }
  };

  const handleReset = () => {
    setImportStep('upload');
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setImportStatus(null);
    setImportResults({ successful: 0, failed: 0, skipped: 0, errors: [] });
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Exchange</label>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="w-full p-2 border border-card-stroke rounded bg-surface-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {supportedExchanges.map(exchange => (
              <option key={exchange.value} value={exchange.value}>
                {exchange.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(Number(e.target.value))}
            className="w-full p-2 border border-card-stroke rounded bg-surface-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {accounts.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <div className="border-2 border-dashed border-card-stroke rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer bg-primary text-on-primary px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Select CSV File
            </label>
            <p className="text-sm text-gray-400 mt-2">
              {csvFile ? csvFile.name : 'No file selected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="font-medium mb-2">Field Mapping</h3>
        <p className="text-sm text-gray-400">
          Map the CSV columns to the required fields. Fields marked with * are required.
        </p>
      </div>

      <div className="space-y-3">
        {csvHeaders.map(header => {
          const lowerHeader = header.toLowerCase();
          const isCalculatedField = lowerHeader === 'ntl' || lowerHeader === 'closedpnl';
          
          return (
            <div key={header} className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">{header}</label>
                <div className="text-xs text-gray-400 mt-1">
                  Sample: {csvData[0]?.[header] || 'N/A'}
                </div>
                {isCalculatedField && (
                  <div className="text-xs text-amber-400 mt-1">
                    ⚠️ Calculated field - will be skipped (computed automatically)
                  </div>
                )}
              </div>
              <div className="flex-1">
                <select
                  value={fieldMapping[header] || ''}
                  onChange={(e) => handleFieldMappingChange(header, e.target.value || null)}
                  className="w-full p-2 border border-card-stroke rounded bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isCalculatedField}
                >
                  <option value="">
                    {isCalculatedField ? '-- Calculated field (skipped) --' : '-- Skip this field --'}
                  </option>
                  {!isCalculatedField && requiredFields.map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label}{field.key !== 'fees' ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setImportStep('upload')}
          className="px-4 py-2 border border-card-stroke rounded text-on-surface hover:bg-surface-variant transition-colors"
        >
          Back
        </button>
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors"
        >
          Preview Import
        </button>
      </div>
    </div>
  );

  const getActionType = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('open long') || actionLower.includes('buy')) {
      return { type: 'Open Long', color: 'text-green-400', bgColor: 'bg-green-400/10' };
    } else if (actionLower.includes('open short')) {
      return { type: 'Open Short', color: 'text-red-400', bgColor: 'bg-red-400/10' };
    } else if (actionLower.includes('close long') || (actionLower.includes('sell') && !actionLower.includes('short'))) {
      return { type: 'Close Long', color: 'text-orange-400', bgColor: 'bg-orange-400/10' };
    } else if (actionLower.includes('close short')) {
      return { type: 'Close Short', color: 'text-blue-400', bgColor: 'bg-blue-400/10' };
    } else if (actionLower.includes('liquidation')) {
      return { type: 'Liquidation', color: 'text-red-500', bgColor: 'bg-red-500/10' };
    }
    return { type: action, color: 'text-gray-400', bgColor: 'bg-gray-400/10' };
  };

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="font-medium mb-2">Import Preview</h3>
        <p className="text-sm text-gray-400">
          Found {csvData.length} transaction(s) to import into account: {accounts.find(a => a.account_id === selectedAccount)?.name}
        </p>
        {selectedExchange === 'hyperliquid' && (
          <div className="mt-2 text-xs text-amber-600">
            <span className="font-medium">Note:</span> Spot trading transactions (e.g., SOL/USDC, ETH/USDC) will be automatically skipped as they represent asset conversions, not leveraged trades.
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          <span className="font-medium">Position Tracking:</span> The system will automatically detect position states and manage trade lifecycle
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-stroke">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Quantity</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Fees</th>
            </tr>
          </thead>
          <tbody>
            {csvData.slice(0, 10).map((row, index) => {
              const actionValue = Object.entries(fieldMapping).find(([, target]) => target === 'action')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'action')![0]] : 'N/A';
              const actionType = getActionType(actionValue);
              
              // Check if this row will be skipped (spot trading)
              const instrumentField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'instrument_ticker');
              const instrument = instrumentField ? row[instrumentField] : '';
              const isSpotTrade = selectedExchange === 'hyperliquid' && (instrument.includes('/USDC') || instrument.includes('/USD'));
              
              return (
                <tr key={index} className={`border-b border-card-stroke/50 ${isSpotTrade ? 'opacity-50 bg-gray-50' : ''}`}>
                  <td className="p-2">{Object.entries(fieldMapping).find(([, target]) => target === 'datetime')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'datetime')![0]] : 'N/A'}</td>
                  <td className="p-2">
                    {instrument}
                    {isSpotTrade && <span className="ml-2 text-xs text-gray-500">(Will be skipped - Spot trade)</span>}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${actionType.bgColor} ${actionType.color}`}>
                      {actionType.type}
                    </span>
                  </td>
                  <td className="p-2">{Object.entries(fieldMapping).find(([, target]) => target === 'quantity')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'quantity')![0]] : 'N/A'}</td>
                  <td className="p-2">{Object.entries(fieldMapping).find(([, target]) => target === 'price')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'price')![0]] : 'N/A'}</td>
                  <td className="p-2">{Object.entries(fieldMapping).find(([, target]) => target === 'fees')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'fees')![0]] : '0'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {csvData.length > 10 && (
          <p className="text-sm text-gray-400 mt-2">... and {csvData.length - 10} more rows</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-medium text-blue-900 mb-2">Enhanced Position Tracking</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Automatic Trade Management:</strong> The system detects when to create new trades vs. add to existing ones</p>
          <p>• <strong>Position Size Validation:</strong> Prevents over-selling and validates position consistency</p>
          <p>• <strong>Liquidation Handling:</strong> Properly processes forced liquidations and market orders</p>
          <p>• <strong>Order Type Recognition:</strong> Supports all major order types (Open Long/Short, Close Long/Short, Liquidations)</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setImportStep('mapping')}
          className="px-4 py-2 border border-card-stroke rounded text-on-surface hover:bg-surface-variant transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleImport}
          className="px-4 py-2 bg-success text-on-primary rounded hover:bg-success/90 transition-colors"
        >
          Import {csvData.length} Transaction(s)
        </button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-lg font-medium">Importing transactions...</p>
      <p className="text-sm text-gray-400">Please wait while we process your data</p>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <div className="text-center py-6">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
        <p className="text-sm text-gray-400">
          Successfully imported {importResults.successful} transaction(s)
          {importResults.skipped > 0 && `, ${importResults.skipped} skipped (spot trading)`}
          {importResults.failed > 0 && `, ${importResults.failed} failed`}
        </p>
      </div>

      {importResults.errors.length > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <h4 className="font-medium text-error mb-2">Errors:</h4>
          <ul className="text-sm text-error space-y-1">
            {importResults.errors.slice(0, 5).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
            {importResults.errors.length > 5 && (
              <li>• ... and {importResults.errors.length - 5} more errors</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors"
        >
          Import Another File
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${importStep === 'upload' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'upload' ? 'border-primary' : 'border-gray-400'}`}>
            1
          </div>
          <span className="text-sm">Upload</span>
        </div>
        <div className={`flex items-center gap-2 ${importStep === 'mapping' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'mapping' ? 'border-primary' : 'border-gray-400'}`}>
            2
          </div>
          <span className="text-sm">Mapping</span>
        </div>
        <div className={`flex items-center gap-2 ${importStep === 'preview' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'preview' ? 'border-primary' : 'border-gray-400'}`}>
            3
          </div>
          <span className="text-sm">Preview</span>
        </div>
        <div className={`flex items-center gap-2 ${importStep === 'complete' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'complete' ? 'border-primary' : 'border-gray-400'}`}>
            4
          </div>
          <span className="text-sm">Complete</span>
        </div>
      </div>

      {/* Status messages */}
      {importStatus && (
        <div className={`p-4 rounded-lg border ${
          importStatus.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
          importStatus.type === 'error' ? 'bg-error/10 border-error/20 text-error' :
          'bg-primary/10 border-primary/20 text-primary'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {importStatus.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {importStatus.type === 'info' && <FileText className="h-5 w-5" />}
            <span>{importStatus.message}</span>
          </div>
        </div>
      )}

      {/* Step content */}
      {importStep === 'upload' && renderUploadStep()}
      {importStep === 'mapping' && renderMappingStep()}
      {importStep === 'preview' && renderPreviewStep()}
      {importStep === 'importing' && renderImportingStep()}
      {importStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default CSVImportForm;