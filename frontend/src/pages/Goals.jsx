import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Target, Award, Trophy } from 'lucide-react'
import { goalAPI, transactionAPI } from '../services/api'
import { setMonthlyGoal, setChallenges, setUserChallenges, setRewardPoints } from '../store/goalSlice'

export default function Goals() {
  const [showGoalForm, setShowGoalForm] = useState(false)
  const { monthlyGoal, challenges, userChallenges, rewardPoints } = useSelector((state) => state.goals)
  const { user } = useSelector((state) => state.auth)
  const { register, handleSubmit, reset } = useForm()
  const dispatch = useDispatch()
  const [monthlyGoals, setMonthlyGoals] = useState({})
  const [userPoints, setUserPoints] = useState(0)
  const [currentSpending, setCurrentSpending] = useState(0)

  useEffect(() => {
    loadMonthlyGoals()
    loadUserPoints()
    updateCurrentSpending()
    checkAndAwardPoints()
    
    // Listen for transaction changes
    const handleTransactionChange = () => {
      updateCurrentSpending()
    }
    
    window.addEventListener('transactionAdded', handleTransactionChange)
    window.addEventListener('transactionDeleted', handleTransactionChange)
    
    return () => {
      window.removeEventListener('transactionAdded', handleTransactionChange)
      window.removeEventListener('transactionDeleted', handleTransactionChange)
    }
  }, [user])

  const fetchCurrentMonthSpending = async () => {
    if (!user?.email) return
    
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      // Get monthly statistics which includes current spending
      const response = await goalAPI.getSavingsGoals() // This should be replaced with actual monthly spending API
      
      // Update monthly data with current spending
      const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${user.email}`) || '{}')
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
      
      const updatedData = {
        ...monthlyData,
        [monthKey]: {
          ...monthlyData[monthKey],
          current_spending: response.data?.current_spending || getCurrentCurrentSpending()
        }
      }
      
      localStorage.setItem(`monthlyData_${user.email}`, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Failed to fetch current spending')
    }
  }

  const loadMonthlyGoals = () => {
    if (!user?.email) return
    const goals = JSON.parse(localStorage.getItem(`monthlyGoals_${user.email}`) || '{}')
    setMonthlyGoals(goals)
  }

  const loadUserPoints = () => {
    if (!user?.email) return
    const points = parseInt(localStorage.getItem(`userPoints_${user.email}`) || '0')
    setUserPoints(points)
  }

  const getCurrentMonthGoal = () => {
    const currentDate = new Date()
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
    return monthlyGoals[monthKey] || { target: 0, current: 0 }
  }

  const updateCurrentSpending = async () => {
    if (!user?.email) return
    
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      // Get monthly statistics from API
      const response = await transactionAPI.getMonthlyStatistics(year, month, 0)
      const totalSpending = response.data.total_expenses || 0
      
      setCurrentSpending(totalSpending)
      
      // Update localStorage
      const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${user.email}`) || '{}')
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
      const updatedData = {
        ...monthlyData,
        [monthKey]: {
          ...monthlyData[monthKey],
          current_spending: totalSpending
        }
      }
      localStorage.setItem(`monthlyData_${user.email}`, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Failed to fetch monthly spending:', error)
      // Fallback to 0 if API fails
      setCurrentSpending(0)
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

  const checkAndAwardPoints = () => {
    if (!user?.email || getCurrentMonthGoal().target === 0) return
    
    const today = new Date().toDateString()
    const lastCheck = localStorage.getItem(`lastPointCheck_${user.email}`)
    
    if (lastCheck === today) return // Already checked today
    
    const currentDate = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const dayOfMonth = currentDate.getDate()
    
    const dailyBudget = getCurrentMonthGoal().target / daysInMonth
    const expectedSpendingToday = dailyBudget * dayOfMonth
    
    // Check if goal exceeded and notify
    if (currentSpending > getCurrentMonthGoal().target) {
      const exceededAmount = currentSpending - getCurrentMonthGoal().target
      addNotification(`⚠️ Monthly spending goal exceeded by $${exceededAmount.toFixed(2)}`, 'error')
    }
    
    if (currentSpending <= expectedSpendingToday) {
      // Award points based on streak
      const streakDays = parseInt(localStorage.getItem(`streakDays_${user.email}`) || '0') + 1
      let pointsToAdd = 0
      
      if (streakDays === 1) pointsToAdd = 5
      else if (streakDays === 7) pointsToAdd = 10
      else if (streakDays >= daysInMonth) pointsToAdd = 50
      
      if (pointsToAdd > 0) {
        const currentPoints = parseInt(localStorage.getItem(`userPoints_${user.email}`) || '0')
        const newPoints = currentPoints + pointsToAdd
        localStorage.setItem(`userPoints_${user.email}`, newPoints.toString())
        setUserPoints(newPoints)
        addNotification(`🎉 Earned ${pointsToAdd} points for ${streakDays}-day streak!`, 'success')
      }
      
      localStorage.setItem(`streakDays_${user.email}`, streakDays.toString())
    } else {
      localStorage.setItem(`streakDays_${user.email}`, '0')
    }
    
    localStorage.setItem(`lastPointCheck_${user.email}`, today)
  }

  const onSubmitGoal = async (data) => {
    try {
      const response = await goalAPI.createSavingsGoal(data)
      dispatch(setMonthlyGoal(response.data))
      toast.success('Monthly goal set successfully!')
      reset()
      setShowGoalForm(false)
    } catch (error) {
      toast.error('Failed to set goal')
    }
  }

  const goalProgress = monthlyGoal ? (monthlyGoal.current_amount / monthlyGoal.target_amount) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Goals & Challenges</h1>
        <div className="flex items-center gap-2 text-yellow-600">
          <Trophy size={24} />
          <span className="text-xl font-bold">{userPoints} Points</span>
        </div>
      </div>

      {/* Set Monthly Spending Goal */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-blue-600" />
          Monthly Spending Goal
        </h2>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Enter monthly spending limit"
            className="flex-1 p-2 border rounded-lg"
            id="monthlyGoalInput"
            disabled={getCurrentMonthGoal().target > 0}
          />
          <button
            onClick={() => {
              const input = document.getElementById('monthlyGoalInput')
              const amount = parseFloat(input.value)
              if (amount > 0) {
                const currentDate = new Date()
                const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
                
                // Get current month spending to adjust goal if set mid-month
                const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${user.email}`) || '{}')
                const currentSpending = monthlyData[monthKey]?.current_spending || 0
                
                const newGoals = { 
                  ...monthlyGoals, 
                  [monthKey]: { 
                    target: amount, 
                    current: currentSpending,
                    setDate: new Date().toISOString()
                  } 
                }
                setMonthlyGoals(newGoals)
                localStorage.setItem(`monthlyGoals_${user.email}`, JSON.stringify(newGoals))
                input.value = ''
                toast.success('Monthly spending goal set successfully!')
                addNotification('Monthly spending goal set successfully', 'success')
              }
            }}
            className="btn-primary"
            disabled={getCurrentMonthGoal().target > 0}
          >
            {getCurrentMonthGoal().target > 0 ? 'Goal Set' : 'Set Goal'}
          </button>
          {getCurrentMonthGoal().target > 0 && (
            <button
              onClick={() => {
                const currentDate = new Date()
                const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
                
                // Deduct points earned from this goal
                const currentPoints = parseInt(localStorage.getItem(`userPoints_${user.email}`) || '0')
                const goalPoints = 50 // Points for monthly goal completion
                const newPoints = Math.max(0, currentPoints - goalPoints)
                localStorage.setItem(`userPoints_${user.email}`, newPoints.toString())
                setUserPoints(newPoints)
                
                const newGoals = { ...monthlyGoals }
                delete newGoals[monthKey]
                setMonthlyGoals(newGoals)
                localStorage.setItem(`monthlyGoals_${user.email}`, JSON.stringify(newGoals))
                toast.success('Monthly spending goal deleted!')
                addNotification('Monthly spending goal deleted and points deducted', 'success')
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
        {getCurrentMonthGoal().target > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Spent: ${currentSpending.toFixed(2)} / ${getCurrentMonthGoal().target}</span>
              <span>{((currentSpending / getCurrentMonthGoal().target) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  (currentSpending / getCurrentMonthGoal().target) > 1 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((currentSpending / getCurrentMonthGoal().target) * 100, 100)}%` }}
              />
            </div>
            {(currentSpending / getCurrentMonthGoal().target) > 1 && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ Monthly goal exceeded by ${(currentSpending - getCurrentMonthGoal().target).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Set Monthly Goal</h2>
            <form onSubmit={handleSubmit(onSubmitGoal)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  placeholder="e.g., Emergency Fund"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                <input
                  {...register('target_amount', { required: true })}
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary">Set Goal</button>
                <button 
                  type="button" 
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenges */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="text-yellow-600" />
          Monthly Challenges
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium">1-Day Streak</div>
              <div className="text-sm text-gray-600">Follow daily budget for 1 day after setting goal</div>
            </div>
            <div className="text-blue-600 font-bold">+5 pts</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <div>
              <div className="font-medium">7-Day Streak</div>
              <div className="text-sm text-gray-600">Follow daily recommendation for 7 days</div>
            </div>
            <div className="text-yellow-600 font-bold">+10 pts</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-medium">Monthly Budget</div>
              <div className="text-sm text-gray-600">Stay within monthly spending goal</div>
            </div>
            <div className="text-green-600 font-bold">+50 pts</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium">3-Month Streak</div>
              <div className="text-sm text-gray-600">Complete 3 consecutive monthly goals</div>
            </div>
            <div className="text-purple-600 font-bold">+100 pts</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <span className="font-medium text-blue-800">Your Points: {userPoints}</span>
          </div>
        </div>
      </div>
    </div>
  )
}