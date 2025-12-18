import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  change: {
    value: string
    isPositive: boolean
  }
  description: string
  icon?: LucideIcon
}

export function StatsCard({ title, value, change, description, icon: Icon }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                change.isPositive ? 'text-green-600' : 'text-red-500'
              )}
            >
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change.value}
            </span>
            <span className="text-xs text-muted">vs last quarter</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{description}</span>
      </div>
    </Card>
  )
}
