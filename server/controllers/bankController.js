const pool = require('../config/database');

// GET BALANCE
exports.getBalance = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Server error while fetching balance.' });
  }
};

// TRANSFER MONEY
exports.transferMoney = async (req, res) => {
  try {
    const { receiverUsername, amount } = req.body;
    const senderId = req.user.id;

    console.log('Transfer request:', { senderId, receiverUsername, amount });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const senderResult = await client.query(
        'SELECT balance, is_frozen FROM users WHERE id = $1',
        [senderId]
      );

      if (senderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Sender not found.' });
      }

      if (senderResult.rows[0].is_frozen) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Account frozen. Contact Admin.' });
      }

      if (senderResult.rows[0].balance < amount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds.' });
      }

      const receiverResult = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [receiverUsername]
      );

      if (receiverResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Receiver not found.' });
      }

      const receiverId = receiverResult.rows[0].id;

      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [amount, senderId]
      );

      await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [amount, receiverId]
      );

      await client.query(
        `INSERT INTO transactions (sender_id, receiver_id, amount, type, description) 
         VALUES ($1, $2, $3, 'TRANSFER', $4)`,
        [senderId, receiverId, amount, `Transfer to ${receiverUsername}`]
      );

      await client.query('COMMIT');

      const newBalance = await client.query(
        'SELECT balance FROM users WHERE id = $1',
        [senderId]
      );

      res.json({
        message: `Successfully transferred $${amount} to ${receiverUsername}!`,
        newBalance: newBalance.rows[0].balance
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Server error during transfer.' });
  }
};

// GET TRANSACTION HISTORY
exports.getTransactionHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id,
        t.amount,
        t.type,
        t.description,
        t.created_at,
        sender.username as sender_username,
        receiver.username as receiver_username
       FROM transactions t
       LEFT JOIN users sender ON t.sender_id = sender.id
       LEFT JOIN users receiver ON t.receiver_id = receiver.id
       WHERE t.sender_id = $1 OR t.receiver_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Server error while fetching history.' });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, title FROM users WHERE id != $1',
      [req.user.id]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
};