import type {
  UserActivityRecord,
  UserActivityResponse,
  SummaryResponse,
  DaySummary,
  DailyAggregate,
  UserAggregate,
  ToolAggregate,
} from '@/types'

const BASE = '/api/anthropic/v1/organizations/analytics'

async function fetchAllPages(url: string): Promise<UserActivityRecord[]> {
  const all: UserActivityRecord[] = []
  let page: string | null = null

  do {
    const sep = url.includes('?') ? '&' : '?'
    const fullUrl = page ? `${url}${sep}page=${encodeURIComponent(page)}&limit=1000` : `${url}${sep}limit=1000`

    const res = await fetch(fullUrl)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API ${res.status}: ${text}`)
    }

    const json: UserActivityResponse = await res.json()
    all.push(...json.data)
    page = json.next_page
  } while (page)

  return all
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDateRange(days: number): string[] {
  const dates: string[] = []
  const now = new Date()
  // API requires date before today, so start from yesterday
  for (let i = days; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

export async function fetchUsers(days: number): Promise<Map<string, UserActivityRecord[]>> {
  const dates = getDateRange(days)
  const byDate = new Map<string, UserActivityRecord[]>()

  // Fetch in batches of 5
  for (let i = 0; i < dates.length; i += 5) {
    const batch = dates.slice(i, i + 5)
    const results = await Promise.all(
      batch.map(async (date) => {
        const records = await fetchAllPages(`${BASE}/users?date=${date}`)
        return { date, records }
      }),
    )
    for (const { date, records } of results) {
      byDate.set(date, records)
    }
  }

  return byDate
}

export async function fetchSummaries(days: number): Promise<DaySummary[]> {
  const dates = getDateRange(days)
  const startDate = dates[0]
  const endDate = dates[dates.length - 1]

  const res = await fetch(`${BASE}/summaries?starting_date=${startDate}&ending_date=${endDate}&limit=1000`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  const json: SummaryResponse = await res.json()
  return json.summaries
}

// Aggregation helpers

export function aggregateByDay(
  usersByDate: Map<string, UserActivityRecord[]>,
  summaries: DaySummary[],
): DailyAggregate[] {
  const summaryMap = new Map<string, DaySummary>()
  for (const s of summaries) {
    summaryMap.set(s.starting_at.split('T')[0], s)
  }

  const result: DailyAggregate[] = []

  for (const [date, records] of usersByDate) {
    const summary = summaryMap.get(date)
    let sessions = 0, linesAdded = 0, linesRemoved = 0, commits = 0, pullRequests = 0
    let conversations = 0, messages = 0, webSearches = 0, toolAccepted = 0, toolRejected = 0

    for (const r of records) {
      const cc = r.claude_code_metrics
      sessions += cc.core_metrics.distinct_session_count
      linesAdded += cc.core_metrics.lines_of_code.added_count
      linesRemoved += cc.core_metrics.lines_of_code.removed_count
      commits += cc.core_metrics.commit_count
      pullRequests += cc.core_metrics.pull_request_count
      conversations += r.chat_metrics.distinct_conversation_count
      messages += r.chat_metrics.message_count
      webSearches += r.web_search_count

      const ta = cc.tool_actions
      toolAccepted += ta.edit_tool.accepted_count + ta.multi_edit_tool.accepted_count +
        ta.write_tool.accepted_count + ta.notebook_edit_tool.accepted_count
      toolRejected += ta.edit_tool.rejected_count + ta.multi_edit_tool.rejected_count +
        ta.write_tool.rejected_count + ta.notebook_edit_tool.rejected_count
    }

    result.push({
      date,
      sessions,
      linesAdded,
      linesRemoved,
      commits,
      pullRequests,
      conversations,
      messages,
      webSearches,
      toolAccepted,
      toolRejected,
      activeUsers: summary?.daily_active_user_count ?? records.length,
    })
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateByUser(usersByDate: Map<string, UserActivityRecord[]>): UserAggregate[] {
  const byUser = new Map<string, {
    sessions: number; linesAdded: number; linesRemoved: number
    commits: number; pullRequests: number; conversations: number; messages: number
    webSearches: number; totalAccepted: number; totalRejected: number
  }>()

  for (const records of usersByDate.values()) {
    for (const r of records) {
      const name = r.user.email_address.split('@')[0]
        .split(/[._-]/)
        .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ')
      const cc = r.claude_code_metrics
      const ta = cc.tool_actions

      const accepted = ta.edit_tool.accepted_count + ta.multi_edit_tool.accepted_count +
        ta.write_tool.accepted_count + ta.notebook_edit_tool.accepted_count
      const rejected = ta.edit_tool.rejected_count + ta.multi_edit_tool.rejected_count +
        ta.write_tool.rejected_count + ta.notebook_edit_tool.rejected_count

      const existing = byUser.get(name)
      if (existing) {
        existing.sessions += cc.core_metrics.distinct_session_count
        existing.linesAdded += cc.core_metrics.lines_of_code.added_count
        existing.linesRemoved += cc.core_metrics.lines_of_code.removed_count
        existing.commits += cc.core_metrics.commit_count
        existing.pullRequests += cc.core_metrics.pull_request_count
        existing.conversations += r.chat_metrics.distinct_conversation_count
        existing.messages += r.chat_metrics.message_count
        existing.webSearches += r.web_search_count
        existing.totalAccepted += accepted
        existing.totalRejected += rejected
      } else {
        byUser.set(name, {
          sessions: cc.core_metrics.distinct_session_count,
          linesAdded: cc.core_metrics.lines_of_code.added_count,
          linesRemoved: cc.core_metrics.lines_of_code.removed_count,
          commits: cc.core_metrics.commit_count,
          pullRequests: cc.core_metrics.pull_request_count,
          conversations: r.chat_metrics.distinct_conversation_count,
          messages: r.chat_metrics.message_count,
          webSearches: r.web_search_count,
          totalAccepted: accepted,
          totalRejected: rejected,
        })
      }
    }
  }

  return Array.from(byUser.entries())
    .map(([name, d]) => ({
      name,
      sessions: d.sessions,
      linesAdded: d.linesAdded,
      linesRemoved: d.linesRemoved,
      commits: d.commits,
      pullRequests: d.pullRequests,
      conversations: d.conversations,
      messages: d.messages,
      webSearches: d.webSearches,
      acceptanceRate: (d.totalAccepted + d.totalRejected) > 0
        ? (d.totalAccepted / (d.totalAccepted + d.totalRejected)) * 100
        : 0,
    }))
    .sort((a, b) => b.linesAdded - a.linesAdded)
}

export function aggregateTools(usersByDate: Map<string, UserActivityRecord[]>): ToolAggregate[] {
  const tools: Record<string, { accepted: number; rejected: number }> = {
    Edit: { accepted: 0, rejected: 0 },
    'Multi-Edit': { accepted: 0, rejected: 0 },
    Write: { accepted: 0, rejected: 0 },
    NotebookEdit: { accepted: 0, rejected: 0 },
  }

  for (const records of usersByDate.values()) {
    for (const r of records) {
      const ta = r.claude_code_metrics.tool_actions
      tools['Edit'].accepted += ta.edit_tool.accepted_count
      tools['Edit'].rejected += ta.edit_tool.rejected_count
      tools['Multi-Edit'].accepted += ta.multi_edit_tool.accepted_count
      tools['Multi-Edit'].rejected += ta.multi_edit_tool.rejected_count
      tools['Write'].accepted += ta.write_tool.accepted_count
      tools['Write'].rejected += ta.write_tool.rejected_count
      tools['NotebookEdit'].accepted += ta.notebook_edit_tool.accepted_count
      tools['NotebookEdit'].rejected += ta.notebook_edit_tool.rejected_count
    }
  }

  return Object.entries(tools)
    .map(([tool, counts]) => ({ tool, ...counts }))
    .filter((t) => t.accepted + t.rejected > 0)
}
