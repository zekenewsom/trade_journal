// File: zekenewsom-trade_journal/packages/react-app/src/views/LogTransactionPage.tsx
// New file for Stage 5

import React from 'react';
import LogTransactionForm from '../components/transactions/LogTransactionForm';

interface LogTransactionPageProps {
  onTransactionLogged: () => void;
  onCancel: () => void;
}

const LogTransactionPage: React.FC<LogTransactionPageProps> = ({ onTransactionLogged, onCancel }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Log New Transaction</h2>
      <LogTransactionForm onSaveSuccess={onTransactionLogged} />
      <button onClick={onCancel} style={{ marginTop: '20px' }}>
        Cancel
      </button>
    </div>
  );
};

export default LogTransactionPage;