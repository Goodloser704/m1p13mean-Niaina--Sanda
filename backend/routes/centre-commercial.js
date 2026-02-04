const express = require('express');
const router = express.Router();

/**
 * 📄 Routes centre commercial
 * Gestion des opérations
 * Architecture: Route → Controller → Service
 */
const centreCommercialController = require('../controllers/centreCommercialController');
const { auth } = require('../middleware/auth');

// Routes publiques
router.get('/', centreCommercialController.obtenirCentreCommercial);

// Routes admin uniquement
router.put('/', auth, centreCommercialController.modifierCentreCommercial);
router.get('/stats', auth, centreCommercialController.obtenirStatistiques);

module.exports = router;