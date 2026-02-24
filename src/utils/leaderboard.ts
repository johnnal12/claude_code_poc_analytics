import type { UserAggregate, UserDailyRecord } from '@/types'

export interface RankedUser extends UserAggregate {
  rank: number
}

export interface Badge {
  label: string
  color: string
}

export function computeRankings(users: UserAggregate[]): RankedUser[] {
  return [...users]
    .sort((a, b) => b.sessions - a.sessions)
    .map((user, i) => ({ ...user, rank: i + 1 }))
}

export function computeStreaks(
  userDaily: Record<string, UserDailyRecord[]>,
): Record<string, number> {
  const streaks: Record<string, number> = {}

  for (const [name, records] of Object.entries(userDaily)) {
    const sorted = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    let streak = 0
    let prev: Date | null = null

    for (const rec of sorted) {
      const isActive = rec.sessions > 0 || rec.conversations > 0
      if (!isActive) break

      const d = new Date(rec.date + 'T00:00:00')
      if (prev === null) {
        streak = 1
      } else {
        const diff = (prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        if (Math.round(diff) === 1) {
          streak++
        } else {
          break
        }
      }
      prev = d
    }

    streaks[name] = streak
  }

  return streaks
}

export function hasWeekendActivity(
  records: UserDailyRecord[] | undefined,
): boolean {
  if (!records) return false
  return records.some((r) => {
    const day = new Date(r.date + 'T00:00:00').getDay()
    return (day === 0 || day === 6) && (r.sessions > 0 || r.conversations > 0)
  })
}

export function computeBadges(user: UserAggregate, streak: number, weekendActive: boolean): Badge[] {
  const badges: Badge[] = []

  if (user.sessions >= 100)
    badges.push({ label: 'Code Machine', color: 'bg-terra-100 text-terra-700 dark:bg-terra-900/40 dark:text-terra-300' })
  else if (user.sessions >= 50)
    badges.push({ label: 'Prolific Coder', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' })

  if (user.commits >= 50)
    badges.push({ label: 'Super Committer', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' })
  else if (user.commits >= 10)
    badges.push({ label: 'Committer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' })

  if (streak >= 7)
    badges.push({ label: 'Iron Streak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' })

  if (weekendActive)
    badges.push({ label: 'Weekend Warrior', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' })

  if (user.linesRemoved > user.linesAdded)
    badges.push({ label: 'Code Surgeon', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' })

  if (user.linesAdded >= 50_000)
    badges.push({ label: 'Architect', color: 'bg-stone-200 text-stone-700 dark:bg-stone-700/40 dark:text-stone-300' })

  return badges
}
