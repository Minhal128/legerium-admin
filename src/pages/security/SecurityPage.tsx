import { useState, useEffect } from 'react'
import { Users, Lock, Shield, Bell, ChevronRight, Loader2, Menu, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { api } from '@/services/api'

type TabType = 'rbac' | 'auth' | 'transaction' | 'alerts'

const tabs = [
  { id: 'rbac' as TabType, label: 'Admin Access & Roles (RBAC)', icon: Users },
  { id: 'auth' as TabType, label: 'Authentication controls', icon: Lock },
  { id: 'transaction' as TabType, label: 'Transaction protection', icon: Shield },
  { id: 'alerts' as TabType, label: 'Security alerts', icon: Bell },
]

const roles = [
  { name: 'Admin', control: true, manage: true, edit: true, view: true },
  { name: 'Super Admin', control: true, manage: true, edit: true, view: true },
  { name: 'Manager', control: true, manage: true, edit: false, view: true },
  { name: 'Editor', control: true, manage: true, edit: true, view: true },
]

export function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rbac')
  const [adminAction, setAdminAction] = useState<'invite' | 'remove'>('invite')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Security & Access Control</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Configure access rules, monitor activity, and enforce security best practices.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="lg:hidden h-9 w-9"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar Navigation - Mobile Drawer */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 lg:relative lg:transform-none lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <Card className="h-full rounded-none lg:rounded-lg border-0 lg:border w-full p-4">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-semibold text-gray-900">Navigation</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-[#B3E7D7]/50 text-[#06AE7A]'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <Card className="flex-1 p-4 sm:p-5 md:p-6 min-w-0">
          {activeTab === 'rbac' && <RBACContent adminAction={adminAction} setAdminAction={setAdminAction} />}
          {activeTab === 'auth' && <AuthenticationContent />}
          {activeTab === 'transaction' && <TransactionProtectionContent />}
          {activeTab === 'alerts' && <TransactionProtectionContent />}
        </Card>
      </div>
    </div>
  )
}

function RBACContent({ 
  adminAction, 
  setAdminAction 
}: { 
  adminAction: 'invite' | 'remove'
  setAdminAction: (action: 'invite' | 'remove') => void 
}) {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await api.get<any>('/admin/admins')
      if (response.success && response.data) {
        setAdmins(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteAdmin = async () => {
    if (!email) return
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    
    try {
      await api.post('/admin/admins/invite', { email, role: selectedRole })
      setMessage({ type: 'success', text: 'Admin invited successfully' })
      setEmail('')
      fetchAdmins()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to invite admin' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return
    
    try {
      await api.delete(`/admin/admins/${adminId}`)
      setMessage({ type: 'success', text: 'Admin removed successfully' })
      fetchAdmins()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove admin' })
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Admin Access & roles</h3>
      </div>

      {/* Admin List */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Admin Users</h4>
        {loading ? (
          <div className="flex justify-center py-6 sm:py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 sm:hidden">
            {admins.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No admins found
              </div>
            ) : (
              admins.map((admin) => (
                <Card key={admin._id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {admin.firstName || ''} {admin.lastName || 'Admin'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{admin.email}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 text-xs h-7"
                      onClick={() => handleRemoveAdmin(admin._id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                      {admin.role}
                    </span>
                    <span>ID: #{admin._id.slice(-6)}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Admin</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin._id} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 text-sm text-gray-900">
                        {admin.firstName || ''} {admin.lastName || 'Admin'}
                      </td>
                      <td className="py-4 text-sm text-gray-600">{admin.email}</td>
                      <td className="py-4 text-sm text-gray-600 capitalize">{admin.role}</td>
                      <td className="py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 text-xs"
                          onClick={() => handleRemoveAdmin(admin._id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Roles Table */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Roles & Permissions</h4>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Role</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Control</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Manage</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Edit</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">View</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 sm:py-4 text-sm text-gray-900">{role.name}</td>
                  <td className="py-3 sm:py-4 text-center">
                    <div className="flex justify-center">
                      <Switch defaultChecked={role.control} />
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 text-center">
                    <div className="flex justify-center">
                      <Switch defaultChecked={role.manage} />
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 text-center">
                    <div className="flex justify-center">
                      <Switch defaultChecked={role.edit} />
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 text-center">
                    <div className="flex justify-center">
                      <Switch defaultChecked={role.view} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Admins */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Manage admins</h3>
        </div>

        {message.text && (
          <div className={cn(
            "p-3 rounded-lg text-xs sm:text-sm",
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant={adminAction === 'invite' ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 h-9 sm:h-11 text-xs sm:text-sm',
              adminAction === 'invite' && 'border-gray-300 bg-white'
            )}
            onClick={() => setAdminAction('invite')}
          >
            Invite admin
          </Button>
          <Button
            variant={adminAction === 'remove' ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 h-9 sm:h-11 text-xs sm:text-sm',
              adminAction === 'remove' && 'border-gray-300 bg-white'
            )}
            onClick={() => setAdminAction('remove')}
          >
            Remove
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-gray-700 text-sm sm:text-base">Email address</Label>
            <Input 
              placeholder="admin@example.com" 
              className="h-9 sm:h-11 text-sm sm:text-base" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-gray-700 text-sm sm:text-base">Admin roles</Label>
            <div className="relative">
              <select 
                className="w-full h-9 sm:h-11 px-3 sm:px-4 rounded-lg border border-gray-200 bg-gray-50 text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06AE7A]"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="manager">Manager</option>
              </select>
              <ChevronRight className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 rotate-90" />
            </div>
          </div>

          <Button 
            className="w-full h-9 sm:h-11 bg-[#06AE7A] hover:bg-[#059669] text-xs sm:text-sm sm:text-base"
            onClick={handleInviteAdmin}
            disabled={submitting || !email}
          >
            {submitting ? 'Processing...' : adminAction === 'invite' ? 'Invite Admin' : 'Remove Admin'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function AuthenticationContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Authentication controls</h3>
      </div>

      {/* Settings */}
      <div className="space-y-0">
        {/* 2FA for admin */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">2FA for admin</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Require Two Factor Authentication for admin account</p>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Password policy */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Password policy</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Set minimum password requirements</p>
          </div>
          <button className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 shrink-0">
            <span>Minimum 12 chars</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Auto-lock time out */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Auto-lock time out</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Lock out admin after minutes of inactivity</p>
          </div>
          <button className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 shrink-0">
            <span>5 Minutes</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TransactionProtectionContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Transaction protections</h3>
      </div>

      {/* Settings */}
      <div className="space-y-0">
        {/* Restricted addresses */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Restricted addresses</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Maintain list of restricted/blacklisted addresses</p>
          </div>
          <button className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 shrink-0">
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Transaction Velocity Limit */}
        <div className="py-3 sm:py-4 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Transaction Velocity Limit</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Set max transaction limits within specific time window</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
            <span className="text-xs sm:text-sm text-gray-600">Max transaction</span>
            <Input defaultValue="20" className="w-14 sm:w-16 h-8 sm:h-9 text-xs sm:text-sm text-center" />
            <span className="text-xs sm:text-sm text-gray-600">Time</span>
            <Input defaultValue="20 Mins" className="w-20 sm:w-24 h-8 sm:h-9 text-xs sm:text-sm text-center" />
          </div>
        </div>

        {/* High-Risk Transaction Filters */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">High-Risk Transaction Filters</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Automatically flag/block transactions with scam addresses</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  )
}