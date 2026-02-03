const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const { auth } = require('../middleware/auth');

// Routes publiques
router.get('/', produitController.obtenirProduits);
router.get('/boutique/:boutiqueId', produitController.obtenirProduitsParBoutique);
router.get('/:id', produitController.obtenirProduitParId);

// Routes commerçant (propriétaire de la boutique)
router.get('/me', auth, produitController.obtenirMesProduits);
router.post('/', auth, produitController.creerProduit);
router.put('/:id', auth, produitController.modifierProduit);
router.delete('/:id', auth, produitController.supprimerProduit);
router.put('/:id/stock', auth, produitController.modifierStock);

module.exports = router;