import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Home from './Home'
import Goals from './Goals'
import History from './History'
import Profile from './Profile'
import Settings from './Settings'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <Navbar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<Home />} />
            <Route path="goals" element={<Goals />} />

            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}