#!/usr/bin/env node

// Fetches 30 days of Anthropic Enterprise Analytics data and writes public/data.json.
// Usage: CLAUDE_API_KEY=sk-... node scripts/fetch-data.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = join(__dirname, '..', 'public', 'data.json')

const API_KEY = process.env.CLAUDE_API_KEY
if (!API_KEY) {
  console.error('Missing CLAUDE_API_KEY environment variable')
  process.exit(1)
}

const BASE = 'https://api.anthropic.com/v1/organizations/analytics'
const HEADERS = {
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01',
}

// --- Date helpers ---

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

function getDateRange(days) {
  const dates = []
  const now = new Date()
  // API requires date before today, so start from yesterday
  for (let i = days; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

// --- API fetching ---

async function fetchAllPages(url) {
  const all = []
  let page = null

  do {
    const sep = url.includes('?') ? '&' : '?'
    const fullUrl = page
      ? `${url}${sep}page=${encodeURIComponent(page)}&limit=1000`
      : `${url}${sep}limit=1000`

    const res = await fetch(fullUrl, { headers: HEADERS })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API ${res.status}: ${text}`)
    }

    const json = await res.json()
    all.push(...json.data)
    page = json.next_page
  } while (page)

  return all
}

async function fetchUsers(dates) {
  const byDate = new Map()

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

async function fetchSummaries(startDate, endDate) {
  const res = await fetch(
    `${BASE}/summaries?starting_date=${startDate}&ending_date=${endDate}&limit=1000`,
    { headers: HEADERS },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json.summaries
}

// --- Aggregation (mirrors src/api/client.ts) ---

function aggregateByDay(usersByDate, summaries) {
  const summaryMap = new Map()
  for (const s of summaries) {
    summaryMap.set(s.starting_at.split('T')[0], s)
  }

  const result = []

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

function emailToName(email) {
  const local = email.split('@')[0]
  return local
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function aggregateByUser(usersByDate) {
  const byUser = new Map()

  for (const records of usersByDate.values()) {
    for (const r of records) {
      const name = emailToName(r.user.email_address)
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
    .sort((a, b) => b.sessions - a.sessions)
}

function aggregateTools(usersByDate) {
  const tools = {
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

// --- Projects ---

async function fetchProjects(dates) {
  const byProject = new Map()

  // Fetch in batches of 5
  for (let i = 0; i < dates.length; i += 5) {
    const batch = dates.slice(i, i + 5)
    const results = await Promise.all(
      batch.map(async (date) => {
        const records = await fetchAllPages(`${BASE}/projects?date=${date}`)
        return records
      }),
    )
    for (const records of results) {
      for (const r of records) {
        const name = r.project_name
        const existing = byProject.get(name)
        if (existing) {
          existing.users = Math.max(existing.users, r.distinct_user_count)
          existing.conversations += r.conversation_count
          existing.messages += r.message_count
        } else {
          byProject.set(name, {
            users: r.distinct_user_count,
            conversations: r.conversation_count,
            messages: r.message_count,
          })
        }
      }
    }
  }

  return Array.from(byProject.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.conversations - a.conversations)
}

// --- Main ---

async function main() {
  const DAYS = 30
  const dates = getDateRange(DAYS)
  const startDate = dates[0]
  const endDate = dates[dates.length - 1]

  console.log(`Fetching ${DAYS} days of data (${startDate} to ${endDate})...`)

  const [usersByDate, summaries] = await Promise.all([
    fetchUsers(dates),
    fetchSummaries(startDate, endDate),
  ])

  console.log(`Fetched ${usersByDate.size} days of user data, ${summaries.length} summaries`)

  const daily = aggregateByDay(usersByDate, summaries)
  const users = aggregateByUser(usersByDate)
  const tools = aggregateTools(usersByDate)

  let projects = []
  try {
    console.log('Fetching projects...')
    projects = await fetchProjects(dates)
    console.log(`Fetched ${projects.length} projects`)
  } catch (err) {
    console.warn(`Skipping projects: ${err.message}`)
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    daily,
    users,
    tools,
    projects,
  }

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  console.log(`Wrote ${OUTPUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
