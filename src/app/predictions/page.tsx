'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { PaymentModal } from '@/components/PaymentModal'
import { LocationModal } from '@/components/LocationModal'
import { NonGhanaPayment } from '@/components/NonGhanaPayment'
import { fetchVIPMatches, fetchVIPResultsUpdated, fetchVIPSoldOut } from '@/data/vipMatches'
import { VIP_PACKAGES } from '@/config/paystack'
import { VIP_BOOKING_CODES } from '@/data/vipBookingCodes'
import { useAuth } from '@/hooks/useAuth'

export default function Predictions() {
  const { isLoggedIn, isLoading } = useAuth()
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoading, isLoggedIn])
  const [activeTab, setActiveTab] = useState('today')
  const [showBookingPopup, setShowBookingPopup] = useState(false)
  const [vipResultsUpdated, setVipResultsUpdated] = useState({
    vip1: false,
    vip2: true,
    vip3: true
  })
  const [vipSoldOut, setVipSoldOut] = useState({
    vip1: false,
    vip2: false,
    vip3: false
  })
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

  // Function to handle button clicks with auth check
  const handleButtonClick = (href: string) => {
    if (!isLoggedIn) {
      window.location.href = '/login'
    } else {
      window.location.href = href
    }
  }

  
    // State for predictions data from API
    const [predictions, setPredictions] = useState<any[]>([]);
    const [predictionsLoading, setPredictionsLoading] = useState(false);
    const [predictionsError, setPredictionsError] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
    // Helper to get YYYY-MM-DD for today/yesterday/tomorrow
    const getDateString = (tab: string): string => {
      const today = new Date();
      if (tab === 'today') return today.toISOString().slice(0, 10);
      if (tab === 'yesterday') {
        const d = new Date(today);
        d.setDate(today.getDate() - 1);
        return d.toISOString().slice(0, 10);
      }
      if (tab === 'tomorrow') {
        const d = new Date(today);
        d.setDate(today.getDate() + 1);
        return d.toISOString().slice(0, 10);
      }
      // fallback
      return today.toISOString().slice(0, 10);
    };
  
    // Fetch predictions when activeTab or selectedDate changes
    useEffect(() => {
      const fetchPredictions = async () => {
        setPredictionsLoading(true);
        setPredictionsError('');
        try {
          let url = '';
          let dateStr = '';
          if (activeTab === 'today' && !selectedDate) {
            url = 'https://api.betgeniuz.com/games/free-bookings';
          } else {
            // Use selectedDate if custom, else get date from tab
            dateStr = selectedDate || getDateString(activeTab);
            // If dateStr is today, use free-bookings endpoint
            const todayStr = getDateString('today');
            if (dateStr === todayStr) {
              url = 'https://api.betgeniuz.com/games/free-bookings';
            } else {
              url = `https://api.betgeniuz.com/games/other-games?date=${dateStr}`;
            }
          }
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch predictions');
          const data = await res.json();
          setPredictions(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setPredictionsError(err?.message || 'Could not load predictions');
        }
        setPredictionsLoading(false);
      };
      fetchPredictions();
    }, [activeTab, selectedDate]);

  // VIP section state (copied from vip/page.tsx)
  const [vipLoading, setVipLoading] = useState(true)
  const [VIP_MATCHES_DATA, setVIPMatchesData] = useState<any>({})
  const [adminVipPackages, setAdminVipPackages] = useState(VIP_PACKAGES)
  const [adminBookingCodes, setAdminBookingCodes] = useState(VIP_BOOKING_CODES)

  useEffect(() => {
    // Fetch VIP data from API
    const fetchData = async () => {
      setVipLoading(true)
      const [matches, resultsUpdated, soldOut] = await Promise.all([
        fetchVIPMatches(),
        fetchVIPResultsUpdated(),
        fetchVIPSoldOut()
      ])
      setVIPMatchesData(matches)
      setVipResultsUpdated(resultsUpdated)
      setVipSoldOut(soldOut)
      setVipLoading(false)
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

  // VIP logic handlers (copied from vip/page.tsx)
  const handleVipBuyNowClick = (vipType: 'vip1' | 'vip2' | 'vip3', cardIndex: number) => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }

    if (vipSoldOut[vipType]) {
      setSoldOutVipType(vipType)
      setShowSoldOutPopup(true)
    } else {
      const vipPackage = adminVipPackages[vipType] || VIP_PACKAGES[vipType]
      setSelectedVipPackage(vipPackage.name)
      setSelectedVipAmount(vipPackage.amount)
      setActiveCardIndex(cardIndex)
      setShowLocationModal(true)
    }
  }

  const handleVipLocationSelect = (location: 'ghana' | 'not-ghana') => {
    setSelectedLocation(location)
    setShowLocationModal(false)

    if (location === 'ghana') {
      setShowPaymentModal(true)
    } else {
      setShowNonGhanaModal(true)
    }
  }

  const handleVipPaymentSuccess = (reference: string) => {
    try {
      const prev = JSON.parse(localStorage.getItem('purchasedPackages') || '[]')
      const next = Array.from(new Set([...(Array.isArray(prev) ? prev : []), selectedVipPackage]))
      localStorage.setItem('purchasedPackages', JSON.stringify(next))
    } catch {}

    setShowPaymentModal(false)
    setShowLocationModal(false)
    setShowNonGhanaModal(false)
    setActiveCardIndex(null)
    window.location.href = '/dashboard?from=payment_success'
  }

  const renderVipMatchResult = (match: any, vipType: string) => {
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
    const vipData = VIP_MATCHES_DATA[vipType]
    if (!vipData) return null
    const isPurchased = purchasedPackages.includes(vipData.name)
    const isResultsUpdated = vipResultsUpdated[vipType]
    const isSoldOut = vipSoldOut[vipType]
    const bookingCodes = adminBookingCodes[vipType]

    return (
      <div className="relative text-center bg-gray-50 rounded-lg p-3">
        {/* Date Header - Only show when results are updated */}
        {isResultsUpdated && (
          <div className="text-red-500 text-sm font-medium mb-4">
            {/* You may want to add a date header here if available */}
          </div>
        )}

        {/* Sample Matches - Locked until purchase */}
        <div className="mb-2">
          {!isPurchased && vipType === 'vip1' && (
            <div className="bg-gray-200 text-gray-700 text-sm font-semibold py-3 px-4 rounded mb-4">
              🔒 Locked — Purchase {vipData.name} to view games and booking codes
            </div>
          )}
          {/* Sold Out Banner - Only show when sold out and results not updated */}
          {isPurchased && isSoldOut && !isResultsUpdated && (
            <div className="bg-red-600 text-white text-sm font-bold py-2 px-4 rounded mb-4">
              SOLD OUT
            </div>
          )}
          {isPurchased && (
            <div className="space-y-2">
              {vipData.matches.map((match: any) => (
                <div key={match.id} className="text-left">
                  <div className="text-sm text-gray-800 font-bold mb-2">{match.homeTeam} vs {match.awayTeam}</div>
                  {renderVipMatchResult(match, vipType)}
                </div>
              ))}
            </div>
          )}
        </div>

        {!isResultsUpdated && (
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
                onClick={() => handleVipBuyNowClick(vipType, cardIndex)}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Buy Now {(adminVipPackages[vipType] as any)?.price || vipData.price}
              </button>
            )}
          </div>
        )}

        {/* Show matches for VIP 2 and VIP 3 when results are updated */}
        {isResultsUpdated && vipType !== 'vip1' && (
          <div className="space-y-2">
            {vipData.matches.map((match: any) => (
              <div key={match.id} className="text-left">
                <div className="text-sm text-gray-800 font-bold mb-2">{match.homeTeam} vs {match.awayTeam}</div>
                {renderVipMatchResult(match, vipType)}
              </div>
            ))}
          </div>
        )}

        {/* Buy Now button for VIP 2 and VIP 3 when results are updated */}
        {isResultsUpdated && !isPurchased && vipType !== 'vip1' && (
          <button
            onClick={() => handleVipBuyNowClick(vipType, cardIndex)}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 px-6 rounded-lg font-semibold transition-colors mt-4"
          >
            Buy Now {(adminVipPackages[vipType] as any)?.price || vipData.price}
          </button>
        )}

        {/* Purchased status for VIP 2 and VIP 3 when results are updated */}
        {isResultsUpdated && isPurchased && vipType !== 'vip1' && (
          <div className="space-y-2 mt-4">
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
        )}

        {/* Modals for each VIP type */}
        {showLocationModal && activeCardIndex === cardIndex && (
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onLocationSelect={handleVipLocationSelect}
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
            onPaymentSuccess={handleVipPaymentSuccess}
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

  return (
    <main className="min-h-screen text-white">
      <Navbar onPredictionsClick={() => {}} />
      
      {/* Hero Section */}
      <section 
        className="relative py-32 px-4 pt-40 min-h-[100vh] bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-background.png.png)' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Expert Sports
            <span className="block text-[#f59e0b]">Predictions</span>
          </h1>
          
          <p className="text-lg md:text-xl text-indigo-200 mb-6 max-w-2xl mx-auto">
            Get professional betting tips and predictions for football matches. 
            Make informed decisions with our expert analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => handleButtonClick('/vip')}
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors"
            >
              Join VIP
            </button>
            <button
              onClick={() => handleButtonClick('/vvip')}
              className="border-2 border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors"
            >
              Join Telegram
            </button>
          </div>
        </div>
      </section>

      {/* Today's Top Predictions Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {(() => {
              if (activeTab === 'today' && !selectedDate) return "Today's Top Predictions";
              if (activeTab === 'yesterday') return "Yesterday's Top Predictions";
              if (activeTab === 'tomorrow') return "Tomorrow's Top Predictions";
              if (activeTab === 'custom' && selectedDate) {
                // Format date as e.g. 15 September 2025
                const d = new Date(selectedDate);
                const day = d.getDate();
                const month = d.toLocaleString('default', { month: 'long' });
                const year = d.getFullYear();
                return `${day} ${month} ${year}'s Top Predictions`;
              }
              // fallback for any other case
              return "Top Predictions";
            })()}
          </h2>
          
          {/* Date Filter Tabs */}
          <div className="flex justify-center items-center mb-8 space-x-4">
            {/* Date Range Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => {
                  setActiveTab('yesterday');
                  setSelectedDate(null);
                }}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'yesterday' 
                    ? 'bg-[#191970] text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yesterday
              </button>
              <button 
                onClick={() => {
                  setActiveTab('today');
                  setSelectedDate(null);
                }}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'today' 
                    ? 'bg-[#191970] text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button 
                onClick={() => {
                  setActiveTab('tomorrow');
                  setSelectedDate(null);
                }}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'tomorrow' 
                    ? 'bg-[#191970] text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tomorrow
              </button>
            </div>
            {/* Date Picker Icon - trigger native picker reliably */}
            <div className="relative">
              <input
                id="date-picker"
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    setActiveTab('custom');
                    setSelectedDate(e.target.value);
                  }
                }}
                ref={(el) => {
                  // attach to window for button handler below
                  // @ts-ignore
                  window.__datePickerEl = el;
                }}
              />
              <button
                type="button"
                onClick={() => {
                  // Prefer showPicker where supported
                  const el = (window as any).__datePickerEl as HTMLInputElement | undefined;
                  if (el) {
                    // @ts-ignore
                    if (typeof el.showPicker === 'function') {
                      // @ts-ignore
                      el.showPicker();
                    } else {
                      el.click();
                      el.focus();
                    }
                  }
                }}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors border border-gray-200"
                title="Pick a custom date"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Predictions List - Dynamic from API */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="space-y-3">
              {predictionsLoading && (
                <div className="text-center text-blue-600 font-medium py-8">Loading predictions...</div>
              )}
              {predictionsError && !predictionsLoading && (
                <div className="text-center text-red-600 font-medium py-8">{predictionsError}</div>
              )}
              {!predictionsLoading && !predictionsError && predictions.length === 0 && (
                <div className="text-center text-gray-500 py-8">No predictions found.</div>
              )}
              {/* Render all games from all bookings */}
              {!predictionsLoading && !predictionsError && predictions.length > 0 &&
                predictions.flatMap((booking: any) =>
                  (booking.games || []).map((game: any) => (
                    <div key={game.id || `${booking.id}-${game.home}-${game.away}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">{game.tournament}</div>
                          <div className="text-base font-bold text-gray-800">{game.home} vs {game.away}</div>
                        </div>
                        <div className="flex flex-col items-end min-w-[110px]">
                            <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-500 font-semibold mb-1">
                              Pick: 
                           
                              {game.prediction} </span>
                            <span className="text-xs text-gray-600 mt-1">
                              Odds: <span className="font-semibold">{game.odd}</span>
                            </span>
                            </div>
                          <div className="w-3 h-3 mt-2 bg-yellow-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              }
            </div>
          </div>

          
          {/* Booking Code Button */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowBookingPopup(!showBookingPopup)}
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              Booking Code
            </button>
            
            {/* Dropdown */}
            {showBookingPopup && (
              <div className="mt-2 bg-white rounded shadow-lg p-2 max-w-48 mx-auto">
                <div className="space-y-1">
                  {/* Sporty Code */}
                  <div className="bg-[#191970] text-white px-2 py-1 rounded flex items-center justify-between">
                    <span className="text-xs font-medium">Sporty: {predictions[0].booking_code}</span>
                <button 
                      onClick={() => {
                        navigator.clipboard.writeText(predictions[0].booking_code);
                      }}
                      className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Copy code"
                >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              
                  {/* MSport Code */}
                  {/* <div className="bg-[#191970] text-white px-2 py-1 rounded flex items-center justify-between">
                    <span className="text-xs font-medium">MSport: jddhdh</span>
                <button 
                      onClick={() => {
                        navigator.clipboard.writeText('jddhdh');
                      }}
                      className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Copy code"
                >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              
                  {/* Football.com Code */}
                  {/* <div className="bg-[#191970] text-white px-2 py-1 rounded flex items-center justify-between">
                    <span className="text-xs font-medium">Football.com: abc123</span>
                <button 
                      onClick={() => {
                        navigator.clipboard.writeText('abc123');
                      }}
                      className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Copy code"
                >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div> */} 
            </div>
          </div>
            )}
           </div>
           
        </div>
      </section>

      {/* VIP Packages Section */}
      <section id="vip-packages" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {vipLoading ? (
            <div className="text-xl font-semibold text-gray-800 text-center py-8">Loading VIP Packages...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {renderVIPCard('vip1', 0)}
              {renderVIPCard('vip2', 1)}
              {renderVIPCard('vip3', 2)}
            </div>
          )}
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
      <footer className="bg-[#191970] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold text-[#f59e0b] mb-4">BetGeniuz</h3>
              <p className="text-indigo-200 mb-4">
                Your trusted source for expert sports predictions and betting tips. Get professional analysis to make informed betting decisions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Home</a></li>
                <li><a href="/predictions" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Predictions</a></li>
                <li><a href="/about" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">About</a></li>
                <li><a href="/contact" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Help Center</a></li>
                <li><a href="/privacy" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">Terms of Service</a></li>
                <li><a href="/faq" className="text-indigo-200 hover:text-[#f59e0b] transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-indigo-400 mt-8 pt-8 text-center">
            <p className="text-indigo-200">
              © 2024 BetGeniuz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Sold Out Popup Modal */}
      {showSoldOutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Package Sold Out</h3>
              <p className="text-gray-600">
                Sorry, {soldOutVipType.toUpperCase()} package is currently sold out. 
                Please try again later or choose another package.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSoldOutPopup(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
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
            </div>
          </div>
        </div>
      )}


    </main>
  )
}