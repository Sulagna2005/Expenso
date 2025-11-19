import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'
import { setProfileSetup, updateProfile } from '../store/authSlice'

export default function ProfileSetup() {
  const { user } = useSelector((state) => state.auth)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: '',
      phone: '',
      monthly_income: '',
      estimated_expenses: '',
      initial_balance: ''
    }
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      dispatch(updateProfile(response.data))
      dispatch(setProfileSetup(true))
      toast.success('Profile setup completed!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Complete Your Profile</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  value={user?.email || ''}
                  type="email"
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  {...register('full_name', { required: 'Full name is required' })}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income</label>
                <input
                  {...register('monthly_income', { required: 'Monthly income is required' })}
                  type="number"
                  step="0.01"
                  placeholder="Enter your monthly income"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.monthly_income && <p className="text-red-500 text-sm mt-1">{errors.monthly_income.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Monthly Expenses</label>
                <input
                  {...register('estimated_expenses')}
                  type="number"
                  step="0.01"
                  placeholder="Enter estimated monthly expenses"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <input
                  {...register('initial_balance')}
                  type="number"
                  step="0.01"
                  placeholder="Enter your initial balance"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">About Expenso</h3>
              <p className="text-gray-700">
                Expenso helps you track expenses, set savings goals, and get smart spending recommendations. 
                Complete challenges to earn reward points and achieve your financial goals.
              </p>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 btn-primary py-3">
                Complete Setup
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/auth')}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}