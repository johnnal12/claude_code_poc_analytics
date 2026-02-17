import clsx from 'clsx'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'amber'
}

const colorMap = {
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  red: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    icon: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    icon: 'text-amber-600 dark:text-amber-400',
  },
}

export function StatCard({ label, value, trend, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color]
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <div
      className={clsx(
        'rounded-2xl border border-stone-200/60 border-l-[3px] bg-white p-5 shadow-sm',
        'dark:border-gray-800/60 dark:bg-gray-900',
        colors.border,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{value}</p>
        </div>
        <div className={clsx('rounded-xl p-2.5', colors.bg)}>
          <Icon className={clsx('h-5 w-5', colors.icon)} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={trendPositive ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'font-medium text-red-600 dark:text-red-400'}>
            {trendPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-gray-400 dark:text-gray-500">vs prev period</span>
        </div>
      )}
    </div>
  )
}
