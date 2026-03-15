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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="navbar flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
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
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition border border-red-500/30"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Balance Card */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-muted text-lg font-medium">Available Balance</h2>
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="balance-display">${balance}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="alert alert-success mb-6 flex items-center gap-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transfer Form */}
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
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
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

          {/* Quick Stats */}
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
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
                <span className="text-text-muted">Account Type</span>
                <span className="text-white font-medium">{user.isAdmin ? 'Administrator' : 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
                <span className="text-text-muted">Total Transactions</span>
                <span className="text-white font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
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
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="professional-table">
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
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-text-muted">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;