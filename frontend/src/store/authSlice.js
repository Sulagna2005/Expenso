import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    isProfileSetup: true,
  },
  reducers: {
    loginSuccess: (state, action) => {
      console.log('Login success payload:', action.payload)
      // Only clear monthly data from other users, keep profile data
      Object.keys(localStorage).forEach(key => {
        if ((key.includes('monthlyData_') || key.includes('lastMonthlyUpdate_')) && 
            !key.includes(action.payload.user.email)) {
          localStorage.removeItem(key)
        }
      })
      
      state.user = action.payload.user
      state.token = action.payload.access
      state.isAuthenticated = true
      state.isProfileSetup = action.payload.user.profile_setup_complete
      localStorage.setItem('access_token', action.payload.access)
      localStorage.setItem('refresh_token', action.payload.refresh)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      console.log('Auth state after login:', { isAuthenticated: state.isAuthenticated, isProfileSetup: state.isProfileSetup })
    },
    logout: (state) => {
      // Keep profile data, only clear auth tokens
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isProfileSetup = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
    setProfileSetup: (state, action) => {
      state.isProfileSetup = action.payload
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    updateUser: (state, action) => {
      state.user = action.payload
      state.isProfileSetup = action.payload.profile_setup_complete
      localStorage.setItem('user', JSON.stringify(action.payload))
    }
  }
})

export const { loginSuccess, logout, setProfileSetup, updateProfile, updateUser } = authSlice.actions
export default authSlice.reducer