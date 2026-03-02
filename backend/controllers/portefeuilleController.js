const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');
const { validationResult } = require('express-validator');
const { RoleEnum } = require('../utils/enums');

/**
 * 💰 Contrôleur Portefeuille
 * Gestion des portefeuilles et transactions
 */

// @route   GET /api/portefeuille/me
// @desc    Obtenir mon portefeuille
// @access  Private
exports.obtenirMonPortefeuille = async (req, res) => {
  try {
    const portefeuille = await PorteFeuille.obtenirParUtilisateur(req.user._id);
    
    if (!portefeuille) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }
    
    res.json({
      portefeuille: {
        _id: portefeuille._id,
        balance: portefeuille.balance,
        owner: portefeuille.owner,
        derniereMiseAJour: portefeuille.derniereMiseAJour,
        createdAt: portefeuille.createdAt,
        updatedAt: portefeuille.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur obtention portefeuille:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération du portefeuille'
    });
  }
};

// @route   GET /api/users/:id/wallet (conforme aux spécifications)
// @desc    Obtenir le portefeuille d'un utilisateur avec transactions
// @access  Private
// @return  { wallet, transactions }
exports.obtenirPortefeuilleUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le portefeuille depuis la base de données
    const portefeuille = await PorteFeuille.findOne({ owner: id }).populate('owner', 'nom prenoms email role');
    
    if (!portefeuille) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }
    
    // Vérifier les permissions - L'utilisateur peut consulter son propre portefeuille
    // ou un admin peut consulter n'importe quel portefeuille
    const isOwnWallet = req.user._id.toString() === portefeuille.owner._id.toString();
    const isAdmin = req.user.role === RoleEnum.Admin;
    
    if (!isOwnWallet && !isAdmin) {
      return res.status(403).json({
        message: 'Vous ne pouvez consulter que votre propre portefeuille'
      });
    }
    
    // Récupérer les transactions récentes
    const transactions = await PFTransaction.find({
      $or: [
        { fromWallet: portefeuille._id },
        { toWallet: portefeuille._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: 'fromWallet',
      populate: { path: 'owner', select: 'nom prenoms email' }
    })
    .populate({
      path: 'toWallet',
      populate: { path: 'owner', select: 'nom prenoms email' }
    });
    
    res.json({
      wallet: {
        _id: portefeuille._id,
        balance: portefeuille.balance,
        owner: portefeuille.owner,
        derniereMiseAJour: portefeuille.derniereMiseAJour,
        createdAt: portefeuille.createdAt,
        updatedAt: portefeuille.updatedAt
      },
      transactions: transactions.map(transaction => ({
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        fromWallet: transaction.fromWallet,
        toWallet: transaction.toWallet,
        description: transaction.description,
        statut: transaction.statut,
        createdAt: transaction.createdAt,
        typeForUser: transaction.fromWallet.owner._id.toString() === portefeuille.owner._id.toString() 
          ? 'Sortie' 
          : 'Entree'
      }))
    });
  } catch (error) {
    console.error('Erreur obtention portefeuille utilisateur:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération du portefeuille'
    });
  }
};

// @route   GET /api/portefeuille/transactions
// @desc    Obtenir l'historique de mes transactions
// @access  Private
exports.obtenirMesTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const portefeuille = await PorteFeuille.obtenirParUtilisateur(req.user._id);
    
    if (!portefeuille) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }
    
    const transactions = await PFTransaction.obtenirHistorique(portefeuille._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    });
    
    // Enrichir les transactions avec le type pour l'utilisateur
    const transactionsEnrichies = transactions.map(transaction => {
      const fromWalletId = transaction.fromWallet._id.toString();
      const montant = fromWalletId === portefeuille._id.toString()
        ? -transaction.amount
        : transaction.amount;

      return {
        ...transaction.toObject(),
        typeForUser: transaction.getTypeForWallet(portefeuille._id),
        montant
      };
    });
    
    const total = await PFTransaction.countDocuments({
      $or: [
        { fromWallet: portefeuille._id },
        { toWallet: portefeuille._id }
      ],
      // statut: 'Completee',
      ...(type && { type })
    });
    
    res.json({
      transactions: transactionsEnrichies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention transactions:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des transactions'
    });
  }
};

// @route   POST /api/portefeuille/recharge
// @desc    Recharger le portefeuille (simulation)
// @access  Private
exports.rechargerPortefeuille = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { montant, modePaiement = 'Carte' } = req.body;
    
    if (montant <= 0 || montant > 10000) {
      return res.status(400).json({
        message: 'Le montant doit être entre 0.01Ar et 10,000Ar'
      });
    }
    
    const portefeuille = await PorteFeuille.obtenirParUtilisateur(req.user._id);
    
    if (!portefeuille) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }
    
    // Simuler une recharge (dans un vrai système, il y aurait une intégration de paiement)
    await portefeuille.crediter(montant, `Recharge par ${modePaiement}`);
    
    res.json({
      message: 'Portefeuille rechargé avec succès',
      portefeuille: {
        _id: portefeuille._id,
        balance: portefeuille.balance,
        derniereMiseAJour: portefeuille.derniereMiseAJour
      },
      transaction: {
        montant,
        modePaiement,
        date: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur recharge portefeuille:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la recharge'
    });
  }
};

// @route   GET /api/portefeuille/stats
// @desc    Obtenir les statistiques de mon portefeuille
// @access  Private
exports.obtenirStatistiques = async (req, res) => {
  try {
    const portefeuille = await PorteFeuille.obtenirParUtilisateur(req.user._id);
    
    if (!portefeuille) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }
    
    // Statistiques des 30 derniers jours
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() - 30);
    
    const [
      totalEntrees,
      totalSorties,
      nombreTransactions,
      transactionsParType
    ] = await Promise.all([
      // Total des entrées
      PFTransaction.aggregate([
        {
          $match: {
            toWallet: portefeuille._id,
            // statut: 'Completee',
            createdAt: { $gte: dateLimite }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Total des sorties
      PFTransaction.aggregate([
        {
          $match: {
            fromWallet: portefeuille._id,
            // statut: 'Completee',
            createdAt: { $gte: dateLimite }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Nombre de transactions
      PFTransaction.countDocuments({
        $or: [
          { fromWallet: portefeuille._id },
          { toWallet: portefeuille._id }
        ],
        // statut: 'Completee',
        createdAt: { $gte: dateLimite }
      }),
      
      // Transactions par type
      PFTransaction.aggregate([
        {
          $match: {
            $or: [
              { fromWallet: portefeuille._id },
              { toWallet: portefeuille._id }
            ],
            // statut: 'Completee',
            createdAt: { $gte: dateLimite }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            montant: { $sum: '$amount' }
          }
        }
      ])
    ]);
    
    res.json({
      portefeuille: {
        balance: portefeuille.balance,
        derniereMiseAJour: portefeuille.derniereMiseAJour
      },
      statistiques: {
        periode: '30 derniers jours',
        totalEntrees: totalEntrees[0]?.total || 0,
        totalSorties: totalSorties[0]?.total || 0,
        nombreTransactions,
        transactionsParType: transactionsParType.map(stat => ({
          type: stat._id,
          nombre: stat.count,
          montant: stat.montant
        }))
      }
    });
  } catch (error) {
    console.error('Erreur obtention statistiques:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

// @route   GET /api/portefeuille/admin/all
// @desc    Obtenir tous les portefeuilles (Admin seulement)
// @access  Private (Admin)
exports.obtenirTousPortefeuilles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      // Recherche par nom/email de l'utilisateur
      const User = require('../models/User');
      const utilisateurs = await User.find({
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenoms: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.owner = { $in: utilisateurs.map(u => u._id) };
    }
    
    const portefeuilles = await PorteFeuille.find(query)
      .populate('owner', 'nom prenoms email role')
      .sort({ balance: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await PorteFeuille.countDocuments(query);
    
    res.json({
      portefeuilles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention tous portefeuilles:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des portefeuilles'
    });
  }
};