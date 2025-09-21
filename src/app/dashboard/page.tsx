'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { VIP_PACKAGES } from '@/config/paystack';
import Navbar from '@/components/Navbar';
import { fetchVIPMatches, fetchVIPResultsUpdated } from '@/data/vipMatches';

export default function Dashboard() {
  const { userData, isLoggedIn, isLoading } = useAuth();
  const [purchased, setPurchased] = useState<string[]>([])
  const [vipMatchesData, setVipMatchesData] = useState<any>({})
  const [vipResultsUpdated, setVipResultsUpdated] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoading, isLoggedIn])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('purchasedPackages') || '[]')
      if (Array.isArray(saved)) {
        setPurchased(saved)
      } else {
        // Add some sample data for testing if no purchases exist
        setPurchased(['VIP 1', 'VIP 2'])
      }
    } catch {
      // Add some sample data for testing
      setPurchased(['VIP 1', 'VIP 2'])
    }
  }, [])

  // Fetch VIP matches data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [matches, resultsUpdated] = await Promise.all([
          fetchVIPMatches(),
          fetchVIPResultsUpdated()
        ])
        setVipMatchesData(matches)
        setVipResultsUpdated(resultsUpdated)
      } catch (error) {
        console.error('Error fetching VIP data:', error)
        // Add sample data for testing
        setVipMatchesData({
          vip1: {
            name: 'VIP 1',
            matches: [
              { id: '1', homeTeam: 'Arsenal', awayTeam: 'Chelsea', option: 'Home', odds: '1.85', result: 'win' },
              { id: '2', homeTeam: 'Manchester United', awayTeam: 'Liverpool', option: 'Over 2.5', odds: '2.15', result: 'pending' }
            ],
            isResultsUpdated: true
          },
          vip2: {
            name: 'VIP 2',
            matches: [
              { id: '3', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', option: 'Away', odds: '1.95', result: 'win' },
              { id: '4', homeTeam: 'PSG', awayTeam: 'Bayern Munich', option: 'Draw', odds: '3.20', result: 'pending' }
            ],
            isResultsUpdated: false
          }
        })
        setVipResultsUpdated({ vip1: true, vip2: false })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Helper function to get purchased games with details
  const getPurchasedGames = () => {
    const games = []
    purchased.forEach((pkgName, index) => {
      const vipType = Object.keys(VIP_PACKAGES).find(key => VIP_PACKAGES[key as keyof typeof VIP_PACKAGES].name === pkgName)
      if (vipType && vipMatchesData[vipType]) {
        const isResultsUpdated = vipResultsUpdated[vipType] || vipMatchesData[vipType].isResultsUpdated
        games.push({
          id: index,
          packageName: pkgName,
          vipType,
          matches: vipMatchesData[vipType].matches || [],
          isResultsUpdated,
          bookingCodes: VIP_PACKAGES[vipType as keyof typeof VIP_PACKAGES].bookingCodes,
          price: VIP_PACKAGES[vipType as keyof typeof VIP_PACKAGES].amount,
          purchaseDate: new Date().toISOString().split('T')[0], // Mock date for now
          status: isResultsUpdated ? 'Completed' : 'Active'
        })
      }
    })
    return games
  }

  // Toggle card expansion
  const toggleCardExpansion = (cardId: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  // Helper function to render match result
  const renderMatchResult = (match: any) => {
    if (!match.result) return null
    
    return (
      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-2">
          <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
            Option: {match.option || match.prediction || 'N/A'}
          </div>
          <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
            Odds: {match.odds || 'N/A'}
          </div>
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

  const purchasedGames = getPurchasedGames()

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      
      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="bg-black text-white px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
        </div>

          {/* Welcome Card */}
          <div className="bg-white p-6 rounded-b-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">
              
              Welcome back, {(userData as any)?.username || 'User'}!

            </h2>
                  </div>

          {/* Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Active Subscription Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Subscription</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">VIP</div>
              <p className="text-sm text-gray-500">Valid until: Sep 7, 2025</p>
                </div>
                
            {/* Predictions Used Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Predictions Used</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">0</div>
              <p className="text-sm text-gray-500 mb-2">In The Last 30 days</p>
              <button 
                onClick={() => document.getElementById('games-purchased-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Games Purchased: {purchasedGames.length}
              </button>
                  </div>

            {/* Win Rate Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Win Rate</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">96%</div>
              <p className="text-sm text-gray-500">Based on your picks</p>
                  </div>
                </div>
                
          {/* Games Purchased */}
          <div id="games-purchased-section" className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Your Purchased Games</h3>
            
            {purchasedGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⚽</div>
                <p className="text-gray-500 text-lg">No purchases yet.</p>
                <p className="text-gray-400 text-sm mt-2">Visit our VIP section to get started!</p>
                <button 
                  onClick={() => window.location.href = '/vip'}
                  className="mt-4 bg-[#f59e0b] hover:bg-[#d97706] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Browse VIP Packages
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {purchasedGames.map((game) => (
                  <div key={game.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Card Header - Clickable */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCardExpansion(game.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-semibold text-gray-800">{game.packageName}</h4>
                            <span className="text-sm text-gray-500">({game.matches.length} games)</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Purchased: {game.purchaseDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">GHS {game.price}</div>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-500">+</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              game.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {game.status}
                            </span>
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedCards.has(game.id) ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedCards.has(game.id) && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-4">
                          {/* Booking Codes Section */}
                          <div className="mb-6">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Booking Codes</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded-lg border">
                                <div className="text-xs text-gray-500 mb-1">Sporty</div>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(game.bookingCodes.sporty)}
                                  className="text-sm font-mono text-blue-600 hover:text-blue-800 underline"
                                >
                                  {game.bookingCodes.sporty}
                                </button>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <div className="text-xs text-gray-500 mb-1">MSport</div>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(game.bookingCodes.msport)}
                                  className="text-sm font-mono text-green-600 hover:text-green-800 underline"
                                >
                                  {game.bookingCodes.msport}
                                </button>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <div className="text-xs text-gray-500 mb-1">Football</div>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(game.bookingCodes.football)}
                                  className="text-sm font-mono text-purple-600 hover:text-purple-800 underline"
                                >
                                  {game.bookingCodes.football}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Games Details */}
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Games in this package</h5>
                            {game.matches.length === 0 ? (
                              <p className="text-gray-500 text-sm">No games available yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {game.matches.map((match: any, matchIndex: number) => (
                                  <div key={matchIndex} className="bg-white rounded-lg p-4 border">
                                    <div className="flex items-center justify-between mb-3">
                                      <h6 className="font-semibold text-gray-800">
                                        {match.homeTeam} vs {match.awayTeam}
                                      </h6>
                                      {match.result && (
                                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                          match.result === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {match.result === 'win' ? 'WON' : 'LOST'}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-600">Prediction:</span>
                                        <span className="ml-2 text-gray-800">{match.prediction || match.option || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-600">Odds:</span>
                                        <span className="ml-2 text-gray-800">{match.odds || 'N/A'}</span>
                                      </div>
                                    </div>

                                    {game.isResultsUpdated && match.result && (
                                      <div className="mt-3 pt-3 border-t border-gray-200">
                                        {renderMatchResult(match)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
              </div>
            </div>


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
  );
}
