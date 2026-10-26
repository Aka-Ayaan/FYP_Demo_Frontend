import React from 'react'
import { cn } from '@/lib/utils'

export type StatusType =
  | 'Draft'
  | 'Optimizing'
  | 'Generated'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Executing'
  | 'Completed'
  | 'Rejected'
  | 'Infeasible'
  | 'Adequate'
  | 'Below Safety'
  | 'Stock-out Risk'
  | 'Active'
  | 'Inactive'
  | 'Binding'
  | 'Near Limit'
  | 'Slack'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200'

  switch (status) {
    case 'Approved':
    case 'Completed':
    case 'Active':
    case 'Adequate':
    case 'Slack':
      colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
      break

    case 'Under Review':
    case 'Optimizing':
    case 'Below Safety':
    case 'Near Limit':
      colorStyles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
      break

    case 'Rejected':
    case 'Infeasible':
    case 'Stock-out Risk':
    case 'Binding':
    case 'Inactive':
      colorStyles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
      break

    case 'Generated':
    case 'Published':
    case 'Executing':
      colorStyles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
      break

    case 'Draft':
    default:
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      break
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        colorStyles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  )
}
