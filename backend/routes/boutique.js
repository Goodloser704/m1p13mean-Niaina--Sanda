const express = require('express');
const { auth, adminAuth, authorize } = require('../middleware/auth');
const boutiqueController = require('../controllers/boutiqueController');

const router = express.Router();

/**
 * 🏪 Routes des Boutiques
 * Gestion des inscriptions, validations et opérations boutiques
 * Architecture: Route → Controller → Service
 */

// Routes publiques pour les boutiques - PAS D'AUTHENTIFICATION REQUISE
// @route   GET /api/boutiques (conforme aux spécifications)
// @desc    Obtenir toutes les boutiques actives (publique)
// @access  Public (NO AUTH REQUIRED)
// @return  { boutiques, count }
router.get('/boutiques', boutiqueController.getAllBoutiques);

// @route   GET /api/boutiques/search/ (conforme aux spécifications)
// @desc    Rechercher des boutiques par mot-clé
// @access  Public (NO AUTH REQUIRED)
// @query   keyword, page, limit
// @return  { boutiques, count, pagination }
router.get('/boutiques/search/', boutiqueController.searchBoutiques);

// @route   GET /api/boutiques/:id/produits (conforme aux spécifications)
// @desc    Obtenir les produits d'une boutique
// @access  Public (NO AUTH REQUIRED)
// @param   id - ID de la boutique
// @return  { produits }
router.get('/boutiques/:id/produits', boutiqueController.getBoutiqueProduits);

// Routes de gestion boutique (anciennes, maintenues pour compatibilité) - PUBLIQUES
// @route   GET /api/boutique
// @desc    Obtenir toutes les boutiques actives (publique)
// @access  Public (NO AUTH REQUIRED)
// @return  { boutiques, count }
router.get('/', boutiqueController.getAllBoutiques);

// @route   POST /api/boutique
// @desc    Créer une nouvelle boutique (alias de /register)
// @access  Private (Commercant ONLY)
// @body    { nom, description, categorie }
// @return  { message, boutique }
router.post('/', auth, authorize('Commercant'), boutiqueController.createBoutique);

// @route   GET /api/boutiques/search
// @desc    Rechercher des boutiques par mot-clé
// @access  Public (NO AUTH REQUIRED)
// @query   keyword, page, limit
// @return  { boutiques, count, pagination }
router.get('/search', boutiqueController.searchBoutiques);

// @route   POST /api/boutique/register
// @desc    Créer une nouvelle inscription boutique
// @access  Private (Commercant ONLY)
// @body    { nom, description, categorie }
// @return  { message, boutique }
router.post('/register', auth, authorize('Commercant'), boutiqueController.createBoutique);

// @route   POST /api/commercant/boutique (conforme aux spécifications)
// @desc    Créer une nouvelle boutique
// @access  Private (Commercant ONLY)
// @body    { boutique }
// @return  { boutique }
router.post('/commercant/boutique', auth, authorize('Commercant'), boutiqueController.createBoutique);

// @route   GET /api/boutique/my-boutiques
// @desc    Obtenir toutes mes boutiques
// @access  Private (Commercant)
// @return  { boutiques, count }
router.get('/my-boutiques', auth, boutiqueController.getMyBoutiques);

// @route   GET /api/commercant/:id/boutiques (conforme aux spécifications)
// @desc    Obtenir les boutiques d'un commerçant
// @access  Private (Commercant)
// @return  { boutiques }
router.get('/commercant/:id/boutiques', auth, boutiqueController.getCommercantBoutiques);

// @route   GET /api/boutique/me/:boutiqueId?
// @desc    Obtenir une boutique spécifique (ou la première si pas d'ID)
// @access  Private (Commercant)
// @param   boutiqueId - ID de la boutique (optionnel)
// @return  { boutique }
router.get('/me/:boutiqueId?', auth, boutiqueController.getMyBoutique);

// @route   GET /api/commercant/boutique/:id (conforme aux spécifications)
// @desc    Obtenir une boutique spécifique
// @access  Private (Commercant)
// @param   id - ID de la boutique
// @return  { boutique }
router.get('/commercant/boutique/:id', auth, boutiqueController.getBoutiqueById);

// @route   PUT /api/boutique/me/:boutiqueId
// @desc    Mettre à jour une boutique
// @access  Private (Commercant)
// @param   boutiqueId - ID de la boutique
// @body    { nom, description, horairesHebdo }
// @return  { message, boutique }
router.put('/me/:boutiqueId', auth, boutiqueController.updateMyBoutique);

// @route   DELETE /api/boutique/me/:boutiqueId
// @desc    Supprimer une boutique (si en attente)
// @access  Private (Commercant)
// @param   boutiqueId - ID de la boutique
// @return  { message }
router.delete('/me/:boutiqueId', auth, boutiqueController.deleteMyBoutique);

// Routes Admin pour la gestion des boutiques
// @route   GET /api/boutique/all
// @desc    Obtenir toutes les boutiques (Admin seulement)
// @access  Private (Admin)
// @return  { boutiques, count }
router.get('/all', adminAuth, boutiqueController.getAllBoutiques);

// @route   GET /api/boutique/admin/stats
// @desc    Obtenir les statistiques des boutiques
// @access  Private (Admin)
// @return  { statistiques }
router.get('/admin/stats', adminAuth, boutiqueController.getBoutiqueStats);

// @route   GET /api/boutique/pending
// @desc    Obtenir les boutiques en attente de validation
// @access  Private (Admin seulement)
router.get('/pending', adminAuth, boutiqueController.getPendingBoutiques);

// @route   PUT /api/boutique/:boutiqueId/approve
// @desc    Approuver une boutique
// @access  Private (Admin seulement)
router.put('/:boutiqueId/approve', adminAuth, boutiqueController.approveBoutique);

// @route   PUT /api/boutique/:boutiqueId/reject
// @desc    Rejeter une boutique
// @access  Private (Admin seulement)
router.put('/:boutiqueId/reject', adminAuth, boutiqueController.rejectBoutique);

// @route   GET /api/boutique/:boutiqueId
// @desc    Obtenir une boutique par ID
// @access  Private (Admin seulement)
router.get('/:boutiqueId', adminAuth, boutiqueController.getBoutiqueById);

module.exports = router;