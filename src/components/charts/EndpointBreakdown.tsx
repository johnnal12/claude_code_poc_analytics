import clsx from 'clsx'
import { Card } from '@/components/ui/Card'
import type { UserAggregate } from '@/types'

interface Props {
  data: UserAggregate[]
  onUserClick?: (name: string) => void
}

export function UserBreakdown({ data, onUserClick }: Props) {
  return (
    <Card title="Top Users">
      <div className="-mx-6 -mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-200/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:border-warm-800/60 dark:text-stone-500">
              <th className="px-6 pb-3 pr-4">User</th>
              <th className="pb-3 pr-4 text-right">Sessions</th>
              <th className="pb-3 pr-4 text-right">Chats</th>
              <th className="pb-3 pr-4 text-right">Lines +/-</th>
              <th className="pb-3 pr-4 text-right">Commits</th>
              <th className="pb-3 pr-4 text-right">Searches</th>
              <th className="pb-3 pr-6 text-right">Accept %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, i) => (
              <tr
                key={user.name}
                className={clsx(
                  'transition-colors hover:bg-warm-50 dark:hover:bg-warm-800/40',
                  i !== data.length - 1 && 'border-b border-warm-100 dark:border-warm-800/40',
                )}
              >
                <td className="truncate px-6 py-3 pr-4 font-medium max-w-[220px]" title={user.name}>
                  <button
                    onClick={() => onUserClick?.(user.name)}
                    className="text-left text-analytics-600 hover:text-analytics-700 dark:text-analytics-400 dark:hover:text-analytics-300 hover:underline underline-offset-2 transition-colors"
                  >
                    {user.name}
                  </button>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
                  {user.sessions.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
                  {user.conversations.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  <span className="text-emerald-600 dark:text-emerald-400">+{user.linesAdded.toLocaleString()}</span>
                  <span className="mx-0.5 text-stone-300 dark:text-stone-600">/</span>
                  <span className="text-rose-500 dark:text-rose-400">-{user.linesRemoved.toLocaleString()}</span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
                  {user.commits.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
                  {user.webSearches.toLocaleString()}
                </td>
                <td className={clsx(
                  'py-3 pr-6 text-right tabular-nums font-medium',
                  user.acceptanceRate >= 90
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : user.acceptanceRate >= 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : user.acceptanceRate === 0
                        ? 'text-stone-300 dark:text-stone-600'
                        : 'text-rose-600 dark:text-rose-400',
                )}>
                  {user.acceptanceRate > 0 ? `${user.acceptanceRate.toFixed(1)}%` : '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
