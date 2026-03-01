const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');

const router = express.Router();

// @route   GET /api/products
// @desc    Liste des produits (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      categorie, 
      boutique, 
      prixMin, 
      prixMax,
      sortBy = 'dateCreation'
    } = req.query;

    const filter = { isActive: true };
    
    // Filtres
    if (search) {
      filter.$text = { $search: search };
    }
    if (categorie) {
      filter.categorie = categorie;
    }
    if (boutique) {
      filter.boutique = boutique;
    }
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = parseFloat(prixMin);
      if (prixMax) filter.prix.$lte = parseFloat(prixMax);
    }

    // Tri
    const sortOptions = {};
    switch (sortBy) {
      case 'prix_asc':
        sortOptions.prix = 1;
        break;
      case 'prix_desc':
        sortOptions.prix = -1;
        break;
      case 'note':
        sortOptions['note.moyenne'] = -1;
        break;
      default:
        sortOptions.dateCreation = -1;
    }

    const products = await Product.find(filter)
      .populate('boutique', 'nom logo note')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

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

// @route   GET /api/products/:id
// @desc    Détails d'un produit
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('boutique', 'nom description contact horaires logo note');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/products
// @desc    Créer un produit
// @access  Private (Boutique)
router.post('/', auth, authorize('boutique'), async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    if (boutique.statut !== 'approuve') {
      return res.status(400).json({ message: 'Boutique non approuvée' });
    }

    const product = new Product({
      ...req.body,
      boutique: boutique._id
    });

    await product.save();
    await product.populate('boutique', 'nom');

    res.status(201).json({ message: 'Produit créé avec succès', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit
// @access  Private (Boutique)
router.put('/:id', auth, authorize('boutique'), async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, boutique: boutique._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('boutique', 'nom');

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit mis à jour', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
// @access  Private (Boutique)
router.delete('/:id', auth, authorize('boutique'), async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      boutique: boutique._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/products/categories/list
// @desc    Liste des catégories disponibles
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('categorie', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;