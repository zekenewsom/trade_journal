// File: zekenewsom-trade_journal/packages/react-app/src/views/NewTradePage.tsx
// New file

import React from 'react';
import TradeEntryForm from '../components/trades/TradeEntryForm';

interface NewTradePageProps {
  onBack: () => void; // Function to go back to the main view
}

const NewTradePage: React.FC<NewTradePageProps> = ({ onBack }) => {
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>
        &larr; Back to Dashboard
      </button>
      <h2>Record New Trade</h2>
      <TradeEntryForm />
    </div>
  );
};

export default NewTradePage;