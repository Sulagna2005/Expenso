import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { transactionAPI } from '../services/api'

export default function History() {
  const [currentMonthStats, setCurrentMonthStats] = useState({})
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState([])
  const [monthlyStats, setMonthlyStats] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [isRegularUser, setIsRegularUser] = useState(false)

  useEffect(() => {
    // Clear any localStorage data that might interfere with user-specific data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (currentUser.email) {
      // Only proceed if we have a valid user
      fetchCurrentMonthData()
      checkUserActivity()
    }
  }, [])

  useEffect(() => {
    if (isRegularUser) {
      fetchMonthlyStats()
    }
  }, [isRegularUser])

  const checkUserActivity = async () => {
    try {
      const response = await transactionAPI.checkUserActivity()
      setIsRegularUser(response.data.is_regular_user)
    } catch (error) {
      console.error('Failed to check user activity')
      setIsRegularUser(false)
    }
  }

  const getMonthlyIncomeFromProfile = (year, month) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!currentUser.email) return 0
    
    const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${currentUser.email}`) || '{}')
    const monthKey = `${year}-${month - 1}`
    return monthlyData[monthKey]?.monthly_income || 0
  }

  const getMonthlyIncomeFromAPI = async (year, month) => {
    try {
      // First try to get from profile data
      const profileIncome = getMonthlyIncomeFromProfile(year, month)
      if (profileIncome > 0) return profileIncome
      
      // Fallback to API
      const response = await transactionAPI.getMonthlyIncome(year, month)
      return response.data.monthly_income || 0
    } catch (error) {
      return getMonthlyIncomeFromProfile(year, month)
    }
  }

  const fetchCurrentMonthData = async () => {
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const monthlyIncome = await getMonthlyIncomeFromAPI(year, month)
      
      const response = await transactionAPI.getMonthlyStatistics(year, month, monthlyIncome)
      setCurrentMonthStats(response.data)
      setCurrentMonthTransactions(response.data.transactions)
    } catch (error) {
      console.error('Failed to fetch current month data')
    }
  }

  const fetchMonthlyStats = async () => {
    try {
      const stats = []
      const currentDate = new Date()
      
      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        if (date <= currentDate) {
          try {
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const monthlyIncome = await getMonthlyIncomeFromAPI(year, month)
            
            const response = await transactionAPI.getMonthlyStatistics(year, month, monthlyIncome)
            stats.push({
              ...response.data,
              year: year,
              month: month,
              monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            })
          } catch (error) {
            // Month with no data
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const monthlyIncome = await getMonthlyIncomeFromAPI(year, month)
            
            stats.push({
              monthly_income: monthlyIncome,
              total_transactions: 0,
              total_addon: 0,
              total_expenses: 0,
              month_balance: monthlyIncome,
              year: year,
              month: month,
              monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              transactions: []
            })
          }
        }
      }
      setMonthlyStats(stats.filter(stat => stat.year !== currentDate.getFullYear() || stat.month !== currentDate.getMonth() + 1))
    } catch (error) {
      console.error('Failed to fetch monthly stats')
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

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return

    try {
      await transactionAPI.deleteTransaction(transactionId)
      toast.success('Transaction deleted successfully!')
      addNotification('Transaction deleted successfully', 'success')
      
      if (selectedMonth) {
        fetchMonthTransactions(selectedMonth.year, selectedMonth.month)
      } else {
        fetchCurrentMonthData()
      }
      
      // Trigger a custom event to notify Navbar to refresh daily expense status
      window.dispatchEvent(new CustomEvent('transactionDeleted'))
    } catch (error) {
      toast.error('Failed to delete transaction')
      addNotification('Failed to delete transaction', 'error')
    }
  }

  const fetchMonthTransactions = async (year, month) => {
    try {
      const monthlyIncome = await getMonthlyIncomeFromAPI(year, month)
      const response = await transactionAPI.getMonthlyStatistics(year, month, monthlyIncome)
      setSelectedTransactions(response.data.transactions)
    } catch (error) {
      console.error('Failed to fetch month transactions')
    }
  }

  const handleMonthClick = (monthData) => {
    setSelectedMonth(monthData)
    fetchMonthTransactions(monthData.year, monthData.month)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const TransactionList = ({ transactions, showDelete = false }) => (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              transaction.transaction_type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.transaction_type === 'income' ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowDownLeft size={20} />
              )}
            </div>
            <div>
              <div className="font-medium">{transaction.purpose}</div>
              <div className="text-sm text-gray-600">
                {formatDate(transaction.date)} at {formatTime(transaction.created_at)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`text-lg font-semibold ${
              transaction.transaction_type === 'income' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {transaction.transaction_type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
            </div>
            {showDelete && (
              <button
                onClick={() => handleDeleteTransaction(transaction.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction History</h1>

      {/* Current Month Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{currentMonthStats.total_transactions || 0}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${(currentMonthStats.total_addon || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Transaction Income</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">${(currentMonthStats.total_expenses || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">${(currentMonthStats.current_balance || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Current Balance</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Current Month Transactions</h3>
        {currentMonthTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions this month</div>
        ) : (
          <TransactionList transactions={currentMonthTransactions} showDelete={true} />
        )}
      </div>

      {/* Previous Months */}
      {isRegularUser ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Previous Months</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyStats.map((monthData, index) => (
              <div 
                key={index}
                onClick={() => handleMonthClick(monthData)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold mb-3">{monthData.monthName}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-medium">{monthData.total_transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Income:</span>
                    <span className="font-medium text-green-600">${(monthData.total_addon || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-medium text-red-600">${(monthData.total_expenses || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Current Balance:</span>
                    <span className="font-bold text-purple-600">${(monthData.current_balance || 0).toFixed(2)}</span>
                  </div>
                  {monthData.goal_exceeded && (
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>Goal Exceeded:</span>
                      <span className="font-bold">+${monthData.exceeded_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Previous Months</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Keep using Expenso regularly to see your transaction history!</p>
            <p className="text-sm mt-2">Previous months will appear here once you have more transaction activity.</p>
          </div>
        </div>
      )}

      {/* Selected Month Transactions */}
      {selectedMonth && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedMonth.monthName} Transactions</h2>
            <button 
              onClick={() => setSelectedMonth(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          {selectedTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <TransactionList transactions={selectedTransactions} />
          )}
        </div>
      )}
    </div>
  )
}