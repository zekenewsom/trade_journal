// File: zekenewsom-trade_journal/packages/react-app/src/views/LogTransactionPage.tsx
// New file for Stage 5

import React, { useState, useEffect } from 'react';
import LogTransactionForm from '../components/transactions/LogTransactionForm';
import type { LogTransactionFormData } from '../types';

interface LogTransactionPageProps {
  onTransactionLogged: () => void;
  onCancel: () => void;
  initialValues?: {
    instrument_ticker: string;
    asset_class: 'Stock' | 'Cryptocurrency';
    exchange: string;
  };
}

const LogTransactionPage: React.FC<LogTransactionPageProps> = ({ 
  onTransactionLogged, 
  onCancel,
  initialValues 
}) => {
  const [availableEmotions, setAvailableEmotions] = useState([]);

  useEffect(() => {
    console.log('[DEBUG] LogTransactionPage mounted');
    const fetchEmotions = async () => {
      try {
        const emotions = await window.electronAPI.getEmotions();
        setAvailableEmotions(emotions);
      } catch (err) {
        console.error('Error fetching emotions:', err);
      }
    };
    fetchEmotions();
  }, []);

  const handleSubmit = async () => {
    onTransactionLogged();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Log New Transaction</h2>
      <LogTransactionForm 
        onSubmit={handleSubmit} 
        onCancel={onCancel}
        availableEmotions={availableEmotions}
        initialValues={initialValues}
      />
    </div>
  );
};

export default LogTransactionPage;