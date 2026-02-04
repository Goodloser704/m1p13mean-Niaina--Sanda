const express = require('express');
const router = express.Router();

/**
 * 🏬 Routes espaces
 * Gestion des espaces locatifs du centre commercial
 * Architecture: Route → Controller → Service
 */
const espaceController = require('../controllers/espaceController');
const { auth, authorize } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Route de test simple (sans auth admin)
router.get('/test', (req, res) => {
  console.log('🧪 Route de test espaces appelée');
  res.json({ 
    message: 'Route espaces fonctionnelle',
    timestamp: new Date().toISOString(),
    user: req.user ? req.user._id : 'Non authentifié'
  });
});

// Middleware de vérification du rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent gérer les espaces.' 
    });
  }
  next();
};

// @route   GET /api/espaces/disponibles
// @desc    Rechercher des espaces disponibles (accessible aux boutiques)
// @access  Authentifié
router.get('/disponibles', espaceController.rechercherEspacesDisponibles);

// Appliquer le middleware admin aux routes suivantes
router.use(requireAdmin);

// @route   GET /api/espaces
// @desc    Obtenir tous les espaces avec filtres
// @access  Admin
router.get('/', espaceController.obtenirEspaces);

// @route   GET /api/espaces/stats
// @desc    Obtenir les statistiques des espaces
// @access  Admin
router.get('/stats', espaceController.obtenirStatistiques);

// @route   GET /api/espaces/code/:code
// @desc    Obtenir un espace par code
// @access  Admin
router.get('/code/:code', espaceController.obtenirEspaceParCode);

// @route   GET /api/espaces/:id
// @desc    Obtenir un espace par ID
// @access  Admin
router.get('/:id', espaceController.obtenirEspaceParId);

// @route   POST /api/espaces
// @desc    Créer un nouvel espace
// @access  Admin
router.post('/', espaceController.creerEspace);

// @route   PUT /api/espaces/:id
// @desc    Mettre à jour un espace
// @access  Admin
router.put('/:id', espaceController.mettreAJourEspace);

// @route   PUT /api/espaces/:id/occuper
// @desc    Occuper un espace
// @access  Admin
router.put('/:id/occuper', espaceController.occuperEspace);

// @route   PUT /api/espaces/:id/liberer
// @desc    Libérer un espace
// @access  Admin
router.put('/:id/liberer', espaceController.libererEspace);

// @route   DELETE /api/espaces/:id
// @desc    Supprimer un espace (soft delete)
// @access  Admin
router.delete('/:id', espaceController.supprimerEspace);

module.exports = router;