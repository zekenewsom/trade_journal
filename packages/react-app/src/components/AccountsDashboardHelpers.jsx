import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Box, Button, TextField, CircularProgress, InputAdornment } from '@mui/material';
// Displays the current balance for an account
export const AccountBalance = ({ accountId }) => {
    const getAccountBalance = useAppStore(s => s.getAccountBalance);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getAccountBalance(accountId).then(result => {
            if (mounted)
                setBalance(typeof result === 'number' ? result : (result?.balance ?? 0));
        }).finally(() => setLoading(false));
        return () => { mounted = false; };
    }, [accountId, getAccountBalance]);
    return loading ? _jsx(CircularProgress, { size: 14 }) : _jsx("span", { children: balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
};
// Manual deposit/withdrawal form for an account
export const ManualTransactionForm = ({ accountId }) => {
    const addAccountTransaction = useAppStore(s => s.addAccountTransaction);
    const fetchAccounts = useAppStore(s => s.fetchAccounts);
    const fetchAccountTransactions = useAppStore(s => s.fetchAccountTransactions);
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (type) => {
        setError(null);
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt === 0) {
            setError('Enter a valid amount');
            return;
        }
        setLoading(true);
        const result = await addAccountTransaction({
            accountId,
            type,
            amount: type === 'deposit' ? Math.abs(amt) : -Math.abs(amt),
            memo,
        });
        setLoading(false);
        if (result.success) {
            setAmount('');
            setMemo('');
            fetchAccounts();
            fetchAccountTransactions(accountId);
        }
        else {
            setError(result.message || 'Error');
        }
    };
    return (_jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center', mt: 1 }, children: [_jsx(TextField, { label: "Amount", value: amount, onChange: e => setAmount(e.target.value), size: "small", type: "number", inputProps: { step: 'any', min: 0 }, sx: { width: 110 }, InputProps: {
                    startAdornment: _jsx(InputAdornment, { position: "start", children: "$" }),
                }, disabled: loading }), _jsx(TextField, { label: "Memo", value: memo, onChange: e => setMemo(e.target.value), size: "small", sx: { width: 120 }, disabled: loading }), _jsx(Button, { variant: "contained", color: "success", size: "small", onClick: () => handleSubmit('deposit'), disabled: loading, children: "Add" }), _jsx(Button, { variant: "outlined", color: "error", size: "small", onClick: () => handleSubmit('withdrawal'), disabled: loading, children: "Subtract" }), loading && _jsx(CircularProgress, { size: 18 }), error && _jsx("span", { className: "text-red-500 ml-2 text-xs", children: error })] }));
};
