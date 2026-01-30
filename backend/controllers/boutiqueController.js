const boutiqueService = require('../services/boutiqueService');

/**
 * 🏪 Contrôleur des Boutiques
 * Gère les requêtes HTTP pour les boutiques
 */
class BoutiqueController {

  /**
   * 📝 Créer une nouvelle inscription boutique
   */
  async createBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Création nouvelle boutique`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   📝 Données:`, req.body);
    
    try {
      const boutiqueData = req.body;
      
      // Validation des champs requis
      if (!boutiqueData.nom || !boutiqueData.categorie) {
        return res.status(400).json({ 
          message: 'Le nom et la catégorie sont requis' 
        });
      }

      const boutique = await boutiqueService.createBoutiqueRegistration(
        req.user._id, 
        boutiqueData
      );

      console.log(`✅ Boutique créée: ${boutique.nom}`);
      
      res.status(201).json({
        message: 'Inscription boutique créée avec succès. En attente de validation admin.',
        boutique: {
          _id: boutique._id,
          nom: boutique.nom,
          categorie: boutique.categorie,
          statut: boutique.statut,
          dateCreation: boutique.dateCreation
        }
      });

    } catch (error) {
      console.error(`❌ Erreur création boutique:`, error.message);
      
      if (error.message.includes('déjà une boutique') || 
          error.message.includes('rôle boutique')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🏪 Obtenir toutes les boutiques de l'utilisateur connecté
   */
  async getMyBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutiques utilisateur`);
    console.log(`   👤 User ID: ${req.user._id}`);
    
    try {
      const boutiques = await boutiqueService.getUserBoutiques(req.user._id);

      console.log(`✅ ${boutiques.length} boutiques trouvées`);
      
      res.json({ 
        boutiques,
        count: boutiques.length 
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🏪 Obtenir une boutique spécifique de l'utilisateur connecté
   */
  async getMyBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutique spécifique`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId || 'première'}`);
    
    try {
      const boutique = await boutiqueService.getUserBoutique(
        req.user._id, 
        req.params.boutiqueId
      );

      if (!boutique) {
        return res.status(404).json({ 
          message: 'Aucune boutique trouvée pour cet utilisateur' 
        });
      }

      console.log(`✅ Boutique trouvée: ${boutique.nom}`);
      
      res.json({ boutique });

    } catch (error) {
      console.error(`❌ Erreur récupération boutique:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 📋 Obtenir les boutiques en attente (Admin seulement)
   */
  async getPendingBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📋 [${timestamp}] Récupération boutiques en attente`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const boutiques = await boutiqueService.getPendingBoutiques();

      console.log(`✅ ${boutiques.length} boutiques en attente récupérées`);
      
      res.json({
        boutiques,
        count: boutiques.length
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques en attente:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✅ Approuver une boutique (Admin seulement)
   */
  async approveBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Approbation boutique`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      
      const boutique = await boutiqueService.approveBoutique(
        boutiqueId, 
        req.user._id
      );

      console.log(`✅ Boutique approuvée: ${boutique.nom}`);
      
      res.json({
        message: 'Boutique approuvée avec succès',
        boutique
      });

    } catch (error) {
      console.error(`❌ Erreur approbation boutique:`, error.message);
      
      if (error.message === 'Boutique non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('déjà été traitée')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ❌ Rejeter une boutique (Admin seulement)
   */
  async rejectBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`❌ [${timestamp}] Rejet boutique`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      const { reason } = req.body;
      
      const result = await boutiqueService.rejectBoutique(
        boutiqueId, 
        req.user._id, 
        reason
      );

      console.log(`❌ Boutique rejetée`);
      
      res.json({
        message: 'Boutique rejetée',
        reason: result.reason
      });

    } catch (error) {
      console.error(`❌ Erreur rejet boutique:`, error.message);
      
      if (error.message === 'Boutique non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('déjà été traitée')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔍 Obtenir une boutique par ID (Admin seulement)
   */
  async getBoutiqueById(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Récupération boutique par ID`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      
      const boutique = await boutiqueService.getBoutiqueById(boutiqueId);

      console.log(`✅ Boutique trouvée: ${boutique.nom}`);
      
      res.json({ boutique });

    } catch (error) {
      console.error(`❌ Erreur récupération boutique:`, error.message);
      
      if (error.message === 'Boutique non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✏️ Mettre à jour une boutique
   */
  async updateMyBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✏️ [${timestamp}] Mise à jour boutique`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      const { boutiqueId } = req.params;
      const updateData = req.body;
      
      const boutique = await boutiqueService.updateBoutique(
        boutiqueId, 
        req.user._id, 
        updateData
      );

      console.log(`✅ Boutique mise à jour: ${boutique.nom}`);
      
      res.json({
        message: 'Boutique mise à jour avec succès',
        boutique
      });

    } catch (error) {
      console.error(`❌ Erreur mise à jour boutique:`, error.message);
      
      if (error.message.includes('non trouvée') || error.message.includes('propriétaire')) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🗑️ Supprimer une boutique
   */
  async deleteMyBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🗑️ [${timestamp}] Suppression boutique`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      const { boutiqueId } = req.params;
      
      const result = await boutiqueService.deleteBoutique(
        boutiqueId, 
        req.user._id
      );

      console.log(`✅ Boutique supprimée`);
      
      res.json(result);

    } catch (error) {
      console.error(`❌ Erreur suppression boutique:`, error.message);
      
      if (error.message.includes('non trouvée') || 
          error.message.includes('propriétaire') ||
          error.message.includes('en attente')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
  async getBoutiqueStats(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Statistiques boutiques`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const stats = await boutiqueService.getBoutiqueStats();

      console.log(`✅ Statistiques récupérées`);
      
      res.json(stats);

    } catch (error) {
      console.error(`❌ Erreur statistiques boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new BoutiqueController();