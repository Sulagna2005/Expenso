import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { User, Mail, Phone, DollarSign, Camera, Bell } from 'lucide-react'
import { transactionAPI, authAPI } from '../services/api'
import { updateProfile } from '../store/authSlice'

export default function Profile() {
  const { user } = useSelector((state) => state.auth)
  const [statistics, setStatistics] = useState({
    total_transactions: 0,
    total_income: 0,
    total_expenses: 0,
    current_balance: 0
  })
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [monthlyData, setMonthlyData] = useState({})
  const [showMonthlyNotification, setShowMonthlyNotification] = useState(false)
  const fileInputRef = useRef(null)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const dispatch = useDispatch()

  useEffect(() => {
    loadLocalData()
    fetchProfile()
    checkMonthlyUpdate()
    requestNotificationPermission()
  }, [])

  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      const response = await authAPI.getProfile()
      if (response.data.success) {
        dispatch(updateProfile(response.data.user))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      if (error.response?.status === 401) {
        toast.error('Please login again')
      }
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Fetch statistics after monthly data is loaded
    if (Object.keys(monthlyData).length > 0) {
      fetchStatistics()
    }
  }, [monthlyData])

  useEffect(() => {
    // Only reset with actual user data, not localStorage data
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone: user.phone || '',
      })
    }
  }, [user, reset])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const loadLocalData = () => {
    if (!user?.email) return
    
    const userKey = user.email
    const savedImage = localStorage.getItem(`profileImage_${userKey}`)
    const savedMonthlyData = localStorage.getItem(`monthlyData_${userKey}`)
    const savedProfile = localStorage.getItem(`userProfile_${userKey}`)
    
    if (savedImage) setProfileImage(savedImage)
    if (savedMonthlyData) {
      setMonthlyData(JSON.parse(savedMonthlyData))
    }
    // Remove localStorage profile loading since we fetch from backend
  }

  const checkMonthlyUpdate = () => {
    if (!user?.email) return
    
    const lastUpdate = localStorage.getItem(`lastMonthlyUpdate_${user.email}`)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentKey = `${currentYear}-${currentMonth}`
    
    if (!lastUpdate || lastUpdate !== currentKey) {
      setShowMonthlyNotification(true)
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Monthly Update Required', {
          body: 'Please update your monthly income and expenses for this month.',
          icon: '/favicon.ico'
        })
      }
    }
  }

  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentKey = `${currentYear}-${currentMonth}`
    
    // If current month data doesn't exist, return empty (will use previous month for calculations)
    return monthlyData[currentKey] || null
  }

  const getPreviousMonthData = () => {
    const prevDate = new Date()
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`
    
    return monthlyData[prevKey] || {
      monthly_income: 0,
      estimated_monthly_expense: 0,
      daily_expense: 0
    }
  }

  const getActiveData = () => {
    const current = getCurrentMonthData()
    const previous = getPreviousMonthData()
    
    // Use current month data if it exists, otherwise use previous month
    return current || previous
  }

  const fetchStatistics = async () => {
    try {
      const activeData = getActiveData()
      const currentMonthIncome = activeData?.monthly_income || 0
      
      const response = await transactionAPI.getUserStatistics(currentMonthIncome)
      setStatistics(response.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && user?.email) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        setProfileImage(imageData)
        localStorage.setItem(`profileImage_${user.email}`, imageData)
        toast.success('Profile picture updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    if (user?.email) {
      setProfileImage(null)
      localStorage.removeItem(`profileImage_${user.email}`)
      toast.success('Profile picture removed!')
    }
  }

  const openImageModal = () => {
    if (profileImage) {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.onclick = () => document.body.removeChild(modal)
      
      const img = document.createElement('img')
      img.src = profileImage
      img.className = 'max-w-full max-h-full object-contain'
      
      modal.appendChild(img)
      document.body.appendChild(modal)
    }
  }

  const addNotification = (message, type = 'info') => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const newNotification = {
      message,
      type,
      timestamp: new Date().toLocaleString(),
      id: Date.now()
    }
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50)))
  }

  const onSubmit = async (data) => {
    try {
      setProfileLoading(true)
      const response = await authAPI.updateProfile(data)
      if (response.data.success) {
        dispatch(updateProfile(response.data.user))
        toast.success('Profile updated successfully!')
        addNotification('Profile updated successfully', 'success')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      if (error.response?.status === 401) {
        toast.error('Please login again')
        addNotification('Please login again', 'error')
      } else {
        toast.error('Failed to update profile')
        addNotification('Failed to update profile', 'error')
      }
    } finally {
      setProfileLoading(false)
    }
  }

  const handleMonthlyDataSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    const monthlyIncome = parseFloat(formData.get('monthly_income')) || 0
    const monthlyExpense = parseFloat(formData.get('estimated_monthly_expense')) || 0
    const dailyExpense = parseFloat(formData.get('daily_expense')) || 0
    
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    try {
      await transactionAPI.setMonthlyGoals({
        year: currentYear,
        month: currentMonth,
        monthly_income: monthlyIncome,
        estimated_expenses: monthlyExpense,
        daily_expense: dailyExpense
      })
      
      // Save to localStorage for current month
      const currentKey = `${currentYear}-${currentMonth - 1}`
      const newMonthlyData = {
        ...monthlyData,
        [currentKey]: {
          monthly_income: monthlyIncome,
          estimated_monthly_expense: monthlyExpense,
          daily_expense: dailyExpense,
          updated_at: new Date().toISOString()
        }
      }
      
      if (user?.email) {
        localStorage.setItem(`monthlyData_${user.email}`, JSON.stringify(newMonthlyData))
        localStorage.setItem(`lastMonthlyUpdate_${user.email}`, currentKey)
      }
      
      setMonthlyData(newMonthlyData)
      setShowMonthlyNotification(false)
      
      // Refresh statistics with new monthly data
      fetchStatistics()
      
      toast.success('Monthly goals updated successfully!')
      addNotification('Monthly goals updated successfully', 'success')
    } catch (error) {
      toast.error('Failed to update monthly goals')
      addNotification('Failed to update monthly goals', 'error')
    }
  }

  const currentData = getCurrentMonthData() || {}
  const activeData = getActiveData() || {}

  const getCurrencySymbol = () => {
    const currencySymbols = {
      'USD': '$', 'INR': '₹', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$',
      'EUR': '€', 'JPY': '¥', 'CNY': '¥', 'BRL': 'R$', 'MXN': '$',
      'SGD': 'S$', 'AED': 'د.إ', 'SAR': '﷼', 'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh'
    }
    return currencySymbols[user?.currency] || '$'
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {showMonthlyNotification && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Bell className="text-yellow-600" size={20} />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Monthly Update Required</p>
            <p className="text-yellow-700 text-sm">Please update your monthly income and expenses for this month.</p>
          </div>
          <button 
            onClick={() => setShowMonthlyNotification(false)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="card">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div 
                className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto overflow-hidden cursor-pointer"
                onClick={openImageModal}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-blue-600" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.full_name || user?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            {profileImage && (
              <button
                onClick={removeProfileImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  {...register('full_name', { required: 'Full name is required' })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  value={user?.email || ''}
                  type="email"
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* Income & Expenses */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Income & Expenses</h2>
        
        <form onSubmit={handleMonthlyDataSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Monthly Income
              </label>
              <input
                name="monthly_income"
                type="number"
                step="0.01"
                defaultValue={currentData?.monthly_income || ''}
                placeholder={`${getCurrencySymbol()}${activeData?.monthly_income || '0.00'}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Estimated Monthly Expense
              </label>
              <input
                name="estimated_monthly_expense"
                type="number"
                step="0.01"
                defaultValue={currentData?.estimated_monthly_expense || ''}
                placeholder={`${getCurrencySymbol()}${activeData?.estimated_monthly_expense || '0.00'}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Estimated Daily Expense
              </label>
              <input
                name="daily_expense"
                type="number"
                step="0.01"
                defaultValue={currentData?.daily_expense || ''}
                placeholder={`${getCurrencySymbol()}${activeData?.daily_expense || '0.00'}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Current month: {currentData?.updated_at ? new Date(currentData.updated_at).toLocaleDateString() : 'Not updated'}</p>
              {activeData !== currentData && activeData && currentData && (
                <p className="text-yellow-600">Using previous month's data for calculations</p>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Updating...' : 'Update Monthly Data'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading statistics...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total_transactions || 0}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getCurrencySymbol()}{(statistics.total_income || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Add-On</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{getCurrencySymbol()}{(statistics.total_expenses || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getCurrencySymbol()}{(statistics.current_balance || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current Balance</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}