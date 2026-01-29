const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * 🔔 Routes des Notifications
 * Architecture: Route → Controller → Service
 */

// @route   GET /api/notifications
// @desc    Obtenir les notifications de l'utilisateur connecté
// @access  Private
router.get('/', auth, notificationController.getUserNotifications);

// @route   GET /api/notifications/count
// @desc    Obtenir le nombre de notifications non lues
// @access  Private
router.get('/count', auth, notificationController.getUnreadCount);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put('/:notificationId/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Marquer toutes les notifications comme lues
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   PUT /api/notifications/:notificationId/archive
// @desc    Archiver une notification
// @access  Private
router.put('/:notificationId/archive', auth, notificationController.archiveNotification);

// @route   GET /api/notifications/admin/stats
// @desc    Obtenir les statistiques des notifications (Admin seulement)
// @access  Private (Admin)
router.get('/admin/stats', adminAuth, notificationController.getAdminStats);

module.exports = router;