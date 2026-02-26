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
router.get('/', produitController.obtenirProduits);
router.get('/test', produitController.testProduits);
router.get('/boutique/:boutiqueId', produitController.obtenirProduitsParBoutique);

// Routes commerçant (propriétaire de la boutique) - AVANT /:id pour éviter conflit
router.get('/me', auth, produitController.obtenirMesProduits);
router.post('/', auth, produitController.creerProduit);
router.put('/:id/stock', auth, produitController.modifierStock);
router.put('/:id', auth, produitController.modifierProduit);
router.delete('/:id', auth, produitController.supprimerProduit);

// Route publique avec paramètre dynamique - DOIT ÊTRE EN DERNIER
router.get('/:id', produitController.obtenirProduitParId);

module.exports = router;