import axios from 'axios'

// API base URL - works for both development and production
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api'  // Production: backend URL
  : '/api'  // Development: proxy handles this

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
}

export const transactionAPI = {
  getTransactions: () => api.get('/transactions/'),
  createTransaction: (data) => api.post('/transactions/', data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}/delete/`),
  getHistory: () => api.get('/transactions/history/'),
  getDashboard: () => api.get('/transactions/dashboard/'),
  getUserStatistics: (monthlyIncome = 0) => api.post('/transactions/statistics/', { monthly_income: monthlyIncome }),
  getMonthlyStatistics: (year, month, monthlyIncome = 0) => api.post(`/transactions/monthly/${year}/${month}/`, { monthly_income: monthlyIncome }),
  setMonthlyIncome: (data) => api.post('/transactions/monthly-income/', data),
  getMonthlyIncome: (year, month) => api.get(`/transactions/monthly-income/?year=${year}&month=${month}`),
  getCumulativeBalance: () => api.get('/transactions/cumulative-balance/'),
  checkDailyExpenseUsage: (date = null) => api.post('/transactions/daily-expense/check/', date ? { date } : {}),
  markDailyExpenseUsed: () => api.post('/transactions/daily-expense/mark/'),
  addDailyExpenseForDate: (date, amount) => api.post('/transactions/daily-expense/add/', { date, amount }),
  checkUserActivity: () => api.get('/transactions/user-activity/'),
  getNotifications: () => api.get('/transactions/notifications/'),
  getMonthlyGoals: (year, month) => api.get(`/transactions/monthly-goals/?year=${year}&month=${month}`),
  setMonthlyGoals: (data) => api.post('/transactions/monthly-goals/', data),
}

export const goalAPI = {
  getSavingsGoals: () => api.get('/goals/savings/'),
  createSavingsGoal: (data) => api.post('/goals/savings/', data),
  getChallenges: () => api.get('/goals/challenges/'),
  getUserChallenges: () => api.get('/goals/user-challenges/'),
  getRewards: () => api.get('/goals/rewards/'),
}

export const analyticsAPI = {
  getSpending: () => api.get('/analytics/spending/'),
  getRecommendations: () => api.get('/analytics/recommendations/'),
}

export default api