import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'
import { loginSuccess } from '../store/authSlice'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' }
]

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const response = isLogin
        ? await authAPI.login(data)
        : await authAPI.register(data)

      const { user, access, refresh } = response.data
      dispatch(loginSuccess({ user, access, refresh }))
      toast.success(isLogin ? 'Login successful!' : 'Registration successful!')

      // Redirect to profile setup if not complete
      if (!user.profile_setup_complete) {
        navigate('/profile-setup')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Auth error:', error)
      
      // Handle validation errors
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Handle field-specific errors
        if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
          const fieldErrors = []
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`)
            } else {
              fieldErrors.push(`${field}: ${errorData[field]}`)
            }
          })
          toast.error(fieldErrors.join('\n'))
        } else {
          // Handle general errors
          const errorMessage = errorData.detail || 
                              errorData.message || 
                              errorData.error ||
                              'Authentication failed'
          toast.error(errorMessage)
        }
      } else {
        toast.error(error.message || 'Authentication failed')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Expenso</h1>
          <p className="text-gray-600 mt-2">Track your expenses smartly</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <input
                  {...register('full_name', { required: 'Full name is required' })}
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
              </div>
              

              
              <div>
                <select
                  {...register('country', { required: 'Country is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="US"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
              </div>
            </>
          )}

          <div>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="w-full btn-primary py-3 text-lg">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  )
}