import { Settings, User, Palette, Globe, Database, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const settingsCategories = [
  { icon: User, label: 'Profile', active: true },
  { icon: Palette, label: 'Appearance', active: false },
  { icon: Globe, label: 'Language & Region', active: false },
  { icon: Database, label: 'Data Management', active: false },
  { icon: Bell, label: 'Notifications', active: false },
]

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-muted mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="p-4 h-fit">
          <nav className="space-y-1">
            {settingsCategories.map((category, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  category.active
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-5 h-5" />
                {category.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-muted" />
              <h3 className="font-semibold text-gray-900">Profile Information</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Dennis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Petter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="dennis@legerium.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+1 234 567 890" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-muted" />
              <h3 className="font-semibold text-gray-900">Appearance</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-muted">Switch to dark theme</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">Compact Mode</h4>
                  <p className="text-sm text-muted">Reduce spacing and padding</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Sidebar Collapsed</h4>
                  <p className="text-sm text-muted">Keep sidebar collapsed by default</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 md:p-6 border-red-200">
            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-muted">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
