# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React/TypeScript SPA dashboard that visualizes Anthropic Enterprise Analytics API data — Claude Code usage metrics (sessions, lines of code, commits, tool acceptance rates) and chat metrics across an organization.

## Commands

```bash
npm run dev                    # Vite dev server at localhost:5173
npm run build                  # tsc + vite build → dist/
npm run preview                # Serve production build locally
npx tsc --noEmit               # Type-check only (no emit)
```

The dev server requires `CLAUDE_API_KEY` env var:
```bash
CLAUDE_API_KEY=sk-... npm run dev
```

No test framework, linter, or CI pipeline is configured.

## Architecture

### Data Flow

```
Anthropic Enterprise API (/v1/organizations/analytics)
  ↓  Vite proxy rewrites /api/anthropic/* → api.anthropic.com (injects x-api-key header)
  ↓
src/api/client.ts — fetchUsers(), fetchSummaries() + aggregation functions
  ↓
src/stores/analyticsStore.ts — Zustand store (fetch → aggregate → state)
  ↓
src/pages/Dashboard.tsx — renders charts + stats from store
```

### API Client (`src/api/client.ts`)

- `fetchUsers(days)` — fetches per-user activity records by date, paginated, in batches of 5 dates concurrently. Returns `Map<date, UserActivityRecord[]>`.
- `fetchSummaries(days)` — fetches org-wide daily summaries for the date range.
- `aggregateByDay()`, `aggregateByUser()`, `aggregateTools()` — transform raw API data into chart-ready aggregates.
- All date ranges account for a 3-day API data delay.

### Zustand Store (`src/stores/analyticsStore.ts`)

Single store holds `range` (7d/14d/30d), loading/error state, and all aggregated data. `setRange()` triggers a full re-fetch. Theme store (`themeStore.ts`) persists dark mode to localStorage.

### Components

- `pages/Dashboard.tsx` — main page, consumes analytics store, renders summary StatCards + chart components
- `components/charts/` — five Recharts-based visualizations (activity, lines of code, tool acceptance, DAU, top users table)
- `components/ui/` — Card, StatCard (reusable)
- `components/layout/` — Layout wrapper + Navbar with dark mode toggle

### API Types (`src/types/index.ts`)

Mirrors the Anthropic Enterprise Analytics API response shapes (`UserActivityRecord`, `DaySummary`, etc.) plus dashboard-specific aggregated types (`DailyAggregate`, `UserAggregate`, `ToolAggregate`).

## Key Details

- **Path alias:** `@/*` resolves to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- **Styling:** Tailwind CSS with custom `analytics` color palette (blue-based), dark mode via `class` strategy, Inter font
- **No backend:** Pure SPA; the Vite dev proxy handles API auth. Production deployment needs its own proxy or API gateway.
- **No routing:** Single-page dashboard, no React Router
