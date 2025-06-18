import React from 'react';
import BackupRestorePage from './BackupRestorePage';
import SettingsRiskFreeRate from '../components/dashboard/SettingsRiskFreeRate';

const SettingsPage = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
        Settings
      </h1>
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-white">Backup & Restore</h2>
        <p className="text-gray-400 mb-4">Backup, restore, and export your trade data. For your security, make regular backups!</p>
        <div className="bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg">
          <BackupRestorePage />
        </div>
      </div>
      {/* Other settings sections can be added here */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-white">Sharpe Ratio Settings</h2>
        <p className="text-gray-400 mb-4">Set the risk-free rate for accurate Sharpe Ratio calculations.</p>
        <div className="bg-dark-500 rounded-xl p-6 border border-dark-400 shadow-lg">
          <SettingsRiskFreeRate />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
