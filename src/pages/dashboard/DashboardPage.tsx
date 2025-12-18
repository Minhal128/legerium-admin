import { Users, Wallet, DollarSign, TrendingUp, ArrowUpDown, MoreHorizontal } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { truncateAddress } from '@/lib/utils'

const transactionVolumeData = [
  { day: '1', value: 28000 },
  { day: '2', value: 30000 },
  { day: '3', value: 29000 },
  { day: '4', value: 35000 },
  { day: '5', value: 38000 },
  { day: '6', value: 32000 },
  { day: '7', value: 30000 },
  { day: '8', value: 28000 },
  { day: '9', value: 22000 },
]

const recentTransactions = [
  {
    id: '0x5f...a92x68',
    type: 'Send',
    asset: 'BTC',
    amount: '0.021 BTC',
    from: '0x6b...93e1',
    to: '0x91...e4d7',
    network: 'Ethereum',
    status: 'Successful',
    time: '24 Oct, 25, 12:56PM',
  },
  {
    id: '0x5f...a92x68',
    type: 'Swap',
    asset: 'ETH',
    amount: '0.021 ETH',
    from: '0x6b...93e1',
    to: '0x91...e4d7',
    network: 'Ethereum',
    status: 'Successful',
    time: '24 Oct, 25, 12:56PM',
  },
]

const statsCards = [
  {
    title: 'Daily Active Users',
    value: '123k',
    change: { value: '+0.2%', isPositive: true },
    description: 'Slightly higher than average',
    icon: Users,
  },
  {
    title: 'Total Active wallets',
    value: '10,000',
    change: { value: '-1.9%', isPositive: false },
    description: 'Below average',
    icon: Wallet,
  },
  {
    title: 'Total Transaction',
    value: '$324,971.82',
    change: { value: '+1.1%', isPositive: true },
    description: 'Slightly higher than average',
    icon: DollarSign,
  },
  {
    title: 'Success Rate',
    value: '85%',
    change: { value: '+2.0%', isPositive: true },
    description: 'Slightly higher than average',
    icon: TrendingUp,
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Real time Overview</h2>
        <p className="text-sm text-muted mt-1">
          Track system uptime, transaction volume, and user activity across supported blockchain networks
        </p>
      </div>

      {/* Transaction Volume Chart */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted" />
            <span className="font-medium text-gray-700">Transaction Volume Over time</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">$324,971.82</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +4.9%
            </Badge>
            <span className="text-sm text-muted">vs last quarter</span>
          </div>
        </div>

        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionVolumeData}>
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
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelStyle={{ color: 'white' }}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Transactions */}
      <DataTableWrapper>
        <DataTableHeader
          title="Recent Transactions"
          icon={<ArrowUpDown className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[800px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Network chain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {tx.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={tx.asset} className="w-6 h-6" />
                        {tx.asset}
                      </div>
                    </TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell className="text-primary">{truncateAddress(tx.from)}</TableCell>
                    <TableCell className="text-primary">{truncateAddress(tx.to)}</TableCell>
                    <TableCell>{tx.network}</TableCell>
                    <TableCell>
                      <Badge variant="success">{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{tx.time}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
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
