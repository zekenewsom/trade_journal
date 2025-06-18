import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { AccountBalance, ManualTransactionForm } from './AccountsDashboardHelpers';
import { Box, Button, Typography, TextField, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, Divider, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AccountsDashboard: React.FC = () => {
  const [newAccountName, setNewAccountName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const {
    accounts,
    selectedAccountId,
    accountTransactions,
    isLoadingAccounts,
    errorLoadingAccounts,
    isLoadingAccountTransactions,
    errorLoadingAccountTransactions,
    fetchAccounts,
    selectAccount,
    fetchAccountTransactions,
    createAccount,
    renameAccount,
    archiveAccount,
    unarchiveAccount,
    deleteAccount,

  } = useAppStore();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccountId != null) {
      fetchAccountTransactions(selectedAccountId);
    }
  }, [selectedAccountId, fetchAccountTransactions]);

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) return;
    setActionLoading(-1);
    await createAccount({ name: newAccountName });
    setNewAccountName('');
    setActionLoading(null);
  };

  const handleRenameAccount = async (accountId: number) => {
    if (!editingName.trim()) return;
    setActionLoading(accountId);
    await renameAccount({ accountId, newName: editingName });
    setEditingId(null);
    setEditingName('');
    setActionLoading(null);
  };

  const handleArchive = async (accountId: number) => {
    setActionLoading(accountId);
    await archiveAccount({ accountId });
    setActionLoading(null);
  };

  const handleUnarchive = async (accountId: number) => {
    setActionLoading(accountId);
    await unarchiveAccount({ accountId });
    setActionLoading(null);
  };

  const handleDelete = async (accountId: number) => {
    setActionLoading(accountId);
    await deleteAccount({ accountId });
    setActionLoading(null);
  };

  return (
    <Box
      className="bg-surface text-on-surface"
      sx={{ p: 3, maxWidth: 600, mx: 'auto', borderRadius: 2, boxShadow: 2 }}
    >
      <Typography variant="h5" className="text-on-surface" sx={{ mb: 2, fontWeight: 600 }}>
        Cash Accounts
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="New Account Name"
          value={newAccountName}
          onChange={e => setNewAccountName(e.target.value)}
          size="small"
        />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateAccount} disabled={!newAccountName.trim() || actionLoading === -1}>
          {actionLoading === -1 ? <CircularProgress size={20} /> : 'Add'}
        </Button>
      </Box>
      {isLoadingAccounts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : errorLoadingAccounts ? (
        <Typography color="error">{errorLoadingAccounts}</Typography>
      ) : (
        <List>
          {accounts.map(account => (
  <React.Fragment key={account.account_id}>
    <ListItem alignItems="flex-start">
      <Box sx={{ flex: 1 }}>
        <ListItemButton
          selected={selectedAccountId === account.account_id}
          onClick={() => selectAccount(account.account_id)}
          sx={{ cursor: 'pointer', bgcolor: selectedAccountId === account.account_id ? 'primary.50' : undefined }}
        >
          {editingId === account.account_id ? (
            <>
              <TextField
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button size="small" variant="outlined" onClick={() => handleRenameAccount(account.account_id)} disabled={actionLoading === account.account_id}>
                Save
              </Button>
              <Button size="small" onClick={() => { setEditingId(null); setEditingName(''); }}>Cancel</Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemText
                primary={<>
                  <span>{account.name}</span>
                  <span className="ml-3 text-sm text-gray-500 font-mono">Balance: <AccountBalance accountId={account.account_id} /></span>
                </>}
                secondary={account.is_archived ? 'Archived' : undefined}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => { setEditingId(account.account_id); setEditingName(account.name); }}>
                  <EditIcon />
                </IconButton>
                {account.is_archived ? (
                  <IconButton edge="end" aria-label="unarchive" onClick={() => handleUnarchive(account.account_id)} disabled={actionLoading === account.account_id}>
                    <UnarchiveIcon />
                  </IconButton>
                ) : (
                  <IconButton edge="end" aria-label="archive" onClick={() => handleArchive(account.account_id)} disabled={actionLoading === account.account_id}>
                    <ArchiveIcon />
                  </IconButton>
                )}
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(account.account_id)} disabled={actionLoading === account.account_id}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </Box>
          )}
        </ListItemButton>
        <ManualTransactionForm accountId={account.account_id} />
      </Box>
    </ListItem>
    <Divider />
  </React.Fragment>
))}
        </List>
      )}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          Account Transactions
        </Typography>
        {isLoadingAccountTransactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : errorLoadingAccountTransactions ? (
          <Typography color="error">{errorLoadingAccountTransactions}</Typography>
        ) : (
          <List>
            {accountTransactions.map((txn, idx) => (
              <ListItem key={txn.transaction_id ?? `txn-${idx}`}>
                <ListItemText
                  primary={txn.type + ': ' + txn.amount}
                  secondary={txn.memo || txn.created_at}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default AccountsDashboard;
