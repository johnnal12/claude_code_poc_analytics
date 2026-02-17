import { useEffect, useMemo } from 'react'
import { Terminal, Code2, GitCommit, MessageSquare, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { StatCard } from '@/components/ui/StatCard'
import { ActivityChart } from '@/components/charts/RequestVolumeChart'
import { LinesOfCodeChart } from '@/components/charts/LatencyChart'
import { ToolAcceptanceChart } from '@/components/charts/ErrorRateChart'
import { ActiveUsersChart } from '@/components/charts/CostBreakdownChart'
import { UserBreakdown } from '@/components/charts/EndpointBreakdown'
import { ProjectsChart } from '@/components/charts/ProjectsChart'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import type { TimeRange } from '@/types'

const ranges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
]

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function Dashboard() {
  const { range, setRange, fetch: fetchData, loading, error, daily, users, tools, projects, fetchedAt, dataDateRange } =
    useAnalyticsStore()

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stats = useMemo(() => {
    const totalSessions = daily.reduce((s, d) => s + d.sessions, 0)
    const totalAdded = daily.reduce((s, d) => s + d.linesAdded, 0)
    const totalRemoved = daily.reduce((s, d) => s + d.linesRemoved, 0)
    const totalCommits = daily.reduce((s, d) => s + d.commits, 0)
    const totalConversations = daily.reduce((s, d) => s + d.conversations, 0)
    const totalMessages = daily.reduce((s, d) => s + d.messages, 0)
    const peakDAU = daily.length > 0 ? Math.max(...daily.map((d) => d.activeUsers)) : 0

    return {
      totalSessions,
      totalLinesChanged: totalAdded + totalRemoved,
      totalCommits,
      totalConversations,
      totalMessages,
      peakDAU,
    }
  }, [daily])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Analytics</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Claude usage across your organization
          </p>
          {dataDateRange && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {formatDateLabel(dataDateRange.start)} &ndash; {formatDateLabel(dataDateRange.end)}
              {fetchedAt && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Updated {formatTimestamp(fetchedAt)}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-0.5 rounded-xl bg-stone-100 p-1 dark:bg-gray-800">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                range === r.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-analytics-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Code Sessions"
              value={stats.totalSessions.toLocaleString()}
              icon={Terminal}
              color="blue"
            />
            <StatCard
              label="Lines Changed"
              value={stats.totalLinesChanged.toLocaleString()}
              icon={Code2}
              color="green"
            />
            <StatCard
              label="Commits"
              value={stats.totalCommits.toLocaleString()}
              icon={GitCommit}
              color="amber"
            />
            <StatCard
              label="Chat Conversations"
              value={stats.totalConversations.toLocaleString()}
              icon={MessageSquare}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ActivityChart data={daily} />
            <LinesOfCodeChart data={daily} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ToolAcceptanceChart data={tools} />
            <ActiveUsersChart data={daily} />
          </div>

          {projects.length > 0 && (
            <ProjectsChart data={projects} />
          )}

          <UserBreakdown data={users} />
        </>
      )}
    </div>
  )
}
