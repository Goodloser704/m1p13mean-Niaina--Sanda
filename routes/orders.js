const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// @route   POST /api/orders
// @desc    Créer une commande
// @access  Private (Client)
router.post('/', auth, authorize('client'), async (req, res) => {
  try {
    const { produits, modePaiement, adresseLivraison, notes } = req.body;

    if (!produits || produits.length === 0) {
      return res.status(400).json({ message: 'Aucun produit dans la commande' });
    }

    // Vérifier les produits et calculer le total
    let montantTotal = 0;
    const produitsValides = [];

    for (const item of produits) {
      const produit = await Product.findById(item.produit);
      
      if (!produit || !produit.isActive) {
        return res.status(400).json({ 
          message: `Produit ${item.produit} non disponible` 
        });
      }

      if (produit.stock.quantite < item.quantite) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${produit.nom}` 
        });
      }

      const prixUnitaire = produit.prixPromo || produit.prix;
      montantTotal += prixUnitaire * item.quantite;

      produitsValides.push({
        produit: produit._id,
        quantite: item.quantite,
        prix: prixUnitaire,
        options: item.options || {}
      });

      // Réduire le stock
      produit.stock.quantite -= item.quantite;
      await produit.save();
    }

    // Grouper par boutique (une commande par boutique)
    const commandesParBoutique = {};
    
    for (const item of produitsValides) {
      const produit = await Product.findById(item.produit);
      const boutiqueId = produit.boutique.toString();
      
      if (!commandesParBoutique[boutiqueId]) {
        commandesParBoutique[boutiqueId] = {
          boutique: produit.boutique,
          produits: [],
          montantTotal: 0
        };
      }
      
      commandesParBoutique[boutiqueId].produits.push(item);
      commandesParBoutique[boutiqueId].montantTotal += item.prix * item.quantite;
    }

    // Créer les commandes
    const commandes = [];
    
    for (const boutiqueId in commandesParBoutique) {
      const commandeData = commandesParBoutique[boutiqueId];
      
      const order = new Order({
        client: req.user._id,
        boutique: commandeData.boutique,
        produits: commandeData.produits,
        montantTotal: commandeData.montantTotal,
        modePaiement,
        adresseLivraison,
        notes
      });

      await order.save();
      await order.populate([
        { path: 'boutique', select: 'nom contact' },
        { path: 'produits.produit', select: 'nom prix images' }
      ]);
      
      commandes.push(order);
    }

    res.status(201).json({ 
      message: 'Commande(s) créée(s) avec succès', 
      commandes 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/me
// @desc    Mes commandes
// @access  Private (Client)
router.get('/me', auth, authorize('client'), async (req, res) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;
    const filter = { client: req.user._id };
    
    if (statut) filter.statut = statut;

    const orders = await Order.find(filter)
      .populate('boutique', 'nom contact')
      .populate('produits.produit', 'nom prix images')
      .sort({ dateCommande: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/:id
// @desc    Détails d'une commande
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    
    // Filtrer selon le rôle
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'boutique') {
      const Boutique = require('../models/Boutique');
      const boutique = await Boutique.findOne({ proprietaire: req.user._id });
      if (boutique) {
        filter.boutique = boutique._id;
      }
    }

    const order = await Order.findOne(filter)
      .populate('client', 'nom prenom email telephone')
      .populate('boutique', 'nom contact')
      .populate('produits.produit', 'nom prix images');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Annuler une commande
// @access  Private (Client)
router.put('/:id/cancel', auth, authorize('client'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      client: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (!['en_attente', 'confirme'].includes(order.statut)) {
      return res.status(400).json({ 
        message: 'Impossible d\'annuler cette commande' 
      });
    }

    // Remettre les produits en stock
    for (const item of order.produits) {
      const produit = await Product.findById(item.produit);
      if (produit) {
        produit.stock.quantite += item.quantite;
        await produit.save();
      }
    }

    order.statut = 'annule';
    await order.save();

    res.json({ message: 'Commande annulée avec succès', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;