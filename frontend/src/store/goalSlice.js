import { createSlice } from '@reduxjs/toolkit'

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    savingsGoals: [],
    challenges: [],
    userChallenges: [],
    rewardPoints: 0,
    monthlyGoal: null,
  },
  reducers: {
    setSavingsGoals: (state, action) => {
      state.savingsGoals = action.payload
    },
    setChallenges: (state, action) => {
      state.challenges = action.payload
    },
    setUserChallenges: (state, action) => {
      state.userChallenges = action.payload
    },
    setRewardPoints: (state, action) => {
      state.rewardPoints = action.payload
    },
    setMonthlyGoal: (state, action) => {
      state.monthlyGoal = action.payload
    }
  }
})

export const { setSavingsGoals, setChallenges, setUserChallenges, setRewardPoints, setMonthlyGoal } = goalSlice.actions
export default goalSlice.reducer