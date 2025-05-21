// File: zekenewsom-trade_journal/packages/react-app/src/views/LogTransactionPage.tsx
// New file for Stage 5

import React from 'react';
import LogTransactionForm from '../components/transactions/LogTransactionForm';
import type { LogTransactionFormData } from '../types';
import { useAppStore } from '../stores/appStore';

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
  const { availableEmotions, refreshTrades } = useAppStore();

  const handleSubmit = async () => {
    await refreshTrades();
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