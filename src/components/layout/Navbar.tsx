import { useAnalyticsStore } from '@/stores/analyticsStore'
import type { TimeRange } from '@/types'

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d',  label: '7 days'  },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
]

export function Navbar() {
  const { range, setRange } = useAnalyticsStore()

  return (
    <header className="an-nav">
      <div className="an-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="an-logo">Claude Code <span className="sep">/</span> Analytics</span>
          <span className="an-tag">POC</span>
        </div>
        <div className="an-nav-right">
          <div className="an-live">
            <div className="an-live-dot" />
            Live
          </div>
          <div className="an-periods">
            {RANGES.map(r => (
              <button
                key={r.value}
                className={`an-period${range === r.value ? ' active' : ''}`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
