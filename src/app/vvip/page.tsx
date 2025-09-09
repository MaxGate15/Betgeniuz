'use client'

import Navbar from '@/components/Navbar'

export default function VVIP() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar onPredictionsClick={() => window.location.href = '/predictions'} />
      
      {/* VVIP Header */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="text-[#f59e0b]">VVIP</span> Access
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock premium predictions, exclusive insights, and VIP features. 
            Join the elite betting community and maximize your winning potential.
          </p>
          <div className="flex justify-center">
            <div className="bg-[#f59e0b] text-white px-8 py-3 rounded-full text-lg font-semibold">
              🏆 Premium Membership
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Packages */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your VIP Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700 relative">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                <div className="text-4xl font-bold text-[#f59e0b] mb-2">$29</div>
                <div className="text-gray-400">per month</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Daily Predictions (5-8 tips)
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Basic Statistics
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Email Notifications
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Mobile Access
                </li>
              </ul>
              
              <a 
                href="/login?plan=basic" 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block"
              >
                Get Started
              </a>
            </div>

            {/* Premium Plan - Featured */}
            <div className="bg-[#1e293b] rounded-lg p-8 border-2 border-[#f59e0b] relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#f59e0b] text-white px-6 py-2 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="text-4xl font-bold text-[#f59e0b] mb-2">$79</div>
                <div className="text-gray-400">per month</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Daily Predictions (10-15 tips)
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Advanced Statistics & Analytics
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Priority Support
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Live Match Updates
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Exclusive VIP Chat
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Early Access to Predictions
                </li>
              </ul>
              
              <a 
                href="/login?plan=premium" 
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block"
              >
                Choose Premium
              </a>
            </div>

            {/* Elite Plan */}
            <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700 relative">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
                <div className="text-4xl font-bold text-[#f59e0b] mb-2">$149</div>
                <div className="text-gray-400">per month</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Unlimited Predictions
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Personal Betting Advisor
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  24/7 VIP Support
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Custom Betting Strategies
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Exclusive Events Access
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#f59e0b] mr-3">✓</span>
                  Risk Management Tools
                </li>
              </ul>
              
              <a 
                href="/login?plan=elite" 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block"
              >
                Go Elite
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[#1e293b]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            VIP Features & Benefits
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">High Accuracy</h3>
              <p className="text-gray-400">Expert analysis with proven track record</p>
            </div>
            
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-gray-400">Live match updates and instant notifications</p>
            </div>
            
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile First</h3>
              <p className="text-gray-400">Optimized for all devices and platforms</p>
            </div>
            
            <div className="text-center">
              <div className="text-[#f59e0b] text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-gray-400">Professional betting strategies and advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What Our VIP Members Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-[#f59e0b] text-2xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-300 mb-4">
                "BetGeniuz VIP has completely transformed my betting strategy. The predictions are incredibly accurate!"
              </p>
              <div className="text-white font-semibold">- Michael R.</div>
              <div className="text-gray-400 text-sm">Premium Member</div>
            </div>
            
            <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-[#f59e0b] text-2xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-300 mb-4">
                "The exclusive insights and real-time updates give me a huge advantage. Worth every penny!"
              </p>
              <div className="text-white font-semibold">- Sarah L.</div>
              <div className="text-gray-400 text-sm">Elite Member</div>
            </div>
            
            <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-[#f59e0b] text-2xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-300 mb-4">
                "Professional service with amazing support. My success rate has improved dramatically!"
              </p>
              <div className="text-white font-semibold">- David K.</div>
              <div className="text-gray-400 text-sm">Premium Member</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Winning?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of successful bettors who trust BetGeniuz for their predictions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login?plan=premium" 
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start VIP Trial
            </a>
            <a 
              href="/predictions" 
              className="border-2 border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View Free Predictions
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
