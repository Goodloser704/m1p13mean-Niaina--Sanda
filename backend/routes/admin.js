const express = require('express');
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

/**
 * 📊 Routes Admin Dashboard
 * Gestion des statistiques et données administratives
 * Architecture: Route → Controller → Service
 */

// @route   GET /api/admin/dashboard
// @desc    Obtenir les statistiques du dashboard admin
// @access  Private (Admin)
// @return  { boutiques, espaces, utilisateurs, revenus, ventes }
router.get('/dashboard', adminAuth, adminController.getDashboardStats);

module.exports = router;