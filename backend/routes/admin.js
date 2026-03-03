const express = require('express');
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const demandeLocationController = require('../controllers/demandeLocationController');
const centreCommercialController = require('../controllers/centreCommercialController');

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

/**
 * @route   PUT /api/admin/centre-commercial
 * @desc    Modifier les informations du centre commercial (conforme aux spécifications)
 * @access  Private (Admin)
 * @spec    Liste-des-fonctions.txt - updateCentreCommercial
 */
router.put('/centre-commercial', adminAuth, centreCommercialController.modifierCentreCommercial);

/**
 * @route   GET /api/admin/demandes-location/etat/:etat
 * @desc    Obtenir les demandes de location par état (conforme aux spécifications)
 * @access  Private (Admin)
 * @spec    Liste-des-fonctions.txt - getDemandeLocationParEtat
 */
router.get('/demandes-location/etat/:etat', adminAuth, demandeLocationController.obtenirDemandesParEtat);

module.exports = router;