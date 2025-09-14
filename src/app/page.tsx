'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const [activeTab, setActiveTab] = useState('today')
  const [showBookingPopup, setShowBookingPopup] = useState(false)
  const { isLoggedIn } = useAuth()

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



  return (
    <main className="min-h-screen text-white">
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      
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

      {/* Winning Team Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#191970] to-[#2e2e8f]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f59e0b] mb-6 uppercase">
            BetGeniuz
          </h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto leading-relaxed mb-8">
            Join the winning team today and discover accurate high and low-risk predictions designed to enhance your success. Don't wait—be part of our next big win and unlock countless opportunities to stay ahead in the game!
          </p>
          
          {/* Get Started Button */}
          <button 
            onClick={() => handleButtonClick('/vvip')}
            className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#191970] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-[#f59e0b] mb-4">BetGeniuz</h3>
              <p className="text-indigo-200 mb-4">
                Your trusted source for expert sports predictions and betting tips. 
                Get professional analysis to make informed betting decisions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-indigo-200 hover:text-white transition-colors">Home</a></li>
                <li><button onClick={() => handleButtonClick('/predictions')} className="text-indigo-200 hover:text-white transition-colors">Predictions</button></li>
                <li><a href="/about" className="text-indigo-200 hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="text-indigo-200 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-indigo-400 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-indigo-200 text-sm">Verified Predictions</span>
                </div>
                
              <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-indigo-200 text-sm">Expert Analysis</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-indigo-200 text-sm">Gambling Awareness</span>
                </div>
              </div>
              
              {/* Copyright */}
              <p className="text-indigo-200">
                © 2024 BetGeniuz. All rights reserved. | 
                <a href="#" className="hover:text-white transition-colors ml-2">Privacy Policy</a> | 
                <a href="#" className="hover:text-white transition-colors ml-2">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
