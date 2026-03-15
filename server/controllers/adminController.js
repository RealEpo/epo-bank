const pool = require('../config/database');

// GET ALL USERS (Admin View)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, balance, is_admin, is_frozen, title, created_at FROM users ORDER BY balance DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
};

// FREEZE/UNFREEZE USER
exports.toggleFreeze = async (req, res) => {
  try {
    const { userId, freeze } = req.body;

    await pool.query(
      'UPDATE users SET is_frozen = $1 WHERE id = $2',
      [freeze, userId]
    );

    const action = freeze ? 'FROZEN' : 'UNFROZEN';
    
    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_user_id, details) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, `USER_${action}`, userId, `Admin ${freeze ? 'froze' : 'unfroze'} user`]
    );

    res.json({ message: `User ${action} successfully!` });
  } catch (error) {
    console.error('Toggle freeze error:', error);
    res.status(500).json({ error: 'Server error while freezing user.' });
  }
};

// ADD/REMOVE MONEY (Admin Print Money)
exports.adjustBalance = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!amount || amount === 0) {
      return res.status(400).json({ error: 'Amount must not be 0.' });
    }

    // Add or subtract based on positive/negative amount
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [amount, userId]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, type, description) 
       VALUES ($1, $2, $3, 'ADMIN_ADJUST', $4)`,
      [null, userId, Math.abs(amount), reason || 'Admin balance adjustment']
    );

    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_user_id, details) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'BALANCE_ADJUST', userId, `${amount > 0 ? 'Added' : 'Removed'} $${Math.abs(amount)}: ${reason || 'No reason'}`]
    );

    res.json({ message: `Successfully ${amount > 0 ? 'added' : 'removed'} $${Math.abs(amount)}!` });
  } catch (error) {
    console.error('Adjust balance error:', error);
    res.status(500).json({ error: 'Server error while adjusting balance.' });
  }
};

// GET ALL TRANSACTIONS (Admin View)
exports.getAllTransactions = async (req, res) => {
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
       ORDER BY t.created_at DESC
       LIMIT 100`
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Server error while fetching transactions.' });
  }
};

// GET ADMIN LOGS (Your Secret History)
exports.getAdminLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at,
        u.username as target_username
       FROM admin_logs al
       LEFT JOIN users u ON al.target_user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 50`
    );

    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Server error while fetching admin logs.' });
  }
};

// TRIGGER CHAOS EVENT (Rob Random User)
exports.triggerChaosRob = async (req, res) => {
  try {
    // Get a random user (not admin)
    const victimResult = await pool.query(
      `SELECT id, username, balance FROM users WHERE is_admin = FALSE AND balance > 50 ORDER BY RANDOM() LIMIT 1`
    );

    if (victimResult.rows.length === 0) {
      return res.status(400).json({ error: 'No eligible victims found.' });
    }

    const victim = victimResult.rows[0];
    const robAmount = Math.floor(Math.random() * (victim.balance * 0.3)) + 10; // 10-30% of their balance

    // Steal money
    await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [robAmount, victim.id]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO transactions (sender_id, receiver_id, amount, type, description) 
       VALUES ($1, $2, $3, 'CHAOS_ROB', $4)`,
      [victim.id, null, robAmount, `Chaos Bot robbed ${victim.username}`]
    );

    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_user_id, details) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'CHAOS_ROB', victim.id, `Robbed $${robAmount} from ${victim.username}`]
    );

    res.json({
      message: `Chaos Bot robbed $${robAmount} from ${victim.username}!`,
      victim: victim.username,
      amount: robAmount
    });
  } catch (error) {
    console.error('Chaos rob error:', error);
    res.status(500).json({ error: 'Server error while triggering chaos.' });
  }
};

// GIVE MONEY TO ALL USERS (Stimulus Check)
exports.stimulusCheck = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    // Get all non-admin users
    const usersResult = await pool.query(
      'SELECT id, username FROM users WHERE is_admin = FALSE'
    );

    let totalGiven = 0;

    for (const user of usersResult.rows) {
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [amount, user.id]
      );

      await pool.query(
        `INSERT INTO transactions (sender_id, receiver_id, amount, type, description) 
         VALUES ($1, $2, $3, 'STIMULUS', $4)`,
        [null, user.id, amount, 'Admin stimulus check']
      );

      totalGiven += amount;
    }

    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_user_id, details) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'STIMULUS', null, `Gave $${amount} to ${usersResult.rows.length} users. Total: $${totalGiven}`]
    );

    res.json({
      message: `Gave $${amount} to ${usersResult.rows.length} users!`,
      totalGiven,
      recipients: usersResult.rows.length
    });
  } catch (error) {
    console.error('Stimulus check error:', error);
    res.status(500).json({ error: 'Server error while giving stimulus.' });
  }
};