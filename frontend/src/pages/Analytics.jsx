import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, Target, Lightbulb } from 'lucide-react'
import { analyticsAPI } from '../services/api'

export default function Analytics() {
  const [spendingData, setSpendingData] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [spendingRes, recommendationsRes] = await Promise.all([
          analyticsAPI.getSpending(),
          analyticsAPI.getRecommendations()
        ])
        
        setSpendingData(spendingRes.data.monthly || [])
        setWeeklyData(spendingRes.data.weekly || [])
        setCategoryData(spendingRes.data.categories || [])
        setRecommendations(recommendationsRes.data || [])
      } catch (error) {
        console.error('Failed to fetch analytics data')
        // Mock data for demo
        setWeeklyData([
          { week: 'Week 1', income: 1200, expenses: 800, savings: 400 },
          { week: 'Week 2', income: 1100, expenses: 900, savings: 200 },
          { week: 'Week 3', income: 1300, expenses: 750, savings: 550 },
          { week: 'Week 4', income: 1250, expenses: 850, savings: 400 },
        ])
        setSpendingData([
          { month: 'Jan', income: 4500, expenses: 3200, savings: 1300 },
          { month: 'Feb', income: 4800, expenses: 3400, savings: 1400 },
          { month: 'Mar', income: 4600, expenses: 3100, savings: 1500 },
        ])
        setCategoryData([
          { name: 'Food', value: 800, color: '#8884d8' },
          { name: 'Transport', value: 400, color: '#82ca9d' },
          { name: 'Entertainment', value: 300, color: '#ffc658' },
          { name: 'Bills', value: 600, color: '#ff7300' },
        ])
        setRecommendations([
          { category: 'Food', suggestion: 'Consider meal planning to reduce food expenses by 15%' },
          { category: 'Transport', suggestion: 'Use public transport more often to save $100/month' },
        ])
      }
    }
    fetchAnalyticsData()
  }, [])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Insights</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Monthly Savings</div>
              <div className="text-2xl font-bold">$1,400</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Expenses</div>
              <div className="text-2xl font-bold">$3,233</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Savings Rate</div>
              <div className="text-2xl font-bold">30.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Savings Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Weekly Savings Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="savings" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Overview */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#8884d8" />
              <Bar dataKey="expenses" fill="#82ca9d" />
              <Bar dataKey="savings" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Smart Recommendations */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            Smart Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="font-medium text-yellow-800">{rec.category}</div>
                  <div className="text-yellow-700">{rec.suggestion}</div>
                </div>
              ))
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="font-medium text-blue-800">Food & Dining</div>
                  <div className="text-blue-700">Consider meal planning to reduce food expenses by 15%</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="font-medium text-green-800">Transportation</div>
                  <div className="text-green-700">Use public transport more often to save $100/month</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="font-medium text-purple-800">Savings Goal</div>
                  <div className="text-purple-700">You're on track! Keep up the great work with your savings</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}