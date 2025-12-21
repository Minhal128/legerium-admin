import { useState, useEffect } from 'react'
import { Wallet, MoreHorizontal, Loader2, Copy, Download, Ban, Eye, TrendingUp } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { truncateAddress, formatCurrency } from '@/lib/utils'
import { api } from '@/services/api'

interface WalletAddress {
  walletId: string;
  userId: string;
  userEmail: string;
  userName: string;
  address: string;
  currency: string;
  network: string;
  isActive: boolean;
  createdAt: string;
}

export function WalletsPage() {
  const [wallets, setWallets] = useState<WalletAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWallets: 0,
    activeWallets: 0,
    inactiveWallets: 0,
    newWallets: 0
  })
  
  // Wallet detail modal state
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [walletDetails, setWalletDetails] = useState<any | null>(null)
  const [walletActivities, setWalletActivities] = useState<any | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all wallets from admin endpoint and stats in parallel
        const [walletsRes, statsRes] = await Promise.all([
          api.get<any>('/admin/wallets'),
          api.get<any>('/admin/wallets/stats')
        ])
        
        if (walletsRes.success && walletsRes.data?.wallets) {
          setWallets(walletsRes.data.wallets)
        }
        
        if (statsRes.success && statsRes.data) {
          setStats({
            totalWallets: statsRes.data.totalWallets || 0,
            activeWallets: statsRes.data.activeWallets || 0,
            inactiveWallets: statsRes.data.inactiveWallets || 0,
            newWallets: statsRes.data.newWallets || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch wallets:', error)
        // Fallback to user wallet endpoint if admin endpoint fails
        try {
          const response = await api.get<any>('/wallet')
          if (response.data && response.data.addresses) {
            const addresses = response.data.addresses.map((addr: any) => ({
              ...addr,
              userEmail: 'Current User',
              userName: 'Current User',
              isActive: addr.isActive !== false
            }))
            setWallets(addresses)
            setStats({
              totalWallets: addresses.length,
              activeWallets: addresses.filter((w: any) => w.isActive).length,
              inactiveWallets: addresses.filter((w: any) => !w.isActive).length,
              newWallets: 0
            })
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch wallet details when opening modal
  const openWalletDetails = async (wallet: WalletAddress) => {
    setSelectedWallet(wallet)
    setWalletDialogOpen(true)
    setLoadingDetails(true)
    
    try {
      const [detailsRes, activitiesRes] = await Promise.all([
        api.get<any>(`/admin/wallets/${wallet.walletId}`),
        api.get<any>(`/admin/wallets/${wallet.walletId}/activities`)
      ])
      
      if (detailsRes.success && detailsRes.data) {
        setWalletDetails(detailsRes.data)
      }
      if (activitiesRes.success && activitiesRes.data) {
        setWalletActivities(activitiesRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch wallet details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Suspend wallet
  const handleSuspendWallet = async (walletId: string, suspend: boolean) => {
    try {
      const res = await api.put<any>(`/admin/wallets/${walletId}/suspend`, { suspend })
      if (res.success) {
        // Update local state
        setWallets(prev => prev.map(w => 
          w.walletId === walletId ? { ...w, isActive: !suspend } : w
        ))
        if (walletDetails) {
          setWalletDetails({ ...walletDetails, wallet: { ...walletDetails.wallet, isActive: !suspend } })
        }
        alert(suspend ? 'Wallet suspended' : 'Wallet activated')
      }
    } catch (error) {
      console.error('Failed to suspend wallet:', error)
      alert('Failed to update wallet status')
    }
  }

  // Export wallet activity
  const handleExportActivity = async (walletId: string, format: 'csv' | 'json') => {
    try {
      const res = await api.get<any>(`/admin/wallets/${walletId}/export?format=${format}`)
      if (format === 'json' && res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wallet_${walletId}_activity.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export wallet activity')
    }
  }

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    alert('Address copied!')
  }

  const statsCards = [
    {
      title: 'Total Wallets created',
      value: stats.totalWallets.toString(),
      change: { value: '+0.0%', isPositive: true },
      description: 'Total generated addresses',
      icon: Wallet,
    },
    {
      title: 'Active wallets',
      value: stats.activeWallets.toString(),
      change: { value: '+0.0%', isPositive: true },
      description: 'Currently active addresses',
      icon: Wallet,
    },
    {
      title: 'Inactive wallets',
      value: stats.inactiveWallets.toString(),
      change: { value: '0.0%', isPositive: true },
      description: 'Suspended or inactive',
      icon: Wallet,
    },
    {
      title: 'New Wallets (30d)',
      value: stats.newWallets.toString(),
      change: { value: '+0.0%', isPositive: true },
      description: 'Created in last 30 days',
      icon: Wallet,
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Wallets</h2>
        <p className="text-xs sm:text-sm text-muted mt-0.5 sm:mt-1">
          Monitor user activity and wallet performance across supported blockchain networks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        
        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No wallets found
            </div>
          ) : (
            wallets.map((wallet, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CryptoIcon symbol={wallet.currency} className="w-5 h-5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {wallet.userEmail || wallet.userName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {truncateAddress(wallet.address, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={wallet.isActive ? 'success' : 'warning'}
                    className="text-xs font-normal"
                  >
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500 mb-0.5">Currency</div>
                    <div className="font-medium">{wallet.currency}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Network</div>
                    <div className={`font-medium ${wallet.network === 'bitcoin' ? 'text-orange-600' : 'text-primary'}`}>
                      {wallet.network || wallet.currency}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => openWalletDetails(wallet)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => copyAddress(wallet.address)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem onClick={() => handleExportActivity(wallet.walletId, 'json')}>
                        <Download className="w-3.5 h-3.5 mr-2" /> Export Activity
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleSuspendWallet(wallet.walletId, wallet.isActive)}
                      >
                        <Ban className="w-3.5 h-3.5 mr-2" /> {wallet.isActive ? 'Suspend' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
                  <TableHead className="text-xs sm:text-sm">Address</TableHead>
                  <TableHead className="text-xs sm:text-sm">User</TableHead>
                  <TableHead className="text-xs sm:text-sm">Currency</TableHead>
                  <TableHead className="text-xs sm:text-sm">Network</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No wallets found
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((wallet, index) => (
                    <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox className="h-4 w-4" />
                      </TableCell>
                      <TableCell 
                        className="font-medium font-mono text-xs sm:text-sm" 
                        onClick={() => openWalletDetails(wallet)}
                      >
                        {truncateAddress(wallet.address)}
                      </TableCell>
                      <TableCell 
                        className="text-xs sm:text-sm text-gray-600" 
                        onClick={() => openWalletDetails(wallet)}
                      >
                        {wallet.userEmail || wallet.userName || 'Unknown'}
                      </TableCell>
                      <TableCell onClick={() => openWalletDetails(wallet)}>
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={wallet.currency} className="w-5 h-5" />
                          <span className="text-xs sm:text-sm">{wallet.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => openWalletDetails(wallet)}>
                        <span className={`text-xs sm:text-sm ${wallet.network === 'bitcoin' ? 'text-orange-600' : 'text-primary'}`}>
                          {wallet.network || wallet.currency}
                        </span>
                      </TableCell>
                      <TableCell onClick={() => openWalletDetails(wallet)}>
                        <Badge
                          variant={wallet.isActive ? 'success' : 'warning'}
                          className="font-normal text-xs px-2 py-0.5"
                        >
                          {wallet.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => openWalletDetails(wallet)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => copyAddress(wallet.address)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => handleExportActivity(wallet.walletId, 'json')}>
                                <Download className="w-3.5 h-3.5 mr-2" /> Export Activity
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleSuspendWallet(wallet.walletId, wallet.isActive)}
                              >
                                <Ban className="w-3.5 h-3.5 mr-2" /> {wallet.isActive ? 'Suspend Wallet' : 'Activate Wallet'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DataTableWrapper>

      {/* Wallet Details Modal */}
      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {loadingDetails ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Wallet Activities</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => copyAddress(selectedWallet?.address || '')}
                  >
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-mono truncate">{selectedWallet?.address || '—'}</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 px-4 sm:px-5 py-3 border-y border-gray-100 bg-gray-50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-base sm:text-lg font-bold text-emerald-600">
                      {walletDetails?.stats?.totalTransactions || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Total Transactions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {formatCurrency(walletDetails?.stats?.transactionVolume || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Transaction volume</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {walletDetails?.stats?.lastActivity 
                        ? new Date(walletDetails.stats.lastActivity).toLocaleDateString('en-US', { weekday: 'short' })
                        : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Last activity</p>
                </div>
              </div>

              {/* Most Used Tokens */}
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Most used tokens</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {(walletDetails?.stats?.mostUsedTokens || [selectedWallet?.currency]).slice(0, 3).map((token: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CryptoIcon symbol={token} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium">{token}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Volume Chart */}
              <div className="px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Transaction volume</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {formatCurrency(walletDetails?.stats?.transactionVolume || 0)}
                </p>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mb-3">
                  <TrendingUp className="w-3 h-3" /> +4.9% vs last quarter
                </p>
                <div className="h-28 sm:h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={walletActivities?.volumeChart || []}>
                      <XAxis 
                        dataKey="_id" 
                        tick={{ fontSize: 10 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value) || 0), 'Volume']}
                        contentStyle={{ 
                          fontSize: 12, 
                          borderRadius: 8,
                          padding: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-5 pb-4 sm:pb-5">
                <Button
                  variant="outline"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => handleExportActivity(selectedWallet?.walletId, 'json')}
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Export Activity
                </Button>
                <Button
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${selectedWallet?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                  onClick={() => handleSuspendWallet(selectedWallet?.walletId, selectedWallet?.isActive)}
                >
                  <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 
                  {selectedWallet?.isActive ? 'Suspend Wallet' : 'Activate Wallet'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}