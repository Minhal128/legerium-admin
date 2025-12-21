import { useState, useEffect } from 'react'
import { MoreHorizontal, Search, Filter, Download, Ticket, CheckCircle, Clock, Timer, Loader2, MessageSquare, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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


interface Ticket {
  _id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  walletId?: string;
  createdAt: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  responses?: Array<{
    message: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
}

interface TicketStats {
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  totalTickets: number;
}

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats>({
    openTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    totalTickets: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await api.get<any>('/admin/tickets')
      if (response.success && response.data?.tickets) {
        setTickets(response.data.tickets)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get<any>('/admin/stats/tickets')
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch ticket stats:', error)
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await api.put(`/admin/tickets/${ticketId}`, { status })
      fetchTickets()
      fetchStats()
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const handleRespond = async () => {
    if (!selectedTicket || !responseMessage.trim()) return
    
    setResponding(true)
    try {
      await api.post(`/admin/tickets/${selectedTicket._id}/respond`, { 
        message: responseMessage 
      })
      setResponseMessage('')
      setSelectedTicket(null)
      fetchTickets()
    } catch (error) {
      console.error('Failed to respond to ticket:', error)
    } finally {
      setResponding(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const statsCards = [
    { title: 'Open tickets', value: stats.openTickets.toString(), icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Resolved tickets', value: stats.resolvedTickets.toString(), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending response', value: stats.pendingTickets.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Total tickets', value: stats.totalTickets.toString(), icon: Timer, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Support</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage support tickets and FAQs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.title}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tickets Table */}
      <Card className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Tickets</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="pl-8 sm:pl-9 w-full text-xs sm:text-sm h-9 sm:h-10" 
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-9 sm:h-10">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-9 sm:h-10">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Export</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-2 sm:-mx-4 md:-mx-6">
          <div className="min-w-[900px] sm:min-w-[1000px] px-2 sm:px-4 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Ticket ID</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Subject</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">User</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Category</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">Priority</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">Date</TableHead>
                  <TableHead className="px-2 sm:px-4 text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell className="px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                        #{ticket._id.slice(-6)}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 text-xs sm:text-sm truncate max-w-[120px]">
                        {ticket.subject}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell truncate max-w-[120px]">
                        {ticket.user?.email || 'Unknown'}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 text-xs sm:text-sm capitalize">
                        {ticket.category}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                        <Badge 
                          variant={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' : 'secondary'}
                          className={
                            ticket.priority === 'high' || ticket.priority === 'urgent'
                              ? 'bg-red-100 text-red-600 border-0 font-normal text-xs'
                              : 'bg-gray-100 text-gray-600 border-0 font-normal text-xs'
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <Badge 
                          variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'open' ? 'default' : 'secondary'}
                          className={
                            ticket.status === 'resolved' 
                              ? 'bg-[#B3E7D7] text-[#06AE7A] border-0 font-normal text-xs' 
                              : ticket.status === 'open'
                              ? 'bg-blue-100 text-blue-600 border-0 font-normal text-xs'
                              : 'bg-orange-100 text-orange-600 border-0 font-normal text-xs'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          {ticket.status === 'open' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                              className="h-7 px-2 text-xs sm:text-sm sm:h-8 sm:px-3"
                            >
                              Resolve
                            </Button>
                          )}
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

      {/* Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 md:p-6">
          <Card className="w-full max-w-full sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base sm:text-lg">Ticket #{selectedTicket._id.slice(-6)}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setSelectedTicket(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500 text-xs sm:text-sm">Subject</Label>
                <p className="font-medium text-sm sm:text-base">{selectedTicket.subject}</p>
              </div>
              
              <div>
                <Label className="text-gray-500 text-xs sm:text-sm">Message</Label>
                <p className="text-gray-700 text-sm sm:text-base">{selectedTicket.message}</p>
              </div>
              
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div>
                  <Label className="text-gray-500 text-xs sm:text-sm mb-2 block">Previous Responses</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTicket.responses.map((response, idx) => (
                      <div key={idx} className={`p-2 sm:p-3 rounded-lg ${response.isAdmin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-xs sm:text-sm">{response.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {response.isAdmin ? 'Admin' : 'User'} • {formatDate(response.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="response" className="text-xs sm:text-sm">Your Response</Label>
                <textarea
                  id="response"
                  className="w-full mt-1 p-2 sm:p-3 rounded-lg border border-gray-200 min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                  placeholder="Type your response..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 bg-[#06AE7A] hover:bg-[#059669] text-xs sm:text-sm h-9 sm:h-10"
                  onClick={handleRespond}
                  disabled={responding || !responseMessage.trim()}
                >
                  {responding ? 'Sending...' : 'Send Response'}
                </Button>
                <Button
                  variant="outline"
                  className="text-xs sm:text-sm h-9 sm:h-10"
                  onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}