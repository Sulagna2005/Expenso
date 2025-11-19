import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import transactionSlice from './transactionSlice'
import goalSlice from './goalSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    transactions: transactionSlice,
    goals: goalSlice,
  },
})