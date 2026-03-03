const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const achatController = require('../controllers/achatController');
const { RoleEnum } = require('../utils/enums');

const router = express.Router();

/**
 * 🏪 Routes Commercant
 * Routes spécifiques aux commerçants
 * Architecture: Route → Controller → Service
 */

// Middleware pour vérifier le rôle commercant
const commercantAuth = [auth, authorize(RoleEnum.Commercant)];

// @route   GET /api/commercant/achats/en-cours
// @desc    Obtenir les achats en cours pour le commercant
// @access  Private (Commercant)
router.get('/achats/en-cours', commercantAuth, achatController.obtenirAchatsCommercantEnCours);

// @route   PUT /api/commercant/achats/:id/livraison
// @desc    Valider la livraison d'un achat
// @access  Private (Commercant)
router.put('/achats/:id/livraison', commercantAuth, [
  body('dureeLivraison')
    .matches(/^\d+:[0-5]\d:[0-5]\d$/)
    .withMessage('La durée de livraison doit être au format hh:mm:ss')
], achatController.validerLivraison);

module.exports = router;
