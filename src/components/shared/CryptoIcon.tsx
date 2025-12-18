import { cn } from '@/lib/utils'

interface CryptoIconProps {
  symbol: string
  className?: string
}

const iconColors: Record<string, { bg: string; text: string }> = {
  BTC: { bg: 'bg-orange-100', text: 'text-orange-600' },
  ETH: { bg: 'bg-blue-100', text: 'text-blue-600' },
  USDC: { bg: 'bg-blue-100', text: 'text-blue-600' },
  SOL: { bg: 'bg-purple-100', text: 'text-purple-600' },
  BNB: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  XRP: { bg: 'bg-gray-100', text: 'text-gray-600' },
  TETHER: { bg: 'bg-green-100', text: 'text-green-600' },
  TRON: { bg: 'bg-red-100', text: 'text-red-600' },
}

export function CryptoIcon({ symbol, className }: CryptoIconProps) {
  const colors = iconColors[symbol.toUpperCase()] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  const initial = symbol.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
        colors.bg,
        colors.text,
        className
      )}
    >
      {initial}
    </div>
  )
}
