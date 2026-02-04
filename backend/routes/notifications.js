const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * 🔔 Routes des Notifications
 * Gestion des notifications utilisateurs et administrateurs
 * Architecture: Route → Controller → Service
 */

// @route   GET /api/notifications
// @desc    Obtenir les notifications de l'utilisateur connecté
// @access  Private
// @query   page, limit, includeRead, type
// @return  { notifications, unreadCount, pagination }
router.get('/', auth, notificationController.getUserNotifications);

// @route   GET /api/notifications/count
// @desc    Obtenir le nombre de notifications non lues
// @access  Private
// @return  { unreadCount }
router.get('/count', auth, notificationController.getUnreadCount);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Marquer une notification comme lue
// @access  Private
// @param   notificationId - ID de la notification
// @return  { message, notification }
router.put('/:notificationId/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Marquer toutes les notifications comme lues
// @access  Private
// @return  { message, count }
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   PUT /api/notifications/:notificationId/archive
// @desc    Archiver une notification
// @access  Private
// @param   notificationId - ID de la notification
// @return  { message, notification }
router.put('/:notificationId/archive', auth, notificationController.archiveNotification);

// @route   GET /api/notifications/admin/stats
// @desc    Obtenir les statistiques des notifications (Admin seulement)
// @access  Private (Admin)
// @return  { statistiques }
router.get('/admin/stats', adminAuth, notificationController.getAdminStats);

module.exports = router;