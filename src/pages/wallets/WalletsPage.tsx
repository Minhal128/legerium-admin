import { Wallet, MoreHorizontal } from 'lucide-react'
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

const walletDirectory = [
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'BTC', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'SOL', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'ETH', totalTransactions: 18, status: 'Suspended', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'BTC', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'ETH', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'BTC', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
  { address: '0x5f...a92x680r', dateCreated: '23-10-2025', network: 'BTC', totalTransactions: 18, status: 'Active', lastActivity: '20-10-2025' },
]

const statsCards = [
  {
    title: 'Total Wallets created',
    value: '1002',
    change: { value: '+0.2%', isPositive: true },
    description: 'Slightly higher than average',
    icon: Wallet,
  },
  {
    title: 'Active wallets',
    value: '1000',
    change: { value: '-1.9%', isPositive: false },
    description: 'Below average',
    icon: Wallet,
  },
  {
    title: 'Inactive wallets',
    value: '14',
    change: { value: '+1.1%', isPositive: true },
    description: 'Slightly higher than average',
    icon: Wallet,
  },
  {
    title: 'New wallets',
    value: '$12,000,000',
    change: { value: '+2.0%', isPositive: true },
    description: 'Slightly higher than average',
    icon: Wallet,
  },
]

export function WalletsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Wallets</h2>
        <p className="text-sm text-muted mt-1">
          Monitor user activity and wallet performance across supported blockchain networks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Wallet Directory Table */}
      <DataTableWrapper>
        <DataTableHeader
          title="Wallet directory"
          icon={<Wallet className="w-4 h-4 text-muted" />}
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
                  <TableHead>Address</TableHead>
                  <TableHead>Date created</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Total transactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletDirectory.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">{truncateAddress(wallet.address)}</TableCell>
                    <TableCell>{wallet.dateCreated}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={wallet.network} className="w-6 h-6" />
                        <span>{wallet.network}</span>
                      </div>
                    </TableCell>
                    <TableCell>{wallet.totalTransactions}</TableCell>
                    <TableCell>
                      <Badge
                        variant={wallet.status === 'Active' ? 'success' : 'warning'}
                        className="font-normal"
                      >
                        {wallet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{wallet.lastActivity}</TableCell>
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
