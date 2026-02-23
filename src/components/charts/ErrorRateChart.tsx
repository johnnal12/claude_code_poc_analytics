import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'
import type { ToolAggregate } from '@/types'

interface Props {
  data: ToolAggregate[]
}

const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)',
  border: '1px solid var(--tooltip-border)',
  color: 'var(--tooltip-text)',
  borderRadius: '0.75rem',
  fontSize: '0.8rem',
  padding: '8px 12px',
}

export function ToolAcceptanceChart({ data }: Props) {
  return (
    <Card title="Tool Acceptance / Rejection">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-warm-200/60 dark:stroke-warm-800/60" vertical={false} />
            <XAxis dataKey="tool" tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="text-stone-400" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              cursor={{ fill: 'var(--tooltip-border)', opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="rejected" name="Rejected" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
