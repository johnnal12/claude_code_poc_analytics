import { useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
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
    <DataLoader>
      <Layout>
        <Dashboard />
      </Layout>
    </DataLoader>
  )
}
