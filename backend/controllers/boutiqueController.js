const boutiqueService = require('../services/boutiqueService');
const { RoleEnum } = require('../utils/enums');

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

      const CategorieBoutique = require('../models/CategorieBoutique');
      const categories = await CategorieBoutique.find({
        nom: searchRegex,
        isActive: true
      }).select('_id');
      const categorieIds = categories.map(c => c._id);
      
      const query = {
        statutBoutique: 'Actif',
        $or: [
          { nom: searchRegex },
          { description: searchRegex },
          { categorie: { $in: categorieIds } }
        ]
      };

      const boutiques = await require('../models/Boutique')
        .find(query)
        .populate([
          { path: 'commercant', select: 'nom prenoms email' },
          { path: 'categorie', select: 'nom' },
          { 
            path: 'espace', 
            select: 'code',
            populate: { path: 'etage', select: 'nom niveau' } 
          },
        ])
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
          commercant: b.commercant,
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
      const { page = 1, limit = 20, disponibleOnly = 'true', statutBoutique } = req.query;

      const filter = { _id: id };
      if (statutBoutique) {
        filter.statutBoutique = statutBoutique;
      }
      
      // Vérifier que la boutique existe et est active
      const boutique = await require('../models/Boutique').findOne(filter);
      
      if (!boutique) {
        console.log(`❌ Boutique non trouvée ou inactive: ${id}`);
        return res.status(404).json({ message: 'Boutique non trouvée ou inactive' });
      }
      
      // Construire la requête pour les produits
      let query = { 
        boutique: id,
        isActive: true  // Filtrer uniquement les produits actifs
      };
      
      if (disponibleOnly === 'true') {
        query['stock.nombreDispo'] = { $gt: 0 };
      }
      
      const produits = await require('../models/Produit')
        .find(query)
        .populate('boutique', 'nom')
        .populate('typeProduit', 'type description icone couleur')
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
          stock: p.stock,
          typeProduit: p.typeProduit,
          boutique: p.boutique,
          tempsPreparation: p.tempsPreparation,
          photo: p.photo,
          createdAt: p.createdAt
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
   * @route   GET /api/boutiques/:id
   * @desc    Obtenir une boutique par ID (Public)
   * @access  Public
   * @param   id - ID de la boutique
   * @return  { boutique }
   */
  async getBoutiqueByIdPublic(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutique par ID (Public)`);
    console.log(`   🏪 Boutique ID: ${req.params.id}`);
    
    try {
      const { id } = req.params;
      
      const Boutique = require('../models/Boutique');
      const boutique = await Boutique.findOne({ 
        _id: id,
        statutBoutique: 'Actif' // Seulement les boutiques actives
      })
        .populate('commercant', 'nom prenoms email')
        .populate('categorie', 'categorie')
        .populate('espace', 'code etage');
      
      if (!boutique) {
        console.log(`❌ Boutique non trouvée ou inactive: ${id}`);
        return res.status(404).json({ message: 'Boutique non trouvée' });
      }

      console.log(`✅ Boutique récupérée: ${boutique.nom}`);
      
      res.json({
        boutique: {
          _id: boutique._id,
          nom: boutique.nom,
          description: boutique.description,
          categorie: boutique.categorie,
          photo: boutique.photo,
          horairesHebdo: boutique.horairesHebdo,
          espace: boutique.espace,
          commercant: boutique.commercant,
          dateCreation: boutique.dateCreation
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutique:`, error.message);
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
      if (req.user._id.toString() !== id && req.user.role !== RoleEnum.Admin) {
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
      if (req.user.role !== RoleEnum.Admin && 
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
   * @access  Private (Commercant ONLY)
   * @body    { nom, description, categorie }
   * @return  { message, boutique }
   */
  async createBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Création nouvelle boutique`);
    console.log(`   👤 User ID: ${req.user._id} (${req.user.role})`);
    console.log(`   📝 Données:`, req.body);
    
    try {
      // Vérification supplémentaire du rôle (défense en profondeur)
      if (req.user.role !== RoleEnum.Commercant && req.user.role !== 'boutique') {
        console.log(`❌ Tentative création boutique par ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Seuls les commerçants peuvent créer des boutiques',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

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
        message: 'Boutique créée avec succès (statut: Inactif). Elle sera activée après approbation de votre demande de location d\'espace.',
        boutique: {
          _id: boutique._id,
          nom: boutique.nom,
          categorie: boutique.categorie,
          statutBoutique: boutique.statutBoutique,
          dateCreation: boutique.dateCreation
        }
      });

    } catch (error) {
      console.error(`❌ Erreur création boutique:`, error.message);
      
      // Gestion spécifique des erreurs
      if (error.message.includes('Catégorie non trouvée')) {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('n\'est plus disponible')) {
        return res.status(400).json({ message: error.message });
      }
      
      if (error.message.includes('déjà une boutique') || 
          error.message.includes('commerçants peuvent')) {
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
   * @desc    Obtenir les boutiques inactives
   * @access  Private (Admin)
   * @return  { boutiques, count }
   */
  async getPendingBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📋 [${timestamp}] Récupération boutiques inactives`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    console.log(`   🔑 Rôle: ${req.user.role}`);
    
    try {
      // Le middleware adminAuth a déjà vérifié les permissions
      const boutiques = await boutiqueService.getPendingBoutiques();

      console.log(`✅ ${boutiques.length} boutiques inactives récupérées`);
      
      res.json({
        boutiques,
        count: boutiques.length
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques inactives:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✅ Activer une boutique (Admin seulement)
   */
  async approveBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Activation boutique`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== RoleEnum.Admin) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      
      const boutique = await boutiqueService.approveBoutique(
        boutiqueId, 
        req.user._id
      );

      console.log(`✅ Boutique activée: ${boutique.nom}`);
      
      res.json({
        message: 'Boutique activée avec succès',
        boutique
      });

    } catch (error) {
      console.error(`❌ Erreur activation boutique:`, error.message);
      
      if (error.message === 'Boutique non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('déjà')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ❌ Désactiver une boutique (Admin seulement)
   */
  async rejectBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`❌ [${timestamp}] Désactivation boutique`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== RoleEnum.Admin) {
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

      console.log(`❌ Boutique désactivée`);
      
      res.json({
        message: 'Boutique désactivée',
        reason: result.reason
      });

    } catch (error) {
      console.error(`❌ Erreur désactivation boutique:`, error.message);
      
      if (error.message === 'Boutique non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔍 Obtenir une boutique par ID (Admin seulement)
   */
  // Ceci est deja declaré en haut, dupliqué
  // async getBoutiqueById(req, res) {
  //   const timestamp = new Date().toISOString();
  //   console.log(`🔍 [${timestamp}] Récupération boutique par ID`);
  //   console.log(`   👤 User ID: ${req.user._id}`);
  //   console.log(`   🏪 Boutique ID: ${req.params.boutiqueId}`);
    
  //   try {
  //     // Vérifier les permissions admin
  //     if (req.user.role !== RoleEnum.Admin) {
  //       console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
  //       return res.status(403).json({ message: 'Accès refusé' });
  //     }

  //     const { boutiqueId } = req.params;
      
  //     const boutique = await boutiqueService.getBoutiqueById(boutiqueId);

  //     console.log(`✅ Boutique trouvée: ${boutique.nom}`);
      
  //     res.json({ boutique });

  //   } catch (error) {
  //     console.error(`❌ Erreur récupération boutique:`, error.message);
      
  //     if (error.message === 'Boutique non trouvée') {
  //       return res.status(404).json({ message: error.message });
  //     }
      
  //     res.status(500).json({ message: 'Erreur serveur' });
  //   }
  // }

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
          error.message.includes('propriétaire')) {
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
      if (req.user.role !== RoleEnum.Admin) {
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
   * 🏪 Obtenir toutes les boutiques avec pagination
   */
  async getAllBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération toutes boutiques`);
    
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const result = await boutiqueService.getAllBoutiques(page, limit);

      console.log(`✅ ${result.boutiques.length} boutiques récupérées`);
      
      res.json({
        boutiques: result.boutiques,
        count: result.boutiques.length,
        pagination: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🏪 Obtenir toutes les boutiques par statut avec pagination
   */
  async getAllBoutiquesByStatut(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🏪 [${timestamp}] Récupération boutiques par statut`);
    console.log(`   📊 Statut: ${req.query.statut}`);
    
    try {
      const { statut, page = 1, limit = 20 } = req.query;
      
      if (!statut) {
        return res.status(400).json({ 
          message: 'Le paramètre "statut" est requis',
          statutsValides: ['Actif', 'EnAttente', 'Inactif', 'Rejete']
        });
      }
      
      const result = await boutiqueService.getAllBoutiquesByStatut(statut, page, limit);

      console.log(`✅ ${result.boutiques.length} boutiques récupérées avec statut ${statut}`);
      
      res.json({
        boutiques: result.boutiques,
        count: result.boutiques.length,
        pagination: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques par statut:`, error.message);
      
      if (error.message.includes('Statut invalide')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new BoutiqueController();