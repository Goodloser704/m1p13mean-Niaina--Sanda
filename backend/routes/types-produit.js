const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

/**
 * 📦 Routes types produit
 * Gestion des types de produits par boutique
 * Architecture: Route → Controller → Service
 */
const typeProduitController = require('../controllers/typeProduitController');
const { auth, authorize } = require('../middleware/auth');
const { RoleEnum } = require('../utils/enums');

// Validations
const validateTypeProduit = [
  body('type')
    .notEmpty().withMessage('Le type est requis')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le type doit contenir entre 2 et 100 caractères'),
  body('boutique')
    .notEmpty().withMessage('La boutique est requise')
    .isMongoId().withMessage('ID boutique invalide'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  body('icone')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('L\'icône ne peut pas dépasser 50 caractères'),
  body('couleur')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur doit être au format hexadécimal (#RRGGBB)')
];

// Routes publiques

// @route   GET /api/types-produit
// @desc    Obtenir tous les types de produits
// @access  Public
// @return  { types, count }
router.get('/', typeProduitController.obtenirTousLesTypes);

// @route   GET /api/types-produit/boutique/:boutiqueId
// @desc    Obtenir les types de produits d'une boutique
// @access  Public
// @param   boutiqueId - ID de la boutique
// @return  { types, count }
router.get('/boutique/:boutiqueId', typeProduitController.obtenirTypesParBoutique);

// Routes commerçant (propriétaire de la boutique)

// @route   GET /api/types-produit/me
// @desc    Obtenir mes types de produits
// @access  Private (Commercant)
// @return  { types, count }
router.get('/me', auth, authorize(RoleEnum.Commercant), typeProduitController.obtenirMesTypes);

// @route   POST /api/types-produit
// @desc    Créer un nouveau type de produit
// @access  Private (Commercant)
// @body    { nom, description, boutique }
// @return  { message, type }
router.post('/', auth, authorize(RoleEnum.Commercant), validateTypeProduit, typeProduitController.creerTypeProduit);

// @route   PUT /api/types-produit/:id
// @desc    Modifier un type de produit
// @access  Private (Commercant)
// @param   id - ID du type de produit
// @body    { nom, description, isActive }
// @return  { message, type }
router.put('/:id', auth, authorize(RoleEnum.Commercant), typeProduitController.modifierTypeProduit);

// @route   DELETE /api/types-produit/:id
// @desc    Supprimer un type de produit
// @access  Private (Commercant)
// @param   id - ID du type de produit
// @return  { message }
router.delete('/:id', auth, authorize(RoleEnum.Commercant), typeProduitController.supprimerTypeProduit);

// @route   POST /api/types-produit/boutique/:boutiqueId/defaut
// @desc    Créer les types de produits par défaut pour une boutique
// @access  Private (Commercant)
// @param   boutiqueId - ID de la boutique
// @return  { message, types }
router.post('/boutique/:boutiqueId/defaut', auth, authorize(RoleEnum.Commercant), typeProduitController.creerTypesParDefaut);

module.exports = router;