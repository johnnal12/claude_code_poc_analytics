import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Leaderboard } from '@/pages/Leaderboard'
import { useAnalyticsStore } from '@/stores/analyticsStore'

function DataLoader({ children }: { children: React.ReactNode }) {
  const fetchData = useAnalyticsStore((s) => s.fetch)
  const fetchedAt = useAnalyticsStore((s) => s.fetchedAt)

  useEffect(() => {
    if (!fetchedAt) fetchData()
  }, [fetchData, fetchedAt])

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <DataLoader>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Layout>
      </DataLoader>
    </BrowserRouter>
  )
}
