import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Bell, Shield, Palette, Globe, Download, Trash2 } from 'lucide-react'
import { logout, updateProfile } from '../store/authSlice'
import { authAPI } from '../services/api'

export default function Settings() {
  const { user } = useSelector((state) => state.auth)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })
  const [theme, setTheme] = useState('light')
  const [currency, setCurrency] = useState(user?.currency || 'USD')
  const [language, setLanguage] = useState('en')
  const dispatch = useDispatch()

  useEffect(() => {
    loadSettings()
    requestNotificationPermission()
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        addNotification('Browser notifications enabled', 'success')
      }
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNotifications(settings.notifications || notifications)
      setTheme(settings.theme || 'light')
      setLanguage(settings.language || 'en')
    }
    if (user?.currency) {
      setCurrency(user.currency)
    }
  }

  const saveSettings = (newSettings) => {
    const settings = {
      notifications,
      theme,
      language,
      ...newSettings
    }
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }

  const addNotification = (message, type = 'info') => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const newNotification = {
      message,
      type,
      timestamp: new Date().toLocaleString(),
      id: Date.now()
    }
    storedNotifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(storedNotifications.slice(0, 50)))
  }

  const handleNotificationChange = (type) => {
    const newNotifications = {
      ...notifications,
      [type]: !notifications[type]
    }
    setNotifications(newNotifications)
    saveSettings({ notifications: newNotifications })
    toast.success('Notification settings updated')
    addNotification(`${type} notifications ${newNotifications[type] ? 'enabled' : 'disabled'}`, 'success')
  }

  const handleExportData = () => {
    const userData = {
      profile: user,
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      monthlyData: JSON.parse(localStorage.getItem(`monthlyData_${user?.email}`) || '{}'),
      notifications: JSON.parse(localStorage.getItem('notifications') || '[]')
    }
    
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenso-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    toast.success('Data exported successfully!')
    addNotification('Data exported successfully', 'success')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Clear all local data
      localStorage.clear()
      dispatch(logout())
      toast.error('Account data cleared. Please contact support for complete deletion.')
      addNotification('Account deletion initiated', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="text-blue-600" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-600">Receive transaction alerts via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">Receive alerts on your device</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">SMS Notifications</div>
              <div className="text-sm text-gray-600">Receive text message alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="text-purple-600" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select 
              value={theme} 
              onChange={(e) => {
                setTheme(e.target.value)
                saveSettings({ theme: e.target.value })
                toast.success('Theme updated')
                addNotification(`Theme changed to ${e.target.value}`, 'success')
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="text-green-600" />
          Localization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select 
              value={language} 
              onChange={(e) => {
                setLanguage(e.target.value)
                saveSettings({ language: e.target.value })
                toast.success('Language updated')
                addNotification(`Language changed to ${e.target.value}`, 'success')
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <input
              type="text"
              value={`${currency} - Based on registered country: ${user?.country || 'N/A'}`}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Currency is automatically set based on your registered country</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="text-red-600" />
          Security & Privacy
        </h2>
        <div className="space-y-4">
          <button 
            onClick={() => {
              const newPassword = prompt('Enter new password:')
              if (newPassword && newPassword.length >= 6) {
                localStorage.setItem(`userPassword_${user?.email}`, newPassword)
                toast.success('Password updated successfully!')
                addNotification('Password changed successfully', 'success')
              } else if (newPassword) {
                toast.error('Password must be at least 6 characters')
                addNotification('Password change failed - too short', 'error')
              }
            }}
            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Change Password</div>
            <div className="text-sm text-gray-600">Update your account password</div>
          </button>

          <button 
            onClick={() => {
              const twoFAEnabled = localStorage.getItem(`twoFA_${user?.email}`) === 'true'
              if (twoFAEnabled) {
                localStorage.removeItem(`twoFA_${user?.email}`)
                toast.success('Two-factor authentication disabled')
                addNotification('Two-factor authentication disabled', 'success')
              } else {
                localStorage.setItem(`twoFA_${user?.email}`, 'true')
                toast.success('Two-factor authentication enabled')
                addNotification('Two-factor authentication enabled', 'success')
              }
            }}
            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Two-Factor Authentication</div>
            <div className="text-sm text-gray-600">
              {localStorage.getItem(`twoFA_${user?.email}`) === 'true' ? 'Enabled - Click to disable' : 'Disabled - Click to enable'}
            </div>
          </button>

          <button 
            onClick={() => {
              const dataSharing = localStorage.getItem(`dataSharing_${user?.email}`) === 'true'
              if (dataSharing) {
                localStorage.removeItem(`dataSharing_${user?.email}`)
                toast.success('Data sharing disabled')
                addNotification('Data sharing disabled', 'success')
              } else {
                localStorage.setItem(`dataSharing_${user?.email}`, 'true')
                toast.success('Data sharing enabled')
                addNotification('Data sharing enabled', 'success')
              }
            }}
            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Privacy Settings</div>
            <div className="text-sm text-gray-600">
              Data sharing: {localStorage.getItem(`dataSharing_${user?.email}`) === 'true' ? 'Enabled' : 'Disabled'}
            </div>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="text-blue-600" />
          Data Management
        </h2>
        <div className="space-y-4">
          <button 
            onClick={handleExportData}
            className="flex items-center gap-2 btn-primary"
          >
            <Download size={16} />
            Export My Data
          </button>

          <button 
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">About Expenso</h2>
        <div className="space-y-2 text-gray-600">
          <p>Version: 1.0.0</p>
          <p>© 2025 Expenso. All rights reserved.</p>
          <div className="flex gap-4 mt-4">
            <button className="text-blue-600 hover:underline">Terms of Service</button>
            <button className="text-blue-600 hover:underline">Privacy Policy</button>
            <button className="text-blue-600 hover:underline">Support</button>
          </div>
        </div>
      </div>
    </div>
  )
}