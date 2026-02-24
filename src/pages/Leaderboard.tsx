import { useMemo } from 'react'
import { Trophy, Flame, Users, Zap } from 'lucide-react'
import clsx from 'clsx'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import {
  computeRankings,
  computeStreaks,
  computeBadges,
  hasWeekendActivity,
  type RankedUser,
  type Badge,
} from '@/utils/leaderboard'
import type { TimeRange } from '@/types'

const ranges: { value: TimeRange; label: string }[] = [
  { value: 'mtd', label: 'MTD' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
]

const medalColors: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-stone-400',
  3: 'text-amber-700 dark:text-amber-600',
}

const rowHighlight: Record<number, string> = {
  1: 'bg-amber-50/60 dark:bg-amber-950/10',
  2: 'bg-stone-50/60 dark:bg-stone-800/10',
  3: 'bg-amber-50/30 dark:bg-amber-950/5',
}

export function Leaderboard() {
  const { range, setRange, loading, users, userDaily } =
    useAnalyticsStore()

  const streaks = useMemo(() => computeStreaks(userDaily), [userDaily])

  const ranked = useMemo(() => computeRankings(users), [users])

  const badgeMap = useMemo(() => {
    const m: Record<string, Badge[]> = {}
    for (const user of ranked) {
      m[user.name] = computeBadges(user, streaks[user.name] ?? 0, hasWeekendActivity(userDaily[user.name]))
    }
    return m
  }, [ranked, streaks, userDaily])

  const topStats = useMemo(() => {
    const totalSessions = users.reduce((s, u) => s + u.sessions, 0)
    const mostActive = ranked[0]?.name ?? '—'
    const longestStreak = Math.max(0, ...Object.values(streaks))
    const totalBadges = Object.values(badgeMap).reduce((s, b) => s + b.length, 0)
    return { totalSessions, mostActive, longestStreak, totalBadges }
  }, [users, ranked, streaks, badgeMap])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-50">
            Leaderboard
          </h1>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Rankings and achievements across your team
          </p>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-warm-100 p-1 dark:bg-warm-800">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                range === r.value
                  ? 'bg-white text-stone-800 shadow-sm dark:bg-warm-700 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-terra-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Team Sessions"
              value={topStats.totalSessions.toLocaleString()}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Most Active"
              value={topStats.mostActive}
              icon={Trophy}
              color="amber"
            />
            <StatCard
              label="Longest Streak"
              value={`${topStats.longestStreak}d`}
              icon={Flame}
              color="red"
            />
            <StatCard
              label="Badges Earned"
              value={topStats.totalBadges.toLocaleString()}
              icon={Zap}
              color="green"
            />
          </div>

          <Card>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
              Rankings
            </h3>
            <div className="-mx-6 -mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-200/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:border-warm-800/60 dark:text-stone-500">
                    <th className="px-6 pb-3 pr-2 w-12">#</th>
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4 text-right">Sessions</th>
                    <th className="pb-3 pr-4 text-right">Lines +/-</th>
                    <th className="pb-3 pr-4 text-right">Commits</th>
                    <th className="pb-3 pr-4 text-right">Streak</th>
                    <th className="pb-3 pr-6">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((user, i) => (
                    <RankRow
                      key={user.name}
                      user={user}
                      streak={streaks[user.name] ?? 0}
                      badges={badgeMap[user.name] ?? []}
                      isLast={i === ranked.length - 1}
                    />
                  ))}
                  {ranked.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-stone-400 dark:text-stone-500">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function RankRow({
  user,
  streak,
  badges,
  isLast,
}: {
  user: RankedUser
  streak: number
  badges: Badge[]
  isLast: boolean
}) {
  const isTop3 = user.rank <= 3

  return (
    <tr
      className={clsx(
        'transition-colors hover:bg-warm-50 dark:hover:bg-warm-800/40',
        !isLast && 'border-b border-warm-100 dark:border-warm-800/40',
        isTop3 && rowHighlight[user.rank],
      )}
    >
      <td className="px-6 py-3 pr-2 w-12">
        {isTop3 ? (
          <span className={clsx('font-serif text-lg font-bold', medalColors[user.rank])}>
            {user.rank}
          </span>
        ) : (
          <span className="font-data text-stone-400 dark:text-stone-500">
            {user.rank}
          </span>
        )}
      </td>
      <td className="py-3 pr-4">
        <span
          className={clsx(
            'font-medium truncate max-w-[220px] inline-block',
            isTop3
              ? 'text-stone-800 dark:text-stone-100'
              : 'text-stone-600 dark:text-stone-300',
          )}
          title={user.name}
        >
          {user.name}
        </span>
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
        {user.sessions.toLocaleString()}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums">
        <span className="text-emerald-600 dark:text-emerald-400">
          +{user.linesAdded.toLocaleString()}
        </span>
        <span className="mx-0.5 text-stone-300 dark:text-stone-600">/</span>
        <span className="text-rose-500 dark:text-rose-400">
          -{user.linesRemoved.toLocaleString()}
        </span>
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300">
        {user.commits.toLocaleString()}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums">
        {streak > 0 ? (
          <span className={clsx(
            'font-medium',
            streak >= 7
              ? 'text-terra-500 dark:text-terra-400'
              : 'text-stone-600 dark:text-stone-300',
          )}>
            {streak}d
          </span>
        ) : (
          <span className="text-stone-300 dark:text-stone-600">&mdash;</span>
        )}
      </td>
      <td className="py-3 pr-6">
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={clsx(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                badge.color,
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}
