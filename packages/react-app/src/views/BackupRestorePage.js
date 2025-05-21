import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './BackupPage.css'; // We'll create this later if needed
const BackupRestorePage = () => {
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(null);
    const handleBackup = async () => {
        try {
            setLoading('backup');
            setMessage(null);
            const result = await window.electronAPI.backupDatabase();
            setMessage(result.success ? 'Database backed up successfully!' : `Backup failed: ${result.message}`);
        }
        catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(null);
        }
    };
    const handleRestore = async () => {
        try {
            if (window.confirm('Are you sure you want to restore from backup? This will replace your current data.')) {
                setLoading('restore');
                setMessage(null);
                const result = await window.electronAPI.restoreDatabase();
                setMessage(result.success ? 'Database restored successfully!' : `Restore failed: ${result.message}`);
            }
        }
        catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(null);
        }
    };
    const handleExportCSV = async () => {
        try {
            setLoading('csv');
            setMessage(null);
            await window.electronAPI.exportDataCSV({ includeTransactions: true });
            setMessage('Data exported to CSV successfully!');
        }
        catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(null);
        }
    };
    const handleExportJSON = async () => {
        try {
            setLoading('json');
            setMessage(null);
            await window.electronAPI.exportDataJSON({ includeTransactions: true });
            setMessage('Data exported to JSON successfully!');
        }
        catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(null);
        }
    };
    const handleExportXLSX = async () => {
        try {
            setLoading('xlsx');
            setMessage(null);
            await window.electronAPI.exportDataXLSX({ includeTransactions: true });
            setMessage('Data exported to Excel successfully!');
        }
        catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(null);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent", children: "Backup & Restore" }), _jsx("p", { className: "text-gray-400 mt-1", children: "Manage your trade data with secure backup and export options" })] }), message && (_jsx("div", { className: `mb-6 p-4 rounded-lg border ${message.includes('Error')
                    ? 'bg-danger/10 border-danger/20 text-danger'
                    : 'bg-secondary/10 border-secondary/20 text-secondary'}`, children: _jsxs("div", { className: "flex items-center", children: [message.includes('Error') ? (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) })), _jsx("span", { children: message })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 bg-primary-500/10 rounded-lg", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-primary-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-white", children: "Database Backup" })] }), _jsx("p", { className: "text-gray-400 mb-4", children: "Create and manage backups of your trade database. Regular backups protect your trading history against data loss." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: handleBackup, disabled: loading === 'backup', className: "w-full btn btn-primary flex justify-center items-center", children: [loading === 'backup' ? (_jsx("div", { className: "w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z", clipRule: "evenodd" }) })), "Backup Now"] }), _jsxs("button", { onClick: handleRestore, disabled: loading === 'restore', className: "w-full btn btn-outline-primary flex justify-center items-center", children: [loading === 'restore' ? (_jsx("div", { className: "w-5 h-5 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin mr-2" })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z", clipRule: "evenodd" }) })), "Restore from Backup"] })] })] }), _jsxs("div", { className: "bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 bg-secondary/10 rounded-lg", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-secondary", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-white", children: "Export Data" })] }), _jsx("p", { className: "text-gray-400 mb-4", children: "Export your trading data in various formats for external analysis, reporting, or backup purposes." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: handleExportCSV, disabled: loading === 'csv', className: "w-full btn btn-secondary flex justify-center items-center", children: [loading === 'csv' ? (_jsx("div", { className: "w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z", clipRule: "evenodd" }) })), "Export to CSV"] }), _jsxs("button", { onClick: handleExportJSON, disabled: loading === 'json', className: "w-full btn btn-secondary flex justify-center items-center", children: [loading === 'json' ? (_jsx("div", { className: "w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z", clipRule: "evenodd" }) })), "Export to JSON"] }), _jsxs("button", { onClick: handleExportXLSX, disabled: loading === 'xlsx', className: "w-full btn btn-secondary flex justify-center items-center", children: [loading === 'xlsx' ? (_jsx("div", { className: "w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 01-1-1V8a1 1 0 012 0v3a1 1 0 01-1 1zm3-4a1 1 0 100 2 1 1 0 000-2z", clipRule: "evenodd" }) })), "Export to Excel"] })] })] })] })] }));
};
export default BackupRestorePage;
