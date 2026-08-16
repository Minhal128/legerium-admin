import { useState } from 'react'
import { Users, Lock, Shield, Bell, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Security & Access Control</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure access rules, monitor activity, and enforce security best practices across the platform.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:w-72 shrink-0 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Content Area */}
        <Card className="flex-1 p-6 min-w-0">
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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Admin Access & roles</h3>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-sm font-medium text-gray-600">Roles & permissions</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">Control</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">Manage</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">Edit</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">View</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0">
                <td className="py-4 text-sm text-gray-900">{role.name}</td>
                <td className="py-4 text-center">
                  <div className="flex justify-center">
                    <Switch defaultChecked={role.control} />
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="flex justify-center">
                    <Switch defaultChecked={role.manage} />
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="flex justify-center">
                    <Switch defaultChecked={role.edit} />
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="flex justify-center">
                    <Switch defaultChecked={role.view} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manage Admins */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Manage admins</h3>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant={adminAction === 'invite' ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 h-11',
              adminAction === 'invite' && 'border-gray-300 bg-white'
            )}
            onClick={() => setAdminAction('invite')}
          >
            Invite admin
          </Button>
          <Button
            variant={adminAction === 'remove' ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 h-11',
              adminAction === 'remove' && 'border-gray-300 bg-white'
            )}
            onClick={() => setAdminAction('remove')}
          >
            Remove
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Email address</Label>
            <Input placeholder="" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Admin roles</Label>
            <div className="relative">
              <select className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06AE7A]">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
                <option value="manager">Manager</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>

          <Button className="w-full h-11 bg-[#06AE7A] hover:bg-[#059669]">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

function AuthenticationContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Authentication controls</h3>
      </div>

      {/* Settings */}
      <div className="space-y-0">
        {/* 2FA for admin */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900">2FA for admin</h4>
            <p className="text-sm text-gray-500 mt-0.5">Require a Two Factor Authentication for admin account</p>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Password policy */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900">Password policy</h4>
            <p className="text-sm text-gray-500 mt-0.5">Require a Two Factor Authentication for admin account</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <span>Minimum 12 password</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-lock time out */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h4 className="font-medium text-gray-900">Auto-lock time out</h4>
            <p className="text-sm text-gray-500 mt-0.5">Lock out admin after minute of inactivity</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <span>5 Minutes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TransactionProtectionContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Transaction protections</h3>
      </div>

      {/* Settings */}
      <div className="space-y-0">
        {/* Restricted addresses */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900">Restricted addresses</h4>
            <p className="text-sm text-gray-500 mt-0.5">Maintain a list of restricted or blacklisted addresses</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <span>Manage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Velocity Limit */}
        <div className="py-4 border-b border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900">Transaction Velocity Limit</h4>
            <p className="text-sm text-gray-500 mt-0.5">Set maximum transaction limits within a specific time window</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-sm text-gray-600">Max transaction</span>
            <Input defaultValue="20" className="w-16 h-9 text-center" />
            <span className="text-sm text-gray-600">Time</span>
            <Input defaultValue="20 Mins" className="w-24 h-9 text-center" />
          </div>
        </div>

        {/* High-Risk Transaction Filters */}
        <div className="flex items-center justify-between py-4">
          <div className="pr-4">
            <h4 className="font-medium text-gray-900">High-Risk Transaction Filters</h4>
            <p className="text-sm text-gray-500 mt-0.5">Automatically flag or block transactions interacting with scam addresses in real time.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  )
}
