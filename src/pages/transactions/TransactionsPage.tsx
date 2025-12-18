import { ArrowUpDown, MoreHorizontal, ChevronDown } from 'lucide-react'
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

const visitorsData = [
  { day: 'Sept 3', newVisitors: 48, returningVisitors: 25 },
  { day: 'Sept 4', newVisitors: 45, returningVisitors: 20 },
  { day: 'Sept 5', newVisitors: 35, returningVisitors: 28 },
  { day: 'Sept 6', newVisitors: 40, returningVisitors: 22 },
  { day: 'Sept 7', newVisitors: 30, returningVisitors: 18 },
  { day: 'Sept 8', newVisitors: 25, returningVisitors: 15 },
  { day: 'Sept 9', newVisitors: 42, returningVisitors: 28 },
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
    time: '24 Oct, 25, 12:55PM',
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
    title: 'Total Transactions',
    value: '1002',
    change: { value: '+0.2%', isPositive: true },
    description: 'Slightly higher than average',
    icon: ArrowUpDown,
  },
  {
    title: 'Successful Transactions',
    value: '1000',
    change: { value: '-1.9%', isPositive: false },
    description: 'Below average',
    icon: ArrowUpDown,
  },
  {
    title: 'Pending Transactions',
    value: '14',
    change: { value: '+1.1%', isPositive: true },
    description: 'Slightly higher than average',
    icon: ArrowUpDown,
  },
  {
    title: 'Total Transaction Volume',
    value: '$12,000,000',
    change: { value: '+2.0%', isPositive: true },
    description: 'Slightly higher than average',
    icon: ArrowUpDown,
  },
]

export function TransactionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Monitor Every Transaction in Real Time</h2>
        <p className="text-sm text-muted mt-1">
          View, track, and analyze all send, receive, and swap transactions across supported blockchains.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Transactions Table - First Instance */}
      <DataTableWrapper>
        <DataTableHeader
          title="Recent Transactions"
          icon={<ArrowUpDown className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />
      </DataTableWrapper>

      {/* Visitors Chart */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-semibold text-gray-900">NEW AND RETURNING VISITORS</h3>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitorsData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="newVisitors"
                name="Sum of new visitors"
                fill="#06AE7A"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="returningVisitors"
                name="Sum of returning visitors"
                fill="#B3E7D7"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Transactions Table - Second Instance with data */}
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
