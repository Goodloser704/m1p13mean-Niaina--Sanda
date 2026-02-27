const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const portefeuilleController = require('../controllers/portefeuilleController');
const { RoleEnum } = require('../utils/enums');

const router = express.Router();

/**
 * 💰 Routes portefeuille
 * Gestion des portefeuilles et transactions financières
 * Architecture: Route → Controller → Service
 */

/**
 * 💰 Routes Portefeuille
 * Gestion des portefeuilles et transactions
 */

// Middleware d'authentification pour toutes les routes
router.use(auth);

// @route   GET /api/portefeuille/me
// @desc    Obtenir mon portefeuille
// @access  Private
router.get('/me', portefeuilleController.obtenirMonPortefeuille);

// // @route   GET /api/users/:id/wallet (conforme aux spécifications)
// // @desc    Obtenir le portefeuille d'un utilisateur
// // @access  Private
// // @return  { wallet, transactions }
// router.get('/users/:id/wallet', portefeuilleController.obtenirPortefeuilleUtilisateur);

// @route   GET /api/portefeuille/transactions
// @desc    Obtenir l'historique de mes transactions
// @access  Private
router.get('/transactions', portefeuilleController.obtenirMesTransactions);

// @route   POST /api/portefeuille/recharge
// @desc    Recharger le portefeuille
// @access  Private
router.post('/recharge', [
  body('montant')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Le montant doit être entre 0.01€ et 10,000€'),
  body('modePaiement')
    .optional()
    .isIn(['Carte', 'Virement', 'PayPal'])
    .withMessage('Mode de paiement invalide')
], portefeuilleController.rechargerPortefeuille);

// @route   GET /api/portefeuille/stats
// @desc    Obtenir les statistiques de mon portefeuille
// @access  Private
router.get('/stats', portefeuilleController.obtenirStatistiques);

// Routes Admin
// @route   GET /api/portefeuille/admin/all
// @desc    Obtenir tous les portefeuilles (Admin seulement)
// @access  Private (Admin)
router.get('/admin/all', 
  authorize(RoleEnum.Admin), 
  portefeuilleController.obtenirTousPortefeuilles
);

module.exports = router;