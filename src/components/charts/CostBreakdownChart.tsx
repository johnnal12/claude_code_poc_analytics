import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import type { DailyAggregate } from '@/types'

interface Props {
  data: DailyAggregate[]
}

const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)',
  border: '1px solid var(--tooltip-border)',
  color: 'var(--tooltip-text)',
  borderRadius: '0.75rem',
  fontSize: '0.8rem',
  padding: '8px 12px',
}

export function ActiveUsersChart({ data }: Props) {
  return (
    <Card title="Daily Active Users">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/60 dark:stroke-gray-800/60" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              className="text-gray-400"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v + 'T00:00:00')
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
            />
            <YAxis tick={{ fontSize: 11 }} className="text-gray-400" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v: string) => new Date(v + 'T00:00:00').toLocaleDateString()}
              formatter={(value: number) => [value, 'Active Users']}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#dauGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
