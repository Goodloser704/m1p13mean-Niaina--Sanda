const express = require('express');
const router = express.Router();
const centreCommercialController = require('../controllers/centreCommercialController');
const { auth } = require('../middleware/auth');

// Routes publiques
router.get('/', centreCommercialController.obtenirCentreCommercial);

// Routes admin uniquement
router.put('/', auth, centreCommercialController.modifierCentreCommercial);
router.get('/stats', auth, centreCommercialController.obtenirStatistiques);

module.exports = router;