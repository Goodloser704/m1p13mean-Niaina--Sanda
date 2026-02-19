const express = require('express');
const router = express.Router();
const { auth, authorize, adminAuth } = require('../middleware/auth');
const loyerController = require('../controllers/loyerController');
const { RoleEnum } = require('../utils/enums');

/**
 * 💰 Routes Loyers
 * Gestion des paiements de loyer et historique
 */

// Routes Admin
/**
 * @route   GET /api/loyers/historique
 * @desc    Obtenir l'historique complet des paiements de loyer
 * @access  Private (Admin)
 * @query   mois, annee, page, limit
 */
router.get('/historique', adminAuth, loyerController.obtenirHistorique);

/**
 * @route   GET /api/loyers/boutiques/impayees
 * @desc    Obtenir les boutiques n'ayant pas payé le loyer du mois en cours
 * @access  Private (Admin)
 * @query   mois, annee
 */
router.get('/boutiques/impayees', adminAuth, loyerController.obtenirBoutiquesImpayees);

/**
 * @route   GET /api/loyers/boutiques/payees
 * @desc    Obtenir les boutiques ayant payé le loyer du mois en cours
 * @access  Private (Admin)
 * @query   mois, annee
 */
router.get('/boutiques/payees', adminAuth, loyerController.obtenirBoutiquesPayees);

/**
 * @route   GET /api/loyers/statistiques
 * @desc    Obtenir les statistiques des loyers par année
 * @access  Private (Admin)
 * @query   annee
 */
router.get('/statistiques', adminAuth, loyerController.obtenirStatistiques);

// Routes Commercant
/**
 * @route   GET /api/commercant/loyers/historique
 * @desc    Obtenir l'historique des loyers d'un commercant
 * @access  Private (Commercant)
 * @query   mois, annee, page, limit
 */
router.get(
  '/commercant/historique',
  auth,
  authorize(RoleEnum.Commercant),
  loyerController.obtenirHistoriqueCommercant
);

/**
 * @route   POST /api/commercant/loyers/:loyerId/payer
 * @desc    Payer un loyer
 * @access  Private (Commercant)
 * @param   loyerId - ID du loyer
 * @body    { modePaiement }
 */
router.post(
  '/commercant/:loyerId/payer',
  auth,
  authorize(RoleEnum.Commercant),
  loyerController.payerLoyer
);

module.exports = router;
