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
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  // ✅ ALL FUNCTIONS MOVED ABOVE useEffect
  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bank/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Balance error:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bank/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bank/users', {
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

    try {
      const response = await axios.post(
        'http://localhost:5000/api/bank/transfer',
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
      setError(err.response?.data?.error || 'Transfer failed!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ✅ useEffect NOW BELOW all functions
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

  if (!user) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">🏦 EpoBank</h1>
        <div className="flex items-center gap-4">
          <span className="text-white">
            Welcome, <span className="text-green-400">{user.username}</span>
            {user.isAdmin && <span className="ml-2 bg-red-500 px-2 py-1 rounded text-sm">ADMIN</span>}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8">
        {/* Balance Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-gray-400 text-lg mb-2">Your Balance</h2>
          <p className="text-4xl font-bold text-green-400">${balance}</p>
        </div>

        {/* Transfer Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl text-white mb-4">💸 Send Money</h2>

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

          <form onSubmit={handleTransfer}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Send To</label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none"
                required
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username} ({u.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none"
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded transition"
            >
              Send Money
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl text-white mb-4">📜 Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-white border-b border-gray-700">
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        tx.type === 'TRANSFER' ? 'bg-blue-500' :
                        tx.type === 'ADMIN_ADJUST' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-2 ${tx.sender_username === user.username ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.sender_username === user.username ? '-' : '+'}${tx.amount}
                    </td>
                    <td className="py-2 text-gray-300">{tx.description}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <p className="text-gray-400 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Admin Button (Only for You!) */}
        {user.isAdmin && (
          <div className="mt-8">
            <button
              onClick={() => navigate('/admin')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg"
            >
              🔥 Admin Panel (God Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;