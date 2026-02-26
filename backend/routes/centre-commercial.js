const express = require('express');
const router = express.Router();

/**
 * 📄 Routes centre commercial
 * Gestion des opérations
 * Architecture: Route → Controller → Service
 */
const centreCommercialController = require('../controllers/centreCommercialController');
const { auth, authorize } = require('../middleware/auth');
const { RoleEnum } = require('../utils/enums');

// @route   GET /api/centre-commercial
// @desc    Obtenir les informations du centre commercial
// @access  Public
// @return  { centreCommercial }
router.get('/', centreCommercialController.obtenirCentreCommercial);

// @route   PUT /api/centre-commercial
// @desc    Modifier les informations du centre commercial
// @access  Private (Admin)
// @body    { nom, adresse, telephone, email, horaires, description }
// @return  { message, centreCommercial }
router.put('/', auth, authorize(RoleEnum.Admin, 'admin'), centreCommercialController.modifierCentreCommercial);

// @route   GET /api/centre-commercial/stats
// @desc    Obtenir les statistiques du centre commercial
// @access  Private (Admin)
// @return  { statistiques }
router.get('/stats', auth, authorize(RoleEnum.Admin, 'admin'), centreCommercialController.obtenirStatistiques);

module.exports = router;