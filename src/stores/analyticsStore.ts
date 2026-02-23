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

const rangeDays: Record<TimeRange, number> = { '7d': 7, '14d': 14, '30d': 30 }

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
  range: '7d',
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
    const days = rangeDays[range]
    // Slice userDaily per-user arrays to match the range
    const sliced: Record<string, UserDailyRecord[]> = {}
    for (const [name, records] of Object.entries(_allUserDaily)) {
      sliced[name] = records.slice(-days)
    }
    set({
      range,
      daily: _allDaily.slice(-days),
      users: _allUsers,
      tools: _allTools,
      userDaily: sliced,
    })
  },

  setSelectedUser: (name: string | null) => {
    set({ selectedUser: name })
  },

  fetch: async () => {
    set({ loading: true, error: null })

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.json`)
      if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)

      const data: StaticData = await res.json()
      const days = rangeDays[get().range]
      const allUserDaily = data.userDaily ?? {}
      const sliced: Record<string, UserDailyRecord[]> = {}
      for (const [name, records] of Object.entries(allUserDaily)) {
        sliced[name] = records.slice(-days)
      }

      set({
        fetchedAt: data.fetchedAt,
        dataDateRange: data.dateRange,
        _allDaily: data.daily,
        _allUsers: data.users,
        _allTools: data.tools,
        _allUserDaily: allUserDaily,
        daily: data.daily.slice(-days),
        users: data.users,
        tools: data.tools,
        projects: data.projects ?? [],
        userDaily: sliced,
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
