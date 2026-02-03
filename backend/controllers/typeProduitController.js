const TypeProduit = require('../models/TypeProduit');
const Boutique = require('../models/Boutique');
const { validationResult } = require('express-validator');

/**
 * 🏷️ Contrôleur Type Produit
 * Gestion des types de produits par boutique
 */

// @route   GET /api/types-produit
// @desc    Obtenir tous les types de produits
// @access  Public
exports.obtenirTousLesTypes = async (req, res) => {
  try {
    const { page = 1, limit = 20, boutiqueId } = req.query;
    
    const criteres = { isActive: true };
    if (boutiqueId) criteres.boutique = boutiqueId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const typesProduit = await TypeProduit.find(criteres)
      .populate('boutique', 'nom')
      .sort({ nom: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TypeProduit.countDocuments(criteres);
    
    console.log(`🏷️ ${typesProduit.length} types de produits récupérés`);
    
    res.json({
      typesProduit,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération types de produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des types de produits'
    });
  }
};

// @route   GET /api/types-produits/boutique/:boutiqueId
// @desc    Obtenir les types de produits d'une boutique
// @access  Public
exports.obtenirTypesParBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;
    
    const typesProduits = await TypeProduit.obtenirTypesParBoutique(boutiqueId);
    
    res.json({
      typesProduits
    });
  } catch (error) {
    console.error('Erreur obtention types produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des types de produits'
    });
  }
};

// @route   GET /api/types-produits/mes-types
// @desc    Obtenir mes types de produits (Commercant)
// @access  Private (Commercant)
exports.obtenirMesTypes = async (req, res) => {
  try {
    const { boutique } = req.query;
    
    // Récupérer les boutiques du commerçant
    let boutiqueQuery = {
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    };
    
    if (boutique) {
      boutiqueQuery._id = boutique;
    }
    
    const boutiques = await Boutique.find(boutiqueQuery).select('_id nom');
    const boutiqueIds = boutiques.map(b => b._id);
    
    const typesProduits = await TypeProduit.find({
      boutique: { $in: boutiqueIds },
      isActive: true
    })
    .populate('boutique', 'nom')
    .sort({ boutique: 1, ordre: 1, type: 1 });
    
    res.json({
      typesProduits,
      boutiques
    });
  } catch (error) {
    console.error('Erreur obtention mes types:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des types de produits'
    });
  }
};

// @route   POST /api/types-produits
// @desc    Créer un type de produit (Commercant)
// @access  Private (Commercant)
exports.creerTypeProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const {
      type,
      boutique,
      description,
      icone,
      couleur,
      ordre
    } = req.body;
    
    // Vérifier que la boutique appartient au commerçant
    const boutiqueObj = await Boutique.findOne({
      _id: boutique,
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    });
    
    if (!boutiqueObj) {
      return res.status(404).json({
        message: 'Boutique non trouvée ou non autorisée'
      });
    }
    
    // Vérifier que le type n'existe pas déjà pour cette boutique
    const typeExistant = await TypeProduit.findOne({
      boutique,
      type: { $regex: new RegExp(`^${type}$`, 'i') }
    });
    
    if (typeExistant) {
      return res.status(400).json({
        message: 'Ce type de produit existe déjà pour cette boutique'
      });
    }
    
    const typeProduit = new TypeProduit({
      type,
      boutique,
      description,
      icone,
      couleur,
      ordre: ordre || 0
    });
    
    await typeProduit.save();
    
    // Populer les données pour la réponse
    await typeProduit.populate('boutique', 'nom');
    
    res.status(201).json({
      message: 'Type de produit créé avec succès',
      typeProduit
    });
  } catch (error) {
    console.error('Erreur création type produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création du type de produit'
    });
  }
};

// @route   PUT /api/types-produits/:id
// @desc    Modifier un type de produit (Commercant)
// @access  Private (Commercant)
exports.modifierTypeProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Récupérer le type de produit avec sa boutique
    const typeProduit = await TypeProduit.findById(id).populate('boutique');
    
    if (!typeProduit) {
      return res.status(404).json({
        message: 'Type de produit non trouvé'
      });
    }
    
    // Vérifier que la boutique appartient au commerçant
    const isOwner = typeProduit.boutique.commercant?.toString() === req.user._id.toString() ||
                   typeProduit.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    // Vérifier l'unicité du type si modifié
    if (updateData.type && updateData.type !== typeProduit.type) {
      const typeExistant = await TypeProduit.findOne({
        _id: { $ne: id },
        boutique: typeProduit.boutique._id,
        type: { $regex: new RegExp(`^${updateData.type}$`, 'i') }
      });
      
      if (typeExistant) {
        return res.status(400).json({
          message: 'Ce type de produit existe déjà pour cette boutique'
        });
      }
    }
    
    // Mettre à jour les champs autorisés
    const allowedFields = ['type', 'description', 'icone', 'couleur', 'ordre', 'isActive'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        typeProduit[field] = updateData[field];
      }
    });
    
    await typeProduit.save();
    
    res.json({
      message: 'Type de produit mis à jour avec succès',
      typeProduit
    });
  } catch (error) {
    console.error('Erreur modification type produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la modification du type de produit'
    });
  }
};

// @route   DELETE /api/types-produits/:id
// @desc    Supprimer un type de produit (soft delete) (Commercant)
// @access  Private (Commercant)
exports.supprimerTypeProduit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le type de produit avec sa boutique
    const typeProduit = await TypeProduit.findById(id).populate('boutique');
    
    if (!typeProduit) {
      return res.status(404).json({
        message: 'Type de produit non trouvé'
      });
    }
    
    // Vérifier que la boutique appartient au commerçant
    const isOwner = typeProduit.boutique.commercant?.toString() === req.user._id.toString() ||
                   typeProduit.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    // Vérifier qu'il n'y a pas de produits liés
    const nombreProduits = await typeProduit.getNombreProduits();
    
    if (nombreProduits > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer ce type car ${nombreProduits} produit(s) y sont associés`
      });
    }
    
    // Soft delete
    typeProduit.isActive = false;
    await typeProduit.save();
    
    res.json({
      message: 'Type de produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression type produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la suppression du type de produit'
    });
  }
};

// @route   POST /api/types-produits/boutique/:boutiqueId/defaut
// @desc    Créer les types par défaut pour une boutique (Commercant)
// @access  Private (Commercant)
exports.creerTypesParDefaut = async (req, res) => {
  try {
    const { boutiqueId } = req.params;
    
    // Vérifier que la boutique appartient au commerçant
    const boutique = await Boutique.findOne({
      _id: boutiqueId,
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    }).populate('categorie', 'categorie');
    
    if (!boutique) {
      return res.status(404).json({
        message: 'Boutique non trouvée ou non autorisée'
      });
    }
    
    // Créer les types par défaut selon la catégorie
    await TypeProduit.creerTypesParDefaut(boutiqueId, boutique.categorie?.categorie);
    
    // Récupérer les types créés
    const typesCrees = await TypeProduit.obtenirTypesParBoutique(boutiqueId);
    
    res.json({
      message: 'Types de produits par défaut créés avec succès',
      typesProduits: typesCrees
    });
  } catch (error) {
    console.error('Erreur création types par défaut:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création des types par défaut'
    });
  }
};