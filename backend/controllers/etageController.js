const etageService = require('../services/etageService');

class EtageController {
  // Créer un nouvel étage
  async creerEtage(req, res) {
    try {
      const etage = await etageService.creerEtage(req.body);
      res.status(201).json({
        message: 'Étage créé avec succès',
        etage
      });
    } catch (error) {
      console.error('Erreur création étage:', error);
      res.status(400).json({
        message: error.message || 'Erreur lors de la création de l\'étage'
      });
    }
  }

  // Obtenir tous les étages
  async obtenirEtages(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        actifSeulement: req.query.actifSeulement !== 'false'
      };

      const result = await etageService.obtenirEtages(options);
      res.json(result);
    } catch (error) {
      console.error('Erreur récupération étages:', error);
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
    try {
      const stats = await etageService.obtenirStatistiques();
      res.json({ stats });
    } catch (error) {
      console.error('Erreur récupération statistiques étages:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

module.exports = new EtageController();