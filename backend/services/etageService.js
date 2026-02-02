const Etage = require('../models/Etage');
const Espace = require('../models/Espace');

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

      // Ajouter les statistiques d'espaces pour chaque étage
      const etagesAvecStats = await Promise.all(
        etages.map(async (etage) => {
          const nombreEspaces = await etage.getNombreEspaces();
          const espacesDisponibles = await etage.getEspacesDisponibles();
          
          return {
            ...etage.toObject(),
            nombreEspaces,
            espacesDisponibles,
            espacesOccupes: nombreEspaces - espacesDisponibles
          };
        })
      );

      const total = await Etage.countDocuments(query);

      return {
        etages: etagesAvecStats,
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
      const totalEspaces = await Espace.countDocuments({ isActive: true });
      const espacesDisponibles = await Espace.countDocuments({ 
        isActive: true, 
        statut: 'Disponible' 
      });
      const espacesOccupes = totalEspaces - espacesDisponibles;

      // Statistiques par étage
      const statsParEtage = await Espace.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$etage',
            totalEspaces: { $sum: 1 },
            espacesDisponibles: {
              $sum: { $cond: [{ $eq: ['$statut', 'Disponible'] }, 1, 0] }
            },
            espacesOccupes: {
              $sum: { $cond: [{ $eq: ['$statut', 'Occupe'] }, 1, 0] }
            },
            surfaceTotale: { $sum: '$surface' },
            loyerTotal: { $sum: '$loyer' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        totalEtages,
        totalEspaces,
        espacesDisponibles,
        espacesOccupes,
        tauxOccupation: totalEspaces > 0 ? ((espacesOccupes / totalEspaces) * 100).toFixed(2) : 0,
        statsParEtage
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EtageService();