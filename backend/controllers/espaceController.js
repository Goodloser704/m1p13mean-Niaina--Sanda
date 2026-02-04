const espaceService = require('../services/espaceService');

/**
 * 🏬 Contrôleur espace
 * Gestion des espaces locatifs du centre commercial
 */
class espaceController {
  // Créer un nouvel espace
  async creerEspace(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Création espace`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    console.log(`   📝 Données:`, req.body);
    
    try {
      const espace = await espaceService.creerEspace(req.body);
      console.log(`✅ Espace créé: ${espace.codeEspace} (Étage ${espace.etage})`);
      
      res.status(201).json({
        message: 'Espace créé avec succès',
        espace
      });
    } catch (error) {
      console.error('❌ Erreur création espace:', error.message);
      res.status(400).json({
        message: error.message || 'Erreur lors de la création de l\'espace'
      });
    }
  }

  // Obtenir tous les espaces avec filtres
  async obtenirEspaces(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération espaces`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    console.log(`   📝 Query params:`, req.query);
    
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        etage: req.query.etage ? parseInt(req.query.etage) : undefined,
        statut: req.query.statut,
        surfaceMin: req.query.surfaceMin ? parseFloat(req.query.surfaceMin) : undefined,
        surfaceMax: req.query.surfaceMax ? parseFloat(req.query.surfaceMax) : undefined,
        loyerMax: req.query.loyerMax ? parseFloat(req.query.loyerMax) : undefined,
        search: req.query.search,
        actifSeulement: req.query.actifSeulement !== 'false'
      };

      console.log(`🔍 Options de recherche:`, options);
      const result = await espaceService.obtenirEspaces(options);
      console.log(`✅ ${result.espaces.length} espaces récupérés`);
      
      res.json(result);
    } catch (error) {
      console.error('❌ Erreur récupération espaces:', error.message);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        message: 'Erreur lors de la récupération des espaces'
      });
    }
  }

  // Obtenir un espace par ID
  async obtenirEspaceParId(req, res) {
    try {
      const espace = await espaceService.obtenirEspaceParId(req.params.id);
      res.json({ espace });
    } catch (error) {
      console.error('Erreur récupération espace:', error);
      const status = error.message === 'Espace non trouvé' ? 404 : 500;
      res.status(status).json({
        message: error.message || 'Erreur lors de la récupération de l\'espace'
      });
    }
  }

  // Obtenir un espace par code
  async obtenirEspaceParCode(req, res) {
    try {
      const espace = await espaceService.obtenirEspaceParCode(req.params.code);
      res.json({ espace });
    } catch (error) {
      console.error('Erreur récupération espace par code:', error);
      const status = error.message === 'Espace non trouvé' ? 404 : 500;
      res.status(status).json({
        message: error.message || 'Erreur lors de la récupération de l\'espace'
      });
    }
  }

  // Mettre à jour un espace
  async mettreAJourEspace(req, res) {
    try {
      const espace = await espaceService.mettreAJourEspace(req.params.id, req.body);
      res.json({
        message: 'Espace mis à jour avec succès',
        espace
      });
    } catch (error) {
      console.error('Erreur mise à jour espace:', error);
      const status = error.message === 'Espace non trouvé' ? 404 : 400;
      res.status(status).json({
        message: error.message || 'Erreur lors de la mise à jour de l\'espace'
      });
    }
  }

  // Supprimer un espace
  async supprimerEspace(req, res) {
    try {
      const result = await espaceService.supprimerEspace(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Erreur suppression espace:', error);
      const status = error.message === 'Espace non trouvé' ? 404 : 400;
      res.status(status).json({
        message: error.message || 'Erreur lors de la suppression de l\'espace'
      });
    }
  }

  // Occuper un espace
  async occuperEspace(req, res) {
    try {
      const { boutiqueId } = req.body;
      const espace = await espaceService.occuperEspace(req.params.id, boutiqueId);
      res.json({
        message: 'Espace occupé avec succès',
        espace
      });
    } catch (error) {
      console.error('Erreur occupation espace:', error);
      const status = error.message.includes('non trouvé') ? 404 : 400;
      res.status(status).json({
        message: error.message || 'Erreur lors de l\'occupation de l\'espace'
      });
    }
  }

  // Libérer un espace
  async libererEspace(req, res) {
    try {
      const espace = await espaceService.libererEspace(req.params.id);
      res.json({
        message: 'Espace libéré avec succès',
        espace
      });
    } catch (error) {
      console.error('Erreur libération espace:', error);
      const status = error.message === 'Espace non trouvé' ? 404 : 500;
      res.status(status).json({
        message: error.message || 'Erreur lors de la libération de l\'espace'
      });
    }
  }

  // Rechercher des espaces disponibles
  async rechercherEspacesDisponibles(req, res) {
    try {
      const criteres = {
        etage: req.query.etage ? parseInt(req.query.etage) : undefined,
        surfaceMin: req.query.surfaceMin ? parseFloat(req.query.surfaceMin) : undefined,
        surfaceMax: req.query.surfaceMax ? parseFloat(req.query.surfaceMax) : undefined,
        loyerMax: req.query.loyerMax ? parseFloat(req.query.loyerMax) : undefined
      };

      const espaces = await espaceService.rechercherEspacesDisponibles(criteres);
      res.json({ espaces });
    } catch (error) {
      console.error('Erreur recherche espaces disponibles:', error);
      res.status(500).json({
        message: 'Erreur lors de la recherche d\'espaces disponibles'
      });
    }
  }

  // Obtenir les statistiques des espaces
  async obtenirStatistiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Récupération statistiques espaces`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    
    try {
      const stats = await espaceService.obtenirStatistiques();
      console.log(`✅ Statistiques espaces récupérées`);
      res.json({ stats });
    } catch (error) {
      console.error('❌ Erreur récupération statistiques espaces:', error.message);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

module.exports = new EspaceController();