const express = require('express');
const { auth } = require('../middleware/auth');
const testItemController = require('../controllers/testItemController');

const router = express.Router();

/**
 * 🧪 Routes TestItem
 * Routes simples pour tester le workflow de développement
 */

// @route   GET /api/test-items/stats/me
// @desc    Obtenir les statistiques de l'utilisateur
// @access  Private
router.get('/stats/me', auth, testItemController.getStats);

// @route   GET /api/test-items
// @desc    Obtenir tous les items de l'utilisateur
// @access  Private
// @query   statut, limit
router.get('/', auth, testItemController.getAll);

// @route   GET /api/test-items/:id
// @desc    Obtenir un item par ID
// @access  Private
router.get('/:id', auth, testItemController.getById);

// @route   POST /api/test-items
// @desc    Créer un nouvel item
// @access  Private
// @body    { titre, description, valeur, tags }
router.post('/', auth, testItemController.create);

// @route   PUT /api/test-items/:id
// @desc    Mettre à jour un item
// @access  Private
// @body    { titre, description, statut, valeur, tags }
router.put('/:id', auth, testItemController.update);

// @route   PUT /api/test-items/:id/toggle
// @desc    Activer/désactiver un item
// @access  Private
router.put('/:id/toggle', auth, testItemController.toggle);

// @route   DELETE /api/test-items/:id
// @desc    Supprimer un item
// @access  Private
router.delete('/:id', auth, testItemController.delete);

module.exports = router;
