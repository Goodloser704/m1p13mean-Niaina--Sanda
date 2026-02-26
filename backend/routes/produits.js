const express = require('express');
const router = express.Router();

/**
 * 📦 Routes produits
 * Gestion des produits et catalogue
 * Architecture: Route → Controller → Service
 */
const produitController = require('../controllers/produitController');
const { auth } = require('../middleware/auth');

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
router.get('/me', auth, produitController.obtenirMesProduits);

// @route   POST /api/produits
// @desc    Créer un nouveau produit
// @access  Private (Commercant)
// @body    { nom, description, prix, categorie, boutique, stock }
// @return  { message, produit }
router.post('/', auth, produitController.creerProduit);

// @route   PUT /api/produits/:id/stock
// @desc    Modifier le stock d'un produit
// @access  Private (Commercant)
// @param   id - ID du produit
// @body    { quantite }
// @return  { message, produit }
router.put('/:id/stock', auth, produitController.modifierStock);

// @route   PUT /api/produits/:id
// @desc    Modifier un produit
// @access  Private (Commercant)
// @param   id - ID du produit
// @body    { nom, description, prix, categorie, stock, isActive }
// @return  { message, produit }
router.put('/:id', auth, produitController.modifierProduit);

// @route   DELETE /api/produits/:id
// @desc    Supprimer un produit (soft delete avec isActive)
// @access  Private (Commercant)
// @param   id - ID du produit
// @return  { message }
router.delete('/:id', auth, produitController.supprimerProduit);

// Route publique avec paramètre dynamique - DOIT ÊTRE EN DERNIER

// @route   GET /api/produits/:id
// @desc    Obtenir un produit par son ID
// @access  Public
// @param   id - ID du produit
// @return  { produit }
router.get('/:id', produitController.obtenirProduitParId);

module.exports = router;