const Etage = require('../models/Etage');

class EtageService {
  // Créer un nouvel étage
  async creerEtage(etageData) {
    try {
      const etage = new Etage(etageData);
      await etage.save();
      return etage;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Un étage avec ce numéro existe déjà');
      }
      throw error;
    }
  }

  // Obtenir tous les étages
  async obtenirEtages(options = {}) {
    try {
      const { page = 1, limit = 50, actifSeulement = true } = options;
      const skip = (page - 1) * limit;
      
      const query = actifSeulement ? { isActive: true } : {};
      
      const etages = await Etage.find(query)
        .sort({ numero: 1 })
        .skip(skip)
        .limit(limit);

      // Version simplifiée sans statistiques d'espaces pour éviter les dépendances circulaires
      const etagesSimples = etages.map(etage => ({
        ...etage.toObject(),
        nombreEspaces: 0,
        espacesDisponibles: 0,
        espacesOccupes: 0
      }));

      const total = await Etage.countDocuments(query);

      return {
        etages: etagesSimples,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un étage par ID
  async obtenirEtageParId(id) {
    try {
      const etage = await Etage.findById(id);
      if (!etage) {
        throw new Error('Étage non trouvé');
      }

      const nombreEspaces = await etage.getNombreEspaces();
      const espacesDisponibles = await etage.getEspacesDisponibles();

      return {
        ...etage.toObject(),
        nombreEspaces,
        espacesDisponibles,
        espacesOccupes: nombreEspaces - espacesDisponibles
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un étage
  async mettreAJourEtage(id, updateData) {
    try {
      const etage = await Etage.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!etage) {
        throw new Error('Étage non trouvé');
      }
      
      return etage;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Un étage avec ce numéro existe déjà');
      }
      throw error;
    }
  }

  // Supprimer un étage (soft delete)
  async supprimerEtage(id) {
    try {
      // Vérifier s'il y a des espaces sur cet étage
      const etage = await Etage.findById(id);
      if (!etage) {
        throw new Error('Étage non trouvé');
      }

      const nombreEspaces = await etage.getNombreEspaces();
      if (nombreEspaces > 0) {
        throw new Error('Impossible de supprimer un étage qui contient des espaces');
      }

      // Soft delete
      etage.isActive = false;
      await etage.save();
      
      return { message: 'Étage supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques des étages
  async obtenirStatistiques() {
    try {
      const totalEtages = await Etage.countDocuments({ isActive: true });
      
      // Version simplifiée sans dépendances circulaires
      return {
        totalEtages,
        totalEspaces: 0,
        espacesDisponibles: 0,
        espacesOccupes: 0,
        tauxOccupation: 0,
        statsParEtage: []
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EtageService();