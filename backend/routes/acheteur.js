/**
 * 🛍️ Routes Acheteur - Conformes aux Spécifications
 * Routes supplémentaires pour respecter exactement les chemins de la spécification
 * 
 * Ces routes sont des alias vers les routes existantes dans achats.js et factures.js
 */

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const achatController = require('../controllers/achatController');
const factureController = require('../controllers/factureController');
const { RoleEnum } = require('../utils/enums');

// Middleware pour vérifier le rôle acheteur
const acheteurAuth = [auth, authorize(RoleEnum.Acheteur)];

/**
 * @route   GET /api/acheteur/:id/achats/en-cours
 * @desc    Obtenir les achats en cours d'un acheteur (conforme aux spécifications)
 * @access  Private (Acheteur)
 * @spec    Liste-des-fonctions.txt - getMyAchatsEnCours
 */
router.get('/:id/achats/en-cours', acheteurAuth, achatController.obtenirMesAchatsEnCours);

/**
 * @route   GET /api/acheteur/:id/achats/historique
 * @desc    Obtenir l'historique des achats d'un acheteur (conforme aux spécifications)
 * @access  Private (Acheteur)
 * @spec    Liste-des-fonctions.txt - getMyHistoriqueAchats
 */
router.get('/:id/achats/historique', acheteurAuth, achatController.obtenirMonHistoriqueAchats);

/**
 * @route   POST /api/acheteur/:id/achats/panier/validate
 * @desc    Valider le panier d'un acheteur (conforme aux spécifications)
 * @access  Private (Acheteur)
 * @spec    Liste-des-fonctions.txt - validerPanier
 * @note    Cette route existe aussi sur /api/achats/panier/valider
 */
router.post('/:id/achats/panier/validate', acheteurAuth, achatController.validerPanier);

/**
 * @route   GET /api/acheteur/:id/factures
 * @desc    Obtenir les factures d'un acheteur (conforme aux spécifications)
 * @access  Private (Acheteur ou Admin)
 * @spec    Liste-des-fonctions.txt - getMyFactures
 */
router.get('/:id/factures', acheteurAuth, factureController.getMyFactures);

module.exports = router;
