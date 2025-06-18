import React from 'react';
import type { TransactionRecord } from '../../types';

export interface TransactionsTableProps {
  transactions: TransactionRecord[];
  onEditTrade: (tradeId: number) => void;
  onDeleteTransaction: (transactionId: number) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onEditTrade, onDeleteTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-on-surface/70">No transactions to display.</p>;
  }

  return (
    <div className="overflow-x-auto mt-8">
      <h3 className="text-lg font-semibold mb-2 text-on-surface">All Transactions</h3>
      <table className="min-w-full border-collapse text-on-surface text-sm bg-surface">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Transaction ID</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Trade ID</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Ticker</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Exchange</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Action</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Quantity</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Price</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Date/Time</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Actions</th>
            <th className="px-3 py-2 border-b-2 border-card-stroke bg-surface-variant whitespace-nowrap">Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn.transaction_id || Math.random()}>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.transaction_id ?? '-'}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.trade_id}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.ticker}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.exchange}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.action}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.quantity}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.price}</td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.datetime ? new Date(txn.datetime).toLocaleString() : '-'}</td>
              <td className="px-3 py-2 border-b border-card-stroke">
                <button
                  className="text-primary hover:underline mr-2"
                  onClick={() => onEditTrade(txn.trade_id)}
                  title="Edit Trade"
                >
                  Edit
                </button>
                <button
                  className="text-error hover:underline"
                  onClick={() => {
                    if (typeof txn.transaction_id === 'number') {
                      onDeleteTransaction(txn.transaction_id);
                    }
                  }}
                  title="Delete Transaction"
                  disabled={typeof txn.transaction_id !== 'number'}
                >
                  Delete
                </button>
              </td>
              <td className="px-3 py-2 border-b border-card-stroke">{txn.notes ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
