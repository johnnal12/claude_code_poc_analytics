// Enterprise Analytics API response types

export interface UserActivityRecord {
  user: {
    id: string
    email_address: string
  }
  chat_metrics: {
    distinct_conversation_count: number
    message_count: number
    thinking_message_count: number
    distinct_projects_used_count: number
    distinct_projects_created_count: number
    distinct_artifacts_created_count: number
    distinct_skills_used_count: number
    connectors_used_count: number
    distinct_files_uploaded_count: number
  }
  claude_code_metrics: {
    core_metrics: {
      distinct_session_count: number
      commit_count: number
      pull_request_count: number
      lines_of_code: {
        added_count: number
        removed_count: number
      }
    }
    tool_actions: {
      edit_tool: { accepted_count: number; rejected_count: number }
      multi_edit_tool: { accepted_count: number; rejected_count: number }
      write_tool: { accepted_count: number; rejected_count: number }
      notebook_edit_tool: { accepted_count: number; rejected_count: number }
    }
  }
  web_search_count: number
}

export interface UserActivityResponse {
  data: UserActivityRecord[]
  next_page: string | null
}

export interface DaySummary {
  starting_at: string
  ending_at: string
  daily_active_user_count: number
  weekly_active_user_count: number
  monthly_active_user_count: number
  assigned_seat_count: number
  pending_invite_count: number
}

export interface SummaryResponse {
  summaries: DaySummary[]
}

export interface ProjectUsage {
  project_name: string
  project_id: string
  distinct_user_count: number
  conversation_count: number
  message_count: number
}

export interface ProjectResponse {
  data: ProjectUsage[]
  next_page: string | null
}

export interface ConnectorUsage {
  connector_name: string
  distinct_user_count: number
  chat_conversation_count: number
  claude_code_session_count: number
}

export interface ConnectorResponse {
  data: ConnectorUsage[]
  next_page: string | null
}

// Aggregated types for dashboard

export interface DailyAggregate {
  date: string
  sessions: number
  linesAdded: number
  linesRemoved: number
  commits: number
  pullRequests: number
  conversations: number
  messages: number
  webSearches: number
  toolAccepted: number
  toolRejected: number
  activeUsers: number
}

export interface UserAggregate {
  name: string
  sessions: number
  linesAdded: number
  linesRemoved: number
  commits: number
  pullRequests: number
  conversations: number
  messages: number
  webSearches: number
  acceptanceRate: number
}

export interface ToolAggregate {
  tool: string
  accepted: number
  rejected: number
}

export interface ProjectAggregate {
  name: string
  users: number
  conversations: number
  messages: number
}

export interface UserDailyRecord {
  date: string
  sessions: number
  linesAdded: number
  linesRemoved: number
  commits: number
  conversations: number
  messages: number
  webSearches: number
}

export type TimeRange = '7d' | '14d' | '30d' | 'mtd'

export interface StaticData {
  fetchedAt: string
  dateRange: { start: string; end: string }
  daily: DailyAggregate[]
  users: UserAggregate[]
  tools: ToolAggregate[]
  projects: ProjectAggregate[]
  userDaily?: Record<string, UserDailyRecord[]>
}
