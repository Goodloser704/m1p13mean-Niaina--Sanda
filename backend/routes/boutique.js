const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const boutiqueController = require('../controllers/boutiqueController');

const router = express.Router();

/**
 * 🏪 Routes des Boutiques
 * Architecture: Route → Controller → Service
 */

// @route   POST /api/boutique/register
// @desc    Créer une nouvelle inscription boutique
// @access  Private (Boutique seulement)
router.post('/register', auth, boutiqueController.createBoutique);

// @route   GET /api/boutique/my-boutiques
// @desc    Obtenir toutes mes boutiques
// @access  Private (Boutique seulement)
router.get('/my-boutiques', auth, boutiqueController.getMyBoutiques);

// @route   GET /api/boutique/me/:boutiqueId?
// @desc    Obtenir une boutique spécifique (ou la première si pas d'ID)
// @access  Private (Boutique seulement)
router.get('/me/:boutiqueId?', auth, boutiqueController.getMyBoutique);

// @route   PUT /api/boutique/me/:boutiqueId
// @desc    Mettre à jour une boutique
// @access  Private (Boutique seulement)
router.put('/me/:boutiqueId', auth, boutiqueController.updateMyBoutique);

// @route   DELETE /api/boutique/me/:boutiqueId
// @desc    Supprimer une boutique (si en attente)
// @access  Private (Boutique seulement)
router.delete('/me/:boutiqueId', auth, boutiqueController.deleteMyBoutique);

// Routes Admin pour la gestion des boutiques
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

// @route   GET /api/boutique/admin/stats
// @desc    Obtenir les statistiques des boutiques
// @access  Private (Admin seulement)
router.get('/admin/stats', adminAuth, boutiqueController.getBoutiqueStats);

module.exports = router;