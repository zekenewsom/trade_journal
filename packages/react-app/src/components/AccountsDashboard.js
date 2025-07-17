import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { AccountBalance, ManualTransactionForm } from './AccountsDashboardHelpers';
import { Box, Button, Typography, TextField, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction, Divider, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
const AccountsDashboard = () => {
    const [newAccountName, setNewAccountName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const { accounts, selectedAccountId, accountTransactions, isLoadingAccounts, errorLoadingAccounts, isLoadingAccountTransactions, errorLoadingAccountTransactions, fetchAccounts, selectAccount, fetchAccountTransactions, createAccount, renameAccount, archiveAccount, unarchiveAccount, deleteAccount, } = useAppStore();
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);
    useEffect(() => {
        if (selectedAccountId != null) {
            fetchAccountTransactions(selectedAccountId);
        }
    }, [selectedAccountId, fetchAccountTransactions]);
    const handleCreateAccount = async () => {
        if (!newAccountName.trim())
            return;
        setActionLoading(-1);
        await createAccount({ name: newAccountName });
        setNewAccountName('');
        setActionLoading(null);
    };
    const handleRenameAccount = async (accountId) => {
        if (!editingName.trim())
            return;
        setActionLoading(accountId);
        await renameAccount({ accountId, newName: editingName });
        setEditingId(null);
        setEditingName('');
        setActionLoading(null);
    };
    const handleArchive = async (accountId) => {
        setActionLoading(accountId);
        await archiveAccount({ accountId });
        setActionLoading(null);
    };
    const handleUnarchive = async (accountId) => {
        setActionLoading(accountId);
        await unarchiveAccount({ accountId });
        setActionLoading(null);
    };
    const handleDelete = async (accountId) => {
        setActionLoading(accountId);
        await deleteAccount({ accountId });
        setActionLoading(null);
    };
    return (_jsxs(Box, { className: "bg-surface text-on-surface", sx: { p: 3, maxWidth: 600, mx: 'auto', borderRadius: 2, boxShadow: 2 }, children: [_jsx(Typography, { variant: "h5", className: "text-on-surface", sx: { mb: 2, fontWeight: 600 }, children: "Cash Accounts" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 2 }, children: [_jsx(TextField, { label: "New Account Name", value: newAccountName, onChange: e => setNewAccountName(e.target.value), size: "small" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: handleCreateAccount, disabled: !newAccountName.trim() || actionLoading === -1, children: actionLoading === -1 ? _jsx(CircularProgress, { size: 20 }) : 'Add' })] }), isLoadingAccounts ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', my: 3 }, children: _jsx(CircularProgress, {}) })) : errorLoadingAccounts ? (_jsx(Typography, { color: "error", children: errorLoadingAccounts })) : (_jsx(List, { children: accounts.map(account => (_jsxs(React.Fragment, { children: [_jsx(ListItem, { alignItems: "flex-start", children: _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(ListItemButton, { selected: selectedAccountId === account.account_id, onClick: () => selectAccount(account.account_id), sx: { cursor: 'pointer', bgcolor: selectedAccountId === account.account_id ? 'primary.50' : undefined }, children: editingId === account.account_id ? (_jsxs(_Fragment, { children: [_jsx(TextField, { value: editingName, onChange: e => setEditingName(e.target.value), size: "small", sx: { mr: 1 } }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => handleRenameAccount(account.account_id), disabled: actionLoading === account.account_id, children: "Save" }), _jsx(Button, { size: "small", onClick: () => { setEditingId(null); setEditingName(''); }, children: "Cancel" })] })) : (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', width: '100%' }, children: [_jsx(ListItemText, { primary: _jsxs(_Fragment, { children: [_jsx("span", { children: account.name }), _jsxs("span", { className: "ml-3 text-sm text-gray-500 font-mono", children: ["Balance: ", _jsx(AccountBalance, { accountId: account.account_id })] })] }), secondary: account.is_archived ? 'Archived' : undefined }), _jsxs(ListItemSecondaryAction, { children: [_jsx(IconButton, { edge: "end", "aria-label": "edit", onClick: () => { setEditingId(account.account_id); setEditingName(account.name); }, children: _jsx(EditIcon, {}) }), account.is_archived ? (_jsx(IconButton, { edge: "end", "aria-label": "unarchive", onClick: () => handleUnarchive(account.account_id), disabled: actionLoading === account.account_id, children: _jsx(UnarchiveIcon, {}) })) : (_jsx(IconButton, { edge: "end", "aria-label": "archive", onClick: () => handleArchive(account.account_id), disabled: actionLoading === account.account_id, children: _jsx(ArchiveIcon, {}) })), _jsx(IconButton, { edge: "end", "aria-label": "delete", onClick: () => handleDelete(account.account_id), disabled: actionLoading === account.account_id, children: _jsx(DeleteIcon, {}) })] })] })) }), _jsx(ManualTransactionForm, { accountId: account.account_id })] }) }), _jsx(Divider, {})] }, account.account_id))) })), _jsxs(Box, { sx: { mt: 4 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 1, fontWeight: 500 }, children: "Account Transactions" }), isLoadingAccountTransactions ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', my: 2 }, children: _jsx(CircularProgress, {}) })) : errorLoadingAccountTransactions ? (_jsx(Typography, { color: "error", children: errorLoadingAccountTransactions })) : (_jsx(List, { children: accountTransactions.map((txn, idx) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: txn.type + ': ' + txn.amount, secondary: txn.memo || txn.created_at }) }, txn.transaction_id ?? `txn-${idx}`))) }))] })] }));
};
export default AccountsDashboard;
