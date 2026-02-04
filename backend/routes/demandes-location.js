const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const demandeLocationController = require('../controllers/demandeLocationController');
const { RoleEnum } = require('../utils/enums');

const router = express.Router();

/**
 * 🏪 Routes Demandes de Location
 * Gestion des demandes de location d'espaces
 */

// Middleware d'authentification pour toutes les routes
router.use(auth);

// @route   POST /api/demandes-location
// @desc    Créer une demande de location
// @access  Private (Commercant)
router.post('/', [
  body('boutiqueId')
    .isMongoId()
    .withMessage('ID de boutique invalide'),
  body('espaceId')
    .isMongoId()
    .withMessage('ID d\'espace invalide'),
  body('dateDebutSouhaitee')
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('dureeContrat')
    .isInt({ min: 1, max: 120 })
    .withMessage('La durée du contrat doit être entre 1 et 120 mois'),
  body('messageCommercant')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Le message ne peut pas dépasser 1000 caractères')
], 
authorize([RoleEnum.Commercant, 'boutique']), 
demandeLocationController.creerDemande);

// Routes Admin - MUST BE BEFORE PARAMETERIZED ROUTES
// @route   GET /api/demandes-location
// @desc    Obtenir toutes les demandes (Admin)
// @access  Private (Admin)
router.get('/', 
  authorize([RoleEnum.Admin, 'admin']), 
  demandeLocationController.obtenirToutesDemandes
);

// @route   GET /api/demandes-location/me
// @desc    Obtenir mes demandes de location
// @access  Private (Commercant)
router.get('/me', 
  authorize([RoleEnum.Commercant, 'boutique']), 
  demandeLocationController.obtenirMesDemandes
);

// @route   GET /api/demandes-location/:id
// @desc    Obtenir une demande par ID
// @access  Private
router.get('/:id', demandeLocationController.obtenirDemandeParId);

// @route   DELETE /api/demandes-location/:id
// @desc    Annuler une demande
// @access  Private (Commercant propriétaire)
router.delete('/:id', 
  authorize([RoleEnum.Commercant, 'boutique']), 
  demandeLocationController.annulerDemande
);

// @route   PUT /api/demandes-location/:id/accepter
// @desc    Accepter une demande de location
// @access  Private (Admin)
router.put('/:id/accepter', [
  body('dateDebut')
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('dateFin')
    .isISO8601()
    .withMessage('Date de fin invalide'),
  body('loyerMensuel')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Loyer mensuel invalide'),
  body('caution')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Caution invalide'),
  body('conditionsSpeciales')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les conditions spéciales ne peuvent pas dépasser 1000 caractères'),
  body('messageAdmin')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Le message admin ne peut pas dépasser 1000 caractères')
], 
authorize([RoleEnum.Admin, 'admin']), 
demandeLocationController.accepterDemande);

// @route   PUT /api/demandes-location/:id/refuser
// @desc    Refuser une demande de location
// @access  Private (Admin)
router.put('/:id/refuser', [
  body('raisonRefus')
    .notEmpty()
    .withMessage('La raison du refus est requise')
    .isLength({ max: 500 })
    .withMessage('La raison du refus ne peut pas dépasser 500 caractères'),
  body('messageAdmin')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Le message admin ne peut pas dépasser 1000 caractères')
], 
authorize([RoleEnum.Admin, 'admin']), 
demandeLocationController.refuserDemande);

module.exports = router;