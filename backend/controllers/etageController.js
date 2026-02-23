const etageService = require('../services/etageService');

console.log('🏢 [CONTROLLER] Initialisation EtageController...');

/**
 * 🏢 Contrôleur des Étages
 * Gestion des étages du centre commercial
 */
class EtageController {
  
  /**
   * @route   POST /api/etages
   * @desc    Créer un nouvel étage
   * @access  Private (Admin)
   * @body    { niveau }
   * @return  { message, etage }
   */
  async creerEtage(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏢 [CONTROLLER] [${timestamp}] === DEBUT creerEtage ===`);
    console.log(`🏢 [CONTROLLER] User ID: ${req.user._id} (${req.user.role})`);
    console.log(`🏢 [CONTROLLER] Body:`, JSON.stringify(req.body, null, 2));
    
    try {
      // Vérifier si un étage avec ce niveau existe déjà
      const Etage = require('../models/Etage');
      const etageExistant = await Etage.findOne({ niveau: req.body.niveau });
      
      if (etageExistant) {
        console.warn(`⚠️ [CONTROLLER] Étage avec niveau ${req.body.niveau} existe déjà (ID: ${etageExistant._id})`);
        return res.status(400).json({
          message: `Un étage avec le niveau ${req.body.niveau} existe déjà`,
          etageExistant: {
            _id: etageExistant._id,
            niveau: etageExistant.niveau,
            nom: etageExistant.nom
          }
        });
      }
      
      console.log(`🏢 [CONTROLLER] Appel etageService.creerEtage...`);
      const etage = await etageService.creerEtage(req.body);
      console.log(`✅ [CONTROLLER] Étage créé:`, JSON.stringify(etage, null, 2));
      
      const response = {
        message: 'Étage créé avec succès',
        etage
      };
      
      console.log(`🏢 [CONTROLLER] Réponse:`, JSON.stringify(response, null, 2));
      console.log(`🏢 [CONTROLLER] === FIN creerEtage ===`);
      
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur création étage:', error.message);
      console.error('❌ [CONTROLLER] Stack:', error.stack);
      console.log(`🏢 [CONTROLLER] === FIN creerEtage (ERREUR) ===`);
      
      res.status(400).json({
        message: error.message || 'Erreur lors de la création de l\'étage'
      });
    }
  }

  /**
   * @route   GET /api/etages
   * @desc    Obtenir tous les étages
   * @access  Private (Admin)
   * @query   page, limit, actifSeulement
   * @return  { etages, pagination }
   */
  async obtenirEtages(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏢 [CONTROLLER] [${timestamp}] === DEBUT obtenirEtages ===`);
    console.log(`🏢 [CONTROLLER] User ID: ${req.user._id} (${req.user.role})`);
    console.log(`🏢 [CONTROLLER] Query params:`, JSON.stringify(req.query, null, 2));
    
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        actifSeulement: req.query.actifSeulement !== 'false'
      };

      console.log(`🔍 [CONTROLLER] Options de recherche:`, JSON.stringify(options, null, 2));
      console.log(`🏢 [CONTROLLER] Appel etageService.obtenirEtages...`);
      
      const result = await etageService.obtenirEtages(options);
      console.log(`✅ [CONTROLLER] ${result.etages.length} étages récupérés`);
      console.log(`🏢 [CONTROLLER] Résultat:`, JSON.stringify(result, null, 2));
      console.log(`🏢 [CONTROLLER] === FIN obtenirEtages ===`);
      
      res.json(result);
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur récupération étages:', error.message);
      console.error('❌ [CONTROLLER] Stack trace:', error.stack);
      console.log(`🏢 [CONTROLLER] === FIN obtenirEtages (ERREUR) ===`);
      
      res.status(500).json({
        message: 'Erreur lors de la récupération des étages'
      });
    }
  }

  // Obtenir un étage par ID
  async obtenirEtageParId(req, res) {
    try {
      const etage = await etageService.obtenirEtageParId(req.params.id);
      res.json({ etage });
    } catch (error) {
      console.error('Erreur récupération étage:', error);
      const status = error.message === 'Étage non trouvé' ? 404 : 500;
      res.status(status).json({
        message: error.message || 'Erreur lors de la récupération de l\'étage'
      });
    }
  }

  // Mettre à jour un étage
  async mettreAJourEtage(req, res) {
    try {
      const etage = await etageService.mettreAJourEtage(req.params.id, req.body);
      res.json({
        message: 'Étage mis à jour avec succès',
        etage
      });
    } catch (error) {
      console.error('Erreur mise à jour étage:', error);
      const status = error.message === 'Étage non trouvé' ? 404 : 400;
      res.status(status).json({
        message: error.message || 'Erreur lors de la mise à jour de l\'étage'
      });
    }
  }

  // Supprimer un étage
  async supprimerEtage(req, res) {
    try {
      const result = await etageService.supprimerEtage(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Erreur suppression étage:', error);
      const status = error.message === 'Étage non trouvé' ? 404 : 400;
      res.status(status).json({
        message: error.message || 'Erreur lors de la suppression de l\'étage'
      });
    }
  }

  // Obtenir les statistiques des étages
  async obtenirStatistiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [CONTROLLER] [${timestamp}] === DEBUT obtenirStatistiques ===`);
    console.log(`📊 [CONTROLLER] User ID: ${req.user._id} (${req.user.role})`);
    
    try {
      console.log(`📊 [CONTROLLER] Appel etageService.obtenirStatistiques...`);
      const stats = await etageService.obtenirStatistiques();
      console.log(`✅ [CONTROLLER] Statistiques récupérées:`, JSON.stringify(stats, null, 2));
      
      const response = { stats };
      console.log(`📊 [CONTROLLER] Réponse finale:`, JSON.stringify(response, null, 2));
      console.log(`📊 [CONTROLLER] === FIN obtenirStatistiques ===`);
      
      res.json(response);
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur récupération statistiques étages:', error.message);
      console.error('❌ [CONTROLLER] Stack trace:', error.stack);
      console.log(`📊 [CONTROLLER] === FIN obtenirStatistiques (ERREUR) ===`);
      
      res.status(500).json({
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

console.log('✅ [CONTROLLER] EtageController initialisé');
module.exports = new EtageController();