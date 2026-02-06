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

// Routes publiques
router.get('/', centreCommercialController.obtenirCentreCommercial);

// Routes admin uniquement
router.put('/', auth, authorize(RoleEnum.Admin, 'admin'), centreCommercialController.modifierCentreCommercial);
router.get('/stats', auth, authorize(RoleEnum.Admin, 'admin'), centreCommercialController.obtenirStatistiques);

module.exports = router;