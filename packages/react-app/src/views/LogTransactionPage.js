import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LogTransactionForm from '../components/transactions/LogTransactionForm';
import { useAppStore } from '../stores/appStore';
const LogTransactionPage = ({ onTransactionLogged, onCancel, initialValues }) => {
    const { availableEmotions, refreshTrades } = useAppStore();
    const handleSubmit = async () => {
        await refreshTrades();
        onTransactionLogged();
    };
    return (_jsxs("div", { style: { maxWidth: '800px', margin: '0 auto', padding: '20px' }, children: [_jsx("h2", { children: "Log New Transaction" }), _jsx(LogTransactionForm, { onSubmit: handleSubmit, onCancel: onCancel, availableEmotions: availableEmotions, initialValues: initialValues })] }));
};
export default LogTransactionPage;
