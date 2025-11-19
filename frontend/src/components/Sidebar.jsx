import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Home, Target, History, User, Settings, LogOut, Menu } from 'lucide-react'
import { logout } from '../store/authSlice'

export default function Sidebar({ isOpen, onClose, onToggle }) {
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    onClose()
  }

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Target, label: 'Goals', path: '/dashboard/goals' },
    { icon: History, label: 'History', path: '/dashboard/history' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ]

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Full sidebar when open */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
        isOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with logo and menu button */}
          <div className={`${isOpen ? 'p-6' : 'p-2'} border-b`}>
            {isOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                      <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor"/>
                      <rect x="2" y="10" width="20" height="2" fill="white"/>
                      <rect x="4" y="14" width="4" height="1" fill="white"/>
                      <rect x="18" y="14" width="2" height="1" fill="white"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-blue-600">Expenso</h2>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>
            )}
          </div>

          <nav className={`${isOpen ? 'p-4' : 'p-2'} flex-1`}>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={isOpen ? onClose : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${isOpen ? 'gap-3 p-3' : 'justify-center p-2'} rounded-lg transition-colors ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`
                    }
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon size={20} />
                    {isOpen && item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className={`${isOpen ? 'p-4' : 'p-2'} border-t mt-auto`}>
            <button
              onClick={handleLogout}
              className={`flex items-center ${isOpen ? 'gap-3 p-3' : 'justify-center p-2'} rounded-lg hover:bg-red-100 text-red-600 w-full text-left`}
              title={!isOpen ? 'Logout' : undefined}
            >
              <LogOut size={20} />
              {isOpen && 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}