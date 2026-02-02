const express = require('express');
const router = express.Router();
const etageController = require('../controllers/etageController');
const { auth, authorize } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Middleware de vérification du rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent gérer les étages.' 
    });
  }
  next();
};

// Appliquer le middleware admin à toutes les routes
router.use(requireAdmin);

// @route   GET /api/etages
// @desc    Obtenir tous les étages
// @access  Admin
router.get('/', etageController.obtenirEtages);

// @route   GET /api/etages/stats
// @desc    Obtenir les statistiques des étages
// @access  Admin
router.get('/stats', etageController.obtenirStatistiques);

// @route   GET /api/etages/:id
// @desc    Obtenir un étage par ID
// @access  Admin
router.get('/:id', etageController.obtenirEtageParId);

// @route   POST /api/etages
// @desc    Créer un nouvel étage
// @access  Admin
router.post('/', etageController.creerEtage);

// @route   PUT /api/etages/:id
// @desc    Mettre à jour un étage
// @access  Admin
router.put('/:id', etageController.mettreAJourEtage);

// @route   DELETE /api/etages/:id
// @desc    Supprimer un étage (soft delete)
// @access  Admin
router.delete('/:id', etageController.supprimerEtage);

module.exports = router;