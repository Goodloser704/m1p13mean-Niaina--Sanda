const Etage = require('../models/Etage');

console.log('🏢 [SERVICE] Initialisation EtageService...');

class EtageService {
  // Créer un nouvel étage
  async creerEtage(etageData) {
    console.log(`🏢 [SERVICE] === DEBUT creerEtage ===`);
    console.log(`🏢 [SERVICE] Données reçues:`, JSON.stringify(etageData, null, 2));
    
    try {
      // Accepter 'numero' ou 'niveau' comme champ (pour compatibilité)
      const niveauEtage = etageData.niveau !== undefined ? etageData.niveau : etageData.numero;
      
      if (niveauEtage === undefined) {
        throw new Error('Le niveau de l\'étage est requis (champ "niveau" ou "numero")');
      }
      
      // Assigner le niveau
      etageData.niveau = niveauEtage;
      delete etageData.numero; // Supprimer l'alias
      
      // Vérifier si un étage actif avec ce niveau existe déjà
      const etageExistant = await Etage.findOne({ 
        niveau: etageData.niveau,
        isActive: true 
      });
      
      if (etageExistant) {
        console.log(`❌ [SERVICE] Étage actif avec niveau ${etageData.niveau} existe déjà`);
        throw new Error('Un étage avec ce niveau existe déjà');
      }
      
      // Vérifier s'il existe un étage inactif avec ce niveau
      const etageInactif = await Etage.findOne({ 
        niveau: etageData.niveau,
        isActive: false 
      });
      
      if (etageInactif) {
        console.log(`♻️  [SERVICE] Réactivation de l'étage inactif ${etageData.niveau}`);
        // Réactiver et mettre à jour l'étage existant
        etageInactif.nom = etageData.nom || etageInactif.nom;
        etageInactif.description = etageData.description || etageInactif.description;
        etageInactif.isActive = true;
        await etageInactif.save();
        console.log(`✅ [SERVICE] Étage réactivé`);
        console.log(`🏢 [SERVICE] === FIN creerEtage (RÉACTIVATION) ===`);
        return etageInactif;
      }
      
      console.log(`🏢 [SERVICE] Création instance Etage...`);
      const etage = new Etage(etageData);
      console.log(`🏢 [SERVICE] Instance créée:`, JSON.stringify(etage, null, 2));
      
      console.log(`🏢 [SERVICE] Sauvegarde en base...`);
      await etage.save();
      console.log(`✅ [SERVICE] Sauvegarde réussie`);
      console.log(`🏢 [SERVICE] === FIN creerEtage ===`);
      
      return etage;
    } catch (error) {
      console.error('❌ [SERVICE] Erreur creerEtage:', error.message);
      console.error('❌ [SERVICE] Stack:', error.stack);
      console.log(`🏢 [SERVICE] === FIN creerEtage (ERREUR) ===`);
      
      if (error.code === 11000) {
        throw new Error('Un étage avec ce niveau existe déjà');
      }
      throw error;
    }
  }

  // Obtenir tous les étages
  async obtenirEtages(options = {}) {
    console.log(`🏢 [SERVICE] === DEBUT obtenirEtages ===`);
    console.log(`🏢 [SERVICE] Options:`, JSON.stringify(options, null, 2));
    
    try {
      const { page = 1, limit = 50, actifSeulement = true } = options;
      const skip = (page - 1) * limit;
      
      const query = actifSeulement ? { isActive: true } : {};
      console.log(`🔍 [SERVICE] Query MongoDB:`, JSON.stringify(query, null, 2));
      console.log(`🔍 [SERVICE] Skip: ${skip}, Limit: ${limit}`);
      
      console.log(`🏢 [SERVICE] Recherche étages en base...`);
      const etages = await Etage.find(query)
        .sort({ niveau: 1 })
        .skip(skip)
        .limit(limit);
      
      console.log(`✅ [SERVICE] ${etages.length} étages trouvés`);
      console.log(`🏢 [SERVICE] Étages bruts:`, JSON.stringify(etages, null, 2));

      // Version simplifiée sans statistiques d'espaces pour éviter les dépendances circulaires
      const etagesSimples = etages.map(etage => ({
        ...etage.toObject(),
        nombreEspaces: 0,
        espacesDisponibles: 0,
        espacesOccupes: 0
      }));
      
      console.log(`🏢 [SERVICE] Étages traités:`, JSON.stringify(etagesSimples, null, 2));

      console.log(`🏢 [SERVICE] Comptage total...`);
      const total = await Etage.countDocuments(query);
      console.log(`📊 [SERVICE] Total: ${total}`);

      const result = {
        etages: etagesSimples,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
      
      console.log(`🏢 [SERVICE] Résultat final:`, JSON.stringify(result, null, 2));
      console.log(`🏢 [SERVICE] === FIN obtenirEtages ===`);

      return result;
    } catch (error) {
      console.error('❌ [SERVICE] Erreur obtenirEtages:', error.message);
      console.error('❌ [SERVICE] Stack:', error.stack);
      console.log(`🏢 [SERVICE] === FIN obtenirEtages (ERREUR) ===`);
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
    console.log(`📊 [SERVICE] === DEBUT obtenirStatistiques ===`);
    
    try {
      console.log(`📊 [SERVICE] Comptage étages actifs...`);
      const totalEtages = await Etage.countDocuments({ isActive: true });
      console.log(`📊 [SERVICE] Total étages: ${totalEtages}`);
      
      // Version simplifiée sans dépendances circulaires
      const result = {
        totalEtages,
        totalEspaces: 0,
        espacesDisponibles: 0,
        espacesOccupes: 0,
        tauxOccupation: 0,
        statsParEtage: []
      };
      
      console.log(`📊 [SERVICE] Statistiques calculées:`, JSON.stringify(result, null, 2));
      console.log(`📊 [SERVICE] === FIN obtenirStatistiques ===`);
      
      return result;
    } catch (error) {
      console.error('❌ [SERVICE] Erreur obtenirStatistiques:', error.message);
      console.error('❌ [SERVICE] Stack:', error.stack);
      console.log(`📊 [SERVICE] === FIN obtenirStatistiques (ERREUR) ===`);
      throw error;
    }
  }
}

console.log('✅ [SERVICE] EtageService initialisé');
module.exports = new EtageService();