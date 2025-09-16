'use client'

import { useState, useEffect } from 'react'
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
  const fallbackVIPData = {
    vip1: {
      name: 'VIP 1',
      price: 'GHS 50',
      matches: [
        { id: '1', homeTeam: 'Arsenal', awayTeam: 'Chelsea', option: 'Home', odds: '1.85', result: 'pending' },
        { id: '2', homeTeam: 'Manchester United', awayTeam: 'Liverpool', option: 'Over 2.5', odds: '2.15', result: 'pending' },
        { id: '3', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', option: 'Away', odds: '1.95', result: 'pending' }
      ]
    },
    vip2: {
      name: 'VIP 2', 
      price: 'GHS 100',
      matches: [
        { id: '4', homeTeam: 'PSG', awayTeam: 'Bayern Munich', option: 'Home', odds: '2.10', result: 'pending' },
        { id: '5', homeTeam: 'Juventus', awayTeam: 'AC Milan', option: 'Under 3.5', odds: '1.75', result: 'pending' }
      ]
    },
    vip3: {
      name: 'VIP 3',
      price: 'GHS 200', 
      matches: [
        { id: '6', homeTeam: 'Manchester City', awayTeam: 'Tottenham', option: 'Home', odds: '1.90', result: 'pending' },
        { id: '7', homeTeam: 'Inter Milan', awayTeam: 'Napoli', option: 'Draw', odds: '3.20', result: 'pending' },
        { id: '8', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', option: 'Away', odds: '2.40', result: 'pending' }
      ]
    }
  }
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
    // Initialize with fallback data first
    setVIPMatchesData(fallbackVIPData)
    setVipResultsUpdated({ vip1: false, vip2: false, vip3: false })
    setVipSoldOut({ vip1: false, vip2: false, vip3: false })
    setLoading(false)
    
    // Then try to fetch real data
    const fetchData = async () => {
      try {
        const [matches, resultsUpdated, soldOut] = await Promise.all([
          fetchVIPMatches(),
          fetchVIPResultsUpdated(),
          fetchVIPSoldOut()
        ])
        setVIPMatchesData(matches)
        setVipResultsUpdated(resultsUpdated)
        setVipSoldOut(soldOut)
      } catch (error) {
        console.log('Using fallback data due to API error:', error)
      }
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

  const handleBuyNowClick = (vipType: 'vip1' | 'vip2' | 'vip3', cardIndex: number) => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    if (vipSoldOut[vipType]) {
      setSoldOutVipType(vipType)
      setShowSoldOutPopup(true)
    } else {
      // Set up location modal first using admin-configured prices
      const vipPackage = adminVipPackages[vipType] || VIP_PACKAGES[vipType]
      setSelectedVipPackage(vipPackage.name)
      setSelectedVipAmount(vipPackage.amount)
      setActiveCardIndex(cardIndex)
      setShowLocationModal(true)
    }
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
    if (!vipResultsUpdated[vipType as keyof typeof vipResultsUpdated]) return null

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
    const vipData = VIP_MATCHES_DATA[vipType] || fallbackVIPData[vipType]
    
    // Handle loading state or missing data
    if (!vipData || !vipData.matches) {
      return (
        <div className="relative text-center bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">Loading...</div>
                  </div>
      )
    }
    
    const isPurchased = purchasedPackages.includes(vipData.name)
    const isResultsUpdated = vipResultsUpdated[vipType]
    const isSoldOut = vipSoldOut[vipType]
    const bookingCodes = adminBookingCodes[vipType]

    return (
            <div className="relative text-center bg-gray-50 rounded-lg p-3">
              
        {/* VIP Package Name */}
        <div className="text-lg font-bold text-gray-800 mb-3">{vipData.name}</div>
        
        {/* Matches Section - Show only team names */}
        <div className="mb-4">
          <div className="space-y-2">
            {vipData.matches.map((match: any) => (
              <div key={match.id} className="text-left">
                <div className="text-sm text-gray-800 font-bold mb-1">{match.homeTeam} vs {match.awayTeam}</div>
                        </div>
            ))}
                  </div>
              </div>
              
        {/* Action Section */}
                <div>
          {isPurchased ? (
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
                          <span className="text-sm font-medium">Football.com:</span>
                  <button onClick={() => navigator.clipboard.writeText(bookingCodes.football)} className="text-[#191970] underline">
                    {bookingCodes.football}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
              onClick={() => handleBuyNowClick(vipType, cardIndex)}
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
              Buy Now {(adminVipPackages[vipType] as any)?.price || vipData.price}
                    </button>
                  )}
                </div>

        {/* Modals for each VIP type */}
        {showLocationModal && activeCardIndex === cardIndex && (
                <LocationModal
                  isOpen={showLocationModal}
                  onClose={() => setShowLocationModal(false)}
                  onLocationSelect={handleLocationSelect}
                  vipPackage={selectedVipPackage}
                  amount={selectedVipAmount}
                />
              )}

        {showPaymentModal && activeCardIndex === cardIndex && (
                <PaymentModal
                  isOpen={showPaymentModal}
                  onClose={() => setShowPaymentModal(false)}
                  vipPackage={selectedVipPackage}
                  amount={selectedVipAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                  location={selectedLocation || 'ghana'}
                />
              )}

        {showNonGhanaModal && activeCardIndex === cardIndex && (
                <NonGhanaPayment
                  vipPackage={selectedVipPackage}
                  amount={selectedVipAmount}
                  onClose={() => setShowNonGhanaModal(false)}
                />
              )}
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
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      
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
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {renderVIPCard('vip1', 0)}
            {renderVIPCard('vip2', 1)}
            {renderVIPCard('vip3', 2)}
          </div>
        </div>
      </section>

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
                  // Scroll to other VIP packages
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

      {/* Footer */}
      <footer className="bg-[#191970] text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Top Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* BetGeniuz Branding */}
            <div>
              <h3 className="text-2xl font-bold text-[#f59e0b] mb-4">BetGeniuz</h3>
              <p className="text-indigo-200 text-sm mb-4">
                Your trusted source for expert sports predictions and betting tips. Get professional analysis to make informed betting decisions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-indigo-200">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/predictions" className="hover:text-white transition-colors">Predictions</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-sm text-indigo-200">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-indigo-400 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Features */}
              <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-200">Verified Predictions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-200">Expert Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-200">Gambling Awareness</span>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-sm text-indigo-200">
                <p>© 2024 BetGeniuz. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}


