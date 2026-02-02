const etageService = require('../services/etageService');

class EtageController {
  // Créer un nouvel étage
  async creerEtage(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏢 [${timestamp}] Création étage`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    console.log(`   📝 Données:`, req.body);
    
    try {
      const etage = await etageService.creerEtage(req.body);
      console.log(`✅ Étage créé: ${etage.nom} (${etage.numero})`);
      
      res.status(201).json({
        message: 'Étage créé avec succès',
        etage
      });
    } catch (error) {
      console.error('❌ Erreur création étage:', error.message);
      res.status(400).json({
        message: error.message || 'Erreur lors de la création de l\'étage'
      });
    }
  }

  // Obtenir tous les étages
  async obtenirEtages(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏢 [${timestamp}] Récupération étages`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    console.log(`   📝 Query params:`, req.query);
    
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        actifSeulement: req.query.actifSeulement !== 'false'
      };

      console.log(`🔍 Options de recherche:`, options);
      const result = await etageService.obtenirEtages(options);
      console.log(`✅ ${result.etages.length} étages récupérés`);
      
      res.json(result);
    } catch (error) {
      console.error('❌ Erreur récupération étages:', error.message);
      console.error('❌ Stack trace:', error.stack);
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
    console.log(`📊 [${timestamp}] Récupération statistiques étages`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    
    try {
      const stats = await etageService.obtenirStatistiques();
      console.log(`✅ Statistiques étages récupérées`);
      res.json({ stats });
    } catch (error) {
      console.error('❌ Erreur récupération statistiques étages:', error.message);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

module.exports = new EtageController();