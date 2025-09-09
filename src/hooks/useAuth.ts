'use client'

import { useState, useEffect } from 'react'

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState({
    firstName: 'User',
    lastName: 'Doe',
    initials: 'U'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem('userLoggedIn')
    const adminLoggedIn = localStorage.getItem('adminLoggedIn')
    
    if (userLoggedIn || adminLoggedIn) {
      setIsLoggedIn(true)
      
      // Get user data if it's a regular user
      if (userLoggedIn) {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData))
        }
      } else if (adminLoggedIn) {
        setUserData({
          firstName: 'Admin',
          lastName: 'User',
          initials: 'A'
        })
      }
    } else {
      setIsLoggedIn(false)
      setUserData({
        firstName: 'User',
        lastName: 'Doe',
        initials: 'U'
      })
    }
    
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('userData')
    setIsLoggedIn(false)
    setUserData({
      firstName: 'User',
      lastName: 'Doe',
      initials: 'U'
    })
  }

  return {
    isLoggedIn,
    userData,
    isLoading,
    logout
  }
}
