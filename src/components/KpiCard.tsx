import React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  delta?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  subtext?: string
  icon?: LucideIcon
  highlight?: boolean
  className?: string
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  subtext,
  icon: Icon,
  highlight,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white border rounded-xl p-5 shadow-xs transition-all',
        highlight
          ? 'border-blue-300 ring-2 ring-blue-500/10'
          : 'border-slate-200 hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
        <span>{title}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {delta && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded',
              delta.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            )}
          >
            {delta.isPositive ? '↓ ' : '↑ '}
            {delta.value}
          </span>
        )}
      </div>
      {(delta?.label || subtext) && (
        <p className="text-xs text-slate-500 mt-2 font-normal">
          {delta?.label || subtext}
        </p>
      )}
    </div>
  )
}
