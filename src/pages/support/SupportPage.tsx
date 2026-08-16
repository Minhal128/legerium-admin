import { MoreHorizontal, Search, Filter, Download, Ticket, CheckCircle, Clock, Timer } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statsCards = [
  { title: 'Open tickets', value: '1002', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Resolved tickets', value: '340', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { title: 'Pending response', value: '14', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  { title: 'Average Response time', value: '3 Mins', icon: Timer, color: 'text-purple-600', bg: 'bg-purple-100' },
]

const tickets = [
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Resolved', date: '20-10-2025' },
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Open', date: '20-10-2025' },
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Resolved', date: '20-10-2025' },
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Open', date: '20-10-2025' },
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Resolved', date: '20-10-2025' },
  { id: '#353782673', subject: 'Can\'t fund wallet', walletId: '0x3f5c...b2c4', category: 'Funding', priority: 'High', status: 'Open', date: '20-10-2025' },
]

export function SupportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Support</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage support tickets and FAQs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tickets Table */}
      <Card className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Tickets</h3>
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[800px] px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Wallet ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-gray-900">{ticket.id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{ticket.walletId}</TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-red-100 text-red-600 border-0 font-normal">
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={ticket.status === 'Resolved' ? 'success' : 'secondary'}
                        className={ticket.status === 'Resolved' 
                          ? 'bg-[#B3E7D7] text-[#06AE7A] border-0 font-normal' 
                          : 'bg-blue-100 text-blue-600 border-0 font-normal'
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.date}</TableCell>
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
