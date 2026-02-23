import { create } from 'zustand'
import type {
  DailyAggregate,
  UserAggregate,
  ToolAggregate,
  ProjectAggregate,
  UserDailyRecord,
  TimeRange,
  StaticData,
} from '@/types'

const rangeDays: Record<Exclude<TimeRange, 'mtd'>, number> = { '7d': 7, '14d': 14, '30d': 30 }

function mtdPrefix(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-`
}

function sliceByRange<T extends { date: string }>(all: T[], range: TimeRange): T[] {
  if (range === 'mtd') {
    const prefix = mtdPrefix()
    return all.filter((d) => d.date >= prefix)
  }
  return all.slice(-rangeDays[range])
}

function sliceUserDaily(all: Record<string, UserDailyRecord[]>, range: TimeRange): Record<string, UserDailyRecord[]> {
  const result: Record<string, UserDailyRecord[]> = {}
  for (const [name, records] of Object.entries(all)) {
    result[name] = sliceByRange(records, range)
  }
  return result
}

interface AnalyticsState {
  range: TimeRange
  loading: boolean
  error: string | null
  daily: DailyAggregate[]
  users: UserAggregate[]
  tools: ToolAggregate[]
  projects: ProjectAggregate[]
  userDaily: Record<string, UserDailyRecord[]>
  selectedUser: string | null
  fetchedAt: string | null
  dataDateRange: { start: string; end: string } | null
  _allDaily: DailyAggregate[]
  _allUsers: UserAggregate[]
  _allTools: ToolAggregate[]
  _allUserDaily: Record<string, UserDailyRecord[]>
  setRange: (range: TimeRange) => void
  setSelectedUser: (name: string | null) => void
  fetch: () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  range: 'mtd',
  loading: false,
  error: null,
  daily: [],
  users: [],
  tools: [],
  projects: [],
  userDaily: {},
  selectedUser: null,
  fetchedAt: null,
  dataDateRange: null,
  _allDaily: [],
  _allUsers: [],
  _allTools: [],
  _allUserDaily: {},

  setRange: (range: TimeRange) => {
    const { _allDaily, _allUsers, _allTools, _allUserDaily } = get()
    set({
      range,
      daily: sliceByRange(_allDaily, range),
      users: _allUsers,
      tools: _allTools,
      userDaily: sliceUserDaily(_allUserDaily, range),
    })
  },

  setSelectedUser: (name: string | null) => {
    set({ selectedUser: name })
  },

  fetch: async () => {
    set({ loading: true, error: null })

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.json?v=${Date.now()}`)
      if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)

      const data: StaticData = await res.json()
      const range = get().range
      const allUserDaily = data.userDaily ?? {}

      set({
        fetchedAt: data.fetchedAt,
        dataDateRange: data.dateRange,
        _allDaily: data.daily,
        _allUsers: data.users,
        _allTools: data.tools,
        _allUserDaily: allUserDaily,
        daily: sliceByRange(data.daily, range),
        users: data.users,
        tools: data.tools,
        projects: data.projects ?? [],
        userDaily: sliceUserDaily(allUserDaily, range),
        loading: false,
      })
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to fetch',
      })
    }
  },
}))
