import { Bell, MoreHorizontal, Search, Filter, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const notifications = [
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
  { id: '#353782673', title: 'Fees update', message: "We've updated our swap fees  and beg...", recipients: 'Users', status: 'Sent', date: '20-10-2025' },
]

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage all in-app and system notifications.
        </p>
      </div>

      {/* Notifications Table */}
      <Card className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search" className="pl-9 w-full sm:w-48" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button className="bg-[#06AE7A] hover:bg-[#059669]">
              Create notification
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[700px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notification ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-gray-900">{notification.id}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{notification.message}</TableCell>
                    <TableCell>{notification.recipients}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="bg-[#B3E7D7] text-[#06AE7A] border-0 font-normal">
                        {notification.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{notification.date}</TableCell>
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
      </Card>
    </div>
  )
}
