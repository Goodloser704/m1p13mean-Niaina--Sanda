const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const achatController = require('../controllers/achatController');
const { RoleEnum, TypeAchatEnum } = require('../utils/enums');

const router = express.Router();

/**
 * 🛒 Routes des Achats
 * Gestion des achats, panier et commandes pour les acheteurs
 * Architecture: Route → Controller → Service
 */

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

// @route   GET /api/achats
// @desc    Test de l'API achats (route publique pour tests)
// @access  Public
// @return  { message, endpoints, timestamp }
router.get('/', (req, res) => {
  res.json({
    message: 'API Achats fonctionnelle',
    endpoints: [
      'POST /api/achats/panier/valider - Valider panier (Auth requise)',
      'GET /api/achats/en-cours - Achats en cours (Auth requise)',
      'GET /api/achats/historique - Historique achats (Auth requise)',
      'GET /api/achats/statistiques - Statistiques (Auth requise)',
      'GET /api/achats/factures - Mes factures (Auth requise)',
      'GET /api/achats/:id - Achat par ID (Auth requise)',
      'PUT /api/achats/:id/annuler - Annuler achat (Auth requise)'
    ],
    timestamp: new Date().toISOString()
  });
});

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