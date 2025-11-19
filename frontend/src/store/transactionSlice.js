import { createSlice } from '@reduxjs/toolkit'

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    balance: 0,
    todaySpending: 0,
    monthlySpending: 0,
    notifications: [],
  },
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    setTodaySpending: (state, action) => {
      state.todaySpending = action.payload
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload
    }
  }
})

export const { setTransactions, addTransaction, setBalance, setTodaySpending, setNotifications } = transactionSlice.actions
export default transactionSlice.reducer