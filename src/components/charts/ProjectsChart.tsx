import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'
import type { ProjectAggregate } from '@/types'

interface Props {
  data: ProjectAggregate[]
}

const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)',
  border: '1px solid var(--tooltip-border)',
  color: 'var(--tooltip-text)',
  borderRadius: '0.75rem',
  fontSize: '0.8rem',
  padding: '8px 12px',
}

export function ProjectsChart({ data }: Props) {
  const top = data.slice(0, 10)

  return (
    <Card title="Top Projects">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/60 dark:stroke-gray-800/60" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="text-gray-400" tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="text-gray-400" tickLine={false} axisLine={false} width={120} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              cursor={{ fill: 'var(--tooltip-border)', opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="conversations" name="Conversations" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            <Bar dataKey="messages" name="Messages" fill="#3b82f6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
