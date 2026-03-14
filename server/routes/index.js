const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bankController = require('../controllers/bankController');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');

// ============================================
// PUBLIC ROUTES (No Login Required)
// ============================================
router.post('/register', authController.register);
router.post('/login', authController.login);

// ============================================
// PROTECTED ROUTES (Login Required)
// ============================================

// Get Current User Info
router.get('/me', authenticateToken, authController.getMe);

// Bank Operations
router.get('/bank/balance', authenticateToken, bankController.getBalance);
router.post('/bank/transfer', authenticateToken, bankController.transferMoney);
router.get('/bank/history', authenticateToken, bankController.getTransactionHistory);
router.get('/bank/users', authenticateToken, bankController.getAllUsers);

// ============================================
// ADMIN ONLY ROUTES (God Mode)
// ============================================

// Get All Users (Admin View)
router.get('/admin/users', authenticateToken, checkAdmin, adminController.getAllUsers);

// Freeze/Unfreeze User
router.post('/admin/freeze', authenticateToken, checkAdmin, adminController.toggleFreeze);

// Add/Remove Money
router.post('/admin/adjust-balance', authenticateToken, checkAdmin, adminController.adjustBalance);

// Get All Transactions
router.get('/admin/transactions', authenticateToken, checkAdmin, adminController.getAllTransactions);

// Get Admin Logs (Your Secret History)
router.get('/admin/logs', authenticateToken, checkAdmin, adminController.getAdminLogs);

// Trigger Chaos Rob
router.post('/admin/chaos/rob', authenticateToken, checkAdmin, adminController.triggerChaosRob);

// Give Stimulus Check
router.post('/admin/stimulus', authenticateToken, checkAdmin, adminController.stimulusCheck);

module.exports = router;