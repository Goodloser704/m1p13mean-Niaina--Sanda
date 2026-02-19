const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const loyerController = require('../controllers/loyerController');

const router = express.Router();

/**
 * 💰 Routes Paiement Loyer
 * Gestion des paiements de loyer des commerçants
 * Architecture: Route → Controller → Service
 */

// Middleware d'authentification pour toutes les routes
router.use(auth);

// @route   POST /api/commercant/loyers/pay
// @desc    Effectuer le paiement du loyer
// @access  Private (Commercant)
// @body    { boutiqueId?, montant?, periode? }
// @return  { recepisse, transaction }
router.post('/pay', [
  body('boutiqueId')
    .optional()
    .isMongoId()
    .withMessage('ID boutique invalide'),
  body('montant')
    .optional()
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Le montant doit être entre 1€ et 10,000€'),
  body('periode')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('La période doit être au format YYYY-MM')
], loyerController.payLoyer);

// @route   GET /api/commercant/loyers/historique
// @desc    Obtenir l'historique des paiements de loyer
// @access  Private (Commercant)
// @query   page, limit
// @return  { loyers, pagination }
router.get('/historique', loyerController.getHistoriqueLoyers);

// @route   GET /api/admin/loyers/historique-par-periode
// @desc    Obtenir l'historique des paiements de loyer par mois/année
// @access  Private (Admin)
// @query   mois (YYYY-MM), annee (YYYY), page, limit
// @return  { loyers, statistiques, pagination }
router.get('/historique-par-periode', loyerController.getHistoriqueParPeriode);

// @route   GET /api/admin/loyers/boutiques-impayees
// @desc    Obtenir la liste des boutiques avec loyer impayé
// @access  Private (Admin)
// @query   mois (YYYY-MM, optionnel)
// @return  { boutiquesImpayees, statistiques }
router.get('/boutiques-impayees', loyerController.getBoutiquesImpayees);

module.exports = router;