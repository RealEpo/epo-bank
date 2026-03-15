// Daily Bonus Route
router.post('/daily-bonus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const userResult = await db.query('SELECT last_bonus_claim, balance FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (user.last_bonus_claim === today) {
      return res.status(400).json({ error: 'Daily bonus already claimed today!' });
    }
    
    const bonusAmount = 50;
    const newBalance = parseFloat(user.balance) + bonusAmount;
    
    await db.query('UPDATE users SET balance = $1, last_bonus_claim = $2 WHERE id = $3', [newBalance, today, userId]);
    
    await db.query('INSERT INTO transactions (receiver_id, amount, type, description) VALUES ($1, $2, $3, $4)', 
      [userId, bonusAmount, 'DAILY_BONUS', 'Daily bonus claim']);
    
    await db.query('INSERT INTO admin_logs (action, details) VALUES ($1, $2)', 
      ['DAILY_BONUS', `User ${req.user.username} claimed daily bonus`]);
    
    res.json({ message: `✅ Claimed $${bonusAmount} daily bonus!`, newBalance: newBalance.toFixed(2) });
  } catch (err) {
    console.error('Daily bonus error:', err);
    res.status(500).json({ error: 'Failed to claim bonus' });
  }
});

// Get User Stats Route
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const txResult = await db.query('SELECT * FROM transactions WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC', [userId]);
    const userResult = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);
    
    let totalSent = 0, totalReceived = 0;
    txResult.rows.forEach(tx => {
      if (tx.sender_id === userId) totalSent += parseFloat(tx.amount);
      if (tx.receiver_id === userId) totalReceived += parseFloat(tx.amount);
    });
    
    const allUsers = await db.query('SELECT id, balance FROM users');
    const rank = allUsers.rows.filter(u => parseFloat(u.balance) > parseFloat(userResult.rows[0].balance)).length + 1;
    
    res.json({
      totalSent: totalSent.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      transactionCount: txResult.rows.length,
      rank,
      balance: userResult.rows[0].balance
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Daily Bonus Route
router.post('/daily-bonus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const userResult = await db.query('SELECT last_bonus_claim, balance FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (user.last_bonus_claim === today) {
      return res.status(400).json({ error: 'Daily bonus already claimed today!' });
    }
    
    const bonusAmount = 50;
    const newBalance = parseFloat(user.balance) + bonusAmount;
    
    await db.query('UPDATE users SET balance = $1, last_bonus_claim = $2 WHERE id = $3', [newBalance, today, userId]);
    
    await db.query('INSERT INTO transactions (receiver_id, amount, type, description) VALUES ($1, $2, $3, $4)', 
      [userId, bonusAmount, 'DAILY_BONUS', 'Daily bonus claim']);
    
    await db.query('INSERT INTO admin_logs (action, details) VALUES ($1, $2)', 
      ['DAILY_BONUS', `User ${req.user.username} claimed daily bonus`]);
    
    res.json({ message: `✅ Claimed $${bonusAmount} daily bonus!`, newBalance: newBalance.toFixed(2) });
  } catch (err) {
    console.error('Daily bonus error:', err);
    res.status(500).json({ error: 'Failed to claim bonus' });
  }
});

// Get User Stats Route
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const txResult = await db.query('SELECT * FROM transactions WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC', [userId]);
    const userResult = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);
    
    let totalSent = 0, totalReceived = 0;
    txResult.rows.forEach(tx => {
      if (tx.sender_id === userId) totalSent += parseFloat(tx.amount);
      if (tx.receiver_id === userId) totalReceived += parseFloat(tx.amount);
    });
    
    const allUsers = await db.query('SELECT id, balance FROM users');
    const rank = allUsers.rows.filter(u => parseFloat(u.balance) > parseFloat(userResult.rows[0].balance)).length + 1;
    
    res.json({
      totalSent: totalSent.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      transactionCount: txResult.rows.length,
      rank,
      balance: userResult.rows[0].balance
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});