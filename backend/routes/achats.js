const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const achatController = require('../controllers/achatController');
const { RoleEnum, TypeAchatEnum } = require('../utils/enums');

const router = express.Router();

// Validation pour la validation du panier
const validatePanier = [
  body('achats')
    .isArray({ min: 1 })
    .withMessage('Le panier doit contenir au moins un achat'),
  body('achats.*.produit')
    .isMongoId()
    .withMessage('ID produit invalide'),
  body('achats.*.quantite')
    .isInt({ min: 1 })
    .withMessage('La quantité doit être un entier positif'),
  body('achats.*.typeAchat')
    .isIn(Object.values(TypeAchatEnum))
    .withMessage('Type d\'achat invalide'),
  body('achats.*.prixUnitaire')
    .isFloat({ min: 0 })
    .withMessage('Prix unitaire invalide'),
  body('montantTotal')
    .isFloat({ min: 0 })
    .withMessage('Montant total invalide')
];

// Middleware pour vérifier le rôle acheteur
const acheteurAuth = [auth, authorize(RoleEnum.Acheteur)];

// @route   POST /api/achats/panier/valider
// @desc    Valider un panier et créer les achats
// @access  Private (Acheteur)
router.post('/panier/valider', acheteurAuth, validatePanier, achatController.validerPanier);

// @route   GET /api/achats/en-cours
// @desc    Obtenir mes achats en cours
// @access  Private (Acheteur)
router.get('/en-cours', acheteurAuth, achatController.obtenirMesAchatsEnCours);

// @route   GET /api/achats/historique
// @desc    Obtenir mon historique d'achats
// @access  Private (Acheteur)
router.get('/historique', acheteurAuth, achatController.obtenirMonHistoriqueAchats);

// @route   GET /api/achats/statistiques
// @desc    Obtenir les statistiques de mes achats
// @access  Private (Acheteur)
router.get('/statistiques', acheteurAuth, achatController.obtenirStatistiquesAchats);

// @route   GET /api/achats/factures
// @desc    Obtenir mes factures
// @access  Private (Acheteur)
router.get('/factures', acheteurAuth, achatController.obtenirMesFactures);

// @route   GET /api/achats/factures/:id
// @desc    Obtenir une facture par ID
// @access  Private (Acheteur)
router.get('/factures/:id', acheteurAuth, achatController.obtenirFactureParId);

// @route   GET /api/achats/:id
// @desc    Obtenir un achat par ID
// @access  Private (Acheteur)
router.get('/:id', acheteurAuth, achatController.obtenirAchatParId);

// @route   PUT /api/achats/:id/annuler
// @desc    Annuler un achat (si possible)
// @access  Private (Acheteur)
router.put('/:id/annuler', acheteurAuth, [
  body('raison')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La raison ne peut pas dépasser 500 caractères')
], achatController.annulerAchat);

module.exports = router;