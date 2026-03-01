const express = require('express');
const router = express.Router();

/**
 * 🏢 Routes etages
 * Gestion des étages du centre commercial
 * Architecture: Route → Controller → Service
 */
const etageController = require('../controllers/etageController');
const { auth, authorize } = require('../middleware/auth');
const { RoleEnum } = require('../utils/enums');

console.log('🏢 [ROUTES] Initialisation routes étages...');

// Middleware d'authentification pour toutes les routes
router.use((req, res, next) => {
  console.log(`🏢 [ROUTES] Requête étages: ${req.method} ${req.originalUrl}`);
  console.log(`🏢 [ROUTES] Headers:`, req.headers);
  next();
});

router.use(auth);

// Route de test simple (sans auth admin)
router.get('/test', (req, res) => {
  console.log('🧪 [ROUTES] Route de test étages appelée');
  console.log('🧪 [ROUTES] User:', req.user ? req.user._id : 'Non authentifié');
  
  const response = { 
    message: 'Route étages fonctionnelle',
    timestamp: new Date().toISOString(),
    user: req.user ? req.user._id : 'Non authentifié'
  };
  
  console.log('🧪 [ROUTES] Réponse test:', response);
  res.json(response);
});

// @route   GET /api/etages
// @desc    Obtenir tous les étages
// @access  Authentifié
router.get('/', (req, res, next) => {
  console.log(`🏢 [ROUTES] GET / - Appel contrôleur obtenirEtages`);
  etageController.obtenirEtages(req, res, next);
});

// @route   GET /api/etages/:id
// @desc    Obtenir un étage par ID
// @access  Authentifié
router.get('/:id', (req, res, next) => {
  console.log(`🏢 [ROUTES] GET /:id - Appel contrôleur obtenirEtageParId`);
  etageController.obtenirEtageParId(req, res, next);
});

// Middleware de vérification du rôle admin
const requireAdmin = (req, res, next) => {
  console.log(`🛡️ [ROUTES] Vérification admin pour ${req.originalUrl}`);
  console.log(`🛡️ [ROUTES] User role: ${req.user?.role}`);
  
  if (req.user.role !== RoleEnum.Admin) {
    console.log(`❌ [ROUTES] Accès refusé - Rôle: ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent gérer les étages.' 
    });
  }
  
  console.log(`✅ [ROUTES] Accès admin autorisé`);
  next();
};

// @route   GET /api/etages/stats
// @desc    Obtenir les statistiques des étages
// @access  Admin
router.get('/stats', requireAdmin, (req, res, next) => {
  console.log(`📊 [ROUTES] GET /stats - Appel contrôleur obtenirStatistiques`);
  etageController.obtenirStatistiques(req, res, next);
});

// @route   POST /api/etages
// @desc    Créer un nouvel étage
// @access  Admin
router.post('/', requireAdmin, (req, res, next) => {
  console.log(`🏢 [ROUTES] POST / - Appel contrôleur creerEtage`);
  etageController.creerEtage(req, res, next);
});

// @route   PUT /api/etages/:id
// @desc    Mettre à jour un étage
// @access  Admin
router.put('/:id', requireAdmin, (req, res, next) => {
  console.log(`🏢 [ROUTES] PUT /:id - Appel contrôleur mettreAJourEtage`);
  etageController.mettreAJourEtage(req, res, next);
});

// @route   DELETE /api/etages/:id
// @desc    Supprimer un étage (soft delete)
// @access  Admin
router.delete('/:id', requireAdmin, (req, res, next) => {
  console.log(`🏢 [ROUTES] DELETE /:id - Appel contrôleur supprimerEtage`);
  etageController.supprimerEtage(req, res, next);
});

console.log('✅ [ROUTES] Routes étages configurées');
module.exports = router;