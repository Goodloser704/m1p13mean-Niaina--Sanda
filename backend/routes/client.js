const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');

const router = express.Router();

// @route   GET /api/client/boutiques
// @desc    Liste des boutiques approuvées
// @access  Public
router.get('/boutiques', async (req, res) => {
  try {
    const { page = 1, limit = 12, categorie, search } = req.query;
    const filter = { statutBoutique: 'Actif' }; // Utiliser statutBoutique au lieu de statut
    
    if (categorie) {
      filter.categorie = categorie;
    }
    
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const boutiques = await Boutique.find(filter)
      .populate('commercant', 'nom prenoms email')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Boutique.countDocuments(filter);

    res.json({
      boutiques,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Erreur GET /api/client/boutiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/client/boutiques/:id
// @desc    Détails d'une boutique
// @access  Public
router.get('/boutiques/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findOne({
      _id: req.params.id,
      statutBoutique: 'Actif' // Utiliser statutBoutique au lieu de statut
    }).populate('commercant', 'nom prenoms email');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    // Récupérer quelques produits de la boutique
    const produits = await Produit.find({
      boutique: boutique._id,
      isActive: true
    }).limit(8);

    res.json({
      ...boutique.toObject(),
      produits
    });
  } catch (error) {
    console.error('Erreur GET /api/client/boutiques/:id:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/client/boutiques/:id/products
// @desc    Produits d'une boutique
// @access  Public
router.get('/boutiques/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, categorie } = req.query;
    const filter = { 
      boutique: req.params.id,
      isActive: true 
    };
    
    if (categorie) {
      filter.categorie = categorie;
    }

    const products = await Produit.find(filter)
      .populate('boutique', 'nom')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Produit.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/client/search
// @desc    Recherche globale
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Terme de recherche requis' });
    }

    const results = {};

    if (type === 'all' || type === 'boutiques') {
      results.boutiques = await Boutique.find({
        statutBoutique: 'Actif', // Utiliser statutBoutique au lieu de statut
        $or: [
          { nom: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }).limit(5);
    }

    if (type === 'all' || type === 'products') {
      // Recherche simple sans index text (qui peut ne pas exister)
      results.products = await Produit.find({
        isActive: true,
        $or: [
          { nom: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      })
      .populate('boutique', 'nom')
      .limit(10);
    }

    res.json(results);
  } catch (error) {
    console.error('Erreur GET /api/client/search:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/client/categories
// @desc    Liste des catégories de boutiques
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Boutique.distinct('categorie', { statutBoutique: 'Actif' }); // Utiliser statutBoutique
    res.json(categories);
  } catch (error) {
    console.error('Erreur GET /api/client/categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;