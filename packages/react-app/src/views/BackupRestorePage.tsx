import React, { useState } from 'react';
import './BackupPage.css'; // We'll create this later if needed

const BackupRestorePage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleBackup = async () => {
    try {
      setLoading('backup');
      setMessage(null);
      const result = await window.electronAPI.backupDatabase();
      setMessage(result.success ? 'Database backed up successfully!' : `Backup failed: ${result.message}`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
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
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(null);
    }
  };
  
  const handleExportCSV = async () => {
    try {
      setLoading('csv');
      setMessage(null);
      await window.electronAPI.exportDataCSV({ includeTransactions: true });
      setMessage('Data exported to CSV successfully!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(null);
    }
  };
  
  const handleExportJSON = async () => {
    try {
      setLoading('json');
      setMessage(null);
      await window.electronAPI.exportDataJSON({ includeTransactions: true });
      setMessage('Data exported to JSON successfully!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(null);
    }
  };
  
  const handleExportXLSX = async () => {
    try {
      setLoading('xlsx');
      setMessage(null);
      await window.electronAPI.exportDataXLSX({ includeTransactions: true });
      setMessage('Data exported to Excel successfully!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
          Backup & Restore
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your trade data with secure backup and export options
        </p>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.includes('Error') 
          ? 'bg-danger/10 border-danger/20 text-danger' 
          : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
          <div className="flex items-center">
            {message.includes('Error') ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Database Backup</h2>
          </div>
          <p className="text-gray-400 mb-4">Create and manage backups of your trade database. Regular backups protect your trading history against data loss.</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleBackup} 
              disabled={loading === 'backup'}
              className="w-full btn btn-primary flex justify-center items-center"
            >
              {loading === 'backup' ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              Backup Now
            </button>
            
            <button 
              onClick={handleRestore} 
              disabled={loading === 'restore'}
              className="w-full btn btn-outline-primary flex justify-center items-center"
            >
              {loading === 'restore' ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              Restore from Backup
            </button>
          </div>
        </div>
        
        <div className="bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Export Data</h2>
          </div>
          <p className="text-gray-400 mb-4">Export your trading data in various formats for external analysis, reporting, or backup purposes.</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleExportCSV} 
              disabled={loading === 'csv'}
              className="w-full btn btn-secondary flex justify-center items-center"
            >
              {loading === 'csv' ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
              )}
              Export to CSV
            </button>
            
            <button 
              onClick={handleExportJSON} 
              disabled={loading === 'json'}
              className="w-full btn btn-secondary flex justify-center items-center"
            >
              {loading === 'json' ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
              )}
              Export to JSON
            </button>
            
            <button 
              onClick={handleExportXLSX} 
              disabled={loading === 'xlsx'}
              className="w-full btn btn-secondary flex justify-center items-center"
            >
              {loading === 'xlsx' ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 01-1-1V8a1 1 0 012 0v3a1 1 0 01-1 1zm3-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              )}
              Export to Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage; 