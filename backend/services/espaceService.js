const Espace = require('../models/Espace');
const Etage = require('../models/Etage');
const CentreCommercial = require('../models/CentreCommercial');
const Boutique = require('../models/Boutique');

class EspaceService {
  // Créer un nouvel espace
  async creerEspace(espaceData) {
    try {
      // 1. Récupérer le centre commercial (prendre le premier actif)
      if (!espaceData.centreCommercial) {
        const centre = await CentreCommercial.findOne({ isActive: true });
        if (!centre) {
          throw new Error('Aucun centre commercial actif trouvé');
        }
        espaceData.centreCommercial = centre._id;
      }

      // 2. Convertir le numéro d'étage en ID si nécessaire
      if (espaceData.etage) {
        const mongoose = require('mongoose');
        
        // Si etage est un ObjectId valide, le garder tel quel
        if (mongoose.Types.ObjectId.isValid(espaceData.etage) && String(espaceData.etage).length === 24) {
          // C'est déjà un ObjectId, vérifier qu'il existe
          const etage = await Etage.findById(espaceData.etage);
          if (!etage || !etage.isActive) {
            throw new Error(`Aucun étage actif trouvé avec cet ID`);
          }
        } else {
          // Si etage est un nombre ou une string de nombre, chercher l'étage correspondant
          const numeroEtage = parseInt(espaceData.etage);
          const etage = await Etage.findOne({ numero: numeroEtage, isActive: true });
          if (!etage) {
            throw new Error(`Aucun étage actif trouvé avec le numéro ${numeroEtage}`);
          }
          espaceData.etage = etage._id;
        }
      }

      // 3. Validation et traitement du code d'espace
      // Accepter 'numero', 'codeEspace' ou 'code' comme champ (pour compatibilité)
      const codeEspace = espaceData.code || espaceData.numero || espaceData.codeEspace;
      
      if (!codeEspace) {
        throw new Error('Le code d\'espace est requis (champ "code", "numero" ou "codeEspace")');
      }

      // Nettoyer et valider le code
      let codeNettoye = String(codeEspace).trim().toUpperCase();
      
      if (codeNettoye.length === 0) {
        throw new Error('Le code d\'espace ne peut pas être vide');
      }

      // Supprimer les caractères non alphanumériques pour respecter le format du modèle
      codeNettoye = codeNettoye.replace(/[^A-Z0-9]/g, '');
      
      if (codeNettoye.length === 0) {
        throw new Error('Le code d\'espace doit contenir au moins un caractère alphanumérique');
      }

      if (codeNettoye.length > 10) {
        throw new Error('Le code d\'espace ne peut pas dépasser 10 caractères alphanumériques');
      }

      // Assigner le code nettoyé
      espaceData.code = codeNettoye;
      // Supprimer les alias pour éviter les conflits
      delete espaceData.numero;
      delete espaceData.codeEspace;

      // 4. Vérifier l'unicité du code sur cet étage
      const espaceExistant = await Espace.findOne({
        code: codeNettoye,
        etage: espaceData.etage,
        isActive: true
      });

      if (espaceExistant) {
        throw new Error(`Le code "${codeNettoye}" existe déjà sur cet étage`);
      }

      // 5. Valider et assigner la superficie
      if (espaceData.superficie !== undefined) {
        const superficie = parseFloat(espaceData.superficie);
        if (isNaN(superficie) || superficie <= 0) {
          throw new Error('La superficie doit être un nombre positif');
        }
        if (superficie > 10000) {
          throw new Error('La superficie ne peut pas dépasser 10000 m²');
        }
        espaceData.surface = superficie; // Le modèle utilise 'surface'
      } else if (espaceData.surface !== undefined) {
        const superficie = parseFloat(espaceData.surface);
        if (isNaN(superficie) || superficie <= 0) {
          throw new Error('La superficie doit être un nombre positif');
        }
        if (superficie > 10000) {
          throw new Error('La superficie ne peut pas dépasser 10000 m²');
        }
        espaceData.surface = superficie;
      } else {
        throw new Error('La superficie est requise');
      }

      // 6. Valider et assigner le prix du loyer
      if (espaceData.prixLoyer !== undefined) {
        const prixLoyer = parseFloat(espaceData.prixLoyer);
        if (isNaN(prixLoyer) || prixLoyer < 0) {
          throw new Error('Le prix du loyer doit être un nombre positif ou zéro');
        }
        if (prixLoyer > 1000000) {
          throw new Error('Le prix du loyer ne peut pas dépasser 1 000 000');
        }
        espaceData.loyer = prixLoyer; // Le modèle utilise 'loyer'
      } else if (espaceData.loyer !== undefined) {
        const prixLoyer = parseFloat(espaceData.loyer);
        if (isNaN(prixLoyer) || prixLoyer < 0) {
          throw new Error('Le prix du loyer doit être un nombre positif ou zéro');
        }
        if (prixLoyer > 1000000) {
          throw new Error('Le prix du loyer ne peut pas dépasser 1 000 000');
        }
        espaceData.loyer = prixLoyer;
      } else {
        throw new Error('Le prix du loyer est requis');
      }

      const espace = new Espace(espaceData);
      await espace.save();
      
      // Recharger l'espace avec populate
      const espacePopulated = await Espace.findById(espace._id)
        .populate('etage', 'nom niveau');
      
      return espacePopulated;
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
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const espaces = await Espace.find(query)
        .populate('etage', 'nom niveau')
        .populate('boutique', 'nom proprietaire')
        .sort({ etage: 1, code: 1 })
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
        .populate('etage', 'nom niveau')
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
  async obtenirEspaceParCode(code) {
    try {
      const espace = await Espace.findOne({ code: code.toUpperCase() })
        .populate('etage', 'nom niveau')
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
      // Validation du code si fourni
      if (updateData.code || updateData.numero || updateData.codeEspace) {
        const codeEspace = updateData.code || updateData.numero || updateData.codeEspace;
        let codeNettoye = String(codeEspace).trim().toUpperCase();
        codeNettoye = codeNettoye.replace(/[^A-Z0-9]/g, '');
        
        if (codeNettoye.length === 0) {
          throw new Error('Le code d\'espace doit contenir au moins un caractère alphanumérique');
        }
        
        if (codeNettoye.length > 10) {
          throw new Error('Le code d\'espace ne peut pas dépasser 10 caractères alphanumériques');
        }

        // Récupérer l'espace actuel pour vérifier l'unicité
        const espaceActuel = await Espace.findById(id);
        if (!espaceActuel) {
          throw new Error('Espace non trouvé');
        }

        // Vérifier l'unicité (sauf pour l'espace actuel)
        const espaceExistant = await Espace.findOne({
          code: codeNettoye,
          etage: espaceActuel.etage,
          _id: { $ne: id },
          isActive: true
        });

        if (espaceExistant) {
          throw new Error(`Le code "${codeNettoye}" existe déjà sur cet étage`);
        }

        updateData.code = codeNettoye;
        delete updateData.numero;
        delete updateData.codeEspace;
      }

      // Validation superficie
      if (updateData.superficie !== undefined) {
        const superficie = parseFloat(updateData.superficie);
        if (isNaN(superficie) || superficie <= 0) {
          throw new Error('La superficie doit être un nombre positif');
        }
        if (superficie > 10000) {
          throw new Error('La superficie ne peut pas dépasser 10000 m²');
        }
        updateData.surface = superficie;
        delete updateData.superficie;
      }

      if (updateData.surface !== undefined) {
        const superficie = parseFloat(updateData.surface);
        if (isNaN(superficie) || superficie <= 0) {
          throw new Error('La superficie doit être un nombre positif');
        }
        if (superficie > 10000) {
          throw new Error('La superficie ne peut pas dépasser 10000 m²');
        }
        updateData.surface = superficie;
      }

      // Validation prix loyer
      if (updateData.prixLoyer !== undefined) {
        const prixLoyer = parseFloat(updateData.prixLoyer);
        if (isNaN(prixLoyer) || prixLoyer < 0) {
          throw new Error('Le prix du loyer doit être un nombre positif ou zéro');
        }
        if (prixLoyer > 1000000) {
          throw new Error('Le prix du loyer ne peut pas dépasser 1 000 000');
        }
        updateData.loyer = prixLoyer;
        delete updateData.prixLoyer;
      }

      if (updateData.loyer !== undefined) {
        const prixLoyer = parseFloat(updateData.loyer);
        if (isNaN(prixLoyer) || prixLoyer < 0) {
          throw new Error('Le prix du loyer doit être un nombre positif ou zéro');
        }
        if (prixLoyer > 1000000) {
          throw new Error('Le prix du loyer ne peut pas dépasser 1 000 000');
        }
        updateData.loyer = prixLoyer;
      }

      // Validation statut
      if (updateData.statut && !['Disponible', 'Occupee'].includes(updateData.statut)) {
        throw new Error('Le statut doit être "Disponible" ou "Occupee"');
      }

      // Si on change l'étage, vérifier qu'il existe et convertir en ObjectId si nécessaire
      if (updateData.etage !== undefined) {
        const mongoose = require('mongoose');
        let etageExiste;
        
        // Vérifier si c'est un ObjectId ou un niveau
        if (mongoose.Types.ObjectId.isValid(updateData.etage) && String(updateData.etage).length === 24) {
          // C'est un ObjectId
          etageExiste = await Etage.findById(updateData.etage);
        } else {
          // C'est un niveau
          etageExiste = await Etage.findOne({ 
            niveau: updateData.etage, 
            isActive: true 
          });
          
          // Si trouvé, utiliser son _id
          if (etageExiste) {
            updateData.etage = etageExiste._id;
          }
        }
        
        if (!etageExiste) {
          throw new Error('L\'étage spécifié n\'existe pas');
        }
      }

      const espace = await Espace.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('etage', 'nom niveau')
        .populate('boutique', 'nom proprietaire');
      
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
      
      return await espace.populate([
        { path: 'etage', select: 'nom niveau' },
        { path: 'boutique', select: 'nom proprietaire' }
      ]);
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
      const espaces = await Espace.rechercherEspaces({
        ...criteres,
        statut: 'Disponible'
      });
      
      // Populate etage pour les espaces trouvés
      return await Espace.populate(espaces, { 
        path: 'etage', 
        select: 'nom niveau' 
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