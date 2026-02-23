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
    accent: 'bg-blue-500',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  green: {
    accent: 'bg-emerald-500',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  red: {
    accent: 'bg-rose-500',
    icon: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  amber: {
    accent: 'bg-amber-500',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
}

export function StatCard({ label, value, trend, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color]
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm shadow-stone-900/[0.04]',
        'dark:bg-warm-900/80 dark:shadow-none dark:ring-1 dark:ring-white/[0.04]',
      )}
    >
      {/* Top accent line */}
      <div className={clsx('absolute inset-x-0 top-0 h-[2px]', colors.accent)} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">{label}</p>
          <p className="stat-display mt-2 text-3xl text-stone-800 dark:text-stone-100">{value}</p>
        </div>
        <div className={clsx('rounded-xl p-2.5', colors.iconBg)}>
          <Icon className={clsx('h-5 w-5', colors.icon)} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={trendPositive ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'font-medium text-red-600 dark:text-red-400'}>
            {trendPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-stone-400 dark:text-stone-500">vs prev period</span>
        </div>
      )}
    </div>
  )
}
