import { useState, useEffect } from 'react'
import { Settings, User, Palette, Globe, Database, Bell, ChevronRight, Save, Loader2, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/services/api'
import { useAuth } from '@/services/authService'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const settingsCategories = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'language', icon: Globe, label: 'Language & Region' },
  { id: 'data', icon: Database, label: 'Data Management' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
]

interface AppearanceSettings {
  darkMode: boolean
  compactMode: boolean
  sidebarCollapsed: boolean
}

interface NotificationSettings {
  transactionAlerts: boolean
  priceMovementAlerts: boolean
  securityNotifications: boolean
  marketingEmails: boolean
  pushNotifications: boolean
}

interface LanguageOption {
  code: string
  name: string
}

interface CurrencyOption {
  code: string
  symbol: string
  name: string
}

interface LanguageRegionSettings {
  language: string
  currency: string
  languageOptions: LanguageOption[]
  currencyOptions: CurrencyOption[]
}

export function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Appearance settings state
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    darkMode: false,
    compactMode: false,
    sidebarCollapsed: false
  })
  const [appearanceLoading, setAppearanceLoading] = useState(true)
  const [appearanceSaving, setAppearanceSaving] = useState<string | null>(null)
  
  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    transactionAlerts: true,
    priceMovementAlerts: true,
    securityNotifications: true,
    marketingEmails: false,
    pushNotifications: true
  })
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  
  // Language & Region settings state
  const [languageRegion, setLanguageRegion] = useState<LanguageRegionSettings>({
    language: 'en',
    currency: 'USD',
    languageOptions: [],
    currencyOptions: []
  })
  const [languageRegionLoading, setLanguageRegionLoading] = useState(true)
  const [languageSaving, setLanguageSaving] = useState(false)
  const [currencySaving, setCurrencySaving] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<any>('/settings/profile')
        if (response.data && response.data.data && response.data.data.profile) {
          const profile = response.data.data.profile
          setProfileData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || ''
          })
        } else if (user) {
          // Fallback to auth user data if settings API fails or structure differs
          const nameParts = (user.name || '').split(' ')
          setProfileData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phoneNumber: ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch appearance settings
  useEffect(() => {
    const fetchAppearance = async () => {
      try {
        const response = await api.get<any>('/settings/appearance')
        if (response.data?.data) {
          setAppearance({
            darkMode: response.data.data.darkMode || false,
            compactMode: response.data.data.compactMode || false,
            sidebarCollapsed: response.data.data.sidebarCollapsed || false
          })
        }
      } catch (error) {
        console.error('Failed to fetch appearance settings:', error)
      } finally {
        setAppearanceLoading(false)
      }
    }
    fetchAppearance()
  }, [])

  // Fetch notification settings
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get<any>('/settings/notifications')
        if (response.data?.data) {
          setNotifications({
            transactionAlerts: response.data.data.transactionAlerts ?? true,
            priceMovementAlerts: response.data.data.priceMovementAlerts ?? true,
            securityNotifications: response.data.data.securityNotifications ?? true,
            marketingEmails: response.data.data.marketingEmails ?? false,
            pushNotifications: response.data.data.pushNotifications ?? true
          })
        }
      } catch (error) {
        console.error('Failed to fetch notification settings:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  // Fetch language & region settings
  useEffect(() => {
    const fetchLanguageRegion = async () => {
      try {
        const response = await api.get<any>('/settings/preferences')
        if (response.data?.data) {
          setLanguageRegion({
            language: response.data.data.language?.current || 'en',
            currency: response.data.data.defaultCurrency?.current || 'USD',
            languageOptions: response.data.data.language?.options || [],
            currencyOptions: response.data.data.defaultCurrency?.options || []
          })
        }
      } catch (error) {
        console.error('Failed to fetch language/region settings:', error)
      } finally {
        setLanguageRegionLoading(false)
      }
    }
    fetchLanguageRegion()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [id === 'phone' ? 'phoneNumber' : id]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber
      })
      // Could add toast notification here
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    setLanguageSaving(true)
    try {
      await api.put('/settings/preferences/language', { language: newLanguage })
      setLanguageRegion(prev => ({ ...prev, language: newLanguage }))
    } catch (error) {
      console.error('Failed to update language:', error)
    } finally {
      setLanguageSaving(false)
    }
  }

  // Handle currency change
  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrencySaving(true)
    try {
      await api.put('/settings/preferences/currency', { currency: newCurrency })
      setLanguageRegion(prev => ({ ...prev, currency: newCurrency }))
    } catch (error) {
      console.error('Failed to update currency:', error)
    } finally {
      setCurrencySaving(false)
    }
  }

  // Handle appearance toggle
  const handleAppearanceToggle = async (key: keyof AppearanceSettings) => {
    const newValue = !appearance[key]
    setAppearanceSaving(key)
    
    try {
      await api.put('/settings/appearance', { [key]: newValue })
      setAppearance(prev => ({ ...prev, [key]: newValue }))
      
      // Apply dark mode immediately
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('dark', newValue)
      }
      // Apply compact mode immediately
      if (key === 'compactMode') {
        document.documentElement.classList.toggle('compact', newValue)
      }
    } catch (error) {
      console.error(`Failed to update ${key}:`, error)
    } finally {
      setAppearanceSaving(null)
    }
  }

  // Handle notification toggle
  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newValue = !notifications[key]
    
    try {
      await api.put('/settings/notifications', { [key]: newValue })
      setNotifications(prev => ({ ...prev, [key]: newValue }))
    } catch (error) {
      console.error(`Failed to update ${key}:`, error)
    }
  }

  // Mobile navigation sheet
  const MobileNavSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden w-full justify-start mb-4">
          <Settings className="w-4 h-4 mr-2" />
          Settings Navigation
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-muted mt-1">
            Manage your account settings
          </p>
        </div>
        <nav className="p-4 space-y-1">
          {settingsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveTab(category.id)
                document.querySelector('[data-state="open"]')?.dispatchEvent(new Event('click'))
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === category.id
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <category.icon className="w-5 h-5" />
              {category.label}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header - Mobile optimized */}
      <div className="px-2 md:px-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-xs md:text-sm text-muted mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Mobile Navigation */}
      <MobileNavSheet />

      <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Settings Navigation - Desktop */}
        <Card className="hidden md:block p-4 h-fit">
          <nav className="space-y-1">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === category.id
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
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* Mobile Tabs Navigation */}
          {isMobile && (
            <div className="md:hidden overflow-x-auto">
              <div className="flex space-x-1 pb-2 min-w-max">
                {settingsCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                      activeTab === category.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {(activeTab === 'profile' || !isMobile) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <User className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Profile Information</h3>
              </div>

              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 md:gap-6 mb-6">
                <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-base md:text-lg">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Change Photo
                  </Button>
                </div>
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="firstName" className="text-xs md:text-sm">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profileData.firstName} 
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="lastName" className="text-xs md:text-sm">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profileData.lastName} 
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2 sm:col-span-2">
                      <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email} 
                        disabled 
                        className="bg-gray-50 text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2 sm:col-span-2">
                      <Label htmlFor="phone" className="text-xs md:text-sm">Phone</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phoneNumber} 
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || loading}
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {/* Appearance Settings */}
          {(activeTab === 'appearance' || !isMobile) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Palette className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Appearance</h3>
              </div>

              {appearanceLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Dark Mode</h4>
                      <p className="text-xs md:text-sm text-muted">Switch to dark theme</p>
                    </div>
                    <Switch 
                      checked={appearance.darkMode}
                      onCheckedChange={() => handleAppearanceToggle('darkMode')}
                      disabled={appearanceSaving === 'darkMode'}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Compact Mode</h4>
                      <p className="text-xs md:text-sm text-muted">Reduce spacing and padding</p>
                    </div>
                    <Switch 
                      checked={appearance.compactMode}
                      onCheckedChange={() => handleAppearanceToggle('compactMode')}
                      disabled={appearanceSaving === 'compactMode'}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Sidebar Collapsed</h4>
                      <p className="text-xs md:text-sm text-muted">Keep sidebar collapsed by default</p>
                    </div>
                    <Switch 
                      checked={appearance.sidebarCollapsed}
                      onCheckedChange={() => handleAppearanceToggle('sidebarCollapsed')}
                      disabled={appearanceSaving === 'sidebarCollapsed'}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Language & Region Settings */}
          {(activeTab === 'language' || !isMobile) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Globe className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Language & Region</h3>
              </div>
              
              {languageRegionLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">Language</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {languageRegion.languageOptions.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          disabled={languageSaving}
                          className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            languageRegion.language === lang.code
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } ${languageSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {lang.name}
                          {languageRegion.language === lang.code && (
                            <Check className="w-4 h-4 ml-2 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Currency Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">Display Currency</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {languageRegion.currencyOptions.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => handleCurrencyChange(curr.code)}
                          disabled={currencySaving}
                          className={`relative flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            languageRegion.currency === curr.code
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } ${currencySaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{curr.symbol}</span>
                            <span>{curr.code}</span>
                          </span>
                          {languageRegion.currency === curr.code && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timezone (info only for now) */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">Timezone</Label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </p>
                        <p className="text-xs text-muted">Detected from your browser</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Data Management Settings */}
          {(activeTab === 'data' || !isMobile) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Database className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Data Management</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm md:text-base">Export Data</h4>
                    <p className="text-xs md:text-sm text-muted">Download all your account data</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Export
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm md:text-base">Clear Cache</h4>
                    <p className="text-xs md:text-sm text-muted">Clear local cached data</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Settings */}
          {(activeTab === 'notifications' || !isMobile) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Bell className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Notifications</h3>
              </div>
              
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Transaction Alerts</h4>
                      <p className="text-xs md:text-sm text-muted">Get notified about transactions</p>
                    </div>
                    <Switch 
                      checked={notifications.transactionAlerts}
                      onCheckedChange={() => handleNotificationToggle('transactionAlerts')}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Price Movement Alerts</h4>
                      <p className="text-xs md:text-sm text-muted">Alert on significant price changes</p>
                    </div>
                    <Switch 
                      checked={notifications.priceMovementAlerts}
                      onCheckedChange={() => handleNotificationToggle('priceMovementAlerts')}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Security Notifications</h4>
                      <p className="text-xs md:text-sm text-muted">Important security alerts</p>
                    </div>
                    <Switch 
                      checked={notifications.securityNotifications}
                      onCheckedChange={() => handleNotificationToggle('securityNotifications')}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Marketing Emails</h4>
                      <p className="text-xs md:text-sm text-muted">Receive promotional content</p>
                    </div>
                    <Switch 
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 md:py-3">
                    <div className="pr-4">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Push Notifications</h4>
                      <p className="text-xs md:text-sm text-muted">Enable browser push notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications}
                      onCheckedChange={() => handleNotificationToggle('pushNotifications')}
                      className="scale-90 md:scale-100" 
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Danger Zone - Always visible on desktop, only in profile tab on mobile */}
          {(!isMobile || activeTab === 'profile') && (
            <Card className="p-4 md:p-6 border-red-200">
              <h3 className="font-semibold text-red-600 text-base md:text-lg mb-3 md:mb-4">Danger Zone</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm md:text-base">Delete Account</h4>
                  <p className="text-xs md:text-sm text-muted">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}