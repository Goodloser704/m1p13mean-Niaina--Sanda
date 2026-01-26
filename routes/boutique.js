const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Boutique = require('../models/Boutique');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// Toutes les routes boutique nécessitent une authentification boutique
router.use(auth);
router.use(authorize('boutique'));

// @route   POST /api/boutique/create
// @desc    Créer une boutique
// @access  Private (Boutique)
router.post('/create', async (req, res) => {
  try {
    // Vérifier si l'utilisateur a déjà une boutique
    const existingBoutique = await Boutique.findOne({ proprietaire: req.user._id });
    if (existingBoutique) {
      return res.status(400).json({ message: 'Vous avez déjà une boutique' });
    }

    const boutique = new Boutique({
      ...req.body,
      proprietaire: req.user._id
    });

    await boutique.save();
    await boutique.populate('proprietaire', 'nom prenom email');

    res.status(201).json({ message: 'Boutique créée avec succès', boutique });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/boutique/me
// @desc    Obtenir ma boutique
// @access  Private (Boutique)
router.get('/me', async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id })
      .populate('proprietaire', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json(boutique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/boutique/me
// @desc    Mettre à jour ma boutique
// @access  Private (Boutique)
router.put('/me', async (req, res) => {
  try {
    const boutique = await Boutique.findOneAndUpdate(
      { proprietaire: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('proprietaire', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json({ message: 'Boutique mise à jour', boutique });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/boutique/dashboard
// @desc    Dashboard de la boutique
// @access  Private (Boutique)
router.get('/dashboard', async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const stats = await Promise.all([
      Product.countDocuments({ boutique: boutique._id }),
      Product.countDocuments({ boutique: boutique._id, isActive: true }),
      Order.countDocuments({ boutique: boutique._id }),
      Order.countDocuments({ boutique: boutique._id, statut: 'en_attente' }),
      Order.aggregate([
        { $match: { boutique: boutique._id } },
        { $group: { _id: null, total: { $sum: '$montantTotal' } } }
      ])
    ]);

    const totalRevenue = stats[4][0]?.total || 0;

    res.json({
      totalProduits: stats[0],
      produitsActifs: stats[1],
      totalCommandes: stats[2],
      commandesEnAttente: stats[3],
      chiffreAffaires: totalRevenue,
      boutique: {
        nom: boutique.nom,
        statut: boutique.statut,
        note: boutique.note
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/boutique/products
// @desc    Mes produits
// @access  Private (Boutique)
router.get('/products', async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const { page = 1, limit = 10, search } = req.query;
    const filter = { boutique: boutique._id };
    
    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/boutique/orders
// @desc    Mes commandes
// @access  Private (Boutique)
router.get('/orders', async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const { page = 1, limit = 10, statut } = req.query;
    const filter = { boutique: boutique._id };
    
    if (statut) filter.statut = statut;

    const orders = await Order.find(filter)
      .populate('client', 'nom prenom email telephone')
      .populate('produits.produit', 'nom prix images')
      .sort({ dateCommande: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/boutique/orders/:id/status
// @desc    Mettre à jour le statut d'une commande
// @access  Private (Boutique)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, boutique: boutique._id },
      { statut },
      { new: true }
    ).populate('client', 'nom prenom email');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ message: 'Statut mis à jour', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;