import { useState, useEffect } from 'react'
import { Coins, MoreHorizontal, Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
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
import { api } from '@/services/api'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface AssetConfig {
  network: {
    smartContract: string
    rpcEndpoints: string[]
    chainId: number | null
    decimals: number
    uptime: number
    latency: number
  }
  swap: {
    enabledDexes: string[]
    slippageTolerance: number
    minSwapAmount: number
    maxSwapAmount: number
  }
}

export function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [assetTab, setAssetTab] = useState<'network' | 'swap'>('network')
  
  // Config state
  const [assetConfig, setAssetConfig] = useState<AssetConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, marketRes] = await Promise.all([
          api.get<any>('/wallet/supported-cryptos'),
          api.get<any>('/market?sortBy=volume')
        ])

        if (assetsRes.data) {
          setAssets(assetsRes.data)
        }

        if (marketRes.data && marketRes.data.pairs) {
          // Process market data for chart (Top 5 by volume)
          const topPairs = marketRes.data.pairs.slice(0, 5).map((pair: any) => ({
            name: pair.symbol.replace('USDT', ''), // Assuming USDT pairs mostly
            volume: parseFloat(pair.volume),
            price: parseFloat(pair.price)
          }))
          setChartData(topPairs)
        }
      } catch (error) {
        console.error('Failed to fetch assets data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch asset config when dialog opens
  const openAssetConfig = async (asset: any) => {
    setSelectedAsset(asset)
    setAssetTab('network')
    setAssetDialogOpen(true)
    setTestResult(null)
    setConfigLoading(true)
    
    try {
      const response = await api.get<any>(`/admin/assets/${asset.symbol}/config`)
      if (response.config) {
        setAssetConfig(response.config)
      } else {
        // Set default config
        setAssetConfig({
          network: {
            smartContract: asset.contractAddress || asset.address || '',
            rpcEndpoints: [],
            chainId: asset.chainId || null,
            decimals: asset.decimals || 18,
            uptime: 100,
            latency: 0
          },
          swap: {
            enabledDexes: ['1inch', 'uniswap'],
            slippageTolerance: 0.5,
            minSwapAmount: 20,
            maxSwapAmount: 12000
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch asset config:', error)
      // Set default config on error
      setAssetConfig({
        network: {
          smartContract: asset.contractAddress || asset.address || '',
          rpcEndpoints: [],
          chainId: asset.chainId || null,
          decimals: asset.decimals || 18,
          uptime: 100,
          latency: 0
        },
        swap: {
          enabledDexes: ['1inch', 'uniswap'],
          slippageTolerance: 0.5,
          minSwapAmount: 20,
          maxSwapAmount: 12000
        }
      })
    } finally {
      setConfigLoading(false)
    }
  }

  // Save config to backend
  const saveConfig = async () => {
    if (!selectedAsset || !assetConfig) return
    
    setSaving(true)
    try {
      await api.put(`/admin/assets/${selectedAsset.symbol}/config`, {
        network: assetConfig.network,
        swap: assetConfig.swap
      })
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  // Test connection
  const testConnection = async () => {
    if (!selectedAsset) return
    
    setTesting(true)
    setTestResult(null)
    try {
      const response = await api.post<any>(`/admin/assets/${selectedAsset.symbol}/test`, {})
      setTestResult({
        status: response.data?.status || 'success',
        message: response.data?.message || 'Connection successful'
      })
    } catch (error) {
      setTestResult({
        status: 'failed',
        message: 'Connection test failed'
      })
    } finally {
      setTesting(false)
    }
  }

  // Toggle DEX
  const toggleDex = (dex: string) => {
    if (!assetConfig) return
    const dexLower = dex.toLowerCase().replace(' ', '')
    const currentDexes = assetConfig.swap.enabledDexes
    if (currentDexes.includes(dexLower)) {
      setAssetConfig({
        ...assetConfig,
        swap: {
          ...assetConfig.swap,
          enabledDexes: currentDexes.filter(d => d !== dexLower)
        }
      })
    } else {
      setAssetConfig({
        ...assetConfig,
        swap: {
          ...assetConfig.swap,
          enabledDexes: [...currentDexes, dexLower]
        }
      })
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="px-4 md:px-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Supported Assets</h2>
        <p className="text-xs md:text-sm text-muted mt-1">
          Manage supported assets, network settings, market data
        </p>
      </div>

      {/* Top Assets Table */}
      <DataTableWrapper className="mx-0 md:mx-0">
        <DataTableHeader
          title={`Top Assets (${assets.length})`}
          icon={<Coins className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />
        <div className="overflow-x-auto -mx-2 md:-mx-4 lg:-mx-6">
          <div className="min-w-[700px] px-2 md:px-4 lg:px-6">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead className="w-10 md:w-12">
                    <Checkbox className="scale-90 md:scale-100" />
                  </TableHead>
                  <TableHead className="px-2 md:px-4">Assets</TableHead>
                  <TableHead className="px-2 md:px-4">Address</TableHead>
                  <TableHead className="px-2 md:px-4 hidden sm:table-cell">Category</TableHead>
                  <TableHead className="px-2 md:px-4 hidden md:table-cell">Decimal</TableHead>
                  <TableHead className="px-2 md:px-4">Network</TableHead>
                  <TableHead className="px-2 md:px-4">Status</TableHead>
                  <TableHead className="px-2 md:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading assets...
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset, index) => (
                    <TableRow 
                      key={asset.symbol ?? index} 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => openAssetConfig(asset)}
                    >
                      <TableCell className="py-3 md:py-4">
                        <Checkbox className="scale-90 md:scale-100" />
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={asset.symbol} className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="font-medium text-sm md:text-base">{asset.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4">
                        <span className="text-xs md:text-sm">
                          {truncateAddress(asset.address || asset.contractAddress || asset.tokenAddress || asset.token?.address || '—')}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4 hidden sm:table-cell">
                        <span className="text-xs md:text-sm">Top</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4 hidden md:table-cell">
                        <span className="text-xs md:text-sm">{asset.decimals}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4">
                        <span className={`text-xs md:text-sm ${asset.network === 'bitcoin' ? 'text-orange-600' : 'text-primary'}`}>
                          {asset.network}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4">
                        <Switch className="scale-75 md:scale-100" defaultChecked={true} />
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-2 md:px-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                          <MoreHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DataTableWrapper>

      {/* Asset Detail Dialog */}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] p-0 overflow-hidden rounded-lg md:rounded-xl">
          {configLoading ? (
            <div className="flex items-center justify-center py-12 md:py-16">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Header with coin icon, symbol, balance and change */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 md:px-5 md:pt-5">
                <div className="flex items-center gap-2 md:gap-3">
                  <CryptoIcon symbol={selectedAsset?.symbol || 'BTC'} className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-base md:text-lg font-semibold text-gray-900">{selectedAsset?.symbol || 'BTC'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm md:text-base font-semibold text-gray-900 truncate max-w-[120px] md:max-w-none">
                    {selectedAsset?.balance ?? '0.0257232'}{selectedAsset?.symbol || 'BTC'}
                  </p>
                  <p className="text-xs text-emerald-500 flex items-center justify-end gap-0.5">
                    <span className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500 text-white text-[7px] md:text-[8px] flex items-center justify-center">↑</span>
                    +1.1%
                  </p>
                </div>
              </div>

              {/* Tab pills */}
              <div className="flex gap-1 md:gap-2 px-4 pb-4 md:px-5">
                <button
                  onClick={() => setAssetTab('network')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${
                    assetTab === 'network'
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Network config
                </button>
                <button
                  onClick={() => setAssetTab('swap')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${
                    assetTab === 'swap'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Swap integration
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-4 md:px-5 md:pb-5 max-h-[60vh] md:max-h-none overflow-y-auto">
                {assetTab === 'network' && assetConfig && (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700">Smart Contract</label>
                      <Input 
                        className="mt-1 text-xs md:text-sm" 
                        placeholder="Contract address" 
                        value={assetConfig.network.smartContract}
                        onChange={(e) => setAssetConfig({
                          ...assetConfig,
                          network: { ...assetConfig.network, smartContract: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700">RPC Endpoints</label>
                      <Input 
                        className="mt-1 text-xs md:text-sm" 
                        placeholder="https://rpc.example.com" 
                        value={assetConfig.network.rpcEndpoints.join(', ')}
                        onChange={(e) => setAssetConfig({
                          ...assetConfig,
                          network: { ...assetConfig.network, rpcEndpoints: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Chain ID</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="1" 
                          type="number"
                          value={assetConfig.network.chainId ?? ''}
                          onChange={(e) => setAssetConfig({
                            ...assetConfig,
                            network: { ...assetConfig.network, chainId: e.target.value ? parseInt(e.target.value) : null }
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Decimals</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="18" 
                          type="number"
                          value={assetConfig.network.decimals}
                          onChange={(e) => setAssetConfig({
                            ...assetConfig,
                            network: { ...assetConfig.network, decimals: parseInt(e.target.value) || 18 }
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Uptime</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="99.9%" 
                          value={`${assetConfig.network.uptime}%`}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Average Latency</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="120ms" 
                          value={`${assetConfig.network.latency}ms`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}

                {assetTab === 'swap' && assetConfig && (
                  <div className="space-y-4 md:space-y-5">
                    {/* DEX Aggregator pills */}
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700">Dex aggregator</label>
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                        {['1inch', 'Uniswap', 'Pancakeswap'].map((dex) => {
                          const dexLower = dex.toLowerCase()
                          const isActive = assetConfig.swap.enabledDexes.includes(dexLower)
                          return (
                            <button
                              key={dex}
                              onClick={() => toggleDex(dex)}
                              className={`px-3 py-1.5 text-xs md:text-sm border rounded-lg transition-colors flex-1 min-w-[70px] md:min-w-0 ${
                                isActive 
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                  : 'border-gray-300 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {dex}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Slippage, Min, Max */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Slippage (%)</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="0.5" 
                          type="number"
                          step="0.1"
                          value={assetConfig.swap.slippageTolerance}
                          onChange={(e) => setAssetConfig({
                            ...assetConfig,
                            swap: { ...assetConfig.swap, slippageTolerance: parseFloat(e.target.value) || 0.5 }
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Min swap ($)</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="20" 
                          type="number"
                          value={assetConfig.swap.minSwapAmount}
                          onChange={(e) => setAssetConfig({
                            ...assetConfig,
                            swap: { ...assetConfig.swap, minSwapAmount: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-700">Max swap ($)</label>
                        <Input 
                          className="mt-1 text-xs md:text-sm" 
                          placeholder="12000" 
                          type="number"
                          value={assetConfig.swap.maxSwapAmount}
                          onChange={(e) => setAssetConfig({
                            ...assetConfig,
                            swap: { ...assetConfig.swap, maxSwapAmount: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Test result message */}
                {testResult && (
                  <div className={`mt-3 md:mt-4 p-2.5 md:p-3 rounded-lg text-xs md:text-sm ${
                    testResult.status === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 px-4 pb-4 md:px-5 md:pb-5">
                <Button
                  variant="outline"
                  className="flex-1 text-xs md:text-sm py-2 h-auto"
                  onClick={saveConfig}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin mr-1.5 md:mr-2" /> : null}
                  Save changes
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm py-2 h-auto"
                  onClick={testConnection}
                  disabled={testing}
                >
                  {testing ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin mr-1.5 md:mr-2" /> : null}
                  Test connection
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Most Traded Assets Chart */}
      <Card className="p-3 md:p-4 lg:p-6 mx-2 md:mx-0">
        <DataTableHeader
          title="Top Traded Assets (24h Volume)"
          icon={<Coins className="w-4 h-4 text-muted" />}
          searchPlaceholder="Search"
        />

        <div className="h-48 sm:h-56 md:h-64 lg:h-80 mt-3 md:mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Volume']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="volume" fill="#2563eb" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                   <Cell key={`cell-${index}`} fill={['#1e3a5f', '#2563eb', '#ef4444', '#64748b', '#c4b5fd'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}