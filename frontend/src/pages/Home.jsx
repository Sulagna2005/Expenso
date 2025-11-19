import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CreditCard, TrendingUp, DollarSign, Target, Award, Calendar } from 'lucide-react'
import { transactionAPI } from '../services/api'
import { setBalance, setTodaySpending } from '../store/transactionSlice'

export default function Home() {
  const { user } = useSelector((state) => state.auth)
  const { balance, todaySpending } = useSelector((state) => state.transactions)
  const { monthlyGoal } = useSelector((state) => state.goals)
  const dispatch = useDispatch()
  const [monthlyGoals, setMonthlyGoals] = useState({})
  const [challenges, setChallenges] = useState({})
  const [userPoints, setUserPoints] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await transactionAPI.getDashboard()
        dispatch(setBalance(response.data.current_balance))
        dispatch(setTodaySpending(response.data.today_spending))
        
        // Update current month spending when dashboard loads
        if (response.data.monthly_spending) {
          updateCurrentSpending(response.data.monthly_spending)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data')
      }
    }
    fetchDashboardData()
    loadMonthlyGoals()
    loadChallenges()
    loadUserPoints()
  }, [dispatch, user?.email])

  const loadMonthlyGoals = () => {
    if (!user?.email) return
    const goals = JSON.parse(localStorage.getItem(`monthlyGoals_${user.email}`) || '{}')
    setMonthlyGoals(goals)
  }

  const loadChallenges = () => {
    if (!user?.email) return
    const challenges = JSON.parse(localStorage.getItem(`challenges_${user.email}`) || '{}')
    setChallenges(challenges)
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

  const getDaysInMonth = () => {
    const currentDate = new Date()
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  }

  const getDaysRemaining = () => {
    const currentDate = new Date()
    const daysInMonth = getDaysInMonth()
    return daysInMonth - currentDate.getDate()
  }

  const getCurrentMonthSpending = () => {
    if (!user?.email) return 0
    
    // Get actual monthly spending from localStorage monthly data
    const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${user.email}`) || '{}')
    const currentDate = new Date()
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
    
    // Use stored current spending or calculate from balance
    return monthlyData[monthKey]?.current_spending || Math.abs(todaySpending || 0)
  }

  const updateCurrentSpending = (newSpending) => {
    if (!user?.email) return
    
    const monthlyData = JSON.parse(localStorage.getItem(`monthlyData_${user.email}`) || '{}')
    const currentDate = new Date()
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
    
    const updatedData = {
      ...monthlyData,
      [monthKey]: {
        ...monthlyData[monthKey],
        current_spending: newSpending
      }
    }
    
    localStorage.setItem(`monthlyData_${user.email}`, JSON.stringify(updatedData))
  }

  const currentGoal = getCurrentMonthGoal() || { target: 0, current: 0 }
  const currentSpending = getCurrentMonthSpending() || 0
  const goalProgress = currentGoal.target > 0 ? (currentSpending / currentGoal.target) * 100 : 0
  const daysInMonth = getDaysInMonth()
  const daysRemaining = Math.max(1, getDaysRemaining())
  
  // Daily budget = monthly goal / total days in month
  const dailyBudget = currentGoal.target > 0 ? currentGoal.target / daysInMonth : 0
  
  // Calculate remaining budget for insights
  const remainingBudget = Math.max(0, currentGoal.target - currentSpending)
  const dailyRecommendation = currentGoal.target > 0 ? remainingBudget / daysRemaining : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {user?.full_name || user?.username}!</h1>

      {/* Card UI */}
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-lg aspect-[1.6/1]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={20} />
                <span className="text-sm font-medium">Expenso</span>
              </div>
              <div className="text-xs opacity-80">CARD</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-lg font-mono tracking-wider">**** **** **** 1234</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-80">CARDHOLDER</div>
                  <div className="text-sm font-medium">{user?.full_name?.toUpperCase() || user?.username?.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">BALANCE</div>
                  <div className="text-lg font-bold">${balance?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Spending Goal</div>
              <div className="text-xl font-bold">{goalProgress.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${goalProgress > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Today's Spending</div>
              <div className="text-xl font-bold">${todaySpending?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Daily Budget</div>
              <div className="text-xl font-bold">${dailyBudget.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
        <div className="space-y-3">
          {currentGoal.target > 0 ? (
            <>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  {goalProgress >= 100 
                    ? `⚠️ Monthly goal exceeded by $${(currentSpending - currentGoal.target).toFixed(2)} (${(goalProgress - 100).toFixed(1)}% over)`
                    : `You have $${remainingBudget.toFixed(2)} left in your monthly budget (${(100 - goalProgress).toFixed(1)}% remaining)`
                  }
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  {daysRemaining > 0 
                    ? `Daily recommendation: Spend no more than $${dailyBudget.toFixed(2)} per day to stay within budget`
                    : goalProgress >= 100 
                      ? "⚠️ Budget exceeded! Be careful with spending."
                      : "⏰ Month ending soon! You're within budget!"
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  💡 Tip: {(todaySpending || 0) > dailyRecommendation 
                    ? "You've spent more than your daily budget today. Try to spend less tomorrow!"
                    : "Great job staying within your daily budget!"
                  }
                </p>
              </div>
            </>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">
                📊 Set a monthly spending goal in Goals page to get personalized insights and recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}