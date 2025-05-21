import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { colors } from '../../styles/design-tokens';

interface MetricCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'good' | 'moderate' | 'bad' | 'strong';
}

export function MetricCard({ 
  title, 
  children, 
  className,
  size = 'md',
  status = 'default'
}: MetricCardProps) {
  const statusColors = {
    default: undefined,
    good: colors.success,
    moderate: colors.warning,
    bad: colors.error,
    strong: colors.primary,
  };

  const sizeClasses = {
    sm: 'col-span-3',
    md: 'col-span-4',
    lg: 'col-span-6'
  };
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-xl2 shadow-card p-4 flex flex-col gap-2 relative',
        sizeClasses[size],
        className
      )}
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        position: 'relative',
      }}
    >
      {status !== 'default' && (
        <span
          style={{
            background: statusColors[status],
            position: 'absolute',
            top: 0,
            right: 0,
            width: '0.375rem',
            height: '1rem',
            borderBottomRightRadius: '0.375rem',
            borderBottomLeftRadius: '0.375rem',
            content: '""',
            display: 'block',
          }}
        />
      )}
      <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textSecondary }}>{title}</h3>
      {children}
    </motion.section>
  );
} 