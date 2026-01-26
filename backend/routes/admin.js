const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification admin
router.use(auth);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Statistiques du dashboard admin
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'boutique' }),
      User.countDocuments({ role: 'client' }),
      Boutique.countDocuments(),
      Boutique.countDocuments({ statut: 'en_attente' }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$montantTotal' } } }
      ])
    ]);

    const totalRevenue = stats[5][0]?.total || 0;

    res.json({
      totalBoutiques: stats[0],
      totalClients: stats[1],
      boutiquesActives: stats[2],
      boutiquesEnAttente: stats[3],
      totalCommandes: stats[4],
      chiffreAffaires: totalRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/admin/boutiques
// @desc    Liste des boutiques avec filtres
// @access  Private (Admin)
router.get('/boutiques', async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (statut) filter.statut = statut;

    const boutiques = await Boutique.find(filter)
      .populate('proprietaire', 'nom prenom email')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Boutique.countDocuments(filter);

    res.json({
      boutiques,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/admin/boutiques/:id/statut
// @desc    Modifier le statut d'une boutique
// @access  Private (Admin)
router.put('/boutiques/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    
    if (!['en_attente', 'approuve', 'suspendu'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).populate('proprietaire', 'nom prenom email');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json({ message: 'Statut mis à jour', boutique });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/admin/users
// @desc    Liste des utilisateurs
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/admin/users/:id/toggle
// @desc    Activer/désactiver un utilisateur
// @access  Private (Admin)
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Impossible de modifier un admin' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}`,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/admin/orders
// @desc    Liste des commandes
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find()
      .populate('client', 'nom prenom email')
      .populate('boutique', 'nom')
      .populate('produits.produit', 'nom prix')
      .sort({ dateCommande: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments();

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

module.exports = router;