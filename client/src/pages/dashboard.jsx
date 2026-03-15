import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal States
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Data States
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, transactionCount: 0, rank: 0 });
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const [bonusCountdown, setBonusCountdown] = useState('');
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  // Fetch Balance
  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bank/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Balance error:', err);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bank/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
      calculateStats(response.data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    }
  };

  // Fetch Users & Leaderboard
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bank/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      const sorted = [...response.data.users]
        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
        .slice(0, 10);
      setLeaderboard(sorted);
      calculateAchievements(response.data.users.find(u => u.id === user.id));
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  // Calculate Stats
  const calculateStats = (txs) => {
    let sent = 0, received = 0, count = 0;
    txs.forEach(tx => {
      if (tx.sender_username === user.username) sent += parseFloat(tx.amount);
      else if (tx.receiver_username === user.username) received += parseFloat(tx.amount);
      count++;
    });
    const rank = users.filter(u => parseFloat(u.balance) > parseFloat(balance)).length + 1;
    setStats({ totalSent: sent.toFixed(2), totalReceived: received.toFixed(2), transactionCount: count, rank });
  };

  // Calculate Achievements
  const calculateAchievements = (userData) => {
    if (!userData) return;
    const bal = parseFloat(userData.balance);
    const txCount = transactions.length;
    
    const achs = [
      { id: 1, name: 'First Steps', desc: 'Make your first transaction', icon: '🌟', unlocked: txCount >= 1 },
      { id: 2, name: 'Saver', desc: 'Reach $1,000 balance', icon: '💰', unlocked: bal >= 1000 },
      { id: 3, name: 'Wealthy', desc: 'Reach $10,000 balance', icon: '💎', unlocked: bal >= 10000 },
      { id: 4, name: 'Rich', desc: 'Reach $50,000 balance', icon: '👑', unlocked: bal >= 50000 },
      { id: 5, name: 'Millionaire', desc: 'Reach $1,000,000 balance', icon: '🏆', unlocked: bal >= 1000000 },
      { id: 6, name: 'Active Trader', desc: 'Make 10 transactions', icon: '📊', unlocked: txCount >= 10 },
      { id: 7, name: 'Power User', desc: 'Make 50 transactions', icon: '⚡', unlocked: txCount >= 50 },
      { id: 8, name: 'Legend', desc: 'Reach top 3 leaderboard', icon: '🔥', unlocked: stats.rank <= 3 },
    ];
    setAchievements(achs);
  };

  // Handle Transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/bank/transfer`, {
        receiverUsername: transferTo,
        amount: parseFloat(transferAmount)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(response.data.message);
      setBalance(response.data.newBalance);
      setTransferTo('');
      setTransferAmount('');
      fetchTransactions();
      fetchUsers();
      setShowTransferForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Daily Bonus
  const handleDailyBonus = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/bank/daily-bonus`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message);
      setBalance(response.data.newBalance);
      setDailyBonusClaimed(true);
      localStorage.setItem('lastBonusClaim', new Date().toDateString());
      fetchTransactions();
      setShowDailyBonus(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Bonus already claimed today!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Check Bonus Status on Load
  useEffect(() => {
    if (!token) { navigate('/'); return; }
    setUser(storedUser);
    fetchBalance();
    fetchTransactions();
    fetchUsers();
    
    const lastClaim = localStorage.getItem('lastBonusClaim');
    const today = new Date().toDateString();
    if (lastClaim === today) setDailyBonusClaimed(true);
    
    // Countdown timer for next bonus
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setBonusCountdown(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get Rank Icon
  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank <= 3) return '🥇';
    if (rank <= 10) return '🥈';
    return '⭐';
  };

  // Get User Title
  const getUserTitle = (bal) => {
    const balance = parseFloat(bal);
    if (balance >= 1000000) return { title: 'Legion Legend', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' };
    if (balance >= 500000) return { title: 'Bank Tycoon', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' };
    if (balance >= 100000) return { title: 'Wealth Master', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' };
    if (balance >= 50000) return { title: 'Rich Citizen', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' };
    if (balance >= 10000) return { title: 'Saver', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' };
    return { title: 'Newcomer', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' };
  };

  const userTitle = getUserTitle(balance);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* ==================== NAVBAR ==================== */}
      
      {/* Desktop Navbar */}
      <nav className="hidden md:flex navbar justify-between items-center sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Legion Bank</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-medium">{user.username}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${userTitle.bg} ${userTitle.color} border`}>{userTitle.title}</span>
          </div>
          {user.isAdmin && (
            <button onClick={() => navigate('/admin')} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition border border-red-500/30 font-medium">
              Admin Panel
            </button>
          )}
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition shadow-lg shadow-red-500/30 font-medium">
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden navbar flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Legion</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-slate-900/98 backdrop-blur-xl animate-slide-down">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">{user.username}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${userTitle.bg} ${userTitle.color} border`}>{userTitle.title}</span>
              </div>
            </div>
            <button onClick={() => { setMobileMenuOpen(false); setShowStats(true); }} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-medium transition flex items-center gap-3">
              <span className="text-xl">📊</span> My Stats
            </button>
            <button onClick={() => { setMobileMenuOpen(false); setShowLeaderboard(true); }} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-medium transition flex items-center gap-3">
              <span className="text-xl">🏆</span> Leaderboard
            </button>
            <button onClick={() => { setMobileMenuOpen(false); setShowAchievements(true); }} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-medium transition flex items-center gap-3">
              <span className="text-xl">🎖️</span> Achievements
            </button>
            <button onClick={() => { setMobileMenuOpen(false); setShowDailyBonus(true); }} className={`w-full p-4 rounded-xl text-left font-medium transition flex items-center gap-3 ${dailyBonusClaimed ? 'bg-gray-700/50 text-gray-400' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
              <span className="text-xl">🎁</span> Daily Bonus {dailyBonusClaimed ? '(Claimed)' : ''}
            </button>
            {user.isAdmin && (
              <button onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }} className="w-full p-4 rounded-xl bg-red-500/20 text-red-400 text-left font-medium border border-red-500/30 transition flex items-center gap-3">
                <span className="text-xl">🔐</span> Admin Panel
              </button>
            )}
            <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-left font-medium transition flex items-center gap-3">
              <span className="text-xl">🚪</span> Logout
            </button>
          </div>
        </div>
      )}

      {/* ==================== MAIN CONTENT ==================== */}
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
        
        {/* Balance Card */}
        <div className="card p-6 md:p-8 mb-6 md:mb-8 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-blue-600/30 border-blue-500/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/15 transition"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/15 transition"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-text-muted text-sm md:text-lg font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Available Balance
                </h2>
                <p className="balance-display text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">${balance}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm px-3 py-1 rounded-full ${userTitle.bg} ${userTitle.color} border`}>{userTitle.title}</span>
                  <span className="text-text-muted text-sm">Rank #{stats.rank}</span>
                </div>
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center backdrop-blur">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 md:gap-4 mt-6 flex-wrap">
              <button onClick={() => setShowTransferForm(true)} className="flex-1 min-w-[100px] btn-primary py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2 hover:scale-105 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Send
              </button>
              <button onClick={() => setShowLeaderboard(true)} className="flex-1 min-w-[100px] py-3 md:py-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 text-yellow-400 transition border border-yellow-500/30 text-sm md:text-base font-medium hover:scale-105">
                🏆 Ranks
              </button>
              <button onClick={() => setShowDailyBonus(true)} className={`flex-1 min-w-[100px] py-3 md:py-4 rounded-xl text-sm md:text-base font-medium transition border hover:scale-105 ${dailyBonusClaimed ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border-green-500/30'}`}>
                🎁 {dailyBonusClaimed ? 'Claimed' : 'Bonus'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success mb-6 flex items-center gap-2 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-error mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <button onClick={() => setShowStats(true)} className="card p-4 md:p-6 flex flex-col items-center gap-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:scale-105 hover:border-cyan-400/50 transition group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className="text-white font-medium text-sm md:text-base">My Stats</span>
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="card p-4 md:p-6 flex flex-col items-center gap-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:scale-105 hover:border-yellow-400/50 transition group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
            <span className="text-white font-medium text-sm md:text-base">Leaderboard</span>
          </button>
          <button onClick={() => setShowAchievements(true)} className="card p-4 md:p-6 flex flex-col items-center gap-3 bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:scale-105 hover:border-pink-400/50 transition group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <span className="text-white font-medium text-sm md:text-base">Achievements</span>
          </button>
          <button onClick={() => setShowDailyBonus(true)} className="card p-4 md:p-6 flex flex-col items-center gap-3 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:scale-105 hover:border-green-400/50 transition group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <span className="text-white font-medium text-sm md:text-base">Daily Bonus</span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Transaction History</h2>
            </div>
            <button onClick={fetchTransactions} className="p-2 md:p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="professional-table hidden md:table">
              <thead>
                <tr>
                  <th className="text-left">Type</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Description</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition">
                    <td>
                      <span className={`badge ${tx.type === 'TRANSFER' ? 'badge-success' : tx.type === 'ADMIN_ADJUST' ? 'badge-warning' : tx.type === 'DAILY_BONUS' ? 'badge-info' : 'badge-danger'}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`font-semibold ${tx.sender_username === user.username ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.sender_username === user.username ? '-' : '+'}${tx.amount}
                    </td>
                    <td className="text-text-muted">{tx.description || '—'}</td>
                    <td className="text-text-muted text-right font-mono text-sm">
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`badge ${tx.type === 'TRANSFER' ? 'badge-success' : tx.type === 'ADMIN_ADJUST' ? 'badge-warning' : tx.type === 'DAILY_BONUS' ? 'badge-info' : 'badge-danger'}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                    <span className={`font-semibold text-lg ${tx.sender_username === user.username ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.sender_username === user.username ? '-' : '+'}${tx.amount}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mb-2">{tx.description || 'No description'}</p>
                  <p className="text-text-muted text-xs font-mono">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="text-text-muted mb-2">No transactions yet</p>
                <p className="text-text-muted text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Transfer Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowTransferForm(false)}>
          <div className="card w-full max-w-md p-6 mb-0 md:mb-0 animate-slide-up bg-slate-900/95 border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Send Money
              </h3>
              <button onClick={() => setShowTransferForm(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-text-muted text-sm font-medium mb-2">Recipient</label>
                <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="input-field" required disabled={loading}>
                  <option value="">Select a user...</option>
                  {users.filter(u => u.username !== user.username).map((u) => (
                    <option key={u.id} value={u.username}>{u.username} {u.title && `(${u.title})`}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-text-muted text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">$</span>
                  <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="input-field pl-8 text-lg" placeholder="0.00" min="0.01" step="0.01" required disabled={loading} />
                </div>
              </div>
              <button type="submit" disabled={loading || !transferTo || !transferAmount} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg flex items-center justify-center gap-2">
                {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Send Money</>)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="card w-full max-w-2xl p-6 mb-0 md:mb-0 animate-slide-up bg-slate-900/95 border-slate-700 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900/95 pb-4 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🏆</span> Global Leaderboard
              </h3>
              <button onClick={() => setShowLeaderboard(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              {leaderboard.map((u, idx) => {
                const title = getUserTitle(u.balance);
                return (
                  <div key={u.id} className={`p-4 rounded-xl flex items-center gap-4 ${u.id === user.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">
                      {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{u.username}</p>
                      <p className={`text-xs ${title.color}`}>{title.title}</p>
                    </div>
                    <p className="text-green-400 font-bold text-lg">${u.balance}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowAchievements(false)}>
          <div className="card w-full max-w-2xl p-6 mb-0 md:mb-0 animate-slide-up bg-slate-900/95 border-slate-700 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900/95 pb-4 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🎖️</span> Achievements
              </h3>
              <button onClick={() => setShowAchievements(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div key={ach.id} className={`p-4 rounded-xl border transition ${ach.unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ach.icon}</span>
                    <div>
                      <p className="text-white font-medium">{ach.name}</p>
                      <p className="text-text-muted text-sm">{ach.desc}</p>
                    </div>
                  </div>
                  {ach.unlocked ? (
                    <span className="badge badge-success">✓ Unlocked</span>
                  ) : (
                    <span className="badge badge-danger">🔒 Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowDailyBonus(false)}>
          <div className="card w-full max-w-md p-6 mb-0 md:mb-0 animate-slide-up bg-slate-900/95 border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🎁</span> Daily Bonus
              </h3>
              <button onClick={() => setShowDailyBonus(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🎁</span>
              </div>
              <p className="text-white text-lg font-medium mb-2">Claim Your Daily Reward!</p>
              <p className="text-text-muted text-sm mb-4">Get <span className="text-green-400 font-bold">$50</span> free every day</p>
              {dailyBonusClaimed ? (
                <div className="p-4 rounded-xl bg-gray-500/20 border border-gray-500/30">
                  <p className="text-gray-400">Already claimed today</p>
                  <p className="text-text-muted text-sm mt-1">Next bonus in: <span className="text-white font-mono">{bonusCountdown}</span></p>
                </div>
              ) : (
                <button onClick={handleDailyBonus} disabled={loading} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                  {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Claiming...</>) : (<><span className="text-2xl">🎁</span> Claim $50 Bonus</>)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4" onClick={() => setShowStats(false)}>
          <div className="card w-full max-w-md p-6 mb-0 md:mb-0 animate-slide-up bg-slate-900/95 border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">📊</span> Your Statistics
              </h3>
              <button onClick={() => setShowStats(false)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                <span className="text-text-muted">Global Rank</span>
                <span className="text-white font-bold text-xl">{getRankIcon(stats.rank)} #{stats.rank}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                <span className="text-text-muted">Total Sent</span>
                <span className="text-red-400 font-bold text-xl">-${stats.totalSent}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                <span className="text-text-muted">Total Received</span>
                <span className="text-green-400 font-bold text-xl">+${stats.totalReceived}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                <span className="text-text-muted">Transactions</span>
                <span className="text-blue-400 font-bold text-xl">{stats.transactionCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex justify-between items-center">
                <span className="text-text-muted">Current Balance</span>
                <span className="text-green-400 font-bold text-xl">${balance}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="card mx-4 mb-4 p-2 flex justify-around items-center backdrop-blur-xl bg-slate-900/90 border border-slate-700/50">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 p-3 rounded-xl text-blue-400 hover:bg-slate-800/50 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setShowTransferForm(true)} className="flex flex-col items-center gap-1 p-3 rounded-xl text-green-400 hover:bg-slate-800/50 transition">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center -mt-8 shadow-lg shadow-green-500/40 border-4 border-slate-900">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
            <span className="text-xs">Send</span>
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="flex flex-col items-center gap-1 p-3 rounded-xl text-yellow-400 hover:bg-slate-800/50 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            <span className="text-xs">Ranks</span>
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default Dashboard;