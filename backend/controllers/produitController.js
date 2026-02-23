const Produit = require('../models/Produit');
const TypeProduit = require('../models/TypeProduit');
const Boutique = require('../models/Boutique');
const { validationResult } = require('express-validator');
const { RoleEnum } = require('../utils/enums');

/**
 * 📦 Contrôleur Produit
 * Gestion des produits par les commerçants
 */

// @route   GET /api/produits
// @desc    Obtenir tous les produits (avec pagination et filtres)
// @access  Public
exports.obtenirProduits = async (req, res) => {
  try {
    const { page = 1, limit = 20, boutiqueId, typeId, search, stockMin } = req.query;
    
    const criteres = { isActive: true };
    
    if (boutiqueId) criteres.boutique = boutiqueId;
    if (typeId) criteres.typeProduit = typeId;
    if (stockMin !== undefined) criteres['stock.nombreDispo'] = { $gte: parseInt(stockMin) };
    if (search) {
      criteres.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const produits = await Produit.find(criteres)
      .populate('typeProduit', 'nom description')
      .populate('boutique', 'nom proprietaire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Produit.countDocuments(criteres);
    
    console.log(`📦 ${produits.length} produits récupérés (page ${page}/${Math.ceil(total / limit)})`);
    
    res.json({
      produits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des produits'
    });
  }
};

// @route   GET /api/produits/test
// @desc    Test de la route produits
// @access  Public
exports.testProduits = async (req, res) => {
  try {
    const stats = {
      message: 'Route produits fonctionnelle',
      timestamp: new Date().toISOString(),
      database: {
        connected: require('mongoose').connection.readyState === 1,
        name: require('mongoose').connection.name
      },
      counts: {
        totalProduits: await Produit.countDocuments(),
        produitsActifs: await Produit.countDocuments({ isActive: true }),
        produitsInactifs: await Produit.countDocuments({ isActive: false })
      }
    };
    
    console.log('🧪 Test produits:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erreur test produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du test produits',
      error: error.message
    });
  }
};

// @route   GET /api/produits/boutique/:boutiqueId
// @desc    Obtenir les produits d'une boutique
// @access  Public
exports.obtenirProduitsParBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;
    const { page = 1, limit = 20, typeProduit, enStock, recherche } = req.query;
    
    const criteres = {
      boutique: boutiqueId
    };
    
    if (typeProduit) criteres.typeProduit = typeProduit;
    if (enStock === 'true') criteres['stock.nombreDispo'] = { $gt: 0 };
    if (recherche) criteres.$text = { $search: recherche };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const produits = await Produit.find(criteres)
      .populate('typeProduit', 'type')
      .populate('boutique', 'nom')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Produit.countDocuments(criteres);
    
    res.json({
      produits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des produits'
    });
  }
};

// @route   GET /api/produits/mes-produits
// @desc    Obtenir mes produits (Commercant)
// @access  Private (Commercant)
exports.obtenirMesProduits = async (req, res) => {
  try {
    const { page = 1, limit = 20, boutique, typeProduit } = req.query;
    
    // Récupérer les boutiques du commerçant
    const boutiques = await Boutique.find({
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    }).select('_id');
    
    const boutiqueIds = boutiques.map(b => b._id);
    
    let query = { 
      boutique: { $in: boutiqueIds },
      isActive: true 
    };
    
    if (boutique) {
      query.boutique = boutique;
    }
    if (typeProduit) {
      query.typeProduit = typeProduit;
    }
    
    const produits = await Produit.find(query)
      .populate('boutique', 'nom')
      .populate('typeProduit', 'type')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Produit.countDocuments(query);
    
    res.json({
      produits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention mes produits:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des produits'
    });
  }
};

// @route   POST /api/produits
// @desc    Créer un produit (Commercant)
// @access  Private (Commercant)
exports.creerProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const {
      nom,
      description,
      prix,
      typeProduit,
      boutique,
      tempsPreparation,
      stock,
      images,
      caracteristiques
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
    
    // Vérifier que le type de produit appartient à cette boutique
    const typeProduitObj = await TypeProduit.findOne({
      _id: typeProduit,
      boutique: boutique
    });
    
    if (!typeProduitObj) {
      return res.status(404).json({
        message: 'Type de produit non trouvé pour cette boutique'
      });
    }
    
    const produit = new Produit({
      nom,
      description,
      prix,
      typeProduit,
      boutique,
      tempsPreparation: tempsPreparation || null,
      stock: {
        nombreDispo: stock?.nombreDispo || 0
      },
      images: images || [],
      caracteristiques: caracteristiques || {}
    });
    
    await produit.save();
    
    // Populer les données pour la réponse
    await produit.populate([
      { path: 'boutique', select: 'nom' },
      { path: 'typeProduit', select: 'type' }
    ]);
    
    res.status(201).json({
      message: 'Produit créé avec succès',
      produit
    });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création du produit'
    });
  }
};

// @route   PUT /api/produits/:id
// @desc    Modifier un produit (Commercant)
// @access  Private (Commercant)
exports.modifierProduit = async (req, res) => {
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
    
    // Récupérer le produit avec sa boutique
    const produit = await Produit.findById(id).populate('boutique');
    
    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé'
      });
    }
    
    // Vérifier que la boutique appartient au commerçant
    const isOwner = produit.boutique.commercant?.toString() === req.user._id.toString() ||
                   produit.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    // Mettre à jour les champs autorisés
    const allowedFields = ['nom', 'description', 'prix', 'tempsPreparation', 'images', 'caracteristiques', 'isActive'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        produit[field] = updateData[field];
      }
    });
    
    await produit.save();
    
    res.json({
      message: 'Produit mis à jour avec succès',
      produit
    });
  } catch (error) {
    console.error('Erreur modification produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la modification du produit'
    });
  }
};

// @route   PUT /api/produits/:id/stock
// @desc    Modifier le stock d'un produit (Commercant)
// @access  Private (Commercant)
exports.modifierStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { nombreDispo } = req.body;
    
    // Récupérer le produit avec sa boutique
    const produit = await Produit.findById(id).populate('boutique');
    
    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé'
      });
    }
    
    // Vérifier que la boutique appartient au commerçant
    const isOwner = produit.boutique.commercant?.toString() === req.user._id.toString() ||
                   produit.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    if (nombreDispo < 0) {
      return res.status(400).json({
        message: 'Le stock ne peut pas être négatif'
      });
    }
    
    produit.stock.nombreDispo = nombreDispo;
    produit.stock.updatedAt = new Date();
    
    await produit.save();
    
    res.json({
      message: 'Stock mis à jour avec succès',
      produit: {
        _id: produit._id,
        nom: produit.nom,
        stock: produit.stock
      }
    });
  } catch (error) {
    console.error('Erreur modification stock:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la modification du stock'
    });
  }
};

// @route   DELETE /api/produits/:id
// @desc    Supprimer un produit (soft delete) (Commercant)
// @access  Private (Commercant)
exports.supprimerProduit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le produit avec sa boutique
    const produit = await Produit.findById(id).populate('boutique');
    
    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé'
      });
    }
    
    // Vérifier que la boutique appartient au commerçant
    const isOwner = produit.boutique.commercant?.toString() === req.user._id.toString() ||
                   produit.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    // Soft delete
    produit.isActive = false;
    await produit.save();
    
    res.json({
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la suppression du produit'
    });
  }
};

// @route   GET /api/produits/:id
// @desc    Obtenir un produit par ID
// @access  Public
exports.obtenirProduitParId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const produit = await Produit.findOne({ _id: id, isActive: true })
      .populate('boutique', 'nom description contact horairesHebdo')
      .populate('typeProduit', 'type description');
    
    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé'
      });
    }
    
    res.json({ produit });
  } catch (error) {
    console.error('Erreur obtention produit:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération du produit'
    });
  }
};