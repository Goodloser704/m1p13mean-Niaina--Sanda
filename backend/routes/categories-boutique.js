const express = require('express');
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const categorieBoutiqueController = require('../controllers/categorieBoutiqueController');

const router = express.Router();

/**
 * 🏪 Routes categories boutique
 * Gestion des inscriptions, validations et opérations boutiques
 * Architecture: Route → Controller → Service
 */

// Validation pour la création/mise à jour de catégorie
const validateCategorie = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La description ne peut pas dépasser 200 caractères'),
  body('icone')
    .optional()
    .isLength({ max: 10 })
    .withMessage('L\'icône ne peut pas dépasser 10 caractères'),
  body('couleur')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('La couleur doit être au format hexadécimal (#RRGGBB)')
];

// Routes publiques
// @route   GET /api/categories-boutique
// @desc    Obtenir toutes les catégories
// @access  Public
router.get('/', categorieBoutiqueController.obtenirCategories);

// @route   GET /api/categories-boutique/test
// @desc    Test de la route catégories
// @access  Public
router.get('/test', categorieBoutiqueController.testCategories);

// Routes admin uniquement - MUST BE BEFORE PARAMETERIZED ROUTES
// @route   GET /api/categories-boutique/admin/statistiques
// @desc    Obtenir les statistiques des catégories
// @access  Private (Admin)
router.get('/admin/statistiques', adminAuth, categorieBoutiqueController.obtenirStatistiques);

// @route   POST /api/categories-boutique/admin/initialiser
// @desc    Initialiser les catégories par défaut
// @access  Private (Admin)
router.post('/admin/initialiser', adminAuth, categorieBoutiqueController.initialiserCategoriesDefaut);

// @route   POST /api/categories-boutique
// @desc    Créer une nouvelle catégorie
// @access  Private (Admin)
router.post('/', adminAuth, validateCategorie, categorieBoutiqueController.creerCategorie);

// @route   PUT /api/categories-boutique/:id
// @desc    Mettre à jour une catégorie
// @access  Private (Admin)
router.put('/:id', adminAuth, validateCategorie, categorieBoutiqueController.mettreAJourCategorie);

// @route   DELETE /api/categories-boutique/:id
// @desc    Supprimer une catégorie
// @access  Private (Admin)
router.delete('/:id', adminAuth, categorieBoutiqueController.supprimerCategorie);

// @route   GET /api/categories-boutique/:id
// @desc    Obtenir une catégorie par ID
// @access  Public
router.get('/:id', categorieBoutiqueController.obtenirCategorieParId);

module.exports = router;