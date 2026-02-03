const express = require('express');
const router = express.Router();
const typeProduitController = require('../controllers/typeProduitController');
const { auth } = require('../middleware/auth');

// Routes publiques
router.get('/', typeProduitController.obtenirTousLesTypes);
router.get('/boutique/:boutiqueId', typeProduitController.obtenirTypesParBoutique);

// Routes commerçant (propriétaire de la boutique)
router.get('/me', auth, typeProduitController.obtenirMesTypes);
router.post('/', auth, typeProduitController.creerTypeProduit);
router.put('/:id', auth, typeProduitController.modifierTypeProduit);
router.delete('/:id', auth, typeProduitController.supprimerTypeProduit);
router.post('/boutique/:boutiqueId/defaut', auth, typeProduitController.creerTypesParDefaut);

module.exports = router;