const express = require('express');
const router = express.Router();
const authController = require('../server/controllers/authController');
const bankController = require('../server/controllers/bankController');
const adminController = require('../server/controllers/adminController');
const authenticateToken = require('../server/middleware/auth');
const checkAdmin = require('../server/middleware/admin');

// PUBLIC ROUTES
router.post('/register', authController.register);
router.post('/login', authController.login);

// PROTECTED ROUTES
router.get('/me', authenticateToken, authController.getMe);
router.get('/bank/balance', authenticateToken, bankController.getBalance);
router.post('/bank/transfer', authenticateToken, bankController.transferMoney);
router.get('/bank/history', authenticateToken, bankController.getTransactionHistory);
router.get('/bank/users', authenticateToken, bankController.getAllUsers);

// ADMIN ROUTES
router.get('/admin/users', authenticateToken, checkAdmin, adminController.getAllUsers);
router.post('/admin/freeze', authenticateToken, checkAdmin, adminController.toggleFreeze);
router.post('/admin/adjust-balance', authenticateToken, checkAdmin, adminController.adjustBalance);
router.get('/admin/transactions', authenticateToken, checkAdmin, adminController.getAllTransactions);
router.get('/admin/logs', authenticateToken, checkAdmin, adminController.getAdminLogs);
router.post('/admin/chaos/rob', authenticateToken, checkAdmin, adminController.triggerChaosRob);
router.post('/admin/stimulus', authenticateToken, checkAdmin, adminController.stimulusCheck);

module.exports = router;