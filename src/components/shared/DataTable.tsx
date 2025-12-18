import { Search, Filter, Download, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface DataTableHeaderProps {
  title: string
  icon?: ReactNode
  searchPlaceholder?: string
  onSearch?: (value: string) => void
}

export function DataTableHeader({
  title,
  icon,
  searchPlaceholder = 'Search',
  onSearch,
}: DataTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 w-full sm:w-64"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

interface DataTableWrapperProps {
  children: ReactNode
  className?: string
}

export function DataTableWrapper({ children, className }: DataTableWrapperProps) {
  return (
    <Card className={className}>
      <div className="p-4 md:p-6">{children}</div>
    </Card>
  )
}
