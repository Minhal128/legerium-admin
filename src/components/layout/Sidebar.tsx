import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Wallet,
  Shield,
  Bell,
  HelpCircle,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authService } from '@/services/authService'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Assets', href: '/assets', icon: Coins },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ collapsed, onToggle, isMobile = false }: SidebarProps) {
  const location = useLocation()
  const user = authService.getCurrentUser()
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'AU'
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin User'
  const displayRole = user?.role || 'Admin'

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-border flex flex-col',
        collapsed && !isMobile ? 'w-16' : 'w-full'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-lg text-gray-900">LEGERIUM</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label={isMobile ? "Close menu" : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
        >
          {isMobile ? (
            <X className="w-5 h-5" />
          ) : collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    collapsed && !isMobile && 'justify-center px-2'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {(!collapsed || isMobile) && <span>{item.name}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-3 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors',
                collapsed && !isMobile && 'justify-center'
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-muted truncate">{displayRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => {
                authService.logout()
                window.location.href = '/login'
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
