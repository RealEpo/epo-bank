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
  const [showTransferForm, setShowTransferForm] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

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

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bank/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bank/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/bank/transfer`,
        {
          receiverUsername: transferTo,
          amount: parseFloat(transferAmount)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      setBalance(response.data.newBalance);
      setTransferTo('');
      setTransferAmount('');
      fetchTransactions();
      setShowTransferForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setUser(storedUser);
    fetchBalance();
    fetchTransactions();
    fetchUsers();
  }, []);

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
      {/* Navbar - Desktop */}
      <nav className="hidden md:flex navbar justify-between items-center sticky top-0 z-50">
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
            {user.isAdmin && (
              <span className="badge badge-warning text-xs">Administrator</span>
            )}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition backdrop-blur"
          >
            Dashboard
          </button>
          {user.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition border border-red-500/30"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition shadow-lg shadow-red-500/30"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Navbar - Mobile */}
      <nav className="md:hidden navbar flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Legion</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-700/50 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-slate-900/98 backdrop-blur-xl">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">{user.username}</p>
                {user.isAdmin && (
                  <span className="badge badge-warning text-xs">Administrator</span>
                )}
              </div>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              className="w-full p-4 rounded-xl bg-slate-800 text-white text-left font-medium"
            >
              📊 Dashboard
            </button>
            {user.isAdmin && (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
                className="w-full p-4 rounded-xl bg-red-500/20 text-red-400 text-left font-medium border border-red-500/30"
              >
                🔐 Admin Panel
              </button>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); setShowTransferForm(true); }}
              className="w-full p-4 rounded-xl bg-blue-500/20 text-blue-400 text-left font-medium border border-blue-500/30"
            >
              💸 Send Money
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full p-4 rounded-xl bg-red-500 text-white text-left font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
        {/* Balance Card - Enhanced */}
        <div className="card p-6 md:p-8 mb-6 md:mb-8 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-blue-600/30 border-blue-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-text-muted text-sm md:text-lg font-medium mb-1">Available Balance</h2>
                <p className="balance-display text-3xl md:text-5xl">${balance}</p>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 md:gap-4 mt-4">
              <button
                onClick={() => setShowTransferForm(true)}
                className="flex-1 btn-primary py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
              <button
                onClick={fetchBalance}
                className="px-4 md:px-6 py-3 md:py-4 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white transition backdrop-blur"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success mb-6 flex items-center gap-2 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Transfer Form Modal - Mobile */}
        {showTransferForm && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="card w-full max-w-md p-6 mb-0 md:mb-0 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Send Money</h3>
                <button
                  onClick={() => setShowTransferForm(false)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTransfer}>
                <div className="mb-4">
                  <label className="block text-text-muted text-sm font-medium mb-2">Recipient</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="">Select a user...</option>
                    {users.filter(u => u.username !== user.username).map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.username} {u.title && `(${u.title})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-text-muted text-sm font-medium mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">$</span>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="input-field pl-8 text-lg"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !transferTo || !transferAmount}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Money
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile Only */}
        <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowTransferForm(true)}
            className="card p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">Send</span>
          </button>
          <button
            onClick={fetchTransactions}
            className="card p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">History</span>
          </button>
        </div>

        {/* Desktop Layout - Two Columns */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transfer Form - Desktop */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Send Money</h2>
            </div>

            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-text-muted text-sm font-medium mb-2">Recipient</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => u.username !== user.username).map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username} {u.title && `(${u.title})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-text-muted text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="input-field pl-8"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !transferTo || !transferAmount}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Money
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account Overview */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Account Overview</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <span className="text-text-muted">Account Type</span>
                <span className="text-white font-medium">{user.isAdmin ? 'Administrator' : 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <span className="text-text-muted">Total Transactions</span>
                <span className="text-white font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <span className="text-text-muted">Account Status</span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>

            {user.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-danger w-full mt-6 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Administration Panel
              </button>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Transaction History</h2>
            </div>
            <button
              onClick={fetchTransactions}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="professional-table hidden md:table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className={`badge ${
                        tx.type === 'TRANSFER' ? 'badge-success' :
                        tx.type === 'ADMIN_ADJUST' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`font-semibold ${
                      tx.sender_username === user.username ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {tx.sender_username === user.username ? '-' : '+'}${tx.amount}
                    </td>
                    <td className="text-text-muted">{tx.description || '—'}</td>
                    <td className="text-text-muted">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`badge ${
                      tx.type === 'TRANSFER' ? 'badge-success' :
                      tx.type === 'ADMIN_ADJUST' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                    <span className={`font-semibold text-lg ${
                      tx.sender_username === user.username ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {tx.sender_username === user.username ? '-' : '+'}${tx.amount}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mb-2">{tx.description || 'No description'}</p>
                  <p className="text-text-muted text-xs">
                    {new Date(tx.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-text-muted mb-2">No transactions yet</p>
                <p className="text-text-muted text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="card mx-4 mb-4 p-2 flex justify-around items-center backdrop-blur-xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-blue-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setShowTransferForm(true)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-green-400"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center -mt-6 shadow-lg shadow-green-500/40">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-xs">Send</span>
          </button>
          <button
            onClick={() => {
              if (user.isAdmin) navigate('/admin');
              else handleLogout();
            }}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-red-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {user.isAdmin ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              )}
            </svg>
            <span className="text-xs">{user.isAdmin ? 'Admin' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;