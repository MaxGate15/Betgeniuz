'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { VIP_PACKAGES } from '@/config/paystack';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { userData, isLoggedIn, isLoading } = useAuth();
  const [purchased, setPurchased] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoading, isLoggedIn])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('purchasedPackages') || '[]')
      if (Array.isArray(saved)) setPurchased(saved)
    } catch {}
  }, [])

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
              Welcome back, {userData?.username || 'User'}!
            </h2>
                  </div>

          {/* Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Active Subscription Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Subscription</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">VVIP</div>
              <p className="text-sm text-gray-500">Valid until: Sep 7, 2025</p>
                </div>
                
            {/* Predictions Used Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Predictions Used</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">0</div>
              <p className="text-sm text-gray-500 mb-2">In The Last 30 days</p>
              <a href="#" className="text-sm text-blue-600 underline hover:text-blue-800">
                Games Purchased: 0
              </a>
                  </div>

            {/* Win Rate Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Win Rate</h3>
              <div className="text-3xl font-bold text-red-600 mb-1">96%</div>
              <p className="text-sm text-gray-500">Based on your picks</p>
                  </div>
                </div>
                
          {/* Games Purchased */}
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Games Purchased</h3>
            {purchased.length === 0 ? (
              <p className="text-gray-500">No purchases yet.</p>
            ) : (
              <div className="space-y-4">
                {purchased.map((pkg) => {
                  const entry = Object.values(VIP_PACKAGES).find(p => p.name === pkg) as any
                  return (
                    <div key={pkg} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{pkg}</div>
                          <div className="text-sm text-gray-500">Booking Codes</div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center justify-between gap-4">
                            <span>Sporty:</span>
                            <button onClick={() => navigator.clipboard.writeText(entry?.bookingCodes?.sporty)} className="text-blue-600 underline">
                              {entry?.bookingCodes?.sporty || '-'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>MSport:</span>
                            <button onClick={() => navigator.clipboard.writeText(entry?.bookingCodes?.msport)} className="text-blue-600 underline">
                              {entry?.bookingCodes?.msport || '-'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Football.com:</span>
                            <button onClick={() => navigator.clipboard.writeText(entry?.bookingCodes?.football)} className="text-blue-600 underline">
                              {entry?.bookingCodes?.football || '-'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
  );
}
