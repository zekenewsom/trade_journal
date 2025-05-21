import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
export function MetricCard({ title, children, className, size = 'md', status = 'default' }) {
    const statusClasses = {
        default: '',
        good: 'after:bg-positive',
        moderate: 'after:bg-warning',
        bad: 'after:bg-negative',
        strong: 'after:bg-primary',
    };
    const sizeClasses = {
        sm: 'col-span-3',
        md: 'col-span-4',
        lg: 'col-span-6'
    };
    return (_jsxs(motion.section, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.15 }, className: cn('bg-[#131417] rounded-xl2 shadow-card border border-stroke/60 p-4 flex flex-col gap-2 relative', sizeClasses[size], status !== 'default' && 'after:content-[""] after:absolute after:top-0 after:right-0 after:w-1.5 after:h-4 after:rounded-br-md after:rounded-bl-md', statusClasses[status], className), children: [_jsx("h3", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide", children: title }), children] }));
}
