'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar({ onPredictionsClick }: { onPredictionsClick: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { isLoggedIn, userData, isLoading, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Function to handle predictions click with auth check
  const handlePredictionsClick = () => {
    if (!isLoggedIn) {
      window.location.href = '/login'
    } else {
      onPredictionsClick()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Check if user is admin from localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem('is_admin')
    if (adminStatus == "1" || adminStatus === 'true') {
      setIsAdmin(true)
    }
  }, [isLoggedIn])

  return (
    <nav className="bg-[#191970] border-b border-indigo-400 px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="text-xl font-bold text-white">
          BetGeniuz
        </div>
        
                    {/* Desktop Navigation Links - Positioned to the left */}
            <div className="hidden md:flex space-x-6 ml-16">
              <a href="/" className="text-white hover:text-indigo-200 transition-colors">
                Home
              </a>
              <button 
                onClick={handlePredictionsClick}
                className="text-white hover:text-indigo-200 transition-colors"
              >
                Predictions
              </button>
              <a href="/about" className="text-white hover:text-indigo-200 transition-colors">
                About
              </a>
              
              {/* Admin Button - Only show if user is admin */}
              {isLoggedIn && isAdmin && (
                <a href="/admindashboard" className="text-white hover:text-indigo-200 transition-colors">
                  Admin
                </a>
              )}

              <a href="/notifications" className="text-white hover:text-indigo-200 transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Notification Badge */}
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </div>
              </a>
            </div>
        
               {/* Desktop Action Buttons */}
               <div className="hidden md:flex space-x-3">
                 {isLoading ? (
                   <div className="w-20 h-10 bg-gray-300 rounded animate-pulse"></div>
                 ) : isLoggedIn ? (
            <>
              {/* User Profile with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{(userData as any)?.initials}</span>
                  </div>
                  <span className="text-sm font-medium">{(userData as any)?.username || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Dashboard
                    </a>
                    {/* Admin Link in Dropdown - Only show if user is admin */}
                    {isAdmin && (
                      <a
                        href="/admindashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </a>
                    )}
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Settings
                    </a>
                    <button
                      onClick={() => {
                        logout()
                        setIsUserDropdownOpen(false)
                        // Small delay to ensure logout completes before redirect
                        setTimeout(() => {
                          window.location.href = '/'
                        }, 100)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a 
                href="/login" 
                className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-lg transition-colors font-medium"
              >
                Login
              </a>
              <a 
                href="/login?register=true" 
                className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-lg transition-colors font-medium"
              >
                Register
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#191970] border-t border-indigo-400">
          <div className="px-4 py-3 space-y-3">
            <a 
              href="/" 
              className="block text-white hover:text-indigo-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <button 
              onClick={() => {
                handlePredictionsClick()
                setIsMobileMenuOpen(false)
              }}
              className="block text-white hover:text-indigo-200 transition-colors w-full text-left"
            >
              Predictions
            </button>
            <a 
              href="/about" 
              className="block text-white hover:text-indigo-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>

            {/* Admin Button - Only show if user is admin */}
            {isLoggedIn && isAdmin && (
              <a 
                href="/admindashboard" 
                className="block text-white hover:text-indigo-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </a>
            )}

            <a 
              href="/notifications" 
              className="block text-white hover:text-indigo-200 transition-colors relative"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {/* Notification Badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                0
              </div>
            </a>
                   <div className="pt-3 space-y-2">
                     {isLoading ? (
                       <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
                     ) : isLoggedIn ? (
                <>
                  {/* User Profile with Initials in Mobile */}
                  <div className="flex items-center space-x-3 p-3 bg-[#2e2e8f] rounded-lg">
                    <div className="w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{(userData as any)?.initials}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{(userData as any)?.username || 'User'}</span>
                  </div>
                  
                  {/* Mobile Menu Items */}
                  <a
                    href="/dashboard"
                    className="block text-white hover:text-indigo-200 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                  {/* Admin Link in Mobile Menu - Only show if user is admin */}
                  {isAdmin && (
                    <a
                      href="/admindashboard"
                      className="block text-white hover:text-indigo-200 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </a>
                  )}
                  <a
                    href="/settings"
                    className="block text-white hover:text-indigo-200 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                      // Small delay to ensure logout completes before redirect
                      setTimeout(() => {
                        window.location.href = '/'
                      }, 100)
                    }}
                    className="block w-full text-left text-white hover:text-indigo-200 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="/login" 
                    className="block bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-lg transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </a>
                  <a 
                    href="/login?register=true" 
                    className="block bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-lg transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
