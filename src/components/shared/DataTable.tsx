import { useState } from 'react'
import { Search, Filter, Download, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReactNode } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface DataTableHeaderProps {
  title: string
  icon?: ReactNode
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onFilter?: (filters: Record<string, string>) => void
  onExport?: (format: 'csv' | 'json' | 'pdf') => void
  filterOptions?: {
    status?: FilterOption[]
    type?: FilterOption[]
    dateRange?: FilterOption[]
  }
  data?: any[]
  exportFileName?: string
}

export function DataTableHeader({
  title,
  icon,
  searchPlaceholder = 'Search',
  onSearch,
  onFilter,
  onExport,
  filterOptions,
  data = [],
  exportFileName = 'export',
}: DataTableHeaderProps) {
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    const active = Object.entries(filters)
      .filter(([_, value]) => value && value !== 'all')
      .map(([key]) => key)
    setActiveFilters(active)
    onFilter?.(filters)
    setShowFilterDialog(false)
  }

  const clearFilters = () => {
    setFilters({})
    setActiveFilters([])
    onFilter?.({})
    setShowFilterDialog(false)
  }

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExport) {
      onExport(format)
      return
    }

    // Default export implementation
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `${exportFileName}.json`)
    } else if (format === 'csv') {
      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `${exportFileName}.csv`)
    } else if (format === 'pdf') {
      // For PDF, we'd typically use a library like jsPDF
      // For now, show a message
      alert('PDF export requires additional setup. Please use CSV or JSON.')
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle nested objects and arrays
        if (typeof value === 'object') return JSON.stringify(value)
        // Escape quotes and wrap in quotes if contains comma
        const str = String(value ?? '')
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    )
    return [headers.join(','), ...rows].join('\n')
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
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
          
          {/* Filter Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowFilterDialog(true)}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilters.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                JSON (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Data</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down the results
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {filterOptions?.status && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={filters.status || 'all'} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions.status.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filterOptions?.type && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.type.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filterOptions?.dateRange && (
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select 
                  value={filters.dateRange || 'all'} 
                  onValueChange={(value) => handleFilterChange('dateRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {filterOptions.dateRange.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!filterOptions?.status && !filterOptions?.type && !filterOptions?.dateRange && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={filters.status || 'all'} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select 
                    value={filters.dateRange || 'all'} 
                    onValueChange={(value) => handleFilterChange('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
