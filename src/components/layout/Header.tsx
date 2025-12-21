import { useState, useEffect } from 'react'
import { Bell, ChevronDown, Menu, Check, Calendar as CalendarIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authService'
import { api } from '@/services/api'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const user = authService.getCurrentUser()
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'AU'
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin User'
  const [date, setDate] = useState<Date>(new Date())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get<any>('/notifications?limit=5')
      if (response.success && response.data?.notifications) {
        setNotifications(response.data.notifications)
        setUnreadCount(response.data.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {})
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read', {})
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-white px-3 md:px-4 lg:px-6">
      {/* Left side - Menu button and title */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onMenuClick}
          className="flex md:hidden p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Title with responsive sizing */}
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-none">
            {title}
          </h1>
          
          {/* Mobile date display */}
          <div className="md:hidden text-xs text-muted font-normal">
            {format(date, 'MMM dd')}
          </div>
        </div>
      </div>

      {/* Right side - Controls and user */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        {/* Date Picker - Desktop */}
        <div className="hidden sm:flex">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="hidden md:flex items-center gap-2 text-sm h-9 px-3"
              >
                <CalendarIcon className="w-4 h-4 hidden lg:inline" />
                <span>{format(date, 'MMM dd, yyyy')}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile Date Picker */}
        <div className="flex sm:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 p-0"
                aria-label="Select date"
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Dark Mode Toggle */}
        {/* <button
          onClick={toggleDarkMode}
          className="hidden sm:flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          )}
        </button> */}

        {/* Mobile Dark Mode Toggle */}
        {/* <button
          onClick={toggleDarkMode}
          className="flex sm:hidden items-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600" />
          )}
        </button> */}

        {/* Notifications Dropdown - Desktop */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 rounded-full text-[9px] md:text-[10px] text-white flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-semibold text-sm md:text-base">Notifications</span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} unread
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted">
                  No notifications yet
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => !notification.isRead && markAsRead(notification._id)}
                    >
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs md:text-sm ${notification.isRead ? 'text-gray-500' : 'font-medium text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted line-clamp-2 mt-0.5">{notification.message}</p>
                        <p className="text-xs text-muted mt-1.5">
                          {format(new Date(notification.createdAt), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center py-2.5 text-primary hover:text-primary/90" asChild>
                <a href="/notifications" className="text-sm">
                  View all notifications
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Notifications Sheet */}
        <div className="flex sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-4 h-4 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto h-[calc(100%-57px)]">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'font-medium text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted line-clamp-2 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-muted mt-1.5">
                            {format(new Date(notification.createdAt), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="sticky bottom-0 border-t bg-white px-4 py-3">
                  <a
                    href="/notifications"
                    className="block text-center text-sm text-primary hover:text-primary/90 py-2"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Profile Dropdown - Desktop */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="text-xs md:text-sm">{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile" className="w-full cursor-pointer">
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings" className="w-full cursor-pointer">
                  Account Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Mobile User Avatar */}
        <Avatar className="h-7 w-7 md:hidden">
          <AvatarImage src="" alt={displayName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}