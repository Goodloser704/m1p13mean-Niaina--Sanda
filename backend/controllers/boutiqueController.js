const boutiqueService = require('../services/boutiqueService');

/**
 * 🏪 Contrôleur des Boutiques
 * Gestion des inscriptions, validations et opérations boutiques
 */
class BoutiqueController {

  /**
   * @route   GET /api/boutiques/search
   * @desc    Rechercher des boutiques par mot-clé
   * @access  Public
   * @query   keyword, page, limit
   * @return  { boutiques, count, pagination }
   */
  async searchBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Recherche boutiques`);
    console.log(`   🔎 Mot-clé: ${req.query.keyword}`);
    
    try {
      const { keyword, page = 1, limit = 20 } = req.query;

      if (!keyword || keyword.trim().length < 2) {
        return res.status(400).json({ 
          message: 'Le mot-clé doit contenir au moins 2 caractères' 
        });
      }

      // Recherche dans nom, description et catégorie
      const searchRegex = new RegExp(keyword.trim(), 'i');
      
      const query = {
        statut: 'Actif',
        $or: [
          { nom: searchRegex },
          { description: searchRegex },
          { categorie: searchRegex }
        ]
      };

      const boutiques = await require('../models/Boutique')
        .find(query)
        .populate('proprietaire', 'nom prenoms email')
        .populate('categorie', 'nom')
        .populate('espace', 'numero etage')
        .sort({ nom: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await require('../models/Boutique').countDocuments(query);

      console.log(`✅ ${boutiques.length} boutiques trouvées pour "${keyword}"`);
      
      res.json({
        boutiques: boutiques.map(b => ({
          _id: b._id,
          nom: b.nom,
          description: b.description,
          categorie: b.categorie,
          photo: b.photo,
          horairesHebdo: b.horairesHebdo,
          espace: b.espace,
          dateCreation: b.dateCreation
        })),
        count: boutiques.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error(`❌ Erreur recherche boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/boutiques/:id/produits
   * @desc    Obtenir les produits d'une boutique (conforme aux spécifications)
   * @access  Public
   * @param   id - ID de la boutique
   * @return  { produits }
   */
  async getBoutiqueProduits(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🛍️ [${timestamp}] Récupération produits boutique`);
    console.log(`   🏪 Boutique ID: ${req.params.id}`);
    
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, disponibleOnly = 'true' } = req.query;
      
      // Vérifier que la boutique existe et est active
      const boutique = await require('../models/Boutique').findOne({
        _id: id,
        statut: 'Actif'
      });
      
      if (!boutique) {
        console.log(`❌ Boutique non trouvée ou inactive: ${id}`);
        return res.status(404).json({ message: 'Boutique non trouvée ou inactive' });
      }
      
      // Construire la requête pour les produits
      let query = { boutique: id };
      
      if (disponibleOnly === 'true') {
        query.nombreDispo = { $gt: 0 };
      }
      
      const produits = await require('../models/Produit')
        .find(query)
        .populate('boutique', 'nom')
        .populate('typeProduit', 'nom')
        .sort({ nom: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await require('../models/Produit').countDocuments(query);
      
      console.log(`✅ ${produits.length} produits récupérés pour la boutique ${boutique.nom}`);
      
      res.json({
        produits: produits.map(p => ({
          _id: p._id,
          nom: p.nom,
          description: p.description,
          prix: p.prix,
          nombreDispo: p.nombreDispo,
          photo: p.photo,
          typeProduit: p.typeProduit,
          boutique: p.boutique,
          dateCreation: p.dateCreation
        })),
        boutique: {
          _id: boutique._id,
          nom: boutique.nom,
          description: boutique.description
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération produits boutique:`, error.message);
      
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'ID de boutique invalide' });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/commercant/:id/boutiques
   * @desc    Obtenir les boutiques d'un commerçant (conforme aux spécifications)
   * @access  Private (Commercant ou Admin)
   * @param   id - ID du commerçant
   * @return  { boutiques }
   */
  async getCommercantBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutiques commerçant`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🎯 Target ID: ${req.params.id}`);
    
    try {
      const { id } = req.params;
      
      // Vérifier les permissions
      if (req.user._id.toString() !== id && req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - User: ${req.user._id}, Target: ${id}, Role: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Vous ne pouvez consulter que vos propres boutiques' 
        });
      }

      const boutiques = await boutiqueService.getBoutiquesByOwner(id);
      
      console.log(`✅ ${boutiques.length} boutiques récupérées pour le commerçant ${id}`);
      
      res.json({
        boutiques: boutiques.map(b => ({
          _id: b._id,
          nom: b.nom,
          description: b.description,
          categorie: b.categorie,
          statut: b.statut,
          photo: b.photo,
          horairesHebdo: b.horairesHebdo,
          espace: b.espace,
          dateCreation: b.dateCreation,
          dateValidation: b.dateValidation
        }))
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques commerçant:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/commercant/boutique/:id
   * @desc    Obtenir une boutique spécifique (conforme aux spécifications)
   * @access  Private (Commercant ou Admin)
   * @param   id - ID de la boutique
   * @return  { boutique }
   */
  async getBoutiqueById(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutique par ID`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.id}`);
    
    try {
      const { id } = req.params;
      
      const boutique = await boutiqueService.getBoutiqueById(id);
      
      if (!boutique) {
        console.log(`❌ Boutique non trouvée: ${id}`);
        return res.status(404).json({ message: 'Boutique non trouvée' });
      }

      // Vérifier les permissions
      if (req.user.role !== 'admin' && 
          boutique.proprietaire.toString() !== req.user._id.toString()) {
        console.log(`❌ Accès refusé - User: ${req.user._id}, Owner: ${boutique.proprietaire}`);
        return res.status(403).json({ 
          message: 'Vous ne pouvez consulter que vos propres boutiques' 
        });
      }

      console.log(`✅ Boutique récupérée: ${boutique.nom}`);
      
      res.json({
        boutique: {
          _id: boutique._id,
          nom: boutique.nom,
          description: boutique.description,
          categorie: boutique.categorie,
          statut: boutique.statut,
          photo: boutique.photo,
          horairesHebdo: boutique.horairesHebdo,
          espace: boutique.espace,
          proprietaire: boutique.proprietaire,
          dateCreation: boutique.dateCreation,
          dateValidation: boutique.dateValidation
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutique:`, error.message);
      
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'ID de boutique invalide' });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   POST /api/boutique/register
   * @desc    Créer une nouvelle inscription boutique
   * @access  Private (Commercant)
   * @body    { nom, description, categorie }
   * @return  { message, boutique }
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
   * @route   GET /api/boutique/my-boutiques
   * @desc    Obtenir toutes les boutiques de l'utilisateur connecté
   * @access  Private (Commercant)
   * @return  { boutiques, count }
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
   * @route   GET /api/boutique/me/:boutiqueId?
   * @desc    Obtenir une boutique spécifique de l'utilisateur connecté
   * @access  Private (Commercant)
   * @param   boutiqueId - ID de la boutique (optionnel, prend la première si omis)
   * @return  { boutique }
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
   * @route   GET /api/boutique/pending
   * @desc    Obtenir les boutiques en attente de validation
   * @access  Private (Admin)
   * @return  { boutiques, count }
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

  /**
   * 🏪 Obtenir toutes les boutiques (Public)
   */
  async getAllBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération toutes boutiques`);
    
    try {
      const boutiques = await boutiqueService.getAllBoutiques();

      console.log(`✅ ${boutiques.length} boutiques récupérées`);
      
      res.json({
        boutiques,
        count: boutiques.length
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new BoutiqueController();