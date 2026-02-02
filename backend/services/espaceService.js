const Espace = require('../models/Espace');

class EspaceService {
  // Créer un nouvel espace
  async creerEspace(espaceData) {
    try {
      const espace = new Espace(espaceData);
      await espace.save();
      return espace;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Un espace avec ce code existe déjà');
      }
      throw error;
    }
  }

  // Obtenir tous les espaces avec filtres
  async obtenirEspaces(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        etage, 
        statut, 
        surfaceMin, 
        surfaceMax, 
        loyerMax,
        search,
        actifSeulement = true 
      } = options;
      
      const skip = (page - 1) * limit;
      const query = actifSeulement ? { isActive: true } : {};

      // Filtres
      if (etage !== undefined) query.etage = etage;
      if (statut) query.statut = statut;
      if (surfaceMin) query.surface = { $gte: surfaceMin };
      if (surfaceMax) {
        query.surface = query.surface || {};
        query.surface.$lte = surfaceMax;
      }
      if (loyerMax) query.loyer = { $lte: loyerMax };
      if (search) {
        query.$or = [
          { codeEspace: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const espaces = await Espace.find(query)
        .populate('boutique', 'nom proprietaire')
        .sort({ etage: 1, codeEspace: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Espace.countDocuments(query);

      return {
        espaces,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un espace par ID
  async obtenirEspaceParId(id) {
    try {
      const espace = await Espace.findById(id)
        .populate('boutique', 'nom proprietaire contact');
      
      if (!espace) {
        throw new Error('Espace non trouvé');
      }
      
      return espace;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un espace par code
  async obtenirEspaceParCode(codeEspace) {
    try {
      const espace = await Espace.findOne({ codeEspace: codeEspace.toUpperCase() })
        .populate('boutique', 'nom proprietaire contact');
      
      if (!espace) {
        throw new Error('Espace non trouvé');
      }
      
      return espace;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un espace
  async mettreAJourEspace(id, updateData) {
    try {
      // Si on change l'étage, vérifier qu'il existe
      if (updateData.etage) {
        const etageExiste = await Etage.findOne({ 
          numero: updateData.etage, 
          isActive: true 
        });
        
        if (!etageExiste) {
          throw new Error('L\'étage spécifié n\'existe pas');
        }
      }

      const espace = await Espace.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('boutique', 'nom proprietaire');
      
      if (!espace) {
        throw new Error('Espace non trouvé');
      }
      
      return espace;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Un espace avec ce code existe déjà');
      }
      throw error;
    }
  }

  // Supprimer un espace (soft delete)
  async supprimerEspace(id) {
    try {
      const espace = await Espace.findById(id);
      if (!espace) {
        throw new Error('Espace non trouvé');
      }

      // Vérifier si l'espace est occupé
      if (espace.statut === 'Occupe') {
        throw new Error('Impossible de supprimer un espace occupé');
      }

      // Soft delete
      espace.isActive = false;
      await espace.save();
      
      return { message: 'Espace supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Occuper un espace
  async occuperEspace(id, boutiqueId) {
    try {
      const espace = await Espace.findById(id);
      if (!espace) {
        throw new Error('Espace non trouvé');
      }

      if (espace.statut === 'Occupe') {
        throw new Error('Cet espace est déjà occupé');
      }

      // Vérifier que la boutique existe
      const boutique = await Boutique.findById(boutiqueId);
      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      espace.statut = 'Occupe';
      espace.boutique = boutiqueId;
      espace.dateOccupation = new Date();
      
      await espace.save();
      
      return await espace.populate('boutique', 'nom proprietaire');
    } catch (error) {
      throw error;
    }
  }

  // Libérer un espace
  async libererEspace(id) {
    try {
      const espace = await Espace.findById(id);
      if (!espace) {
        throw new Error('Espace non trouvé');
      }

      espace.statut = 'Disponible';
      espace.boutique = null;
      espace.dateOccupation = null;
      
      await espace.save();
      
      return espace;
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des espaces disponibles
  async rechercherEspacesDisponibles(criteres = {}) {
    try {
      return await Espace.rechercherEspaces({
        ...criteres,
        statut: 'Disponible'
      });
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques des espaces
  async obtenirStatistiques() {
    try {
      const totalEspaces = await Espace.countDocuments({ isActive: true });
      const espacesDisponibles = await Espace.countDocuments({ 
        isActive: true, 
        statut: 'Disponible' 
      });
      const espacesOccupes = totalEspaces - espacesDisponibles;

      // Version simplifiée sans agrégations complexes
      return {
        totalEspaces,
        espacesDisponibles,
        espacesOccupes,
        tauxOccupation: totalEspaces > 0 ? ((espacesOccupes / totalEspaces) * 100).toFixed(2) : 0,
        statsParEtage: [],
        statsParSurface: []
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EspaceService();