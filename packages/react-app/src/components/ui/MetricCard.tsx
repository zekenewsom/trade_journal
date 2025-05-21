import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

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


  const sizeClasses = {
    sm: 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4',
    md: 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-6',
    lg: 'col-span-1 sm:col-span-2 md:col-span-6 lg:col-span-12'
  };
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-2xl shadow-card p-4 flex flex-col gap-2 relative bg-surface border border-card-stroke',
        sizeClasses[size],
        className
      )}
      style={{ position: 'relative' }}
    >
      {status !== 'default' && (
        <span
          className={cn(
            'absolute top-0 right-0 w-1.5 h-4 rounded-b-md',
            status === 'good' && 'bg-success',
            status === 'moderate' && 'bg-warning',
            status === 'bad' && 'bg-error',
            status === 'strong' && 'bg-primary'
          )}
        />
      )}
      <h3 className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{title}</h3>
      {children}
    </motion.section>
  );
} 