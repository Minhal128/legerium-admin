import { useState, useEffect } from 'react'
import { Bell, MoreHorizontal, Search, Filter, Download, Loader2, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/services/api'

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'info' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get<any>('/notifications')
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications)
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) return
    
    setCreating(true)
    try {
      await api.post('/notifications', {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type
      })
      setShowCreateModal(false)
      setNewNotification({ title: '', message: '', type: 'info' })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to create notification:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {})
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

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
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage all in-app and system notifications.
        </p>
      </div>

      {/* Notifications Table */}
      <Card className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Recent Notifications</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="pl-9 w-full text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Export</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button 
                className="bg-[#06AE7A] hover:bg-[#059669] text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Create notification</span>
                <span className="xs:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table - Responsive Cards for Mobile */}
        <div className="block sm:hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No notifications found
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification._id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {notification.title}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 ml-1 shrink-0"
                      onClick={() => handleDelete(notification._id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span>ID: #{notification._id.slice(-6)}</span>
                      <Badge 
                        className={`text-xs px-2 py-0.5 ${
                          notification.read 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-[#B3E7D7] text-[#06AE7A]'
                        }`}
                      >
                        {notification.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                  {!notification.read && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full text-xs h-7"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Table - Desktop View */}
        <div className="hidden sm:block overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[700px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Notification ID</TableHead>
                  <TableHead className="text-sm">Title</TableHead>
                  <TableHead className="text-sm">Message</TableHead>
                  <TableHead className="text-sm">Type</TableHead>
                  <TableHead className="text-sm">Status</TableHead>
                  <TableHead className="text-sm">Date</TableHead>
                  <TableHead className="text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification._id}>
                      <TableCell className="font-medium text-gray-900 text-sm">
                        #{notification._id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-sm">{notification.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{notification.message}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={notification.read ? 'secondary' : 'success'}
                          className={notification.read 
                            ? 'bg-gray-100 text-gray-600 border-0 font-normal text-xs'
                            : 'bg-[#B3E7D7] text-[#06AE7A] border-0 font-normal text-xs'
                          }
                        >
                          {notification.read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(notification.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-500"
                            onClick={() => handleDelete(notification._id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Create Notification</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm sm:text-base">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
                <Input
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm sm:text-base">Type</Label>
                <select
                  id="type"
                  className="w-full h-9 sm:h-10 px-3 rounded-md border border-input bg-background text-sm sm:text-base"
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <Button 
                className="w-full bg-[#06AE7A] hover:bg-[#059669] text-sm sm:text-base h-9 sm:h-10"
                onClick={handleCreateNotification}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Notification'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}