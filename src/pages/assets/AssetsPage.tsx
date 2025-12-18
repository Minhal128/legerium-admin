import { Coins, MoreHorizontal } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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

const topAssets = [
  { asset: 'BTC', address: '0x5f...a92x68', category: 'Top', decimal: 8, network: 'BTC', enabled: true },
  { asset: 'ETH', address: '0x5f...a92x68', category: 'Top', decimal: 12, network: 'Ethereum', enabled: true },
  { asset: 'USDC', address: '0x5f...a92x68', category: 'Top', decimal: 8, network: 'Ethereum', enabled: true },
  { asset: 'SOL', address: '0x5f...a92x68', category: 'Top', decimal: 16, network: 'Ethereum', enabled: true },
  { asset: 'BNB', address: '0x5f...a92x68', category: 'Top', decimal: 2, network: 'Ethereum', enabled: true },
  { asset: 'XRP', address: '0x5f...a92x68', category: 'Top', decimal: 4, network: 'Ethereum', enabled: true },
  { asset: 'TETHER', address: '0x5f...a92x68', category: 'Top', decimal: 8, network: 'Ethereum', enabled: true },
]

const tradedAssetsData = [
  { date: 'Sept 3', BTC: 25, ETH: 35, TRON: 20, XRP: 15, Others: 10 },
  { date: 'Sept 4', BTC: 30, ETH: 40, TRON: 25, XRP: 18, Others: 12 },
  { date: 'Sept 5', BTC: 22, ETH: 30, TRON: 18, XRP: 12, Others: 8 },
  { date: 'Sept 6', BTC: 28, ETH: 35, TRON: 22, XRP: 16, Others: 10 },
  { date: 'Sept 7', BTC: 20, ETH: 28, TRON: 15, XRP: 10, Others: 6 },
  { date: 'Sept 8', BTC: 18, ETH: 25, TRON: 12, XRP: 8, Others: 5 },
  { date: 'Sept 9', BTC: 32, ETH: 42, TRON: 28, XRP: 20, Others: 14 },
  { date: 'Sept 10', BTC: 35, ETH: 45, TRON: 30, XRP: 22, Others: 16 },
  { date: 'Sept 11', BTC: 40, ETH: 50, TRON: 35, XRP: 25, Others: 18 },
  { date: 'Sept 12', BTC: 45, ETH: 55, TRON: 38, XRP: 28, Others: 20 },
  { date: 'Sept 13', BTC: 55, ETH: 65, TRON: 45, XRP: 35, Others: 25 },
  { date: 'Sept 14', BTC: 50, ETH: 60, TRON: 40, XRP: 30, Others: 22 },
  { date: 'Sept 15', BTC: 48, ETH: 58, TRON: 38, XRP: 28, Others: 20 },
  { date: 'Sept 16', BTC: 42, ETH: 52, TRON: 35, XRP: 25, Others: 18 },
  { date: 'Sept 17', BTC: 38, ETH: 48, TRON: 32, XRP: 22, Others: 15 },
  { date: 'Sept 18', BTC: 35, ETH: 45, TRON: 30, XRP: 20, Others: 12 },
  { date: 'Sept 19', BTC: 40, ETH: 50, TRON: 35, XRP: 25, Others: 18 },
  { date: 'Sept 20', BTC: 45, ETH: 55, TRON: 38, XRP: 28, Others: 20 },
  { date: 'Sept 21', BTC: 50, ETH: 60, TRON: 42, XRP: 32, Others: 22 },
  { date: 'Sept 22', BTC: 48, ETH: 58, TRON: 40, XRP: 30, Others: 20 },
]

export function AssetsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Supported Assets</h2>
        <p className="text-sm text-muted mt-1">
          Manage supported assets, network settings, market data
        </p>
      </div>

      {/* Top Assets Table */}
      <DataTableWrapper>
        <DataTableHeader
          title="Top Assets"
          icon={<Coins className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[700px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Decimal</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAssets.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={asset.asset} className="w-6 h-6" />
                        <span className="font-medium">{asset.asset}</span>
                      </div>
                    </TableCell>
                    <TableCell>{truncateAddress(asset.address)}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{asset.decimal}</TableCell>
                    <TableCell>
                      <span className={asset.network === 'BTC' ? 'text-orange-600' : 'text-primary'}>
                        {asset.network}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch defaultChecked={asset.enabled} />
                    </TableCell>
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

      {/* Most Traded Assets Chart */}
      <Card className="p-4 md:p-6">
        <DataTableHeader
          title="Most traded assets"
          icon={<Coins className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />

        <div className="h-64 md:h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradedAssetsData} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={1}
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
              <Bar dataKey="BTC" stackId="a" fill="#1e3a5f" barSize={24} />
              <Bar dataKey="ETH" stackId="a" fill="#2563eb" />
              <Bar dataKey="TRON" stackId="a" fill="#ef4444" />
              <Bar dataKey="XRP" stackId="a" fill="#64748b" />
              <Bar dataKey="Others" stackId="a" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
