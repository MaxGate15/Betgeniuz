'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '', // for signup
  })
  const [apiError, setApiError] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMatch, setPasswordMatch] = useState(false)

  // Open Sign Up tab when accessed via /login?register=true
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('register') === 'true') {
        setIsLogin(false)
        setIsForgotPassword(false)
      }
    } catch (err) {
      // no-op
    }
  }, [])

  // Clear password error and match state when switching between login and signup
  useEffect(() => {
    setPasswordError('')
    setPasswordMatch(false)
  }, [isLogin])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Validate password match in real-time
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        // If password is being changed, check against confirmPassword
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setPasswordError('Passwords do not match')
          setPasswordMatch(false)
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          setPasswordError('')
          setPasswordMatch(true)
        } else {
          setPasswordMatch(false)
        }
      } else if (name === 'confirmPassword') {
        // If confirmPassword is being changed, check against password
        if (formData.password && value !== formData.password) {
          setPasswordError('Passwords do not match')
          setPasswordMatch(false)
        } else if (formData.password && value === formData.password) {
          setPasswordError('')
          setPasswordMatch(true)
        } else {
          setPasswordMatch(false)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setApiLoading(true)
    if (isLogin) {
      // Admin login shortcut
      // if (formData.email === 'admin' && formData.password === 'admin123') {
      //   localStorage.setItem('adminLoggedIn', 'true')
      //   window.location.href = '/admindashboard'
      //   setApiLoading(false)
      //   return
      // }
      // API login
      try {
        const res = await fetch('https://api.betgeniuz.com/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email_or_username: formData.email,
            password: formData.password
          })
        })
        const data = await res.json()
        if (!res.ok) {
          setApiError(data.detail || 'Login failed')
        } else {
          // Save token/user info as needed
          localStorage.setItem('userLoggedIn', 'true')
          localStorage.setItem('userData', JSON.stringify(data))
          localStorage.setItem('accessToken', data.access_token)
          localStorage.setItem("is_admin", data.is_admin )
          // if (data.is_admin === 1 || data.is_admin === true) {
          //   localStorage.setItem('adminLoggedIn', 'true')
          //   window.location.href = '/admindashboard'
          // } else {
          //   window.location.href = '/'
          // }
          window.location.href = '/'
        }
      } catch (err) {
        setApiError('Network error. Please try again.')
      }
      setApiLoading(false)
    } else {
      // Registration - validate passwords match first
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match')
        setApiLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters long')
        setApiLoading(false)
        return
      }
      setPasswordError('')
      // API signup
      try {
        const res = await fetch('https://api.betgeniuz.com/auth/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username || formData.email.split('@')[0] || '',
            email: formData.email,
            password: formData.password,
            phone_number: formData.phone,
            is_superuser: false,
            is_staff: false
          })
        })
        const data = await res.json()
        if (!res.ok) {
          setApiError(data.detail || 'Signup failed')
        } else {
          // Optionally auto-login after signup
          localStorage.setItem('userLoggedIn', 'true')
          localStorage.setItem('userData', JSON.stringify(data))
          window.location.href = '/'
        }
      } catch (err) {
        setApiError('Network error. Please try again.')
      }
      setApiLoading(false)
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
                {apiError && (
                  <p className="text-red-400 text-sm mt-1">{apiError}</p>
                )}
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
                  disabled={apiLoading}
                >
                  {apiLoading ? 'Signing In...' : 'Sign In'}
                </button>
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
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
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
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[+0-9\s-]{7,15}"
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="e.g. +233 24 123 4567"
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
                    className={`w-full bg-[#0f172a] border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-[#f59e0b]'
                    }`}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full bg-[#0f172a] border rounded-lg px-4 py-3 pr-10 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        passwordError ? 'border-red-500 focus:border-red-500' : 
                        passwordMatch ? 'border-green-500 focus:border-green-500' : 
                        'border-gray-700 focus:border-[#f59e0b]'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {passwordMatch && formData.confirmPassword && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                  {passwordMatch && formData.confirmPassword && !passwordError && (
                    <p className="text-green-400 text-sm mt-1">✓ Passwords match</p>
                  )}
                </div>
                {apiError && (
                  <p className="text-red-400 text-sm mt-1">{apiError}</p>
                )}
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
                  disabled={apiLoading}
                >
                  {apiLoading ? 'Creating Account...' : 'Create Account'}
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

    </main>
  )
}
