import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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
const CSVImportForm = ({ onImportComplete }) => {
    const accounts = useAppStore(s => s.accounts);
    const selectedAccountId = useAppStore(s => s.selectedAccountId);
    const handleTradeDataChange = useAppStore(s => s.handleTradeDataChange);
    const [importStep, setImportStep] = useState('upload');
    const [selectedExchange, setSelectedExchange] = useState('hyperliquid');
    const [selectedAccount, setSelectedAccount] = useState(selectedAccountId || (accounts.length > 0 ? accounts[0].account_id : 0));
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [fieldMapping, setFieldMapping] = useState({});
    const [importStatus, setImportStatus] = useState(null);
    const [importResults, setImportResults] = useState({ successful: 0, failed: 0, skipped: 0, errors: [] });
    const getHyperLiquidMapping = (headers) => {
        const mapping = {};
        headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader === 'time')
                mapping[header] = 'datetime';
            else if (lowerHeader === 'coin')
                mapping[header] = 'instrument_ticker';
            else if (lowerHeader === 'dir')
                mapping[header] = 'action';
            else if (lowerHeader === 'sz')
                mapping[header] = 'quantity';
            else if (lowerHeader === 'px')
                mapping[header] = 'price';
            else if (lowerHeader === 'fee')
                mapping[header] = 'fees';
            // Skip calculated fields - these are computed automatically by the program:
            // - 'ntl' (notional) = quantity × price
            // - 'closedpnl' = calculated using FIFO methodology with precise decimal arithmetic
            else if (lowerHeader === 'ntl' || lowerHeader === 'closedpnl')
                mapping[header] = null;
            else
                mapping[header] = null;
        });
        return mapping;
    };
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!file.name.endsWith('.csv')) {
            setImportStatus({ message: 'Please select a CSV file', type: 'error' });
            return;
        }
        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                setImportStatus({ message: 'CSV file must contain at least a header row and one data row', type: 'error' });
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                return row;
            });
            setCsvHeaders(headers);
            setCsvData(data);
            // Auto-set field mapping based on selected exchange
            if (selectedExchange === 'hyperliquid') {
                setFieldMapping(getHyperLiquidMapping(headers));
            }
            else {
                // Initialize empty mapping for custom
                const emptyMapping = {};
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
    const handleFieldMappingChange = (csvField, targetField) => {
        setFieldMapping(prev => ({
            ...prev,
            [csvField]: targetField
        }));
    };
    const validateMapping = () => {
        const mappedFields = Object.values(fieldMapping).filter(field => field !== null);
        const requiredMapped = requiredFields.filter(field => field.key !== 'fees' // fees is optional
        ).every(field => mappedFields.includes(field.key));
        if (!requiredMapped) {
            setImportStatus({ message: 'Please map all required fields', type: 'error' });
            return false;
        }
        return true;
    };
    const handlePreview = () => {
        if (!validateMapping())
            return;
        setImportStep('preview');
        setImportStatus(null);
    };
    const handleImport = async () => {
        if (!validateMapping())
            return;
        setImportStep('importing');
        setImportStatus({ message: 'Importing transactions...', type: 'info' });
        try {
            const results = { successful: 0, failed: 0, skipped: 0, errors: [] };
            // Sort CSV data by datetime before processing to ensure chronological order
            const sortedCsvData = [...csvData].sort((a, b) => {
                const dateTimeField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'datetime');
                if (!dateTimeField)
                    return 0;
                const aDateTime = a[dateTimeField];
                const bDateTime = b[dateTimeField];
                if (selectedExchange === 'hyperliquid') {
                    // Parse HyperLiquid datetime format: "7/12/2025 - 09:37:01"
                    const parseHyperLiquidDate = (dateStr) => {
                        const [datePart, timePart] = dateStr.split(' - ');
                        const [month, day, year] = datePart.split('/');
                        const [hours, minutes, seconds] = timePart.split(':');
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
                    };
                    const aDate = parseHyperLiquidDate(aDateTime);
                    const bDate = parseHyperLiquidDate(bDateTime);
                    return aDate.getTime() - bDate.getTime();
                }
                else {
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
                    const transformedData = {
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
                                        const [datePart, timePart] = value.split(' - ');
                                        const [month, day, year] = datePart.split('/');
                                        const [hours, minutes, seconds] = timePart.split(':');
                                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
                                        transformedData.datetime = date.toISOString().slice(0, 16);
                                    }
                                    else {
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
                    }
                    else {
                        results.failed++;
                        results.errors.push(`Row ${sortedCsvData.indexOf(row) + 1}: ${result.message}`);
                    }
                }
                catch (error) {
                    results.failed++;
                    results.errors.push(`Row ${sortedCsvData.indexOf(row) + 1}: ${error.message}`);
                }
            }
            setImportResults(results);
            setImportStep('complete');
            if (results.successful > 0) {
                let message = `Successfully imported ${results.successful} transaction(s)`;
                if (results.skipped > 0)
                    message += `, ${results.skipped} skipped (spot trading)`;
                if (results.failed > 0)
                    message += `, ${results.failed} failed`;
                setImportStatus({
                    message,
                    type: results.failed > 0 ? 'error' : 'success'
                });
                // Refresh trades list so they appear on the Trades page
                await handleTradeDataChange();
            }
            else {
                setImportStatus({ message: 'No transactions were imported', type: 'error' });
            }
            if (onImportComplete) {
                onImportComplete();
            }
        }
        catch (error) {
            setImportStatus({ message: `Import failed: ${error.message}`, type: 'error' });
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
    const renderUploadStep = () => (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Exchange" }), _jsx("select", { value: selectedExchange, onChange: (e) => setSelectedExchange(e.target.value), className: "w-full p-2 border border-card-stroke rounded bg-surface-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", children: supportedExchanges.map(exchange => (_jsx("option", { value: exchange.value, children: exchange.label }, exchange.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Account" }), _jsx("select", { value: selectedAccount, onChange: (e) => setSelectedAccount(Number(e.target.value)), className: "w-full p-2 border border-card-stroke rounded bg-surface-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", children: accounts.map(account => (_jsx("option", { value: account.account_id, children: account.name }, account.account_id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "CSV File" }), _jsxs("div", { className: "border-2 border-dashed border-card-stroke rounded-lg p-6 text-center", children: [_jsx(Upload, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("input", { type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden", id: "csv-upload" }), _jsx("label", { htmlFor: "csv-upload", className: "cursor-pointer bg-primary text-on-primary px-4 py-2 rounded hover:bg-primary/90 transition-colors", children: "Select CSV File" }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: csvFile ? csvFile.name : 'No file selected' })] })] })] }) }));
    const renderMappingStep = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-surface-variant rounded-lg p-4", children: [_jsx("h3", { className: "font-medium mb-2", children: "Field Mapping" }), _jsx("p", { className: "text-sm text-gray-400", children: "Map the CSV columns to the required fields. Fields marked with * are required." })] }), _jsx("div", { className: "space-y-3", children: csvHeaders.map(header => {
                    const lowerHeader = header.toLowerCase();
                    const isCalculatedField = lowerHeader === 'ntl' || lowerHeader === 'closedpnl';
                    return (_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium", children: header }), _jsxs("div", { className: "text-xs text-gray-400 mt-1", children: ["Sample: ", csvData[0]?.[header] || 'N/A'] }), isCalculatedField && (_jsx("div", { className: "text-xs text-amber-400 mt-1", children: "\u26A0\uFE0F Calculated field - will be skipped (computed automatically)" }))] }), _jsx("div", { className: "flex-1", children: _jsxs("select", { value: fieldMapping[header] || '', onChange: (e) => handleFieldMappingChange(header, e.target.value || null), className: "w-full p-2 border border-card-stroke rounded bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary", disabled: isCalculatedField, children: [_jsx("option", { value: "", children: isCalculatedField ? '-- Calculated field (skipped) --' : '-- Skip this field --' }), !isCalculatedField && requiredFields.map(field => (_jsxs("option", { value: field.key, children: [field.label, field.key !== 'fees' ? ' *' : ''] }, field.key)))] }) })] }, header));
                }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setImportStep('upload'), className: "px-4 py-2 border border-card-stroke rounded text-on-surface hover:bg-surface-variant transition-colors", children: "Back" }), _jsx("button", { onClick: handlePreview, className: "px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors", children: "Preview Import" })] })] }));
    const getActionType = (action) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('open long') || actionLower.includes('buy')) {
            return { type: 'Open Long', color: 'text-green-400', bgColor: 'bg-green-400/10' };
        }
        else if (actionLower.includes('open short')) {
            return { type: 'Open Short', color: 'text-red-400', bgColor: 'bg-red-400/10' };
        }
        else if (actionLower.includes('close long') || (actionLower.includes('sell') && !actionLower.includes('short'))) {
            return { type: 'Close Long', color: 'text-orange-400', bgColor: 'bg-orange-400/10' };
        }
        else if (actionLower.includes('close short')) {
            return { type: 'Close Short', color: 'text-blue-400', bgColor: 'bg-blue-400/10' };
        }
        else if (actionLower.includes('liquidation')) {
            return { type: 'Liquidation', color: 'text-red-500', bgColor: 'bg-red-500/10' };
        }
        return { type: action, color: 'text-gray-400', bgColor: 'bg-gray-400/10' };
    };
    const renderPreviewStep = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-surface-variant rounded-lg p-4", children: [_jsx("h3", { className: "font-medium mb-2", children: "Import Preview" }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Found ", csvData.length, " transaction(s) to import into account: ", accounts.find(a => a.account_id === selectedAccount)?.name] }), selectedExchange === 'hyperliquid' && (_jsxs("div", { className: "mt-2 text-xs text-amber-600", children: [_jsx("span", { className: "font-medium", children: "Note:" }), " Spot trading transactions (e.g., SOL/USDC, ETH/USDC) will be automatically skipped as they represent asset conversions, not leveraged trades."] })), _jsxs("div", { className: "mt-3 text-xs text-gray-500", children: [_jsx("span", { className: "font-medium", children: "Position Tracking:" }), " The system will automatically detect position states and manage trade lifecycle"] })] }), _jsxs("div", { className: "max-h-60 overflow-y-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-card-stroke", children: [_jsx("th", { className: "text-left p-2", children: "Date" }), _jsx("th", { className: "text-left p-2", children: "Symbol" }), _jsx("th", { className: "text-left p-2", children: "Action" }), _jsx("th", { className: "text-left p-2", children: "Quantity" }), _jsx("th", { className: "text-left p-2", children: "Price" }), _jsx("th", { className: "text-left p-2", children: "Fees" })] }) }), _jsx("tbody", { children: csvData.slice(0, 10).map((row, index) => {
                                    const actionValue = Object.entries(fieldMapping).find(([, target]) => target === 'action')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'action')[0]] : 'N/A';
                                    const actionType = getActionType(actionValue);
                                    // Check if this row will be skipped (spot trading)
                                    const instrumentField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'instrument_ticker');
                                    const instrument = instrumentField ? row[instrumentField] : '';
                                    const isSpotTrade = selectedExchange === 'hyperliquid' && (instrument.includes('/USDC') || instrument.includes('/USD'));
                                    return (_jsxs("tr", { className: `border-b border-card-stroke/50 ${isSpotTrade ? 'opacity-50 bg-gray-50' : ''}`, children: [_jsx("td", { className: "p-2", children: Object.entries(fieldMapping).find(([, target]) => target === 'datetime')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'datetime')[0]] : 'N/A' }), _jsxs("td", { className: "p-2", children: [instrument, isSpotTrade && _jsx("span", { className: "ml-2 text-xs text-gray-500", children: "(Will be skipped - Spot trade)" })] }), _jsx("td", { className: "p-2", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${actionType.bgColor} ${actionType.color}`, children: actionType.type }) }), _jsx("td", { className: "p-2", children: Object.entries(fieldMapping).find(([, target]) => target === 'quantity')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'quantity')[0]] : 'N/A' }), _jsx("td", { className: "p-2", children: Object.entries(fieldMapping).find(([, target]) => target === 'price')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'price')[0]] : 'N/A' }), _jsx("td", { className: "p-2", children: Object.entries(fieldMapping).find(([, target]) => target === 'fees')?.[0] ? row[Object.entries(fieldMapping).find(([, target]) => target === 'fees')[0]] : '0' })] }, index));
                                }) })] }), csvData.length > 10 && (_jsxs("p", { className: "text-sm text-gray-400 mt-2", children: ["... and ", csvData.length - 10, " more rows"] }))] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Enhanced Position Tracking" }), _jsxs("div", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Automatic Trade Management:" }), " The system detects when to create new trades vs. add to existing ones"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Position Size Validation:" }), " Prevents over-selling and validates position consistency"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Liquidation Handling:" }), " Properly processes forced liquidations and market orders"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Order Type Recognition:" }), " Supports all major order types (Open Long/Short, Close Long/Short, Liquidations)"] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setImportStep('mapping'), className: "px-4 py-2 border border-card-stroke rounded text-on-surface hover:bg-surface-variant transition-colors", children: "Back" }), _jsxs("button", { onClick: handleImport, className: "px-4 py-2 bg-success text-on-primary rounded hover:bg-success/90 transition-colors", children: ["Import ", csvData.length, " Transaction(s)"] })] })] }));
    const renderImportingStep = () => (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "Importing transactions..." }), _jsx("p", { className: "text-sm text-gray-400", children: "Please wait while we process your data" })] }));
    const renderCompleteStep = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center py-6", children: [_jsx(CheckCircle, { className: "h-16 w-16 text-success mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Import Complete!" }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Successfully imported ", importResults.successful, " transaction(s)", importResults.skipped > 0 && `, ${importResults.skipped} skipped (spot trading)`, importResults.failed > 0 && `, ${importResults.failed} failed`] })] }), importResults.errors.length > 0 && (_jsxs("div", { className: "bg-error/10 border border-error/20 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-error mb-2", children: "Errors:" }), _jsxs("ul", { className: "text-sm text-error space-y-1", children: [importResults.errors.slice(0, 5).map((error, index) => (_jsxs("li", { children: ["\u2022 ", error] }, index))), importResults.errors.length > 5 && (_jsxs("li", { children: ["\u2022 ... and ", importResults.errors.length - 5, " more errors"] }))] })] })), _jsx("div", { className: "flex gap-3", children: _jsx("button", { onClick: handleReset, className: "px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors", children: "Import Another File" }) })] }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: `flex items-center gap-2 ${importStep === 'upload' ? 'text-primary' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'upload' ? 'border-primary' : 'border-gray-400'}`, children: "1" }), _jsx("span", { className: "text-sm", children: "Upload" })] }), _jsxs("div", { className: `flex items-center gap-2 ${importStep === 'mapping' ? 'text-primary' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'mapping' ? 'border-primary' : 'border-gray-400'}`, children: "2" }), _jsx("span", { className: "text-sm", children: "Mapping" })] }), _jsxs("div", { className: `flex items-center gap-2 ${importStep === 'preview' ? 'text-primary' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'preview' ? 'border-primary' : 'border-gray-400'}`, children: "3" }), _jsx("span", { className: "text-sm", children: "Preview" })] }), _jsxs("div", { className: `flex items-center gap-2 ${importStep === 'complete' ? 'text-primary' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center ${importStep === 'complete' ? 'border-primary' : 'border-gray-400'}`, children: "4" }), _jsx("span", { className: "text-sm", children: "Complete" })] })] }), importStatus && (_jsx("div", { className: `p-4 rounded-lg border ${importStatus.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
                    importStatus.type === 'error' ? 'bg-error/10 border-error/20 text-error' :
                        'bg-primary/10 border-primary/20 text-primary'}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [importStatus.type === 'success' && _jsx(CheckCircle, { className: "h-5 w-5" }), importStatus.type === 'error' && _jsx(AlertCircle, { className: "h-5 w-5" }), importStatus.type === 'info' && _jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { children: importStatus.message })] }) })), importStep === 'upload' && renderUploadStep(), importStep === 'mapping' && renderMappingStep(), importStep === 'preview' && renderPreviewStep(), importStep === 'importing' && renderImportingStep(), importStep === 'complete' && renderCompleteStep()] }));
};
export default CSVImportForm;
