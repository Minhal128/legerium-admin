import { useEffect, useState } from 'react'
import { Wallet, DollarSign, TrendingUp, ArrowUpDown, MoreHorizontal, Loader2, Filter, Download, FileText, FileJson, File } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/shared/StatsCard'
import { DataTableHeader, DataTableWrapper } from '@/components/shared/DataTable'
import { CryptoIcon } from '@/components/shared/CryptoIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { truncateAddress } from '@/lib/utils'
import { api } from '@/services/api'

// Helper to group transactions by day for the chart
const processChartData = (transactions: any[]) => {
  const days: Record<string, { day: string, value: number }> = {}
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    days[dateStr] = { day: dateStr, value: 0 }
  }

  transactions.forEach(tx => {
    const d = new Date(tx.createdAt)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (days[dateStr]) {
      // Summing up amount for volume. Note: This mixes currencies which isn't ideal but provides a visual
      days[dateStr].value += Number(tx.amount) || 0
    }
  })

  return Object.values(days)
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [activitySummary, setActivitySummary] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [allActivities, setAllActivities] = useState<any[]>([])
  
  // Chart filter states
  const [chartFilterOpen, setChartFilterOpen] = useState(false)
  const [chartType, setChartType] = useState('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data, activity summary, and activities for chart in parallel
        const [dashboardRes, summaryRes, activitiesRes] = await Promise.all([
          api.get<any>('/dashboard'),
          api.get<any>('/activities/summary?period=30d'),
          api.get<any>('/activities?limit=50')
        ])
        
        setDashboardData(dashboardRes.data)
        setActivitySummary(summaryRes.data)
        
        if (activitiesRes.data && activitiesRes.data.activities) {
          setAllActivities(activitiesRes.data.activities)
          setChartData(processChartData(activitiesRes.data.activities))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter chart data based on selected filters
  const applyChartFilters = () => {
    let filtered = [...allActivities]
    
    // Filter by type
    if (chartType !== 'all') {
      filtered = filtered.filter(tx => tx.type?.toLowerCase() === chartType.toLowerCase())
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= dateRange.from!)
    }
    if (dateRange.to) {
      filtered = filtered.filter(tx => new Date(tx.createdAt) <= dateRange.to!)
    }
    
    setChartData(processChartData(filtered))
    setChartFilterOpen(false)
  }

  // Export chart data
  const exportChartData = (format: 'csv' | 'json' | 'pdf') => {
    const dataToExport = chartData
    
    if (format === 'csv') {
      const headers = ['Date', 'Volume']
      const rows = dataToExport.map(d => [d.day, d.value])
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadBlob(csvContent, 'chart-data.csv', 'text/csv')
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(dataToExport, null, 2)
      downloadBlob(jsonContent, 'chart-data.json', 'application/json')
    } else if (format === 'pdf') {
      // For PDF, open print dialog with chart data
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Chart Data Export</title></head>
            <body>
              <h1>Transaction Volume Chart Data</h1>
              <table border="1" cellpadding="8" cellspacing="0">
                <thead><tr><th>Date</th><th>Volume</th></tr></thead>
                <tbody>
                  ${dataToExport.map(d => `<tr><td>${d.day}</td><td>$${d.value.toLocaleString()}</td></tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
      </div>
    )
  }

  const totalBalance = dashboardData?.totalBalance || 0
  const portfolioCount = dashboardData?.portfolio?.length || 0
  const totalTxVolume = activitySummary?.summary ? 
    (activitySummary.summary.bought.amount + activitySummary.summary.sold.amount + activitySummary.summary.swapped.amount + activitySummary.summary.sent.amount + activitySummary.summary.received.amount) 
    : 0
  const totalTxCount = activitySummary?.totalTransactions || 0

  const statsCards = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toLocaleString()}`,
      change: { value: '+0.0%', isPositive: true },
      description: 'Total Portfolio Value',
      icon: DollarSign,
    },
    {
      title: 'Active Assets',
      value: portfolioCount.toString(),
      change: { value: '0', isPositive: true },
      description: 'Assets in wallet',
      icon: Wallet,
    },
    {
      title: 'Total Volume (30d)',
      value: `$${totalTxVolume.toLocaleString()}`,
      change: { value: '+0.0%', isPositive: true },
      description: 'Transaction Volume',
      icon: TrendingUp,
    },
    {
      title: 'Total Transactions',
      value: totalTxCount.toString(),
      change: { value: '+0.0%', isPositive: true },
      description: 'In last 30 days',
      icon: ArrowUpDown,
    },
  ]

  const recentTransactions = dashboardData?.recentTransactions || []

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Real time Overview</h2>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Track system uptime, transaction volume, and user activity across supported blockchain networks
        </p>
      </div>

      {/* Transaction Volume Chart */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted" />
            <span className="font-medium text-gray-700 text-sm sm:text-base">Transaction Volume Over time</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-8 sm:h-9"
              onClick={() => setChartFilterOpen(true)}
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Filter</span>
              {(chartType !== 'all' || dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8 sm:h-9">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => exportChartData('csv')} className="text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartData('json')} className="text-xs sm:text-sm">
                  <FileJson className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartData('pdf')} className="text-xs sm:text-sm">
                  <File className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">${totalTxVolume.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="success" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.0%
            </Badge>
            <span className="text-xs sm:text-sm text-muted">vs last 30 days</span>
          </div>
        </div>

        <div className="h-48 sm:h-56 md:h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06AE7A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06AE7A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${value/1000000}M`;
                  if (value >= 1000) return `$${value/1000}k`;
                  return `$${value}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'white', fontSize: '12px' }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Daily transaction']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#06AE7A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Transactions */}
      <DataTableWrapper className="overflow-hidden">
        <DataTableHeader
          title="Recent Transactions"
          icon={<ArrowUpDown className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />
        <div className="overflow-x-auto -mx-2 sm:-mx-4 md:-mx-6">
          <div className="min-w-[900px] sm:min-w-[1000px] px-2 sm:px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 px-2 sm:px-4">
                    <Checkbox className="h-4 w-4" />
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Transaction ID</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Type</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Assets</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">From</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">To</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">Network chain</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Time</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="px-2 sm:px-4">
                      <Checkbox className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 font-medium text-xs sm:text-sm">
                      {truncateAddress(tx.transactionId || tx._id, window.innerWidth < 640 ? 4 : 8)}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={tx.currency} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{tx.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 text-xs sm:text-sm">
                      {tx.amount} {tx.currency}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 text-primary text-xs sm:text-sm hidden sm:table-cell">
                      {tx.fromAddress ? truncateAddress(tx.fromAddress, window.innerWidth < 768 ? 4 : 8) : '-'}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 text-primary text-xs sm:text-sm hidden md:table-cell">
                      {tx.toAddress ? truncateAddress(tx.toAddress, window.innerWidth < 768 ? 4 : 8) : '-'}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">
                      {tx.network || '-'}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Badge variant="success" className="text-xs whitespace-nowrap">{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DataTableWrapper>

      {/* Chart Filter Dialog */}
      <Dialog open={chartFilterOpen} onOpenChange={setChartFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Filter Chart Data</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Send</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                  <SelectItem value="swap">Swap</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span className="text-muted-foreground">Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange as { from: Date; to: Date }}
                    onSelect={(range) => {
                      setDateRange(range || {})
                    }}
                    numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setChartType('all')
                setDateRange({})
                setChartData(processChartData(allActivities))
                setChartFilterOpen(false)
              }}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button onClick={applyChartFilters} className="w-full sm:w-auto">Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}