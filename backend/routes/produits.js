const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

/**
 * 📦 Routes produits
 * Gestion des produits et catalogue
 * Architecture: Route → Controller → Service
 */
const produitController = require('../controllers/produitController');
const { auth, authorize } = require('../middleware/auth');
const { RoleEnum } = require('../utils/enums');

// Validations
const validateProduit = [
  body('nom')
    .notEmpty().withMessage('Le nom est requis')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Le nom doit contenir entre 2 et 200 caractères'),
  body('prix')
    .notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('boutique')
    .notEmpty().withMessage('La boutique est requise')
    .isMongoId().withMessage('ID boutique invalide'),
  body('typeProduit')
    .optional()
    .isMongoId().withMessage('ID type produit invalide'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
  body('stock.nombreDispo')
    .optional()
    .isInt({ min: 0 }).withMessage('Le stock doit être un entier positif')
];

const validateStock = [
  body('nombreDispo')
    .notEmpty().withMessage('La quantité est requise')
    .isInt({ min: 0 }).withMessage('La quantité doit être un entier positif')
];

// Routes publiques

// @route   GET /api/produits
// @desc    Obtenir tous les produits avec pagination et filtres
// @access  Public
// @query   page, limit, categorie, search
// @return  { produits, count, page, limit, totalPages }
router.get('/', produitController.obtenirProduits);

// @route   GET /api/produits/test
// @desc    Route de test pour vérifier le fonctionnement
// @access  Public
// @return  { message, produits }
router.get('/test', produitController.testProduits);

// @route   GET /api/produits/boutique/:boutiqueId
// @desc    Obtenir tous les produits d'une boutique spécifique
// @access  Public
// @param   boutiqueId - ID de la boutique
// @return  { produits, count }
router.get('/boutique/:boutiqueId', produitController.obtenirProduitsParBoutique);

// Routes commerçant (propriétaire de la boutique) - AVANT /:id pour éviter conflit

// @route   GET /api/produits/me
// @desc    Obtenir tous les produits de mes boutiques
// @access  Private (Commercant)
// @return  { produits, count }
router.get('/me', auth, authorize(RoleEnum.Commercant), produitController.obtenirMesProduits);

// @route   POST /api/produits
// @desc    Créer un nouveau produit
// @access  Private (Commercant)
// @body    { nom, description, prix, categorie, boutique, stock }
// @return  { message, produit }
router.post('/', auth, authorize(RoleEnum.Commercant), validateProduit, produitController.creerProduit);

// @route   PUT /api/produits/:id/stock
// @desc    Modifier le stock d'un produit
// @access  Private (Commercant)
// @param   id - ID du produit
// @body    { quantite }
// @return  { message, produit }
router.put('/:id/stock', auth, authorize(RoleEnum.Commercant), validateStock, produitController.modifierStock);

// @route   PUT /api/produits/:id
// @desc    Modifier un produit
// @access  Private (Commercant)
// @param   id - ID du produit
// @body    { nom, description, prix, categorie, stock, isActive }
// @return  { message, produit }
router.put('/:id', auth, authorize(RoleEnum.Commercant), produitController.modifierProduit);

// @route   DELETE /api/produits/:id
// @desc    Supprimer un produit (soft delete avec isActive)
// @access  Private (Commercant)
// @param   id - ID du produit
// @return  { message }
router.delete('/:id', auth, authorize(RoleEnum.Commercant), produitController.supprimerProduit);

// Route publique avec paramètre dynamique - DOIT ÊTRE EN DERNIER

// @route   GET /api/produits/:id
// @desc    Obtenir un produit par son ID
// @access  Public
// @param   id - ID du produit
// @return  { produit }
router.get('/:id', produitController.obtenirProduitParId);

module.exports = router;