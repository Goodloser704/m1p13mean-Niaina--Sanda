const express = require('express');
const router = express.Router();

/**
 * 📦 Routes types produit
 * Gestion des types de produits par boutique
 * Architecture: Route → Controller → Service
 */
const typeProduitController = require('../controllers/typeProduitController');
const { auth } = require('../middleware/auth');

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
router.get('/me', auth, typeProduitController.obtenirMesTypes);

// @route   POST /api/types-produit
// @desc    Créer un nouveau type de produit
// @access  Private (Commercant)
// @body    { nom, description, boutique }
// @return  { message, type }
router.post('/', auth, typeProduitController.creerTypeProduit);

// @route   PUT /api/types-produit/:id
// @desc    Modifier un type de produit
// @access  Private (Commercant)
// @param   id - ID du type de produit
// @body    { nom, description, isActive }
// @return  { message, type }
router.put('/:id', auth, typeProduitController.modifierTypeProduit);

// @route   DELETE /api/types-produit/:id
// @desc    Supprimer un type de produit
// @access  Private (Commercant)
// @param   id - ID du type de produit
// @return  { message }
router.delete('/:id', auth, typeProduitController.supprimerTypeProduit);

// @route   POST /api/types-produit/boutique/:boutiqueId/defaut
// @desc    Créer les types de produits par défaut pour une boutique
// @access  Private (Commercant)
// @param   boutiqueId - ID de la boutique
// @return  { message, types }
router.post('/boutique/:boutiqueId/defaut', auth, typeProduitController.creerTypesParDefaut);

module.exports = router;