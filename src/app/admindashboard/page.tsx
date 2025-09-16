'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  // Track loading and error state for each VIP package availability action
  const [vipAvailabilityLoading, setVipAvailabilityLoading] = useState<{[id: number]: boolean}>({});
  const [vipAvailabilityError, setVipAvailabilityError] = useState<{[id: number]: string}>({});
  // Unread notifications count from API
  const [unreadCount, setUnreadCount] = useState<number|null>(null);
  const [unreadCountLoading, setUnreadCountLoading] = useState(false);
  const [unreadCountError, setUnreadCountError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchUnreadCount = async () => {
      setUnreadCountLoading(true);
      setUnreadCountError('');
      try {
        const res = await fetch('https://api.betgeniuz.com/notifications/unread/count');
        if (!res.ok) throw new Error('Failed to fetch unread notifications count');
        const num = await res.json();
        setUnreadCount(typeof num === 'number' ? num : null);
      } catch (err) {
        setUnreadCountError('Could not load unread notifications count');
      }
      setUnreadCountLoading(false);
    };
    fetchUnreadCount();
  }, []);
  // Fetch betting slips from backend on mount
  useEffect(() => {
    const fetchSlips = async () => {
      setSlipsLoading(true);
      setSlipsError('');
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('https://api.betgeniuz.com/games/all-bookings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch betting slips');
        const data = await res.json();
        // Normalize slips and games for UI based on API response
        const normalized = (Array.isArray(data) ? data : []).map((item: any, idx: number) => {
          const booking = item.booking || {};
          const games = Array.isArray(item.games) ? item.games.map((g: any, i: number) => ({
            id: g.id || i + 1,
            home_team: g.home_team || '',
            away_team: g.away_team || '',
            odds: g.odds || '',
            league: g.tournament || '',
            date: g.match_day || '',
            prediction: g.prediction || '',
            result: g.result || g.match_status || 'pending',
          })) : [];
          // Calculate total odds if not present
          const totalOdds = games.length > 0 ? games.reduce((acc: number, g: any) => acc * (parseFloat(g.odds) || 1), 1).toFixed(2) : 'N/A';
          return {
            id: booking.id || idx + 1,
            name: booking.share_code || `Slip ${idx + 1}`,
            totalOdds,
            price: booking.price || '',
            createdAt: booking.created_at || booking.deadline || '',
            status: booking.status || 'uploaded',
            games,
            bookingCodes: {
              sporty: booking.share_code || '',
              msport: '',
              football: ''
            },
            deadline: booking.deadline || '',
            shareCode: booking.share_code || '',
            shareURL: booking.share_url || '',
            category: booking.category || '',
          };
        });
        setUploadedSlips(normalized);
        console.log('Fetched and normalized slips:', normalized);
      } catch (err: any) {
        setSlipsError(err?.message || 'Could not load betting slips');
      }
      setSlipsLoading(false);
    };
    fetchSlips();
  }, []);
    // State for VIP packages
  const [vipPackages, setVipPackages] = useState<any[]>([]);
  const [vipLoading, setVipLoading] = useState(false);
  const [vipError, setVipError] = useState('');
  const [priceInput, setPriceInput] = useState('');

  useEffect(() => {
    const fetchVipPackages = async () => {
      setVipLoading(true);
      setVipError('');
      try {
        const res = await fetch('https://api.betgeniuz.com/games/vip-list');
        if (!res.ok) throw new Error('Failed to fetch VIP packages');
        const data = await res.json();
        setVipPackages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setVipError(err?.message || 'Could not load VIP packages');
      }
      setVipLoading(false);
    };
    fetchVipPackages();
  }, []);
  // State for new game form
  const [newGame, setNewGame] = useState({
    homeTeam: '',
    awayTeam: '',
    prediction: '',
    odds: '',
    date: '',
    league: '',
    description: '',
    category: 'free',
    result: 'pending'
  });
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [games, setGames] = useState([
    {
      id: 1,
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      prediction: 'Home Win',
      odds: '2.15',
      status: 'active',
      date: '2024-01-15',
      league: 'Premier League',
      description: 'Strong home form expected',
      available: true,
      category: 'free',
      result: 'pending'
    }
  ]);

  // Notifications state from API
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError('');
      try {
        const res = await fetch('https://api.betgeniuz.com/notifications/all');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        // Ensure data is an array and fields are preserved
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setNotificationsError(err?.message || 'Could not load notifications');
      }
      setNotificationsLoading(false);
    };
    fetchNotifications();
  }, []);

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError('');
      try {
        const res = await fetch('https://api.betgeniuz.com/auth/all-users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        // Map API response to include required fields with defaults
        const mapped = (Array.isArray(data) ? data : []).map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          phone: u.phone,
          status: u.status,
          vip: typeof u.vip === 'boolean' ? u.vip : false,
          lastActivity: u.lastActivity || '',
          signUpDate: u.signUpDate || '',
        }));
        setUsers(mapped);
      } catch (err: any) {
        setUsersError(err?.message || 'Could not load users');
      }
      setUsersLoading(false);
    };
    fetchUsers();
  }, []);

  const [filteredGames, setFilteredGames] = useState(games)
  const [loadInput, setLoadInput] = useState('')
  const [loadedGames, setLoadedGames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [gamesByCategory, setGamesByCategory] = useState({
    free: [] as any[],
    vip1: [] as any[],
    vip2: [] as any[],
    vip3: [] as any[]
  })
  const [uploadedSlips, setUploadedSlips] = useState<any[]>([])
  const [slipsLoading, setSlipsLoading] = useState(false)
  const [slipsError, setSlipsError] = useState('')
  const [selectedSlip, setSelectedSlip] = useState<any>(null)
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [sportyCodeInput, setSportyCodeInput] = useState('')
  const [msportCodeInput, setMsportCodeInput] = useState('')
  const [footballCodeInput, setFootballCodeInput] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [smsRecipients, setSmsRecipients] = useState<'all' | 'custom'>('all')
  const [customNumbers, setCustomNumbers] = useState('')
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [isBookingAttached, setIsBookingAttached] = useState(false)
  const [showPricePanel, setShowPricePanel] = useState(false)
  const [vipBookingCodes, setVipBookingCodes] = useState({
    vip1: { sporty: 'SP12345', msport: 'MS12345', football: 'FB12345' },
    vip2: { sporty: 'SP22345', msport: 'MS22345', football: 'FB22345' },
    vip3: { sporty: 'SP32345', msport: 'MS32345', football: 'FB32345' }
  })

  // Update price input when activeFilter changes only
  useEffect(() => {
    if (activeFilter !== 'free') {
      const currentPackage = vipPackages.find(p => p.id === (activeFilter === 'vip1' ? 1 : activeFilter === 'vip2' ? 2 : activeFilter === 'vip3' ? 3 : 0));
      setPriceInput(currentPackage?.amount?.toString() || '');
    }
  }, [activeFilter]);

  // Check authentication on component mount
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn')
    if (!isAdminLoggedIn) {
      router.push('/')
    }
  }, [router])

  // Update filtered games when games change
  useEffect(() => {
    setFilteredGames(games)
  }, [games])

  const handleAddGame = () => {
    if (newGame.homeTeam && newGame.awayTeam && newGame.prediction) {
      const game = {
        id: Date.now(),
        ...newGame,
        status: 'pending',
        available: true
      }
      const updatedGames = [...games, game]
      setGames(updatedGames)
      setFilteredGames(updatedGames)
      setNewGame({
        homeTeam: '',
        awayTeam: '',
        prediction: '',
        odds: '',
        date: '',
        league: '',
        description: '',
        category: 'free',
        result: 'pending'
      })
    }
  }

  const toggleGameStatus = (id: number) => {
    const updatedGames = games.map(game => 
      game.id === id 
        ? { ...game, status: game.status === 'active' ? 'pending' : 'active' }
        : game
    )
    setGames(updatedGames)
    setFilteredGames(updatedGames)
  }

  const deleteGame = (id: number) => {
    const updatedGames = games.filter(game => game.id !== id)
    setGames(updatedGames)
    setFilteredGames(updatedGames)
  }

  const updateGameResult = (id: number, result: 'won' | 'lost' | 'pending') => {
    const updatedGames = games.map(game => 
      game.id === id ? { ...game, result } : game
    )
    setGames(updatedGames)
    setFilteredGames(updatedGames)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    router.push('/')
  }

  const markNotificationRead = async (id: number) => {
  try {
    // Call the API to mark as read
    const res = await fetch(`https://api.betgeniuz.com/notifications/${id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to mark notification as read");
    }

    // Update local state after success
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};


  // Function to add new sign-up notification
  const addSignUpNotification = (username: string) => {
    const newNotification = {
      id: Date.now(),
      message: `New user signed up: ${username}`,
      type: 'info' as const,
      read: false,
      timestamp: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  // Function to add purchase notification
  const addPurchaseNotification = (username: string, packageName: string) => {
    const newNotification = {
      id: Date.now(),
      message: `${packageName} package purchased by ${username}`,
      type: 'success' as const,
      read: false,
      timestamp: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ))
  }
  const [totalUsers, setTotalUsers] = useState<number|null>(null)
  const [totalUsersLoading, setTotalUsersLoading] = useState(false)
  const [totalUsersError, setTotalUsersError] = useState('')

  // Fetch total users from API on mount
  useEffect(() => {
    const fetchTotalUsers = async () => {
      setTotalUsersLoading(true)
      setTotalUsersError('')
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch('https://api.betgeniuz.com/auth/total-users', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        if (!res.ok) throw new Error('Failed to fetch total users')
        const num = await res.json()
        setTotalUsers(num)
      } catch (err) {
        setTotalUsersError('Could not load total users')
      }
      setTotalUsersLoading(false)
    }
    fetchTotalUsers()
  }, [])
  

  const toggleUserVIP = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, vip: !user.vip } : user
    ))
  }

  // Function to check if user is inactive (more than 30 days since last activity)
  const isUserInactive = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity)
    const currentDate = new Date()
    const daysDifference = Math.floor((currentDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    console.log(`User last activity: ${lastActivity}, Days difference: ${daysDifference}, Is inactive: ${daysDifference > 30}`)
    return daysDifference > 30
  }

  // Function to get days since last activity
  const getDaysSinceActivity = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity)
    const currentDate = new Date()
    const daysDifference = Math.floor((currentDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDifference
  }


  // Real API function to load games from backend
  const loadGamesFromAPI = async (bookingCode: string, category: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`https://api.betgeniuz.com/games/load-booking/${bookingCode}`)
      if (!res.ok) throw new Error('Failed to load games')
      const data = await res.json()
      // Map API response to local game format
      const games = (data.games || []).map((g: any, idx: number) => ({
        id: Date.now() + idx,
        homeTeam: g.home,
        awayTeam: g.away,
        prediction: g.prediction,
        odds: g.odd,
        status: 'active',
        date: data.deadline,
        league: g.tournament,
        description: '',
        available: true,
        category,
        result: 'pending',
        bookingCode: bookingCode,
        platform: 'SportyBet',
        shareCode: data.shareCode,
        shareURL: data.shareURL
      }))
      setGamesByCategory(prev => ({
        ...prev,
        [category]: [...(prev[category as keyof typeof prev] || []), ...games]
      }))
      setLoadedGames(games)
      alert(`Successfully loaded ${games.length} games from SportyBet with booking code: ${bookingCode}`)
    } catch (err) {
      alert('Failed to load games. Please check the booking code and try again.')
    }
    setIsLoading(false)
  }
    const uploadSlip = async (slip: any) => {
    try {
      // Compose games array in required format
      const games = (slip.games || []).map((g: any) => ({
        home: g.homeTeam || g.home,
        away: g.awayTeam || g.away,
        tournament: g.league || g.tournament,
        sport: g.sport || 'Football',
        odd: g.odds || g.odd,
        prediction: g.prediction,
        match_status: g.match_status || 'pending',
        match_day: g.match_day || slip.date || slip.deadline
      }));
      // Determine the correct price to send
      let priceToSend = '';
      if (slip.price && slip.price !== '0') {
        priceToSend = slip.price;
      } else if (typeof priceInput !== 'undefined' && priceInput !== null && priceInput !== '' && priceInput !== '0') {
        priceToSend = priceInput;
      } else {
        // Try to get from VIP package if possible
        const currentVipPackage = vipPackages.find(p => p.id === (slip.category === 'vip1' ? 1 : slip.category === 'vip2' ? 2 : slip.category === 'vip3' ? 3 : 0));
        if (currentVipPackage && currentVipPackage.amount) {
          priceToSend = String(currentVipPackage.amount);
        } else {
          priceToSend = '0';
        }
      }
      const body = {
        shareCode: slip.shareCode,
        shareURL: slip.shareURL,
        deadline: slip.date || slip.deadline,
        category: slip.category,
        price: priceToSend,
        games
      };
      console.log('Uploading slip:', body);
      const res = await fetch('https://api.betgeniuz.com/games/upload-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errText = await res.text();
        let errorMsg = 'Failed to upload slip.';
        try {
          const errJson = JSON.parse(errText);
          if (errJson.detail) {
            if (Array.isArray(errJson.detail)) {
              errorMsg += '\n' + errJson.detail.map((d: any) => d.msg).join('\n');
            } else if (typeof errJson.detail === 'string') {
              errorMsg += '\n' + errJson.detail;
            }
          }
        } catch {}
        alert(errorMsg);
        console.error('Upload error:', errText);
        return;
      }
      alert('Slip uploaded successfully!');
      setUploadedSlips(prev => prev.map(s => s.id === slip.id ? { ...s, status: 'uploaded' } : s));
    } catch (err) {
      alert('Failed to upload slip. See console for details.');
      console.error('Upload error:', err);
    }
  }

  const handleLoadGames = () => {
    if (!loadInput.trim()) {
      alert('Please enter a booking code')
      return
    }
    
    if (activeFilter === 'all') {
      alert('Please select a specific category (Free, VIP 1, VIP 2, or VIP 3) to load games')
      return
    }
    
  loadGamesFromAPI(loadInput, activeFilter)
  }
    const updateGamesStatus = async (bookingId: number | string, games: { game_id: number, status: string }[]) => {
    try {
      const res = await fetch(`https://api.betgeniuz.com/games/update-games-status/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games }),
      });
      if (!res.ok) {
        const errText = await res.text();
        alert('Failed to update game statuses.');
        console.error('Update error:', errText);
        return;
      }
      // Update local state for uploadedSlips and selectedSlip
      setUploadedSlips(prev => prev.map(slip => {
        if (slip.id !== bookingId) return slip;
        return {
          ...slip,
          games: slip.games.map((g: any) => {
            const found = games.find(upd => upd.game_id === g.id);
            return found ? { ...g, result: found.status } : g;
          })
        };
      }));
      if (selectedSlip && selectedSlip.id === bookingId) {
        setSelectedSlip((prev: any) => ({
          ...prev,
          games: prev.games.map((g: any) => {
            const found = games.find(upd => upd.game_id === g.id);
            return found ? { ...g, result: found.status } : g;
          })
        }));
      }
      // Optionally show a success notification
      alert('Game statuses updated successfully!');
    } catch (err) {
      alert('Failed to update game statuses. See console for details.');
      console.error('Update error:', err);
    }
  };

  const clearLoadInput = () => {
    setLoadInput('')
  }

  return (
    <div className="min-h-screen bg-[#191970] text-white">
      {/* Header */}
      <header className="bg-[#191970] border-b border-indigo-400 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">BetGeniuz Admin</h1>
            <span className="text-indigo-200 text-sm">Control Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-indigo-200">Admin User</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-[#2e2e8f] p-1 rounded-lg mb-8">
          {['dashboard', 'games', 'gamescontrol', 'users', 'notifications', 'sms', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-[#f59e0b] text-white'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              {tab === 'gamescontrol' ? 'Games Control' : tab === 'sms' ? 'SMS' : tab}
            </button>
          ))}
        </div>

        {/* Dashboard Overview Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Users</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalUsersLoading ? 'Loading...' : totalUsersError ? 'Error' : totalUsers !== null ? totalUsers : '--'}
                  </p>
                </div>
              </div>
            </div>


             <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg">
               <div className="flex items-center">
                 <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <p className="text-xs font-medium text-gray-600">VIP Packages Available</p>
                   <p className="text-lg font-semibold text-gray-900">{vipPackages.filter(p => p.available).length}/3</p>
                 </div>
               </div>
             </div>

                         <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg">
               <div className="flex items-center">
                 <div className="p-2 rounded-full bg-red-100 text-red-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <p className="text-xs font-medium text-gray-600">Unread Notifications</p>
                   <p className="text-lg font-semibold text-gray-900">
                     {unreadCountLoading
                       ? 'Loading...'
                       : unreadCountError
                         ? 'Error'
                         : unreadCount !== null
                           ? unreadCount
                           : '--'}
                   </p>
                 </div>
               </div>
             </div>
          </div>
        )}

                 {/* Games Management Tab */}
         {activeTab === 'games' && (
           <div className="space-y-6">
             {/* Category Filter */}
             <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
               <h2 className="text-xl font-bold mb-4">Filter Games by Category</h2>
               <div className="flex flex-wrap gap-4">
                 <button
                   onClick={() => {
                     setLoadedGames([])
                     setActiveFilter('all')
                     setSelectedSlip(null)
                   }}
                   className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                     activeFilter === 'all' 
                       ? 'bg-[#f59e0b] text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   Slips ({uploadedSlips.length})
                 </button>
                 <button
                   onClick={() => {
                     setLoadedGames(gamesByCategory.free)
                     setActiveFilter('free')
                     setLoadInput('')
                   }}
                   className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                     activeFilter === 'free' 
                       ? 'bg-[#f59e0b] text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   Free Predictions
                 </button>
                 <button
                   onClick={() => {
                     setLoadedGames(gamesByCategory.vip1)
                     setActiveFilter('vip1')
                     setLoadInput('')
                   }}
                   className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                     activeFilter === 'vip1' 
                       ? 'bg-[#f59e0b] text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   VIP 1
                 </button>
                 <button
                   onClick={() => {
                     setLoadedGames(gamesByCategory.vip2)
                     setActiveFilter('vip2')
                     setLoadInput('')
                   }}
                   className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                     activeFilter === 'vip2' 
                       ? 'bg-[#f59e0b] text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   VIP 2
                 </button>
                 <button
                   onClick={() => {
                     setLoadedGames(gamesByCategory.vip3)
                     setActiveFilter('vip3')
                     setLoadInput('')
                   }}
                   className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                     activeFilter === 'vip3' 
                       ? 'bg-[#f59e0b] text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   VIP 3
                 </button>
               </div>
             </div>
             
            {/* Slips Display - Only show when "Slips" is selected */}
            {activeFilter === 'all' && (
              <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold">Uploaded Slips</h2>
                  <p className="text-sm text-gray-600 mt-1">Click on a slip to view and edit games</p>
                </div>
                
                {slipsLoading ? (
                  <div className="px-6 py-8 text-center text-gray-500">Loading slips...</div>
                ) : slipsError ? (
                  <div className="px-6 py-8 text-center text-red-500">
                    <strong>Error loading slips:</strong> {slipsError}
                  </div>
                ) : uploadedSlips.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No slips uploaded yet. Load games and click "Upload" to create slips.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {uploadedSlips.map((slip: any) => (
                      <div key={slip.id}>
                      <div
                        className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedSlip?.id === slip.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                          onClick={() => setSelectedSlip(selectedSlip?.id === slip.id ? null : slip)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {slip.category === 'free'
                                ? 'Free Slip'
                                : slip.category
                                ? `${slip.category.toUpperCase()} Slip`
                                : slip.shareCode}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                                                            {(slip.games?.length || slip.booking?.games?.length || 0)} games • 
                                              Total Odds: {slip.totalOdds || slip.booking?.totalOdds || 'N/A'} • 
                                              Price: {slip.price || slip.booking?.price || 'N/A'} • 
                                              {(() => {
                                                const rawDate = slip.createdAt || slip.booking?.createdAt || '';
                                                if (!rawDate) return '';
                                                const d = new Date(rawDate);
                                                if (isNaN(d.getTime())) return rawDate;
                                                return d.toLocaleString(undefined, {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true,
                                                });
                                              })()}
                                              </p>
                          </div>    <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              slip.status === 'updated'
                                ? 'bg-green-100 text-green-800'
                                : slip.status === 'uploaded'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {slip.status || 'uploaded'}
                            </span>
                            {slip.isEdited && (
                              <button
                                className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                onClick={e => { e.stopPropagation(); /* Add update functionality here */ }}
                              >
                                Updated
                              </button>
                            )}
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                selectedSlip?.id === slip.id ? 'rotate-180' : ''
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
                        
                        {/* Selected Slip Games Display - Show right under the clicked slip */}
                        {selectedSlip?.id === slip.id && (
                          <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden mx-6 mb-4">
              <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">{selectedSlip.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedSlip.games.length} games • Total Odds: {selectedSlip.totalOdds} • Price: {selectedSlip.price || 'N/A'}
                      </p>
                      {selectedSlip.bookingCodes && (selectedSlip.bookingCodes.sporty || selectedSlip.bookingCodes.msport || selectedSlip.bookingCodes.football) && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Booking Codes:</span>
                          {selectedSlip.bookingCodes.sporty && <span className="ml-2">SportyBet: {selectedSlip.bookingCodes.sporty}</span>}
                          {selectedSlip.bookingCodes.msport && <span className="ml-2">MSport: {selectedSlip.bookingCodes.msport}</span>}
                          {selectedSlip.bookingCodes.football && <span className="ml-2">Football.com: {selectedSlip.bookingCodes.football}</span>}
                        </div>
                      )}
              </div>
                    <button
                      onClick={() => setSelectedSlip(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Games in selected slip */}
                <div className="divide-y divide-gray-200">
                  {selectedSlip.games.map((game: any, index: number) => (
                    <div key={game.id}>
                      <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            {game.home_team} vs {game.away_team}
                          </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {game.league} • {game.date}
                            </div>
                                        <div className="text-sm text-gray-700 mt-1">
                              {game.prediction}
                            </div>
                          </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">
                              {game.odds}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          game.result === 'won' ? 'bg-green-100 text-green-800' :
                                          game.result === 'lost' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {game.result}
                                        </span>
                            </div>
                          </div>
                                    <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Enable edit mode and set editResult for this game
                              const updatedSlips = uploadedSlips.map((s: any) =>
                                s.id === selectedSlip.id
                                  ? {
                                      ...s,
                                      games: s.games.map((g: any) =>
                                        g.id === game.id ? { ...g, isEditing: true, editResult: g.result } : g
                                      )
                                    }
                                  : s
                              );
                              setUploadedSlips(updatedSlips);
                              setSelectedSlip(updatedSlips.find((s: any) => s.id === selectedSlip.id));
                            }}
                            className="bg-[#191970] hover:bg-[#2e2e8f] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      {/* Result Editing Section - Only show when editing */}
                      {game.isEditing && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                      <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-700">Set Result:</span>
                                        <div className="flex space-x-2">
                                          {/* Check Mark (Won) */}
                              <button
                                onClick={async () => {
                                  await updateGamesStatus(selectedSlip.id, [
                                    { game_id: game.id, status: 'won' }
                                  ]);
                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                    s.id === selectedSlip.id
                                      ? {
                                          ...s,
                                          isEdited: true,
                                          games: s.games.map((g: any) =>
                                            g.id === game.id ? { ...g, result: 'won', isEditing: false } : g
                                          )
                                        }
                                      : s
                                  );
                                  setUploadedSlips(updatedSlips);
                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === selectedSlip.id));
                                }}
                                className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                                <span className="text-sm font-medium">Won</span>
                            </button>
                              {/* Wrong Mark (Lost) */}
                            <button
                                onClick={async () => {
                                  await updateGamesStatus(selectedSlip.id, [
                                    { game_id: game.id, status: 'lost' }
                                  ]);
                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                    s.id === selectedSlip.id
                                      ? {
                                          ...s,
                                          isEdited: true,
                                          games: s.games.map((g: any) =>
                                            g.id === game.id ? { ...g, result: 'lost', isEditing: false } : g
                                          )
                                        }
                                      : s
                                  );
                                  setUploadedSlips(updatedSlips);
                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === selectedSlip.id));
                                }}
                                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                                <span className="text-sm font-medium">Lost</span>
                            </button>
                              {/* Question Mark (Pending) */}
                            <button
                                onClick={async () => {
                                  await updateGamesStatus(selectedSlip.id, [
                                    { game_id: game.id, status: 'pending' }
                                  ]);
                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                    s.id === selectedSlip.id
                                      ? {
                                          ...s,
                                          isEdited: true,
                                          games: s.games.map((g: any) =>
                                            g.id === game.id ? { ...g, result: 'pending', isEditing: false } : g
                                          )
                                        }
                                      : s
                                  );
                                  setUploadedSlips(updatedSlips);
                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === selectedSlip.id));
                                }}
                                className="flex items-center space-x-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                                <span className="text-sm font-medium">Pending</span>
                              </button>
                              {/* Cancel Button */}
                              <button
                                onClick={() => {
                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                    s.id === selectedSlip.id
                                      ? {
                                          ...s,
                                          games: s.games.map((g: any) =>
                                            g.id === game.id ? { ...g, isEditing: false } : g
                                          )
                                        }
                                      : s
                                  );
                                  setUploadedSlips(updatedSlips);
                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === selectedSlip.id));
                                }}
                                            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                              >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                            <span className="text-sm font-medium">Cancel</span>
                            </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            )}

                    </div>
        )}

        {/* Load Games Section - Only show when category is selected and no games are loaded */}
        {activeFilter !== 'all' && loadedGames.length === 0 && (
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Load Games - {activeFilter === 'free' ? 'Free Predictions' : activeFilter === 'vip1' ? 'VIP 1' : activeFilter === 'vip2' ? 'VIP 2' : 'VIP 3'}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Enter SportyBet booking code for ${activeFilter === 'free' ? 'Free Predictions' : activeFilter === 'vip1' ? 'VIP 1' : activeFilter === 'vip2' ? 'VIP 2' : 'VIP 3'}...`}
                  value={loadInput}
                  onChange={(e) => setLoadInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                />
                {loadInput && (
                <button
                        onClick={clearLoadInput}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
                )}
              </div>
              <button
                onClick={handleLoadGames}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? 'Loading...' : 'Load Games'}
              </button>
                </div>
            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <p className="mt-2">Loading games from SportyBet...</p>
              </div>
            )}
            </div>
            )}

        {/* Games Display - Show when games are loaded */}
        {activeFilter !== 'all' && loadedGames.length > 0 && (
              <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Loaded Games from SportyBet</h2>
                  <p className="text-sm text-gray-600 mt-1">Booking Code: {sportyCodeInput || loadedGames[0]?.bookingCode || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => {
                    setLoadedGames([]);
                    setLoadInput('');
                    setSportyCodeInput('');
                    setMsportCodeInput('');
                    setFootballCodeInput('');
                    setIsBookingAttached(false);
                    setShowCodePanel(false);
                    setShowPricePanel(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {loadedGames.map((game: any, index: number) => (
                <div key={game.id || index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4 flex-1">
                    {/* X icon for removing individual games */}
                          <button
                      onClick={() => {
                        const updatedGames = loadedGames.filter((_, i) => i !== index);
                        setLoadedGames(updatedGames);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                                {game.homeTeam} vs {game.awayTeam}
                            </span>
                        {/* Question mark icon */}
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                          </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {game.league} • {game.date}
                            </div>
                      <div className="text-sm text-gray-700 mt-1">
                              {game.prediction}
                            </div>
                          </div>
                        </div>
                        
                  {/* Odds and Edit button on the right */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                              {game.odds}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
              ))}
                            </div>
                      


            <div className="px-6 py-4 border-t border-gray-200 relative">
              <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-600">
                  {loadedGames.length} selections loaded
            </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm font-medium text-gray-800">
                        Total Odds: {loadedGames.reduce((acc: number, game: any) => acc * parseFloat(game.odds), 1).toFixed(2)}
                      </div>
                  
                        <button
                          onClick={() => setShowCodePanel(!showCodePanel)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                        >
                    Add Booking
                        </button>
                  
                  {/* Set Price Panel - Absolute positioned overlay between Add Booking and Set Price */}
                        {showPricePanel && (
                    <div className="absolute bottom-0 right-0 mb-20 bg-white p-3 rounded-lg border shadow-lg w-64 z-10">
                      <div className="flex flex-col space-y-2">
                            {activeFilter !== 'free' ? (
                              <>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Price (GHS)</label>
                                <input
                                  type="number"
                                value={priceInput}
                                  onChange={(e) => {
                                  setPriceInput(e.target.value);
                                }}
                                placeholder="Enter price in GHS"
                                className="w-full px-2 py-1 border rounded text-xs"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const newPrice = priceInput;
                                    const vipKey = activeFilter === 'vip1' ? 'vip1' : activeFilter === 'vip2' ? 'vip2' : activeFilter === 'vip3' ? 'vip3' : null;
                                if (vipKey && newPrice) {
                                  setVipPackages(prevPackages => 
                                    prevPackages.map(p => 
                                      p.id === (vipKey === 'vip1' ? 1 : vipKey === 'vip2' ? 2 : vipKey === 'vip3' ? 3 : 0) ? { 
                                          ...p, 
                                          amount: parseInt(newPrice) || 0, 
                                          price: `GHS ${newPrice}` 
                                        } : p
                                    )
                                  );
                                  setShowPricePanel(false);
                                }
                              }}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Save
                            </button>
                            <p className="text-[10px] text-gray-500">Price will be set for {activeFilter === 'vip1' ? 'VIP 1' : activeFilter === 'vip2' ? 'VIP 2' : 'VIP 3'} package.</p>
                              </>
                            ) : (
                          <div className="text-xs text-gray-500">No price for Free Predictions.</div>
                        )}
                            </div>
                          </div>
                        )}
                  
                  <button
                    onClick={() => setShowPricePanel(!showPricePanel)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    {showPricePanel ? 'Hide' : 'Set'} Price
                  </button>
                  
                        <button
                          onClick={() => {
                            // Get current price for the VIP package
                            const currentVipPackage = vipPackages.find(p => p.id === (activeFilter === 'vip1' ? 1 : activeFilter === 'vip2' ? 2 : activeFilter === 'vip3' ? 3 : 0))
                            
                            // Create a new slip
                            const newSlip = {
                              id: Date.now(),
                              name: `Slip(${uploadedSlips.length + 1}) - ${activeFilter === 'free' ? 'Free Predictions' : activeFilter === 'vip1' ? 'VIP 1' : activeFilter === 'vip2' ? 'VIP 2' : 'VIP 3'}`,
                              category: activeFilter,
                              games: [...loadedGames],
                              totalOdds: loadedGames.reduce((acc: number, game: any) => acc * parseFloat(game.odds), 1).toFixed(2),
                              createdAt: new Date().toLocaleString(),
                              status: 'uploaded',
                              price: activeFilter === 'free' ? '0' : String(currentVipPackage?.amount || 0),
                              amount: activeFilter === 'free' ? 0 : currentVipPackage?.amount || 0,
                              bookingCodes: {
                                sporty: sportyCodeInput || loadedGames[0]?.bookingCode || '',
                                msport: msportCodeInput || '',
                                football: footballCodeInput || ''
                              },
                        shareCode: sportyCodeInput || loadedGames[0]?.shareCode || '',
                        shareURL: loadedGames[0]?.shareURL || '',
                        deadline: loadedGames[0]?.date || ''
                      };
                      
                            setUploadedSlips(prev => [...prev, newSlip]);
                      uploadSlip(newSlip);
                    }}
                    className="px-4 py-2 bg-[#191970] hover:bg-[#2e2e8f] text-white rounded text-sm font-medium transition-colors"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
              
              {/* Booking Codes Panel - Absolute positioned overlay */}
              {showCodePanel && (
                <div className="absolute bottom-full right-0 mb-2 bg-white p-3 rounded-lg border shadow-lg w-64 z-10">
                  <div className="flex flex-col space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">SportyBet Code</label>
                      <input
                        type="text"
                        value={sportyCodeInput}
                        onChange={(e) => setSportyCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                  </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">MSport Code</label>
                      <input
                        type="text"
                        value={msportCodeInput}
                        onChange={(e) => setMsportCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Football.com Code</label>
                    <input
                      type="text"
                        value={footballCodeInput}
                        onChange={(e) => setFootballCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
               </div>
                  <button 
                      onClick={() => {
                        setIsBookingAttached(true);
                        setShowCodePanel(false);
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Save Codes
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
                 )}

         {/* Games Control Tab */}
         {activeTab === 'gamescontrol' && (
           <div className="space-y-6">
             <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Games Control Panel</h2>
              <p className="text-gray-600">Manage and control game settings from here.</p>
                     </div>
           </div>
         )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <p className="text-gray-600">Manage users from here.</p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Notifications</h2>
              <p className="text-gray-600">Manage notifications from here.</p>
            </div>
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">SMS Management</h2>
              <p className="text-gray-600">Send and manage SMS from here.</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Configure application settings from here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}