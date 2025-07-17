import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
export function MetricCard({ title, children, className, size = 'md', status = 'default' }) {
    const sizeClasses = {
        sm: 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4',
        md: 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-6',
        lg: 'col-span-1 sm:col-span-2 md:col-span-6 lg:col-span-12'
    };
    return (_jsxs(motion.section, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.15 }, className: cn('rounded-2xl shadow-card p-4 flex flex-col gap-2 relative bg-surface border border-card-stroke', sizeClasses[size], className), style: { position: 'relative' }, children: [status !== 'default' && (_jsx("span", { className: cn('absolute top-0 right-0 w-1.5 h-4 rounded-b-md', status === 'good' && 'bg-success', status === 'moderate' && 'bg-warning', status === 'bad' && 'bg-error', status === 'strong' && 'bg-primary') })), _jsx("h3", { className: "text-xs font-medium uppercase tracking-wide text-on-surface-variant", children: title }), children] }));
}
