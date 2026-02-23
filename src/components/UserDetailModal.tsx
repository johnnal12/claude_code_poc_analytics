import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { UserDailyRecord, UserAggregate } from '@/types'

interface Props {
  user: UserAggregate
  daily: UserDailyRecord[]
  onClose: () => void
}

const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)',
  border: '1px solid var(--tooltip-border)',
  color: 'var(--tooltip-text)',
  borderRadius: '0.75rem',
  fontSize: '0.8rem',
  padding: '8px 12px',
}

function formatTick(v: string) {
  const d = new Date(v + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatLabel(v: string) {
  return new Date(v + 'T00:00:00').toLocaleDateString()
}

function formatValue(value: number, name: string): [string, string] {
  return [value.toLocaleString(), name]
}

export function UserDetailModal({ user, daily, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const hasData = daily.length > 0

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-12"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl dark:bg-warm-900 dark:ring-1 dark:ring-white/[0.06]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200/80 px-6 py-4 dark:border-warm-800/60">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-50">{user.name}</h2>
            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Day-over-day breakdown</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-warm-100 hover:text-stone-600 dark:hover:bg-warm-800 dark:hover:text-stone-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-4">
          {[
            { label: 'Sessions', value: user.sessions },
            { label: 'Lines Changed', value: user.linesAdded + user.linesRemoved },
            { label: 'Commits', value: user.commits },
            { label: 'Chats', value: user.conversations },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-warm-50 px-4 py-3 dark:bg-warm-800/50">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                {s.label}
              </div>
              <div className="mt-1 text-lg font-bold tabular-nums text-stone-800 dark:text-stone-100">
                {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {!hasData ? (
          <div className="px-6 pb-8 pt-4 text-center text-sm text-stone-400 dark:text-stone-500">
            No daily breakdown data available. Re-fetch data to populate.
          </div>
        ) : (
          <div className="space-y-6 px-6 pb-6">
            {/* Sessions chart */}
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                Daily Sessions
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-warm-200/60 dark:stroke-warm-800/60" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} tickFormatter={formatTick} />
                    <YAxis tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLabel} formatter={formatValue} />
                    <Bar dataKey="sessions" name="Sessions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lines of code chart */}
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                Lines of Code
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={daily} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userAddedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="userRemovedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-warm-200/60 dark:stroke-warm-800/60" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} tickFormatter={formatTick} />
                    <YAxis tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLabel} formatter={formatValue} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="linesAdded" name="Added" stroke="#10b981" strokeWidth={2} fill="url(#userAddedGrad)" dot={false} />
                    <Area type="monotone" dataKey="linesRemoved" name="Removed" stroke="#f43f5e" strokeWidth={1.5} fill="url(#userRemovedGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Commits & chats chart */}
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                Commits & Chats
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-warm-200/60 dark:stroke-warm-800/60" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} tickFormatter={formatTick} />
                    <YAxis tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLabel} formatter={formatValue} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="commits" name="Commits" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="conversations" name="Chats" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
