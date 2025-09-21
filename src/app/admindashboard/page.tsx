  // Update game statuses for a booking


  // Upload slip to API

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

  // Update price input when activeFilter changes
  useEffect(() => {
    if (activeFilter !== 'free') {
      const currentPackage = vipPackages.find(p => p.id === (activeFilter === 'vip1' ? 1 : activeFilter === 'vip2' ? 2 : activeFilter === 'vip3' ? 3 : 0));
      setPriceInput(currentPackage?.amount?.toString() || '');
    }
  }, [activeFilter, vipPackages]);
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
  const [selectedSlips, setSelectedSlips] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [hiddenSlips, setHiddenSlips] = useState<Set<string>>(new Set())
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
          status: 'updated', // Mark slip as updated
          games: slip.games.map((g: any) => {
            const found = games.find(upd => upd.game_id === g.id);
            return found ? { ...g, result: found.status } : g;
          })
        };
      }));
      if (selectedSlip && selectedSlip.id === bookingId) {
        setSelectedSlip((prev: any) => ({
          ...prev,
          status: 'updated', // Mark slip as updated
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

  const clearAllSlips = () => {
    if (confirm(`Are you sure you want to clear all ${uploadedSlips.length} slips? This action cannot be undone.`)) {
      setUploadedSlips([])
      setSelectedSlip(null)
      alert('All slips have been cleared successfully!')
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedSlips(new Set())
  }

  const toggleSlipSelection = (slipId: string) => {
    setSelectedSlips(prev => {
      const newSet = new Set(prev)
      if (newSet.has(slipId)) {
        newSet.delete(slipId)
      } else {
        newSet.add(slipId)
      }
      return newSet
    })
  }

  const selectAllSlips = () => {
    const visibleSlips = uploadedSlips.filter(slip => !hiddenSlips.has(slip.id || slip.booking?.id || slip.shareCode))
    setSelectedSlips(new Set(visibleSlips.map(slip => slip.id || slip.booking?.id || slip.shareCode)))
  }

  const deselectAllSlips = () => {
    setSelectedSlips(new Set())
  }

  const deleteSelectedSlips = () => {
    if (selectedSlips.size === 0) {
      alert('Please select slips to delete first.')
      return
    }

    if (confirm(`Are you sure you want to hide ${selectedSlips.size} selected slips from the view? They will remain in the database for filtering.`)) {
      setHiddenSlips(prev => {
        const newSet = new Set(prev)
        selectedSlips.forEach(slipId => newSet.add(slipId))
        return newSet
      })
      setSelectedSlips(new Set())
      setIsSelectMode(false)
      alert(`${selectedSlips.size} slips have been hidden from view successfully!`)
    }
  }

  const restoreHiddenSlips = () => {
    if (hiddenSlips.size === 0) {
      alert('No hidden slips to restore.')
      return
    }

    if (confirm(`Are you sure you want to restore all ${hiddenSlips.size} hidden slips?`)) {
      setHiddenSlips(new Set())
      alert('All hidden slips have been restored!')
    }
  }

  return (
    <div className="min-h-screen bg-[#191970] text-white">
      {/* Header */}
      <header className="bg-[#191970] border-b border-indigo-400 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">BetGeniuz Admin</h1>
            <span className="text-indigo-200 text-xs sm:text-sm">Control Panel</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-indigo-200 text-xs sm:text-sm">Admin User</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 sm:px-4 rounded-lg transition-colors text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-[#2e2e8f] p-1 rounded-lg mb-4 sm:mb-6 lg:mb-8">
          {['dashboard', 'games', 'gamescontrol', 'users', 'notifications', 'sms', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-3 rounded-md transition-colors capitalize text-xs sm:text-sm whitespace-nowrap ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Users</p>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    {totalUsersLoading ? 'Loading...' : totalUsersError ? 'Error' : totalUsers !== null ? totalUsers : '--'}
                  </p>
                </div>
              </div>
            </div>


             <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-lg shadow-lg">
               <div className="flex items-center">
                 <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                   </svg>
                 </div>
                 <div className="ml-2 sm:ml-3">
                   <p className="text-xs font-medium text-gray-600">VIP Packages Available</p>
                   <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{vipPackages.filter(p => p.available).length}/3</p>
                 </div>
               </div>
             </div>

                         <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-lg shadow-lg">
               <div className="flex items-center">
                 <div className="p-2 rounded-full bg-red-100 text-red-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                 </div>
                 <div className="ml-2 sm:ml-3">
                   <p className="text-xs font-medium text-gray-600">Unread Notifications</p>
                   <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
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
                   className={`px-3 py-2 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
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
                   className={`px-3 py-2 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
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
                   className={`px-3 py-2 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
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
                   className={`px-3 py-2 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
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
                   className={`px-3 py-2 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm ${
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
                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                  <h2 className="text-xl font-bold">Uploaded Slips</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {isSelectMode ? 'Select slips to hide from view' : 'Click on a slip to view and edit games'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {uploadedSlips.length > 0 && !isSelectMode && (
                        <button
                          onClick={toggleSelectMode}
                          className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium"
                          title="Select slips to hide"
                        >
                          Select Mode
                        </button>
                      )}
                      {isSelectMode && (
                        <>
                          <button
                            onClick={selectAllSlips}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Select All
                          </button>
                          <button
                            onClick={deselectAllSlips}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Deselect All
                          </button>
                          <button
                            onClick={deleteSelectedSlips}
                            disabled={selectedSlips.size === 0}
                            className="px-3 py-2 sm:px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Hide Selected ({selectedSlips.size})
                          </button>
                          <button
                            onClick={toggleSelectMode}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {hiddenSlips.size > 0 && (
                        <button
                          onClick={restoreHiddenSlips}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          title="Restore hidden slips"
                        >
                          Restore Hidden ({hiddenSlips.size})
                        </button>
                      )}
                      {uploadedSlips.length > 0 && !isSelectMode && (
                        <button
                          onClick={clearAllSlips}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          title="Clear all slips"
                        >
                          Clear All ({uploadedSlips.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {slipsLoading ? (
                  <div className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8 text-center text-gray-500">Loading slips...</div>
                ) : slipsError ? (
                  <div className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8 text-center text-red-500">
                    <strong>Error loading slips:</strong> {slipsError}
                  </div>
                ) : uploadedSlips.length === 0 ? (
                  <div className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8 text-center text-gray-500">
                    No slips uploaded yet. Load games and click "Upload" to create slips.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {uploadedSlips
                      .filter(slip => !hiddenSlips.has(slip.id || slip.booking?.id || slip.shareCode))
                      .map((slip: any) => {
                      const slipId = slip.id || slip.booking?.id || slip.shareCode;
                      const isSelected = selectedSlip?.id === slipId;
                      const isCheckboxSelected = selectedSlips.has(slipId);
                      return (
                        <div key={slipId}>
                          {/* Slip Header */}
                          <div
                            className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            } ${isSelectMode ? 'cursor-default' : 'cursor-pointer'}`}
                            onClick={() => {
                              if (!isSelectMode) {
                                setSelectedSlip(isSelected ? null : slip)
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                {isSelectMode && (
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={isCheckboxSelected}
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        toggleSlipSelection(slipId)
                                      }}
                                      className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                                    />
                                  </div>
                                )}
                                <div>
                                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
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
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  slip.status === 'updated'
                                    ? 'bg-green-100 text-green-800'
                                    : slip.status === 'uploaded'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {slip.status || 'uploaded'}
                                </span>
                                <button
                                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                  onClick={e => { e.stopPropagation(); uploadSlip(slip); }}
                                  disabled={slip.status === 'uploaded'}
                                >
                                  {slip.status === 'uploaded' ? 'Uploaded' : 'Upload'}
                                </button>
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${
                                    isSelected ? 'rotate-180' : ''
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

                          {/* Slip Details - Show directly under the clicked slip */}
                          {isSelected && (
                            <div className="bg-gray-50 border-t border-gray-200">
                              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                
                                {/* Games in selected slip */}
                                <div className="space-y-3">
                                  {(slip.games || slip.booking?.games || []).map((game: any, index: number) => (
                                    <div key={game.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                              <div className="text-sm font-medium text-gray-900">
                                                {(game.home_team && game.away_team)
                                                  ? `${game.home_team} vs ${game.away_team}`
                                                  : (game.home && game.away)
                                                  ? `${game.home} vs ${game.away}`
                                                  : 'vs'}
                                              </div>
                                              {/* Result Status Indicator */}
                                              {game.result && (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                  game.result === 'won' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : game.result === 'lost'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                  {game.result === 'won' ? '✓' : 
                                                   game.result === 'lost' ? '✗' : '?'}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {game.tournament || game.league || 'Tournament'}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                              {game.prediction || game.pick || 'N/A'}
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end min-w-[140px] mr-4">
                                            <div className="flex flex-col items-end">
                                              <span className="text-xs text-gray-500 font-medium mb-1">
                                                Pick: {game.prediction || game.pick || 'N/A'}
                                              </span>
                                              <span className="text-xs text-gray-600">
                                                Odds: <span className="font-semibold text-xs">{game.odd || game.odds || 'N/A'}</span>
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Edit Button */}
                                        <div className="flex items-center">
                                          <button
                                            onClick={() => {
                                              // Enable edit mode and set editResult for this game
                                              const updatedSlips = uploadedSlips.map((s: any) =>
                                                s.id === slip.id
                                                  ? {
                                                      ...s,
                                                      games: s.games.map((g: any) =>
                                                        g.id === game.id ? { ...g, isEditing: true, editResult: g.result } : g
                                                      )
                                                    }
                                                  : s
                                              );
                                              setUploadedSlips(updatedSlips);
                                              setSelectedSlip(updatedSlips.find((s: any) => s.id === slip.id));
                                            }}
                                            className="bg-[#191970] hover:bg-[#2e2e8f] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Result Editing Section - Only show when editing */}
                                      {game.isEditing && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-gray-700">
                                              Update Result:
                                            </div>
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                              {/* Correct Mark (Won) */}
                                              <button
                                                onClick={async () => {
                                                  await updateGamesStatus(slip.id, [
                                                    { game_id: game.id, status: 'won' }
                                                  ]);
                                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                                    s.id === slip.id
                                                      ? {
                                                          ...s,
                                                          status: 'updated', // Mark slip as updated
                                                          games: s.games.map((g: any) =>
                                                            g.id === game.id ? { ...g, result: 'won', isEditing: false } : g
                                                          )
                                                        }
                                                      : s
                                                  );
                                                  setUploadedSlips(updatedSlips);
                                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === slip.id));
                                                }}
                                                className="flex items-center space-x-1 sm:space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm font-medium">Won</span>
                                              </button>
                                              {/* Wrong Mark (Lost) */}
                                              <button
                                                onClick={async () => {
                                                  await updateGamesStatus(slip.id, [
                                                    { game_id: game.id, status: 'lost' }
                                                  ]);
                                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                                    s.id === slip.id
                                                      ? {
                                                          ...s,
                                                          status: 'updated', // Mark slip as updated
                                                          games: s.games.map((g: any) =>
                                                            g.id === game.id ? { ...g, result: 'lost', isEditing: false } : g
                                                          )
                                                        }
                                                      : s
                                                  );
                                                  setUploadedSlips(updatedSlips);
                                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === slip.id));
                                                }}
                                                className="flex items-center space-x-1 sm:space-x-2 bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span className="text-sm font-medium">Lost</span>
                                              </button>
                                              {/* Question Mark (Pending) */}
                                              <button
                                                onClick={async () => {
                                                  await updateGamesStatus(slip.id, [
                                                    { game_id: game.id, status: 'pending' }
                                                  ]);
                                                  const updatedSlips = uploadedSlips.map((s: any) =>
                                                    s.id === slip.id
                                                      ? {
                                                          ...s,
                                                          status: 'updated', // Mark slip as updated
                                                          games: s.games.map((g: any) =>
                                                            g.id === game.id ? { ...g, result: 'pending', isEditing: false } : g
                                                          )
                                                        }
                                                      : s
                                                  );
                                                  setUploadedSlips(updatedSlips);
                                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === slip.id));
                                                }}
                                                className="flex items-center space-x-1 sm:space-x-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
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
                                                    s.id === slip.id
                                                      ? {
                                                          ...s,
                                                          games: s.games.map((g: any) =>
                                                            g.id === game.id ? { ...g, isEditing: false } : g
                                                          )
                                                        }
                                                      : s
                                                  );
                                                  setUploadedSlips(updatedSlips);
                                                  setSelectedSlip(updatedSlips.find((s: any) => s.id === slip.id));
                                                }}
                                                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {/* Loaded Games Results - SportyBet Betting Slip Format */}
            {loadedGames.length > 0 && (
              <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Loaded Games from SportyBet</h2>
                      <p className="text-sm text-gray-600 mt-1">Booking Code: {loadedGames[0]?.bookingCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        setLoadedGames([])
                        setLoadInput('')
                        // Clear games from the current category
                        if (activeFilter !== 'all') {
                          setGamesByCategory(prev => ({
                            ...prev,
                            [activeFilter]: []
                          }))
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                {/* Betting Slip Format */}
                <div className="divide-y divide-gray-200">
                  {loadedGames.map((game: any, index: number) => (
                    <div key={game.id}>
                      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Remove Button */}
                          <button
                            onClick={() => setLoadedGames(loadedGames.filter((g: any) => g.id !== game.id))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          {/* Match Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {game.homeTeam} vs {game.awayTeam}
                              </div>
                              {/* Result Status Indicator */}
                              {game.result && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              game.result === 'won' 
                                ? 'bg-green-100 text-green-800' 
                                : game.result === 'lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                  {game.result === 'won' ? '✓' : 
                                   game.result === 'lost' ? '✗' : '?'}
                            </span>
                              )}
                          </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {game.league} • {game.date}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {game.prediction}
                            </div>
                          </div>
                        </div>
                        
                        {/* Odds and Actions */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {game.odds}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              // Toggle edit mode for this specific game
                              const updatedLoadedGames = loadedGames.map((g: any) => 
                                g.id === game.id ? { ...g, isEditing: !g.isEditing } : g
                              )
                              setLoadedGames(updatedLoadedGames)
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
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-700">
                              Update Result:
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Correct Mark (Won) */}
                          <button
                                onClick={() => {
                                  const updatedLoadedGames = loadedGames.map((g: any) => 
                                    g.id === game.id ? { ...g, result: 'won', isEditing: false } : g
                                  )
                                  setLoadedGames(updatedLoadedGames)
                                }}
                                className="flex items-center space-x-1 sm:space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Won</span>
                          </button>
                              
                              {/* Wrong Mark (Lost) */}
                              <button
                                onClick={() => {
                                  const updatedLoadedGames = loadedGames.map((g: any) => 
                                    g.id === game.id ? { ...g, result: 'lost', isEditing: false } : g
                                  )
                                  setLoadedGames(updatedLoadedGames)
                                }}
                                className="flex items-center space-x-1 sm:space-x-2 bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-sm font-medium">Lost</span>
                              </button>
                              
                              {/* Question Mark (Pending) */}
                              <button
                                onClick={() => {
                                  const updatedLoadedGames = loadedGames.map((g: any) => 
                                    g.id === game.id ? { ...g, result: 'pending', isEditing: false } : g
                                  )
                                  setLoadedGames(updatedLoadedGames)
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
                                  const updatedLoadedGames = loadedGames.map((g: any) => 
                                    g.id === game.id ? { ...g, isEditing: false } : g
                                  )
                                  setLoadedGames(updatedLoadedGames)
                                }}
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
                
                {/* Footer with total info and upload button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-gray-600">
                      {loadedGames.length} selection{loadedGames.length !== 1 ? 's' : ''} loaded
            </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-gray-900">
                        Total Odds: {loadedGames.reduce((acc: number, game: any) => acc * parseFloat(game.odds), 1).toFixed(2)}
                      </div>
                      {/* Booking Codes small button + panel */}
                      <div className="relative mt-2">
                        <button
                          onClick={() => setShowCodePanel(!showCodePanel)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          {showCodePanel ? 'Hide' : 'Add Booking'}
                        </button>
                        {showCodePanel && (
                          <div className="fixed bottom-24 right-8 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 z-50 text-left">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-800">Attach Booking</h4>
                              <button onClick={() => setShowCodePanel(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <label className="block text-xs text-gray-600 mb-1">SportyBet Code</label>
                            <input
                              type="text"
                              value={sportyCodeInput}
                              onChange={(e) => setSportyCodeInput(e.target.value)}
                              placeholder="e.g. abcd"
                              className="w-full px-3 py-2 border rounded mb-3 text-sm"
                            />
                            <label className="block text-xs text-gray-600 mb-1">MSport Code</label>
                            <input
                              type="text"
                              value={msportCodeInput}
                              onChange={(e) => setMsportCodeInput(e.target.value)}
                              placeholder="e.g. efgh"
                              className="w-full px-3 py-2 border rounded mb-3 text-sm"
                            />
                            <label className="block text-xs text-gray-600 mb-1">Football.com Code</label>
                            <input
                              type="text"
                              value={footballCodeInput}
                              onChange={(e) => setFootballCodeInput(e.target.value)}
                              placeholder="e.g. ijkl"
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <p className="text-[11px] text-gray-500 mt-2">Codes will be attached to this {activeFilter === 'free' ? 'Free' : activeFilter.toUpperCase()} slip on upload.</p>
                            <div className="flex justify-end mt-3">
                              <button onClick={() => { setIsBookingAttached(true); setShowCodePanel(false) }} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Attach</button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Price Setting Section */}
                      <div className="relative mt-2">
                        <button
                          onClick={() => setShowPricePanel(!showPricePanel)}
                          className="text-xs bg-[#f59e0b] hover:bg-[#d97706] text-white px-3 py-1 rounded"
                        >
                          {showPricePanel ? 'Hide' : 'Set Price'}
                        </button>
                        {showPricePanel && (
                          <div className="fixed bottom-24 right-8 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 z-50 text-left">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-800">Set VIP Package Price</h4>
                              <button onClick={() => setShowPricePanel(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            {activeFilter !== 'free' ? (
                              <>
                                <label className="block text-xs text-gray-600 mb-1">Price (GHS)</label>
                                <input
                                  type="number"
                                  value={priceInput}
                                  onChange={(e) => {
                                    setPriceInput(e.target.value);
                                  }}
                                  placeholder="Enter price in GHS"
                                  className="w-full px-3 py-2 border rounded mb-3 text-sm"
                                />
                                <button
                                  onClick={() => {
                                    const newPrice = priceInput;
                                    const vipKey = activeFilter === 'vip1' ? 'vip1' : activeFilter === 'vip2' ? 'vip2' : activeFilter === 'vip3' ? 'vip3' : null;
                                    if (vipKey && newPrice) {
                                      setVipPackages(prevPackages => 
                                        prevPackages.map(p => 
                                          p.id === (vipKey === 'vip1' ? 1 : vipKey === 'vip2' ? 2 : 3) ? { 
                                            ...p, 
                                            amount: parseInt(newPrice) || 0, 
                                            price: `GHS ${newPrice}` 
                                          } : p
                                        )
                                      );
                                      setPriceInput('');
                                    }
                                  }}
                                  className="w-full bg-[#2e2e8f] text-white py-2 px-4 rounded text-sm hover:bg-[#1e1e5f] transition-colors"
                                >
                                  Update Price
                                </button>
                                <p className="text-[11px] text-gray-500 mt-2">Price will be set for {activeFilter === 'vip1' ? 'VIP 1' : activeFilter === 'vip2' ? 'VIP 2' : 'VIP 3'} package.</p>
                              </>
                            ) : (
                              <div className="text-xs text-gray-500 mb-3">No price for Free Predictions.</div>
                            )}
                            <div className="flex justify-end mt-3">
                              <button 
                                onClick={() => { 
                                  localStorage.setItem('vipPackages', JSON.stringify(vipPackages));
                                  setShowPricePanel(false);
                                  alert(`Price updated for ${activeFilter.toUpperCase()}!`);
                                }} 
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                              >
                                Save Price
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
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
                              shareCode: sportyCodeInput || loadedGames[0]?.bookingCode || '',
                              shareURL: '',
                              deadline: loadedGames[0]?.date || new Date().toISOString().split('T')[0]
                            }
                            
                            // Add slip to uploaded slips and upload to backend
                            setUploadedSlips(prev => [...prev, newSlip]);
                            if (typeof uploadSlip === 'function') uploadSlip(newSlip);
                            
                            // Add games to the main games list for users to see
                            const updatedGames = [...games, ...loadedGames]
                            setGames(updatedGames)
                            setFilteredGames(updatedGames)
                            
                            // Clear loaded games and show success message
                            setLoadedGames([])
                            setLoadInput('')
                            setSportyCodeInput('')
                            setMsportCodeInput('')
                            setIsBookingAttached(false)
                            setShowCodePanel(false)
                            
                            // Clear from category storage
                            if (activeFilter !== 'all') {
                              setGamesByCategory(prev => ({
                                ...prev,
                                [activeFilter]: []
                              }))
                            }
                            
                            const priceInfo = activeFilter === 'free' ? 'Free' : (currentVipPackage?.amount ? `GHS ${currentVipPackage.amount}` : 'GHS 0')
                            const bookingInfo = sportyCodeInput || msportCodeInput || footballCodeInput ? 'with booking codes' : 'without booking codes'
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                    className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#191970] hover:bg-[#2e2e8f]'
                    } text-white`}
                  >
                    {isLoading ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>
            )}

          </div>
                 )}

         {/* Games Control Tab */}
         {activeTab === 'gamescontrol' && (
           <div className="space-y-6">
             {/* VIP Package Availability Control */}
             <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
               <h2 className="text-xl font-bold mb-4">VIP Package Availability Control</h2>
               <p className="text-gray-600 mb-6">Control which VIP packages are available for purchase and which are sold out</p>
               
               {/* Bulk control buttons removed as requested */}

               {/* VIP Packages List with Availability Control */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {vipPackages.map((pkg) => (
                   <div key={pkg.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                     <h3 className="text-lg font-bold text-gray-900 mb-4">
                      
                       {pkg.name.replace(/^vip(\d)$/i, (_: unknown, n: string) => `VIP ${n}`)
}
                     </h3>
                     <div className="mb-2">
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${pkg.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {pkg.available ? 'Available' : 'Sold Out'}
                       </span>
                     </div>
                     {vipAvailabilityError[pkg.id] && (
                       <div className="text-xs text-red-600 mb-2">{vipAvailabilityError[pkg.id]}</div>
                     )}
                     <div className="flex gap-2">
                       <button
                         disabled={vipAvailabilityLoading[pkg.id] || !pkg.available}
                         onClick={async () => {
                           setVipAvailabilityLoading(prev => ({ ...prev, [pkg.id]: true }));
                           setVipAvailabilityError(prev => ({ ...prev, [pkg.id]: '' }));
                           try {
                             const res = await fetch(`https://api.betgeniuz.com/games/mark-sold-out/${pkg.id}`, { method: 'POST' });
                             if (!res.ok) throw new Error('Failed to mark as sold out');
                             setVipPackages(vipPackages.map(p => p.id === pkg.id ? { ...p, available: false } : p));
                           } catch (err: any) {
                             setVipAvailabilityError(prev => ({ ...prev, [pkg.id]: err?.message || 'Error' }));
                           }
                           setVipAvailabilityLoading(prev => ({ ...prev, [pkg.id]: false }));
                         }}
                         className={`w-1/2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                           !pkg.available ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                         }`}
                       >
                         {vipAvailabilityLoading[pkg.id] && pkg.available ? 'Processing...' : 'Mark as Sold Out'}
                       </button>
                       <button
                         disabled={vipAvailabilityLoading[pkg.id] || pkg.available}
                         onClick={async () => {
                           setVipAvailabilityLoading(prev => ({ ...prev, [pkg.id]: true }));
                           setVipAvailabilityError(prev => ({ ...prev, [pkg.id]: '' }));
                           try {
                             const res = await fetch(`https://api.betgeniuz.com/games/update-availability/${pkg.id}`, { method: 'POST' });
                             if (!res.ok) throw new Error('Failed to mark as available');
                             setVipPackages(vipPackages.map(p => p.id === pkg.id ? { ...p, available: true } : p));
                           } catch (err: any) {
                             setVipAvailabilityError(prev => ({ ...prev, [pkg.id]: err?.message || 'Error' }));
                           }
                           setVipAvailabilityLoading(prev => ({ ...prev, [pkg.id]: false }));
                         }}
                         className={`w-1/2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                           pkg.available ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                         }`}
                       >
                         {vipAvailabilityLoading[pkg.id] && !pkg.available ? 'Processing...' : 'Mark as Available'}
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* VIP Availability Summary removed */}
           </div>
         )}


         {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isInactive = isUserInactive(user.lastActivity)
                    const daysSinceActivity = getDaysSinceActivity(user.lastActivity)
                    
                    return (
                      <tr key={user.id} className={isInactive ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' && !isInactive
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' && !isInactive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Notification Management</h2>
            </div>
            <div className="p-6 space-y-4">
              {notificationsLoading && (
                <div className="text-center text-blue-600 font-medium py-8">Loading notifications...</div>
              )}
              {notificationsError && !notificationsLoading && (
                <div className="text-center text-red-600 font-medium py-8">{notificationsError}</div>
              )}
              {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                <div className="text-center text-gray-500 py-8">No notifications found.</div>
              )}
              {!notificationsLoading && !notificationsError && notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.type === 'success' ? 'Purchase' : 'Sign Up'}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`font-medium ${
                        notification.read ? 'text-gray-600' : 'text-blue-800'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs ml-4"
                        disabled={notificationsLoading}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'sms' && (
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Send SMS to Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={6}
                  maxLength={480}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#191970] focus:border-transparent"
                  placeholder="Type the SMS to send to users..."
                />
                <div className="text-xs text-gray-500 mt-1">{smsMessage.length}/480 characters</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={smsRecipients === 'all'}
                      onChange={() => setSmsRecipients('all')}
                    />
                    <span className="text-sm text-gray-700">All Users</span>
                  </label>
                  {/* <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={smsRecipients === 'custom'}
                      onChange={() => setSmsRecipients('custom')}
                    />
                    <span className="text-sm text-gray-700">Custom Numbers</span>
                  </label> */}
                  {smsRecipients === 'custom' && (
                    <textarea
                      value={customNumbers}
                      onChange={(e) => setCustomNumbers(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#191970] focus:border-transparent"
                      placeholder="Enter comma-separated phone numbers, e.g. 0551112222,0243334444"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  if (!smsMessage.trim()) { alert('Please enter a message'); return }
                  setIsSendingSms(true)
                  try {
                    let response;
                    let body;
                    if (smsRecipients === 'all') {
                        body = '';
                    } else {
                        body = '';
                    }
                      response = await fetch(`https://api.betgeniuz.com/sms/send_bulk?message=${encodeURIComponent(smsMessage)}`,
                        {
                          method: 'POST',
                          headers: { 'accept': 'application/json' },
                          body
                        }
                      );
                    const data = await response.json();
                    if (data.status === 'success') {
                      alert(`SMS sent successfully! Total sent: ${data.summary?.total_sent || 0}`);
                    } else {
                      alert(`Failed to send SMS: ${data.message || 'Unknown error'}`);
                    }
                  } catch (err) {
                    alert('Error sending SMS. Please try again.');
                  }
                  setIsSendingSms(false)
                  setSmsMessage('')
                  setCustomNumbers('')
                }}
                disabled={isSendingSms}
                className={`px-6 py-3 rounded-lg font-bold text-white ${isSendingSms ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#191970] hover:bg-[#2e2e8f]'}`}
              >
                {isSendingSms ? 'Sending…' : 'Send SMS'}
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Admin Management Section */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-[#2e2e8f]">Admin Management</h2>
              
              {/* Add New Admin Form */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Admin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      placeholder="admin@betgeniuz.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      placeholder="+233 123 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Role</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]">
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Manage Games</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Manage Users</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Send SMS</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Manage Admins</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-[#2e2e8f] hover:bg-[#1e1e7f] text-white px-6 py-2 rounded-md transition-colors">
                    Add Admin
                  </button>
                </div>
              </div>

              {/* Current Admins List */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Current Admins</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-[#2e2e8f] flex items-center justify-center">
                                <span className="text-sm font-medium text-white">AU</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Admin User</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">admin@betgeniuz.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Super Admin</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 minutes ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#2e2e8f] hover:text-[#1e1e7f] mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Deactivate</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">JS</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Smith</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john@betgeniuz.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Admin</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 hour ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#2e2e8f] hover:text-[#1e1e7f] mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Deactivate</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">MJ</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Mary Johnson</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">mary@betgeniuz.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Moderator</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 days ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#2e2e8f] hover:text-[#1e1e7f] mr-3">Edit</button>
                          <button className="text-green-600 hover:text-green-900">Activate</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* System Settings Section */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-[#2e2e8f]">System Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        defaultValue="BetGeniuz"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                      <input
                        type="url"
                        defaultValue="https://betgeniuz.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="support@betgeniuz.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Security Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e2e8f]"
                      />
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="twoFactor" className="mr-2" defaultChecked />
                      <label htmlFor="twoFactor" className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-[#2e2e8f] hover:bg-[#1e1e7f] text-white px-6 py-2 rounded-md transition-colors">
                  Save Settings
                </button>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-[#2e2e8f]">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Receive email alerts for important events</p>
                  </div>
                  <input type="checkbox" className="mr-2" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">SMS Notifications</h4>
                    <p className="text-xs text-gray-500">Receive SMS alerts for critical events</p>
                  </div>
                  <input type="checkbox" className="mr-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Push Notifications</h4>
                    <p className="text-xs text-gray-500">Receive browser push notifications</p>
                  </div>
                  <input type="checkbox" className="mr-2" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Admin Alerts</h4>
                    <p className="text-xs text-gray-500">Get notified when new admins are added</p>
                  </div>
                  <input type="checkbox" className="mr-2" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
