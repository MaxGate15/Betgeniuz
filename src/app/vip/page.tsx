'use client'

// Extend Window type for PaystackPop
declare global {
  interface Window {
    PaystackPop?: any;
  }
}

import { useState, useEffect } from 'react'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import { PaymentModal } from '@/components/PaymentModal'
import { LocationModal } from '@/components/LocationModal'
import { NonGhanaPayment } from '@/components/NonGhanaPayment'
import { VIP_PACKAGES } from '@/config/paystack'
import { useAuth } from '@/hooks/useAuth'
import { fetchVIPMatches, fetchVIPResultsUpdated, fetchVIPSoldOut } from '@/data/vipMatches'
import { VIP_BOOKING_CODES } from '@/data/vipBookingCodes'
import { VIP_RESULTS_UPDATED, VIP_SOLD_OUT, VIP_DATE_HEADER } from '@/data/vipStatus'

export default function VIP() {
  const { isLoggedIn, isLoading } = useAuth()
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoading, isLoggedIn])

  // Loading state for async data
  const [loading, setLoading] = useState(true)
  const [VIP_MATCHES_DATA, setVIPMatchesData] = useState<any>({})
  const [vipResultsUpdated, setVipResultsUpdated] = useState<any>({})
  const [vipSoldOut, setVipSoldOut] = useState<any>({})
  
  // Fallback data in case API fails
  // const fallbackVIPData = {
  //   vip1: {
  //     name: 'VIP 1',
  //     price: 'GHS 50',
  //     matches: [
  //       { id: '1', homeTeam: 'Arsenal', awayTeam: 'Chelsea', option: 'Home', odds: '1.85', result: 'pending' },
  //       { id: '2', homeTeam: 'Manchester United', awayTeam: 'Liverpool', option: 'Over 2.5', odds: '2.15', result: 'pending' },
  //       { id: '3', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', option: 'Away', odds: '1.95', result: 'pending' }
  //     ]
  //   },
  //   vip2: {
  //     name: 'VIP 2', 
  //     price: 'GHS 100',
  //     matches: [
  //       { id: '4', homeTeam: 'Real Sociedad', awayTeam: 'Valencia', option: 'Home', odds: '1.80', result: 'pending' },
  //       { id: '5', homeTeam: 'Juventus', awayTeam: 'AC Milan', option: 'Under 3.5', odds: '1.75', result: 'pending' }
  //     ]
  //   },
  //   vip3: {
  //     name: 'VIP 3',
  //     price: 'GHS 200', 
  //     matches: [
  //       { id: '6', homeTeam: 'Manchester City', awayTeam: 'Tottenham', option: 'Home', odds: '1.90', result: 'pending' },
  //       { id: '7', homeTeam: 'Inter Milan', awayTeam: 'Napoli', option: 'Draw', odds: '3.20', result: 'pending' },
  //       { id: '8', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', option: 'Away', odds: '2.40', result: 'pending' }
  //     ]
  //   }
  // }
  const [showSoldOutPopup, setShowSoldOutPopup] = useState(false)
  const [soldOutVipType, setSoldOutVipType] = useState('')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showNonGhanaModal, setShowNonGhanaModal] = useState(false)
  const [selectedVipPackage, setSelectedVipPackage] = useState('')
  const [selectedVipAmount, setSelectedVipAmount] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<'ghana' | 'not-ghana' | null>(null)
  const [purchasedPackages, setPurchasedPackages] = useState<string[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [adminVipPackages, setAdminVipPackages] = useState(VIP_PACKAGES)
  const [adminBookingCodes, setAdminBookingCodes] = useState(VIP_BOOKING_CODES)
  
  useEffect(() => {
    // Try to fetch real data from API first
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log('Fetching VIP data from API...')
        const [matches, resultsUpdated, soldOut] = await Promise.all([
          fetchVIPMatches(),
          fetchVIPResultsUpdated(),
          fetchVIPSoldOut()
        ])
        console.log('API data received:', { matches, resultsUpdated, soldOut })
        
        // Check if we have any VIP data
        if (Object.keys(matches).length > 0) {
          setVIPMatchesData(matches)
          setVipResultsUpdated(resultsUpdated)
          setVipSoldOut(soldOut)
        } else {
          // No VIP packages available from admin
          setVIPMatchesData({})
          setVipResultsUpdated({})
          setVipSoldOut({})
        }
      } catch (error) {
        console.error('API error:', error)
        // No fallback data - show empty state
        setVIPMatchesData({})
        setVipResultsUpdated({})
        setVipSoldOut({})
      }
      setLoading(false)
    }
    fetchData()

    try {
      const saved = JSON.parse(localStorage.getItem('purchasedPackages') || '[]')
      if (Array.isArray(saved)) setPurchasedPackages(saved)
      
      // Load admin-configured VIP packages
      const adminPackages = localStorage.getItem('vipPackages')
      if (adminPackages) {
        setAdminVipPackages(JSON.parse(adminPackages))
      }
      
      // Load admin-configured booking codes
      const adminCodes = localStorage.getItem('vipBookingCodes')
      if (adminCodes) {
        setAdminBookingCodes(JSON.parse(adminCodes))
      }
    } catch {}
  }, [])

  // Paystack Inline Payment Integration
  const [paystackLoading, setPaystackLoading] = useState(false)
  const [paystackError, setPaystackError] = useState('')
  const [paystackSuccess, setPaystackSuccess] = useState('')

  // Helper: Generate unique transaction reference
  function generateReference() {
    return 'VIP_' + Date.now() + '_' + Math.floor(Math.random() * 1000000)
  }

  // Helper: Get user email (from auth or prompt)
  function getUserEmail() {
    // Try to get from useAuth, fallback to prompt
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData')
      if (userData) {
        // userData is an object with an 'email' property
        const parsed = JSON.parse(userData)
        if (parsed.email) return parsed.email
      }
    }
    return prompt('Enter your email for payment:') || ''
  }

  // Main handler for Buy Now
  const handleBuyNowClick = async (vipType: 'vip1' | 'vip2' | 'vip3', cardIndex: number) => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    if (vipSoldOut[vipType]) {
      setSoldOutVipType(vipType)
      setShowSoldOutPopup(true)
      return
    }

    setPaystackError('')
    setPaystackSuccess('')
    setPaystackLoading(true)

    // Get price and booking_id
    const vipPackage = adminVipPackages[vipType] || VIP_PACKAGES[vipType]
    const price = Number(vipPackage.amount || vipPackage.price?.replace(/\D/g, '')) || 0
    const booking_id = vipType
    const reference = generateReference()
    const email = getUserEmail()
    if (!email) {
      setPaystackError('Email is required for payment.')
      setPaystackLoading(false)
      return
    }

    // Paystack Inline
    if (typeof window !== 'undefined' && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key:  'pk_live_af5bf9f11c13146bd6fd46dc0c25508f39e55a49',
        email,
        amount: price * 0.01,
        currency: 'GHS',
        ref: reference,
        callback: function(response) {
          // Send to backend for verification
          fetch('https://api.betgeniuz.com/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.reference,
              email,
              booking_id
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setPaystackSuccess('Payment successful!')
              handlePaymentSuccess(response.reference)
            } else {
              setPaystackError('Payment verification failed.')
            }
          })
          .catch(() => setPaystackError('Payment verification failed.'))
        },
        onClose: function() {
          setPaystackError('Transaction not completed.')
        }
      })
      handler.openIframe()
    } else {
      setPaystackError('Paystack SDK not loaded.')
    }
    setPaystackLoading(false)
  }

  const handleLocationSelect = (location: 'ghana' | 'not-ghana') => {
    setSelectedLocation(location)
    setShowLocationModal(false)
    
    if (location === 'ghana') {
      setShowPaymentModal(true)
    } else {
      setShowNonGhanaModal(true)
    }
  }

  const handlePaymentSuccess = (reference: string) => {
    try {
      // Persist purchased packages to localStorage for dashboard access
      const prev = JSON.parse(localStorage.getItem('purchasedPackages') || '[]')
      const next = Array.from(new Set([...(Array.isArray(prev) ? prev : []), selectedVipPackage]))
      localStorage.setItem('purchasedPackages', JSON.stringify(next))
    } catch {}

    setShowPaymentModal(false)
    setShowLocationModal(false)
    setShowNonGhanaModal(false)
    setActiveCardIndex(null)

    // Redirect to dashboard after purchase
    window.location.href = '/dashboard?from=payment_success'
  }

  const renderMatchResult = (match: any, vipType: string) => {
  const vipData = (VIP_MATCHES_DATA as any)[vipType] 
    const isResultsUpdated = vipResultsUpdated[vipType] || vipData.isResultsUpdated
    if (!isResultsUpdated) return null

  return (
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
          <div className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs">Option: {match.option}</div>
          <div className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs">Odds: {match.odds}</div>
                        </div>
        <div className={`w-6 h-6 ${match.result === 'win' ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center`}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            {match.result === 'win' ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            )}
                          </svg>
                        </div>
                      </div>
    )
  }

  const renderVIPCard = (vipType: 'vip1' | 'vip2' | 'vip3', cardIndex: number) => {
    const vipData = (VIP_MATCHES_DATA as any)[vipType]
    if (!vipData || !vipData.matches) {
      return (
        <div className="relative text-center bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">Loading...</div>
        </div>
      )
    }
    const isPurchased = purchasedPackages.includes(vipData.name)
    const isResultsUpdated = vipResultsUpdated[vipType] || vipData.isResultsUpdated
    const isSoldOut = vipSoldOut[vipType] || vipData.isSoldOut
    const bookingCodes = adminBookingCodes[vipType]

    return (
      <div className="relative text-center bg-gray-50 rounded-lg p-3">
        {/* VIP Package Name */}
        <div className="text-lg font-bold text-gray-800 mb-3">{vipData.name}</div>
        {/* Matches Section */}
        <div className="mb-4">
          <div className="space-y-2">
            {vipData.matches.map((match: any) => (
              <div key={match.id} className="text-left">
                <div className="text-sm text-gray-800 font-bold mb-1">{match.homeTeam} vs {match.awayTeam}</div>
                {isResultsUpdated && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Prediction:</span> {match.prediction || match.option || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Odds:</span> {match.odds || 'N/A'}
                    </div>
                    {renderMatchResult(match, vipType)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Action Section */}
        <div>
          {isResultsUpdated ? (
            isPurchased ? (
              <div className="space-y-2">
                <div className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-center">
                  ✓ Purchased — Booking Codes
                </div>
                <div className="bg-white rounded-lg p-3 text-gray-800 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sporty:</span>
                    <button onClick={() => navigator.clipboard.writeText(bookingCodes.sporty)} className="text-[#191970] underline">
                      {bookingCodes.sporty}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">MSport:</span>
                    <button onClick={() => navigator.clipboard.writeText(bookingCodes.msport)} className="text-[#191970] underline">
                      {bookingCodes.msport}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => navigator.clipboard.writeText(bookingCodes.football)} className="text-[#191970] underline">
                      {bookingCodes.football}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )
          ) : (
            <button
              onClick={() => handleBuyNowClick(vipType, cardIndex)}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              data-price={vipData.price}
              data-booking_id={vipType}
            >
              Buy Now {(adminVipPackages[vipType] as any)?.price || vipData.price}
            </button>
          )}
        </div>
        {/* Paystack Feedback */}
        {paystackLoading && <div className="text-yellow-600 mt-2">Processing payment...</div>}
        {paystackError && <div className="text-red-600 mt-2">{paystackError}</div>}
        {paystackSuccess && <div className="text-green-600 mt-2">{paystackSuccess}</div>}
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="text-xl font-semibold">Loading VIP Packages...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-white">
      {/* Paystack JS SDK */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      {/* ...existing code... */}
      {/* VIP Header */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              VIP
            </h1>
          </div>
        </div>
      </section>
      {/* VIP Packages Section */}
      <section id="vip-packages" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {Object.keys(VIP_MATCHES_DATA).length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {Object.keys(VIP_MATCHES_DATA).map((vipType, index) =>
                renderVIPCard(vipType as 'vip1' | 'vip2' | 'vip3', index)
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">⚽</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Available</h3>
                <p className="text-gray-600">
                  There are currently no VIP packages available. Please check back later or contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* ...existing code... */}
      {/* Sold Out Popup */}
      {showSoldOutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border-2 border-red-500 p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-600 uppercase text-center flex-1">Package Sold Out</h3>
              <button
                onClick={() => setShowSoldOutPopup(false)}
                className="text-black hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Package Sold Out</h3>
              <p className="text-gray-600">
                This VIP package is currently sold out. Please check back later or choose another package.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSoldOutPopup(false)
                  document.querySelector('#vip-packages')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                View Other Packages
              </button>
              <button
                onClick={() => setShowSoldOutPopup(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code... */}
      {/* Footer */}
      <footer className="bg-[#191970] text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* ...existing code... */}
        </div>
      </footer>
    </main>
  )
}


