/**
 * 👤 Routes Utilisateurs - Conformes aux Spécifications
 * Routes supplémentaires pour respecter exactement les chemins de la spécification
 * 
 * Ces routes sont des alias vers les routes existantes dans auth.js, notifications.js, etc.
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');
const portefeuilleController = require('../controllers/portefeuilleController');

/**
 * @route   GET /api/users/me
 * @desc    Obtenir le profil de l'utilisateur connecté (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyProfile
 */
router.get('/me', auth, authController.getProfile);

/**
 * @route   GET /api/users/:id/me
 * @desc    Obtenir le profil de l'utilisateur connecté (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyProfile
 */
router.get('/:id/me', auth, authController.getProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Mettre à jour le profil utilisateur (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - updateMyProfile
 * @note    Cette route existe déjà dans auth.js, ceci est un alias
 */
// Déjà géré dans auth.js via app.use('/api', require('./routes/auth'))

/**
 * @route   GET /api/users/notifications
 * @desc    Obtenir mes notifications (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyNotifications
 */
router.get('/notifications', auth, notificationController.getUserNotifications);

/**
 * @route   GET /api/users/:userId/notifications
 * @desc    Obtenir les notifications d'un utilisateur (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyNotifications
 */
router.get('/:userId/notifications', auth, notificationController.getUserNotifications);

/**
 * @route   GET /api/users/wallet
 * @desc    Obtenir mon portefeuille (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyWallet
 */
router.get('/wallet', auth, portefeuilleController.obtenirMonPortefeuille);

/**
 * @route   GET /api/users/:id/wallet
 * @desc    Obtenir le portefeuille d'un utilisateur (conforme aux spécifications)
 * @access  Private
 * @spec    Liste-des-fonctions.txt - getMyWallet
 */
router.get('/:id/wallet', auth, portefeuilleController.obtenirMonPortefeuille);

module.exports = router;
