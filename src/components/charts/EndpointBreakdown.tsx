import clsx from 'clsx'
import { Card } from '@/components/ui/Card'
import type { UserAggregate } from '@/types'

interface Props {
  data: UserAggregate[]
}

export function UserBreakdown({ data }: Props) {
  return (
    <Card title="Top Users">
      <div className="-mx-5 -mb-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200/80 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:border-gray-800/60 dark:text-gray-500">
              <th className="px-5 pb-3 pr-4">User</th>
              <th className="pb-3 pr-4 text-right">Sessions</th>
              <th className="pb-3 pr-4 text-right">Chats</th>
              <th className="pb-3 pr-4 text-right">Lines +/-</th>
              <th className="pb-3 pr-4 text-right">Commits</th>
              <th className="pb-3 pr-5 text-right">Accept %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, i) => (
              <tr
                key={user.name}
                className={clsx(
                  'transition-colors hover:bg-stone-50 dark:hover:bg-gray-800/40',
                  i !== data.length - 1 && 'border-b border-stone-100 dark:border-gray-800/40',
                )}
              >
                <td className="truncate px-5 py-3 pr-4 font-medium text-gray-900 dark:text-gray-200 max-w-[220px]" title={user.name}>
                  {user.name}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                  {user.sessions.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                  {user.conversations.toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  <span className="text-emerald-600 dark:text-emerald-400">+{user.linesAdded.toLocaleString()}</span>
                  <span className="mx-0.5 text-gray-300 dark:text-gray-600">/</span>
                  <span className="text-rose-500 dark:text-rose-400">-{user.linesRemoved.toLocaleString()}</span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                  {user.commits.toLocaleString()}
                </td>
                <td className={clsx(
                  'py-3 pr-5 text-right tabular-nums font-medium',
                  user.acceptanceRate >= 90
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : user.acceptanceRate >= 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : user.acceptanceRate === 0
                        ? 'text-gray-300 dark:text-gray-600'
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
