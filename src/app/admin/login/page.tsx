'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple admin credentials (in production, use proper authentication)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true')
      router.push('/admindashboard')
    } else {
      setError('Invalid credentials. Use admin/admin123')
    }
  }

  return (
    <div className="min-h-screen bg-[#191970] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#191970]">Admin Login</h1>
          <p className="text-gray-600 mt-2">BetGeniuz Admin Panel</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#191970]"
              placeholder="Enter username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#191970]"
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-[#191970] hover:bg-[#2e2e8f] text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Login
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Default credentials:</p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  )
}
