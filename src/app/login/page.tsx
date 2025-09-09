'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    plan: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      // Check if it's admin login
      if (formData.email === 'admin' && formData.password === 'admin123') {
        // Admin login - redirect to admin dashboard
        localStorage.setItem('adminLoggedIn', 'true')
        window.location.href = '/admindashboard'
      } else {
        // Regular user login - store user data and redirect to user dashboard
        const userData = {
          firstName: formData.email.split('@')[0] || 'User',
          lastName: 'Doe',
          email: formData.email,
          initials: formData.email.split('@')[0]?.substring(0, 2).toUpperCase() || 'U',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          vipStatus: 'Premium',
          successRate: '87%',
          totalPredictions: 156,
          winsThisMonth: 23
        }
        
        localStorage.setItem('userLoggedIn', 'true')
        localStorage.setItem('userData', JSON.stringify(userData))
        window.location.href = '/'
      }
    } else {
      // Registration - store user data and redirect to user dashboard
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        initials: `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase(),
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        vipStatus: formData.plan ? 'Premium' : 'Free',
        successRate: '0%',
        totalPredictions: 0,
        winsThisMonth: 0
      }
      
      localStorage.setItem('userLoggedIn', 'true')
      localStorage.setItem('userData', JSON.stringify(userData))
      window.location.href = '/'
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Password reset requested for:', formData.email)
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      
      {/* Login Header */}
      <section className="pt-32 pb-8 px-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isLogin ? 'Welcome Back' : 'Join BetGeniuz'}
          </h1>
          <p className="text-xl text-gray-300">
            {isLogin 
              ? 'Sign in to access your predictions and VIP features' 
              : 'Create your account and start winning with expert predictions'
            }
          </p>
        </div>
      </section>

      {/* Auth Forms */}
      <section className="py-8 px-4">
        <div className="max-w-md mx-auto">
          
          {/* Toggle Buttons */}
          <div className="flex bg-[#1e293b] rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setIsLogin(true)
                setIsForgotPassword(false)
              }}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                isLogin && !isForgotPassword
                  ? 'bg-[#f59e0b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setIsForgotPassword(false)
              }}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                !isLogin && !isForgotPassword
                  ? 'bg-[#f59e0b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLogin && !isForgotPassword && (
            <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Enter your email or username"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-[#f59e0b]" />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-[#f59e0b] hover:text-[#d97706] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>

                {/* Demo Credentials */}
                <div className="text-center p-4 bg-[#0f172a] rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-400 mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-[#f59e0b]"><strong>Admin:</strong> admin / admin123</p>
                    <p className="text-gray-300"><strong>Regular User:</strong> any other credentials</p>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-gray-400">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors"
                  >
                    Sign up here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Registration Form */}
          {!isLogin && !isForgotPassword && (
            <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Enter your email or username"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Choose Plan (Optional)
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                  >
                    <option value="">Start with Free</option>
                    <option value="basic">Basic VIP - $29/month</option>
                    <option value="premium">Premium VIP - $79/month</option>
                    <option value="elite">Elite VIP - $149/month</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" required className="mr-2 text-[#f59e0b]" />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-[#f59e0b] hover:text-[#d97706]">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#f59e0b] hover:text-[#d97706]">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>

                <div className="text-center">
                  <span className="text-gray-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Forgot Password Form */}
          {isForgotPassword && (
            <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Send Reset Link
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-[#1e293b]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose BetGeniuz?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Expert Predictions</h3>
              <p className="text-gray-400">Professional analysis with proven accuracy rates</p>
            </div>
            
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-gray-400">Live match updates and instant notifications</p>
            </div>
            
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">👑</div>
              <h3 className="text-xl font-semibold text-white mb-2">VIP Features</h3>
              <p className="text-gray-400">Exclusive content and premium betting insights</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
