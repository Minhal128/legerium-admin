import { useEffect, useState } from 'react'
import { ArrowUpDown, MoreHorizontal, ChevronDown, Loader2, Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { StatsCard } from '@/components/shared/StatsCard'
import { DataTableHeader, DataTableWrapper } from '@/components/shared/DataTable'
import { CryptoIcon } from '@/components/shared/CryptoIcon'
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
  const days: Record<string, { date: string, count: number, volume: number }> = {}
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    days[dateStr] = { date: dateStr, count: 0, volume: 0 }
  }

  transactions.forEach(tx => {
    const d = new Date(tx.createdAt)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (days[dateStr]) {
      days[dateStr].count++
      // Simple volume sum (ignoring currency differences for simplicity in this chart)
      days[dateStr].volume += tx.amount 
    }
  })

  return Object.values(days)
}

export function TransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, summaryRes] = await Promise.all([
          api.get<any>('/activities?limit=100'),
          api.get<any>('/activities/summary?period=30d')
        ])
        
        setTransactions(activitiesRes.data.activities)
        setStats(summaryRes.data)
        // initialize chart data based on default period
        const initial = filterAndProcess(activitiesRes.data.activities, period)
        setChartData(initial)
      } catch (error) {
        console.error('Failed to fetch transactions', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper to filter transactions by selected period and process for chart
  const filterAndProcess = (txs: any[], p: string) => {
    const now = new Date()
    let from = new Date()
    if (p === 'today') {
      from.setHours(0,0,0,0)
    } else if (p === 'week') {
      from.setDate(now.getDate() - 6)
      from.setHours(0,0,0,0)
    } else if (p === 'month') {
      from.setMonth(now.getMonth() - 1)
      from.setHours(0,0,0,0)
    } else if (p === 'year') {
      from.setFullYear(now.getFullYear() - 1)
      from.setHours(0,0,0,0)
    }

    const filtered = txs.filter(tx => new Date(tx.createdAt) >= from)
    return processChartData(filtered)
  }

  const onChangePeriod = (p: 'today' | 'week' | 'month' | 'year') => {
    setPeriod(p)
    setChartData(filterAndProcess(transactions, p))
  }

  const exportTransactions = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const content = JSON.stringify(transactions, null, 2)
      downloadBlob(content, 'transactions.json', 'application/json')
    } else {
      // CSV
      const headers = ['id','type','currency','amount','from','to','network','status','createdAt']
      const rows = transactions.map(t => [t._id || '', t.type || '', t.currency || '', t.amount || '', t.fromAddress || '', t.toAddress || '', t.network || '', t.status || '', t.createdAt || ''])
      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
      downloadBlob(csv, 'transactions.csv', 'text/csv')
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

  const totalTransactions = stats?.totalTransactions || 0
  const successfulTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'success').length
  const failedTransactions = transactions.filter(t => t.status === 'failed').length
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length

  const statsCards = [
    {
      title: 'Total Transactions',
      value: totalTransactions.toString(),
      change: { value: '+0.0%', isPositive: true },
      description: 'Total',
      icon: ArrowUpDown,
    },
    {
      title: 'Successful Transactions',
      value: successfulTransactions.toString(),
      change: { value: '0', isPositive: true },
      description: 'Recent success',
      icon: ArrowUpDown,
    },
    {
      title: 'Failed Transactions',
      value: failedTransactions.toString(),
      change: { value: '0', isPositive: false },
      description: 'Recent failed',
      icon: ArrowUpDown,
    },
    {
      title: 'Pending Transactions',
      value: pendingTransactions.toString(),
      change: { value: '0', isPositive: true },
      description: 'Currently processing',
      icon: ArrowUpDown,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transactions</h2>
        <p className="text-xs sm:text-sm text-muted mt-0.5 sm:mt-1">
          Monitor all transactions, swaps, and transfers across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Transaction Activity Chart */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted" />
            <span className="font-medium text-gray-700 text-sm sm:text-base">Transaction Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9">
                  <span className="hidden xs:inline">
                    {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
                  </span>
                  <span className="xs:hidden">
                    {period === 'today' ? 'Today' : period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Year'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChangePeriod('today')}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePeriod('week')}>This Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePeriod('month')}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePeriod('year')}>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                  <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportTransactions('csv')} className="text-xs sm:text-sm">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportTransactions('json')} className="text-xs sm:text-sm">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.reload()} className="text-xs sm:text-sm">
                  Refresh Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="h-56 sm:h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                name="Transactions"
                dataKey="count"
                fill="#06AE7A"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Transactions Table */}
      <DataTableWrapper>
        <DataTableHeader
          title="All Transactions"
          icon={<ArrowUpDown className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search transactions..."
        />
        
        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No transactions found
            </div>
          ) : (
            transactions.map((tx, index) => (
              <Card key={index} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CryptoIcon symbol={tx.currency} className="w-5 h-5" />
                      <span className="font-medium text-gray-900 text-sm">
                        {tx.type} - {tx.amount} {tx.currency}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      ID: {truncateAddress(tx.transactionId || tx._id, 8)}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      tx.status === 'completed' || tx.status === 'success' ? 'success' :
                      tx.status === 'failed' ? 'destructive' : 'default'
                    }
                    className="text-xs capitalize"
                  >
                    {tx.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-gray-500 mb-0.5">From</div>
                    <div className="text-primary truncate">
                      {tx.fromAddress ? truncateAddress(tx.fromAddress, 8) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">To</div>
                    <div className="text-primary truncate">
                      {tx.toAddress ? truncateAddress(tx.toAddress, 8) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Network</div>
                    <div>{tx.network || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Time</div>
                    <div>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[800px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox className="h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Transaction ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">Type</TableHead>
                  <TableHead className="text-xs sm:text-sm">Assets</TableHead>
                  <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">From</TableHead>
                  <TableHead className="text-xs sm:text-sm">To</TableHead>
                  <TableHead className="text-xs sm:text-sm">Network</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Time</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {truncateAddress(tx.transactionId || tx._id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-xs sm:text-sm">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={tx.currency} className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-xs sm:text-sm">{tx.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{tx.amount} {tx.currency}</TableCell>
                    <TableCell className="text-primary text-xs sm:text-sm">
                      {tx.fromAddress ? truncateAddress(tx.fromAddress) : '-'}
                    </TableCell>
                    <TableCell className="text-primary text-xs sm:text-sm">
                      {tx.toAddress ? truncateAddress(tx.toAddress) : '-'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{tx.network || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          tx.status === 'completed' || tx.status === 'success' ? 'success' :
                          tx.status === 'failed' ? 'destructive' : 'default'
                        }
                        className="text-xs px-2 py-0.5"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                      {new Date(tx.createdAt).toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                        <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DataTableWrapper>
    </div>
  )
}

// Update the truncateAddress utility if needed, or add a shorter version for mobile
// In your lib/utils.ts file, you might want to add:
// export function truncateAddress(address: string, chars = 6): string {
//   if (!address) return ''
//   if (address.length <= chars * 2) return address
//   return `${address.slice(0, chars)}...${address.slice(-chars)}`
// }