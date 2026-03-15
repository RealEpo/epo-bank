import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [freezeUserId, setFreezeUserId] = useState('');
  const [freezeAction, setFreezeAction] = useState('true');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token || !storedUser?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchTransactions();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Logs error:', err);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/adjust-balance`,
        {
          userId: parseInt(adjustUserId),
          amount: parseFloat(adjustAmount),
          reason: adjustReason || 'Administrative adjustment'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      setAdjustUserId('');
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to adjust balance.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/freeze`,
        {
          userId: parseInt(freezeUserId),
          freeze: freezeAction === 'true'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      setFreezeUserId('');
      fetchUsers();
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update account status.');
    } finally {
      setLoading(false);
    }
  };

  const handleChaosRob = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/chaos/rob`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      fetchUsers();
      fetchTransactions();
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStimulus = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/stimulus`,
        { amount: 100 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
      fetchUsers();
      fetchTransactions();
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="navbar flex justify-between items-center bg-red-900/30 border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Legion Bank Administration</h1>
            <p className="text-text-muted text-sm">Administrator Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white">
            Logged in as: <span className="text-yellow-400 font-medium">{storedUser?.username}</span>
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
          >
            Back to Dashboard
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

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Adjust Balance */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Adjust Account Balance</h2>
            </div>
            <form onSubmit={handleAdjustBalance}>
              <div className="mb-4">
                <label className="block text-text-muted text-sm font-medium mb-2">User ID</label>
                <input
                  type="number"
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  className="input-field"
                  placeholder="Enter user ID"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-text-muted text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="input-field"
                  placeholder="Positive = Add, Negative = Remove"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label className="block text-text-muted text-sm font-medium mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field"
                  placeholder="Reason for adjustment"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Adjust Balance'}
              </button>
            </form>
          </div>

          {/* Freeze User */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Freeze Account</h2>
            </div>
            <form onSubmit={handleFreeze}>
              <div className="mb-4">
                <label className="block text-text-muted text-sm font-medium mb-2">User ID</label>
                <input
                  type="number"
                  value={freezeUserId}
                  onChange={(e) => setFreezeUserId(e.target.value)}
                  className="input-field"
                  placeholder="Enter user ID"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label className="block text-text-muted text-sm font-medium mb-2">Action</label>
                <select
                  value={freezeAction}
                  onChange={(e) => setFreezeAction(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="true">Freeze Account</option>
                  <option value="false">Unfreeze Account</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (freezeAction === 'true' ? 'Freeze Account' : 'Unfreeze Account')}
              </button>
            </form>
          </div>
        </div>

        {/* System Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleChaosRob}
            disabled={loading}
            className="card p-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/10 transition border-purple-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Random Transfer Test</h3>
                <p className="text-text-muted text-sm">Transfer funds between random users</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleStimulus}
            disabled={loading}
            className="card p-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500/10 transition border-blue-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Universal Credit</h3>
                <p className="text-text-muted text-sm">Distribute $100 to all users</p>
              </div>
            </div>
          </button>
        </div>

        {/* All Users Table */}
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">All Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Balance</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-text-muted">#{u.id}</td>
                    <td className="font-medium text-white">{u.username}</td>
                    <td className="text-green-400 font-semibold">${u.balance}</td>
                    <td>
                      {u.is_admin ? (
                        <span className="badge badge-warning">Admin</span>
                      ) : (
                        <span className="text-text-muted">User</span>
                      )}
                    </td>
                    <td>
                      {u.is_frozen ? (
                        <span className="badge badge-danger">Frozen</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td className="text-text-muted">{u.title || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Logs */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Admin Activity Log</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="badge badge-warning">{log.action}</span>
                    </td>
                    <td className="text-text-muted">{log.target_username || 'System'}</td>
                    <td className="text-text-muted">{log.details}</td>
                    <td className="text-text-muted">
                      {new Date(log.created_at).toLocaleString('en-US', {
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
            {logs.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-text-muted">No admin actions recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;