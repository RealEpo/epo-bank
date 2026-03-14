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
  const navigate = useNavigate();

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
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/logs', {
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

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/adjust-balance',
        {
          userId: parseInt(adjustUserId),
          amount: parseFloat(adjustAmount),
          reason: adjustReason || 'Admin adjustment'
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
      setError(err.response?.data?.error || 'Failed to adjust balance!');
    }
  };

  const handleFreeze = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/freeze',
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
      setError(err.response?.data?.error || 'Failed to freeze user!');
    }
  };

  const handleChaosRob = async () => {
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/chaos/rob',
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
      setError(err.response?.data?.error || 'Chaos Rob failed!');
    }
  };

  const handleStimulus = async () => {
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/stimulus',
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
      setError(err.response?.data?.error || 'Stimulus failed!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="bg-red-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">🔥 EpoBank Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-white">
            Logged in as: <span className="text-yellow-400">{storedUser?.username}</span>
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8">
        {message && (
          <div className="bg-green-500 text-white p-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Adjust Balance */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl text-white mb-4">💰 Print Money</h2>
            <form onSubmit={handleAdjustBalance}>
              <div className="mb-3">
                <label className="block text-gray-300 mb-2">User ID</label>
                <input
                  type="number"
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  placeholder="Positive = Add, Negative = Remove"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-2">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  placeholder="Why are you adjusting?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded"
              >
                Adjust Balance
              </button>
            </form>
          </div>

          {/* Freeze User */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl text-white mb-4">🔒 Jail User</h2>
            <form onSubmit={handleFreeze}>
              <div className="mb-3">
                <label className="block text-gray-300 mb-2">User ID</label>
                <input
                  type="number"
                  value={freezeUserId}
                  onChange={(e) => setFreezeUserId(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-2">Action</label>
                <select
                  value={freezeAction}
                  onChange={(e) => setFreezeAction(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                >
                  <option value="true">Freeze (Jail)</option>
                  <option value="false">Unfreeze (Release)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded"
              >
                {freezeAction === 'true' ? 'Freeze User' : 'Unfreeze User'}
              </button>
            </form>
          </div>
        </div>

        {/* Chaos Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleChaosRob}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-lg text-xl"
          >
            🤖 Chaos Rob (Steal from Random User)
          </button>
          <button
            onClick={handleStimulus}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-lg text-xl"
          >
            💵 Give $100 to All Users
          </button>
        </div>

        {/* All Users Table */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl text-white mb-4">👥 All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Username</th>
                  <th className="pb-2">Balance</th>
                  <th className="pb-2">Admin</th>
                  <th className="pb-2">Frozen</th>
                  <th className="pb-2">Title</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="text-white border-b border-gray-700">
                    <td className="py-2">{u.id}</td>
                    <td className="py-2">{u.username}</td>
                    <td className="py-2 text-green-400">${u.balance}</td>
                    <td className="py-2">{u.is_admin ? '✅' : '❌'}</td>
                    <td className="py-2">{u.is_frozen ? '🔒 Jailed' : '✅ Free'}</td>
                    <td className="py-2 text-gray-300">{u.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Logs */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl text-white mb-4">📜 Your Admin Actions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="text-white border-b border-gray-700">
                    <td className="py-2">
                      <span className="bg-purple-500 px-2 py-1 rounded text-sm">{log.action}</span>
                    </td>
                    <td className="py-2 text-gray-300">{log.target_username || 'N/A'}</td>
                    <td className="py-2 text-gray-300">{log.details}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className="text-gray-400 text-center py-4">No admin actions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;