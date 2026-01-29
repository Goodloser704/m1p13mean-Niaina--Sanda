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

// @route   GET /api/boutique/me
// @desc    Obtenir ma boutique
// @access  Private (Boutique seulement)
router.get('/me', auth, boutiqueController.getMyBoutique);

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