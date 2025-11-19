import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, Bell, Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { transactionAPI } from '../services/api'
import { addTransaction } from '../store/transactionSlice'

export default function Navbar({ onMenuClick }) {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [dailyExpenseUsed, setDailyExpenseUsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { notifications } = useSelector((state) => state.transactions)
  const { register, handleSubmit, reset, watch } = useForm()
  const dispatch = useDispatch()
  const watchedDate = watch('date')

  const getStoredNotifications = () => {
    const stored = localStorage.getItem('notifications')
    return stored ? JSON.parse(stored) : []
  }

  const addNotification = (message, type = 'info') => {
    const notifications = getStoredNotifications()
    const newNotification = {
      message,
      type,
      timestamp: new Date().toLocaleString(),
      id: Date.now()
    }
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50))) // Keep last 50
    localStorage.removeItem('notificationsViewed') // Show red alert for new notifications
  }

  // Override toast to capture all notifications
  const originalToast = toast
  const captureToast = {
    success: (msg) => { originalToast.success(msg); addNotification(msg, 'success') },
    error: (msg) => { originalToast.error(msg); addNotification(msg, 'error') },
    info: (msg) => { originalToast.info(msg); addNotification(msg, 'info') },
    warning: (msg) => { originalToast.warning(msg); addNotification(msg, 'warning') }
  }

  useEffect(() => {
    checkDailyExpenseUsage()
    
    // Listen for transaction deletion events
    const handleTransactionDeleted = () => {
      checkDailyExpenseUsage(selectedDate)
    }
    
    window.addEventListener('transactionDeleted', handleTransactionDeleted)
    
    return () => {
      window.removeEventListener('transactionDeleted', handleTransactionDeleted)
    }
  }, [])

  useEffect(() => {
    // Re-check daily expense usage when form is opened
    if (showTransactionForm) {
      checkDailyExpenseUsage(selectedDate)
    }
  }, [showTransactionForm, selectedDate])

  useEffect(() => {
    // Update selected date and check usage when date changes in form
    if (watchedDate) {
      setSelectedDate(watchedDate)
      checkDailyExpenseUsage(watchedDate)
    }
  }, [watchedDate])

  const checkDailyExpenseUsage = async (date = null) => {
    try {
      const response = await transactionAPI.checkDailyExpenseUsage(date)
      setDailyExpenseUsed(response.data.used_today)
    } catch (error) {
      console.error('Failed to check daily expense usage')
    }
  }

  const onSubmitTransaction = async (data) => {
    try {
      const response = await transactionAPI.createTransaction({
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
      })
      dispatch(addTransaction(response.data))
      captureToast.success('Transaction added successfully!')
      reset()
      setShowTransactionForm(false)
    } catch (error) {
      captureToast.error('Failed to add transaction')
    }
  }

  const handleDailyExpense = async () => {
    if (dailyExpenseUsed) {
      const dateObj = new Date(selectedDate)
      const isToday = selectedDate === new Date().toISOString().split('T')[0]
      captureToast.error(`Daily expense already used for ${isToday ? 'today' : dateObj.toLocaleDateString()}`)
      return
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (!currentUser.email) {
        toast.error('User not found')
        return
      }
      
      const monthlyData = localStorage.getItem(`monthlyData_${currentUser.email}`)
      if (!monthlyData) {
        captureToast.error('Please set your daily expense amount in Profile settings first')
        return
      }
      
      const data = JSON.parse(monthlyData)
      const targetDate = new Date(selectedDate)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()
      const targetKey = `${targetYear}-${targetMonth}`
      
      const dailyExpenseAmount = data[targetKey]?.daily_expense
      if (!dailyExpenseAmount || dailyExpenseAmount <= 0) {
        captureToast.error('Please set a valid daily expense amount in Profile settings')
        return
      }
      
      const response = await transactionAPI.addDailyExpenseForDate(selectedDate, dailyExpenseAmount)
      
      if (response.data.success) {
        setDailyExpenseUsed(true)
        dispatch(addTransaction(response.data.transaction))
        captureToast.success(`Daily expense of $${dailyExpenseAmount} added for ${targetDate.toLocaleDateString()}!`)
        setShowTransactionForm(false)
      }
    } catch (error) {
      if (error.response?.data?.error) {
        captureToast.error(error.response.data.error)
      } else {
        captureToast.error('Failed to add daily expense')
      }
    }
  }

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications)
              if (!showNotifications) {
                // Mark notifications as viewed
                localStorage.setItem('notificationsViewed', 'true')
              }
            }}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <Bell size={24} />
            {getStoredNotifications().length > 0 && !localStorage.getItem('notificationsViewed') && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getStoredNotifications().length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setShowTransactionForm(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor"/>
              <rect x="2" y="10" width="20" height="2" fill="white"/>
              <rect x="4" y="14" width="4" height="1" fill="white"/>
              <rect x="18" y="14" width="2" height="1" fill="white"/>
            </svg>
          </div>
          Expenso
        </div>
      </nav>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 left-16 bg-white shadow-lg rounded-lg p-4 w-80 z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Notifications</h3>
            <button 
              onClick={() => {
                localStorage.removeItem('notifications')
                setShowNotifications(false)
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          {getStoredNotifications().length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-2">
              {getStoredNotifications().map((notification, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-sm border-l-4 border-blue-400">
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{notification.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button onClick={() => setShowTransactionForm(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitTransaction)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select {...register('transaction_type', { required: true })} className="w-full p-2 border rounded-lg">
                  <option value="expense">Expense</option>
                  <option value="income">Add-On</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  {...register('amount', { required: true })}
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purpose (Optional)</label>
                <input
                  {...register('purpose')}
                  type="text"
                  placeholder="Enter purpose (optional)"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  {...register('date')}
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary">
                  Add Transaction
                </button>
                <button 
                  type="button" 
                  onClick={handleDailyExpense}
                  disabled={dailyExpenseUsed}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    dailyExpenseUsed 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {dailyExpenseUsed ? (
                    selectedDate === new Date().toISOString().split('T')[0] ? 'Used Today' : 'Used for Date'
                  ) : (
                    'Daily Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}