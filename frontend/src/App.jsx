import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'

function App() {
  const { isAuthenticated, isProfileSetup } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/auth" 
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/profile-setup" 
          element={isAuthenticated && !isProfileSetup ? <ProfileSetup /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App