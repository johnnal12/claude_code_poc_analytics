import { create } from 'zustand'
import type {
  DailyAggregate,
  UserAggregate,
  ToolAggregate,
  ProjectAggregate,
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
  fetchedAt: string | null
  dataDateRange: { start: string; end: string } | null
  _allDaily: DailyAggregate[]
  _allUsers: UserAggregate[]
  _allTools: ToolAggregate[]
  setRange: (range: TimeRange) => void
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
  fetchedAt: null,
  dataDateRange: null,
  _allDaily: [],
  _allUsers: [],
  _allTools: [],

  setRange: (range: TimeRange) => {
    const { _allDaily, _allUsers, _allTools } = get()
    const days = rangeDays[range]
    set({
      range,
      daily: _allDaily.slice(-days),
      users: _allUsers,
      tools: _allTools,
    })
  },

  fetch: async () => {
    set({ loading: true, error: null })

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.json`)
      if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)

      const data: StaticData = await res.json()
      const days = rangeDays[get().range]

      set({
        fetchedAt: data.fetchedAt,
        dataDateRange: data.dateRange,
        _allDaily: data.daily,
        _allUsers: data.users,
        _allTools: data.tools,
        daily: data.daily.slice(-days),
        users: data.users,
        tools: data.tools,
        projects: data.projects ?? [],
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
