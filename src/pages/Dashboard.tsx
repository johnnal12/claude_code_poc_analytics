import { useEffect, useMemo, useRef } from 'react'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import type { DailyAggregate, ToolAggregate, UserAggregate } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k'
  return n.toLocaleString()
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtTs(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ── SVG Timeline Chart ────────────────────────────────────────────────────────

function TimelineChart({ daily }: { daily: DailyAggregate[] }) {
  const svgRef = useRef<SVGSVGElement>(null)

  const { paths, yLabels, xLabels } = useMemo(() => {
    if (!daily.length) return { paths: null, yLabels: [], xLabels: [] }

    const W = 860, H = 210
    const pt = 12, pr = 8, pb = 20
    const cW = W - pr, cH = H - pt - pb

    const maxSes = Math.max(...daily.map(d => d.sessions), 1) * 1.15
    const maxCon = Math.max(...daily.map(d => d.conversations), 1) * 1.15

    const xi = (i: number) => (i / (daily.length - 1 || 1)) * cW
    const ys = (v: number) => pt + cH - (v / maxSes) * cH
    const yc = (v: number) => pt + cH - (v / maxCon) * cH

    const line = (data: number[], sy: (v: number) => number) =>
      data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xi(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')

    const area = (data: number[], sy: (v: number) => number) =>
      line(data, sy) +
      ` L${xi(data.length - 1).toFixed(1)},${(pt + cH).toFixed(1)}` +
      ` L0,${(pt + cH).toFixed(1)} Z`

    const sesData  = daily.map(d => d.sessions)
    const convData = daily.map(d => d.conversations)

    const gridY = [0.25, 0.5, 0.75, 1].map(t => {
      const y = (pt + cH * (1 - t)).toFixed(1)
      return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#1c1c1c" stroke-width="1"/>`
    }).join('')

    const defs = `<defs>
      <linearGradient id="gSes" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1D4ED8" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#1D4ED8" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gCon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0D9488" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#0D9488" stop-opacity="0"/>
      </linearGradient>
    </defs>`

    const areas = [
      `<path class="an-anim-area" d="${area(sesData, ys)}" fill="url(#gSes)"/>`,
      `<path class="an-anim-area" d="${area(convData, yc)}" fill="url(#gCon)" style="animation-delay:0.1s"/>`,
    ].join('')

    const lines = [
      `<path class="an-anim-path" d="${line(sesData, ys)}" stroke="#1D4ED8" stroke-width="2" fill="none"/>`,
      `<path class="an-anim-path d2" d="${line(convData, yc)}" stroke="#0D9488" stroke-width="2" fill="none"/>`,
    ].join('')

    const dots = [
      ...sesData.map((v, i) =>
        `<circle cx="${xi(i).toFixed(1)}" cy="${ys(v).toFixed(1)}" r="3.5" fill="#1D4ED8" style="animation:dotPop 0.2s ease ${(1.3 + i * 0.05).toFixed(2)}s both; opacity:0"/>`),
      ...convData.map((v, i) =>
        `<circle cx="${xi(i).toFixed(1)}" cy="${yc(v).toFixed(1)}" r="3.5" fill="#0D9488" style="animation:dotPop 0.2s ease ${(1.4 + i * 0.05).toFixed(2)}s both; opacity:0"/>`),
    ].join('')

    const maxVal = Math.max(...sesData, 1)
    const yLabels = [fmt(maxVal), fmt(maxVal * 0.75), fmt(maxVal * 0.5), fmt(maxVal * 0.25), '0']
    const xLabels = daily.map(d => fmtDate(d.date))

    return {
      paths: defs + gridY + areas + lines + dots,
      yLabels,
      xLabels,
    }
  }, [daily])

  useEffect(() => {
    if (svgRef.current && paths) {
      svgRef.current.innerHTML = paths
    }
  }, [paths])

  return (
    <>
      <div className="an-chart-outer">
        <div className="an-y-labels">
          {yLabels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <svg
          ref={svgRef}
          className="an-chart-svg"
          viewBox="0 0 860 210"
          preserveAspectRatio="none"
        />
      </div>
      <div className="an-x-labels">
        {xLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </>
  )
}

// ── Tool Distribution Panel ───────────────────────────────────────────────────

const TOOL_COLORS: Record<string, string> = {
  'Edit': 'blue', 'Multi-Edit': 'teal', 'Write': 'green', 'NotebookEdit': 'amber',
}

function ToolPanel({ tools }: { tools: ToolAggregate[] }) {
  const total = tools.reduce((s, t) => s + t.accepted + t.rejected, 0) || 1

  return (
    <>
      {tools.map((t, i) => {
        const pct = Math.round(((t.accepted + t.rejected) / total) * 100)
        const cls = TOOL_COLORS[t.tool] ?? 'amber'
        return (
          <div className="an-model-row" key={t.tool}>
            <div className="an-mname">{t.tool}</div>
            <div className="an-bar-track">
              <div
                className={`an-bar-fill ${cls}`}
                style={{ width: `${pct}%`, animationDelay: `${0.8 + i * 0.15}s` }}
              />
            </div>
            <div className="an-mpct">{pct}%</div>
          </div>
        )
      })}
      {tools.length === 0 && <div className="an-dv" style={{ fontSize: '0.68rem' }}>No tool data</div>}
    </>
  )
}

// ── Top Contributors ──────────────────────────────────────────────────────────

const DOT_COLORS = ['blue', 'teal', 'green', 'amber', 'red']

function ContribPanel({ users }: { users: UserAggregate[] }) {
  const top = [...users]
    .sort((a, b) => (b.linesAdded + b.linesRemoved) - (a.linesAdded + a.linesRemoved))
    .slice(0, 5)
  const maxLines = Math.max(...top.map(u => u.linesAdded + u.linesRemoved), 1)

  return (
    <>
      {top.map((u, i) => (
        <div className="an-task-row" key={u.name}>
          <div className="an-task-left">
            <div className={`an-dot ${DOT_COLORS[i % DOT_COLORS.length]}`} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              {u.name}
            </span>
          </div>
          <div className="an-task-right">
            <span className="an-task-n">{fmt(u.linesAdded + u.linesRemoved)}</span>
            <span className="an-task-p">{Math.round(((u.linesAdded + u.linesRemoved) / maxLines) * 100)}%</span>
          </div>
        </div>
      ))}
      {top.length === 0 && <div className="an-dv" style={{ fontSize: '0.68rem' }}>No user data</div>}
    </>
  )
}

// ── Acceptance rate color ─────────────────────────────────────────────────────

function rateClass(r: number): string {
  if (r === 0) return 'an-dv'
  if (r >= 90) return 'an-bv'
  if (r >= 75) return 'an-av'
  return 'an-rv'
}

// ── Users table ───────────────────────────────────────────────────────────────

function UsersTable({ users }: { users: UserAggregate[] }) {
  const sorted = [...users].sort((a, b) => (b.linesAdded + b.linesRemoved) - (a.linesAdded + a.linesRemoved))
  const cols = '1fr 100px 100px 180px 100px 100px 120px'

  return (
    <div className="an-table-wrap">
      <div className="an-table-top">
        <div className="an-table-title">
          Developer Summary <span className="an-cursor" />
        </div>
        <div className="an-count">{users.length} developers</div>
      </div>
      <div className="an-th" style={{ gridTemplateColumns: cols }}>
        <span>User</span>
        <span>Sessions</span>
        <span>Commits</span>
        <span>Lines +/− ↓</span>
        <span>Chats</span>
        <span>Searches</span>
        <span>Accept %</span>
      </div>
      {sorted.map((u, i) => (
        <div
          className="an-td"
          key={u.name}
          style={{ gridTemplateColumns: cols, animationDelay: `${0.5 + i * 0.04}s` }}
        >
          <span className="an-uid" style={{ fontStyle: 'normal', color: 'var(--text)' }}>{u.name}</span>
          <span className="an-tv">{u.sessions.toLocaleString()}</span>
          <span className="an-tv">{u.commits.toLocaleString()}</span>
          <span>
            <span className="an-gv">+{fmt(u.linesAdded)}</span>
            <span className="an-dv"> / </span>
            <span className="an-rv">−{fmt(u.linesRemoved)}</span>
          </span>
          <span className="an-tv">{u.conversations.toLocaleString()}</span>
          <span className="an-dv">{u.webSearches.toLocaleString()}</span>
          <span className={rateClass(u.acceptanceRate)}>
            {u.acceptanceRate > 0 ? `${u.acceptanceRate.toFixed(0)}%` : '—'}
          </span>
        </div>
      ))}
      {users.length === 0 && (
        <div style={{ padding: '32px 24px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          No user data available.
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const {
    range,
    fetch: fetchData,
    loading, error,
    daily, users, tools, projects,
    fetchedAt, dataDateRange,
  } = useAnalyticsStore()

  useEffect(() => { fetchData() }, [fetchData])

  const stats = useMemo(() => {
    const totalSessions     = daily.reduce((s, d) => s + d.sessions, 0)
    const totalCommits      = daily.reduce((s, d) => s + d.commits, 0)
    const totalConversations = daily.reduce((s, d) => s + d.conversations, 0)
    const totalAccepted     = daily.reduce((s, d) => s + d.toolAccepted, 0)
    const totalRejected     = daily.reduce((s, d) => s + d.toolRejected, 0)
    const totalLinesAdded   = daily.reduce((s, d) => s + d.linesAdded, 0)
    const totalLinesRemoved = daily.reduce((s, d) => s + d.linesRemoved, 0)
    const peakDAU           = daily.length ? Math.max(...daily.map(d => d.activeUsers)) : 0
    const totalPRs          = daily.reduce((s, d) => s + d.pullRequests, 0)
    const totalSearches     = daily.reduce((s, d) => s + d.webSearches, 0)

    const acceptRate = totalAccepted + totalRejected > 0
      ? ((totalAccepted / (totalAccepted + totalRejected)) * 100).toFixed(1)
      : null

    return {
      totalSessions, totalCommits, totalConversations,
      totalLinesAdded, totalLinesRemoved,
      peakDAU, totalPRs, totalSearches, acceptRate,
    }
  }, [daily])

  return (
    <div>
      <div className="an-page-header">
        <div className="an-page-title">Claude Code Usage</div>
        <div className="an-page-sub">
          {dataDateRange
            ? `${fmtDate(dataDateRange.start)} – ${fmtDate(dataDateRange.end)}`
            : 'Organization-wide metrics'}
          {fetchedAt && (
            <span style={{ marginLeft: 12, color: 'var(--text-dim)' }}>
              · Up to date as of {new Date(fetchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {error && <div className="an-error">{error}</div>}

      {loading ? (
        <div className="an-loading">
          <div className="an-spinner" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="an-kpi-row">
            <div className="an-kpi">
              <div className="an-kpi-label">Code Sessions</div>
              <div className="an-kpi-value blue">{fmt(stats.totalSessions)}</div>
              <div className="an-kpi-sub">Peak DAU {stats.peakDAU}</div>
            </div>
            <div className="an-kpi">
              <div className="an-kpi-label">Commits</div>
              <div className="an-kpi-value">{fmt(stats.totalCommits)}</div>
              <div className="an-kpi-sub">{stats.totalPRs} pull requests</div>
            </div>
            <div className="an-kpi">
              <div className="an-kpi-label">Lines Changed</div>
              <div className="an-kpi-value teal">
                {fmt(stats.totalLinesAdded + stats.totalLinesRemoved)}
              </div>
              <div className="an-kpi-sub">
                +{fmt(stats.totalLinesAdded)} / −{fmt(stats.totalLinesRemoved)}
              </div>
            </div>
            <div className="an-kpi">
              <div className="an-kpi-label">Tool Acceptance</div>
              <div className="an-kpi-value green">{stats.acceptRate ?? '—'}{stats.acceptRate ? '%' : ''}</div>
              <div className="an-kpi-sub">{fmt(stats.totalConversations)} conversations</div>
            </div>
          </div>

          {/* Main grid: chart + right panels */}
          <div className="an-main-grid">
            <div className="an-panel">
              <div className="an-panel-title">
                Sessions &amp; Conversations — {range} Timeline
                <span className="an-ptag">Daily</span>
              </div>
              {daily.length > 0 ? (
                <>
                  <TimelineChart daily={daily} />
                  <div className="an-chart-legend">
                    <div className="an-legend-item">
                      <div className="an-legend-line" style={{ background: 'var(--blue)' }} />
                      Code sessions
                    </div>
                    <div className="an-legend-item">
                      <div className="an-legend-line" style={{ background: 'var(--teal)' }} />
                      Chat conversations
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', padding: '40px 0' }}>
                  No daily data for this range.
                </div>
              )}
            </div>

            <div className="an-right-panels">
              <div className="an-r-section">
                <div className="an-panel-title">Tool Usage</div>
                <ToolPanel tools={tools} />
              </div>
              <div className="an-r-section">
                <div className="an-panel-title">Top Contributors by Lines</div>
                <ContribPanel users={users} />
              </div>
            </div>
          </div>

          {/* Users table */}
          <UsersTable users={users} />

          {/* Projects row if present */}
          {projects.length > 0 && (
            <div className="an-table-wrap" style={{ marginBottom: 28 }}>
              <div className="an-table-top">
                <div className="an-table-title">Projects</div>
                <div className="an-count">{projects.length} projects</div>
              </div>
              <div className="an-th" style={{ gridTemplateColumns: '1fr 80px 100px 80px' }}>
                <span>Project</span><span>Users</span><span>Conversations</span><span>Messages</span>
              </div>
              {projects.slice(0, 8).map((p, i) => (
                <div
                  className="an-td"
                  key={p.name}
                  style={{ gridTemplateColumns: '1fr 80px 100px 80px', animationDelay: `${0.7 + i * 0.07}s` }}
                >
                  <span className="an-uid">{p.name}</span>
                  <span className="an-tv">{p.users}</span>
                  <span className="an-tv">{p.conversations}</span>
                  <span className="an-dv">{p.messages}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="an-footer">
            <div>Claude Code Analytics — <span className="hi">POC Build</span></div>
            <div>
              {dataDateRange && (
                <>{fmtDate(dataDateRange.start)} – {fmtDate(dataDateRange.end)}</>
              )}
            </div>
            <div>
              {fetchedAt ? <>Fetched <span className="hi">{fmtTs(fetchedAt)}</span></> : 'No data'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
