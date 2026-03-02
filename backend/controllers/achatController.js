const Achat = require('../models/Achat');
const Facture = require('../models/Facture');
const Produit = require('../models/Produit');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');
const { validationResult } = require('express-validator');
const { EtatAchatEnum, TypeAchatEnum, TypeTransactionEnum } = require('../utils/enums');
const { estBoutiqueOuverte } = require('../utils/boutique-utils');
const mongoose = require('mongoose');

/**
 * 🛒 Contrôleur Achat
 * Gestion des achats, panier et commandes pour les acheteurs
 */

// @route   POST /api/achats/panier/valider
// @desc    Valider un panier et créer les achats
// @access  Private (Acheteur)
// @body    { achats: Array<Achat>, montantTotal: Number }
// @return  { message, facture, achats }
exports.validerPanier = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { achats: achatsData, montantTotal } = req.body;
    const acheteurId = req.user._id;

    const portefeuilleAcheteur = await PorteFeuille
      .findOne({ owner: acheteurId })
      .session(session);

    if (!portefeuilleAcheteur)
      throw new Error('Portefeuille non trouvé');

    if (portefeuilleAcheteur.balance < montantTotal)
      throw new Error('Solde insuffisant');

    let montantTotalVerifie = 0;
    const achatsCreees = [];

    const descriptionLines = [];

    // ==============================
    // Vérification complète d'abord
    // ==============================

    for (const [index, item] of achatsData.entries()) {

      const produit = await Produit.findById(item.produit)
        .populate('boutique', 'nom horairesHebdo statutBoutique')
        .session(session);

      if (!produit)
        throw new Error(`Produit ${item.produit} non trouvé`);

      // Vérifier si la boutique est ouverte
      const { estOuverte, raison } = estBoutiqueOuverte(produit.boutique);
      if (!estOuverte) {
        throw new Error(`La boutique "${produit.boutique.nom}" est fermée. ${raison}`);
      }

      if (produit.stock.nombreDispo < item.quantite)
        throw new Error(`Stock insuffisant pour ${produit.nom}`);

      if (Math.abs(produit.prix - item.prixUnitaire) > 0.01)
        throw new Error(`Prix modifié pour ${produit.nom}`);

      montantTotalVerifie += item.quantite * item.prixUnitaire;

      descriptionLines.push(`${index + 1}. Produit: ${produit.nom} | Qté: ${item.quantite} | PU: ${item.prixUnitaire} (Boutique: ${produit.boutique.nom})`);
    }

    const description = descriptionLines.join('\n');

    if (Math.abs(montantTotalVerifie - montantTotal) > 0.01)
      throw new Error('Montant total incohérent');

    // ==============================
    // Création facture (après validation)
    // ==============================

    const facture = new Facture({
      acheteur: acheteurId,
      description,
      montantTotal,
      tauxTVA: 20
    });

    facture.calculerMontantTTC();
    await facture.save({ session });

    // ==============================
    // Création achats + MAJ stock
    // ==============================

    for (const item of achatsData) {

      const produit = await Produit.findById(item.produit)
        .populate('boutique')
        .session(session);

      const montantAchat = item.quantite * item.prixUnitaire;

      const achat = new Achat({
        acheteur: acheteurId,
        produit: produit._id,
        facture: facture._id,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        montantTotal: montantAchat,
        typeAchat: {
          type: item.typeAchat,
          dateDebut: new Date(),
          dateFin: new Date()
        },
        etat: EtatAchatEnum.Validee
      });

      await achat.save({ session });
      achatsCreees.push(achat);

      produit.stock.nombreDispo -= item.quantite;
      produit.stock.updatedAt = new Date();
      await produit.save({ session });

      // Transaction portefeuille commerçant
      const portefeuilleCommercant = await PorteFeuille
        .findOne({ owner: produit.boutique.commercant })
        .session(session);

      if (!portefeuilleCommercant)
        throw new Error('Portefeuille commerçant introuvable');

      await PFTransaction.create([{
        fromWallet: portefeuilleAcheteur._id,
        toWallet: portefeuilleCommercant._id,
        type: TypeTransactionEnum.Achat,
        amount: montantAchat,
        description: `Achat ${produit.nom}`,
        relatedEntity: {
          entityType: 'Achat',
          entityId: achat._id
        }
      }], { session });

      portefeuilleCommercant.balance += montantAchat;
      await portefeuilleCommercant.save({ session });
    }

    // Débit global acheteur
    portefeuilleAcheteur.balance -= montantTotal;
    await portefeuilleAcheteur.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Panier validé',
      facture,
      achats: achatsCreees
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: error.message
    });
  }
};

// @route   GET /api/achats/en-cours
// @desc    Obtenir mes achats en cours
// @access  Private (Acheteur)
// @return  { achats, count }
exports.obtenirMesAchatsEnCours = async (req, res) => {
  try {
    const acheteurId = req.user._id;

    const { page = 1, limit = 15, etatsAchat, typesAchat } = req.query;
    const skip = (page - 1) * limit;

    let etats;
    if (etatsAchat) {
      etats = Array.isArray(etatsAchat)
        ? etatsAchat
        : [etatsAchat];
    } else {
      // Inclure Validee pour afficher les achats récents
      etats = [EtatAchatEnum.EnAttente, EtatAchatEnum.Validee];
    }

    let types;
    if (typesAchat) {
      types = Array.isArray(typesAchat)
        ? typesAchat
        : [typesAchat];
    } else {
      types = [TypeAchatEnum.Livrer, TypeAchatEnum.Recuperer];
    }

    const filter = {
      acheteur: acheteurId,
      etat: { $in: etats },
      typeAchat: { $in: types }
    };

    const total = await Achat.countDocuments(filter);

    const achats = await Achat.find(filter)
    .populate('produit', 'nom prix tempsPreparation')
    .populate({
      path: 'produit',
      populate: {
        path: 'boutique',
        select: 'nom',
        populate: {
          path: 'commercant',
          select: 'nom prenom'
        }
      }
    })
    .populate('facture', 'description createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      achats,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération achats en cours:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des achats en cours'
    });
  }
};

// @route   GET /api/achats/historique
// @desc    Obtenir mon historique d'achats
// @access  Private (Acheteur)
// @query   page, limit
// @return  { achats, pagination }
exports.obtenirMonHistoriqueAchats = async (req, res) => {
  try {
    const acheteurId = req.user._id;
    const { page = 1, limit = 20, etat, dateDebut, dateFin } = req.query;

    const criteres = { acheteur: acheteurId };

    if (etat) {
      criteres.etat = etat;
    }

    if (dateDebut || dateFin) {
      criteres.createdAt = {};
      if (dateDebut) criteres.createdAt.$gte = new Date(dateDebut);
      if (dateFin) criteres.createdAt.$lte = new Date(dateFin);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Achat.countDocuments(criteres);

    const achats = await Achat.find(criteres)
      .populate('produit', 'nom prix')
      .populate({
        path: 'produit',
        populate: {
          path: 'boutique',
          select: 'nom',
          populate: {
            path: 'commercant',
            select: 'nom prenom'
          }
        }
      })
      .populate('facture', 'description createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      achats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération historique achats:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de l\'historique des achats'
    });
  }
};

// @route   GET /api/achats/:id
// @desc    Obtenir un achat par ID
// @access  Private (Acheteur)
// @param   id - ID de l'achat
// @return  { achat }
exports.obtenirAchatParId = async (req, res) => {
  try {
    const { id } = req.params;
    const acheteurId = req.user._id;

    const achat = await Achat.findOne({ _id: id, acheteur: acheteurId })
      .populate('produit', 'nom prix description tempsPreparation')
      .populate({
        path: 'produit',
        populate: {
          path: 'boutique',
          select: 'nom description contact',
          populate: {
            path: 'commercant',
            select: 'nom prenom email telephone'
          }
        }
      })
      .populate('facture', 'description montantTotal createdAt');

    if (!achat) {
      return res.status(404).json({
        message: 'Achat non trouvé'
      });
    }

    res.json({ achat });

  } catch (error) {
    console.error('❌ Erreur récupération achat:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de l\'achat'
    });
  }
};

// @route   PUT /api/achats/:id/annuler
// @desc    Annuler un achat (si possible)
// @access  Private (Acheteur)
// @param   id - ID de l'achat
// @body    { raison }
// @return  { message, achat }
exports.annulerAchat = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;
    const acheteurId = req.user._id;

    const achat = await Achat.findOne({ _id: id, acheteur: acheteurId })
      .populate('produit');

    if (!achat) {
      return res.status(404).json({
        message: 'Achat non trouvé'
      });
    }

    // Vérifier si l'achat peut être annulé
    if (achat.etat === EtatAchatEnum.Annulee) {
      return res.status(400).json({
        message: 'Cet achat est déjà annulé'
      });
    }

    // Pour les achats "Récupérer", on peut annuler jusqu'à la date de fin
    // Pour les achats "Livrer", on peut annuler tant qu'ils sont en attente
    const maintenant = new Date();
    const peutAnnuler = 
      (achat.typeAchat.type === TypeAchatEnum.Recuperer && maintenant < achat.typeAchat.dateFin) ||
      (achat.typeAchat.type === TypeAchatEnum.Livrer && achat.etat === EtatAchatEnum.EnAttente);

    if (!peutAnnuler) {
      return res.status(400).json({
        message: 'Cet achat ne peut plus être annulé'
      });
    }

    // Annuler l'achat
    achat.etat = EtatAchatEnum.Annulee;
    achat.raisonAnnulation = raison;
    await achat.save();

    // Remettre le stock
    const produit = achat.produit;
    produit.stock.nombreDispo += achat.quantite;
    produit.stock.updatedAt = new Date();
    await produit.save();

    // Rembourser l'acheteur (créer une transaction inverse)
    const portefeuilleAcheteur = await PorteFeuille.findOne({ owner: acheteurId });
    const portefeuilleCommercant = await PorteFeuille.findOne({ owner: produit.boutique.commercant });

    if (portefeuilleAcheteur && portefeuilleCommercant) {
      const transaction = new PFTransaction({
        fromWallet: portefeuilleCommercant._id,
        toWallet: portefeuilleAcheteur._id,
        type: TypeTransactionEnum.Achat,
        amount: achat.montantTotal,
        description: `Remboursement: ${produit.nom} x${achat.quantite}`,
        relatedEntity: {
          entityType: 'Achat',
          entityId: achat._id
        }
      });

      await transaction.save();

      // Mettre à jour les balances
      portefeuilleAcheteur.balance += achat.montantTotal;
      portefeuilleCommercant.balance -= achat.montantTotal;

      await portefeuilleAcheteur.save();
      await portefeuilleCommercant.save();
    }

    console.log(`❌ Achat annulé: ${achat._id} - Raison: ${raison}`);

    res.json({
      message: 'Achat annulé avec succès',
      achat
    });

  } catch (error) {
    console.error('❌ Erreur annulation achat:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'annulation de l\'achat'
    });
  }
};

// @route   GET /api/achats/factures
// @desc    Obtenir mes factures
// @access  Private (Acheteur)
// @query   page, limit
// @return  { factures, pagination }
exports.obtenirMesFactures = async (req, res) => {
  try {
    const acheteurId = req.user._id;
    const { page = 1, limit = 20, dateDebut, dateFin } = req.query;

    const criteres = { acheteur: acheteurId };

    if (dateDebut || dateFin) {
      criteres.createdAt = {};
      if (dateDebut) criteres.createdAt.$gte = new Date(dateDebut);
      if (dateFin) criteres.createdAt.$lte = new Date(dateFin);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Facture.countDocuments(criteres);

    const factures = await Facture.find(criteres)
      .populate('acheteur', 'nom prenom email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Ajouter les achats pour chaque facture
    for (const facture of factures) {
      const achats = await Achat.find({ facture: facture._id })
        .populate('produit', 'nom prix')
        .populate({
          path: 'produit',
          populate: {
            path: 'boutique',
            select: 'nom'
          }
        });
      facture.achats = achats;
    }

    res.json({
      factures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération factures:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des factures'
    });
  }
};

// @route   GET /api/achats/factures/:id
// @desc    Obtenir une facture par ID
// @access  Private (Acheteur)
// @param   id - ID de la facture
// @return  { facture }
exports.obtenirFactureParId = async (req, res) => {
  try {
    const { id } = req.params;
    const acheteurId = req.user._id;

    const facture = await Facture.findOne({ _id: id, acheteur: acheteurId })
      .populate('acheteur', 'nom prenom email');

    if (!facture) {
      return res.status(404).json({
        message: 'Facture non trouvée'
      });
    }

    // Ajouter les achats
    const achats = await Achat.find({ facture: facture._id })
      .populate('produit', 'nom prix description')
      .populate({
        path: 'produit',
        populate: {
          path: 'boutique',
          select: 'nom',
          populate: {
            path: 'commercant',
            select: 'nom prenom'
          }
        }
      });

    facture.achats = achats;

    res.json({ facture });

  } catch (error) {
    console.error('❌ Erreur récupération facture:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de la facture'
    });
  }
};

// @route   GET /api/achats/statistiques
// @desc    Obtenir les statistiques de mes achats
// @access  Private (Acheteur)
// @return  { statistiques }
exports.obtenirStatistiquesAchats = async (req, res) => {
  try {
    const acheteurId = req.user._id;

    // Statistiques générales
    const totalAchats = await Achat.countDocuments({ acheteur: acheteurId });
    
    const montantTotalResult = await Achat.aggregate([
      { $match: { acheteur: acheteurId } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } }
    ]);
    const montantTotal = montantTotalResult[0]?.total || 0;

    // Achats par état
    const achatsParEtat = await Achat.aggregate([
      { $match: { acheteur: acheteurId } },
      {
        $group: {
          _id: '$etat',
          count: { $sum: 1 },
          montant: { $sum: '$montantTotal' }
        }
      }
    ]);

    // Achats par mois (derniers 12 mois)
    const dateIlYaUnAn = new Date();
    dateIlYaUnAn.setFullYear(dateIlYaUnAn.getFullYear() - 1);

    const achatsParMois = await Achat.aggregate([
      { 
        $match: { 
          acheteur: acheteurId,
          createdAt: { $gte: dateIlYaUnAn }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          montant: { $sum: '$montantTotal' }
        }
      },
      {
        $project: {
          mois: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]}
            ]
          },
          count: 1,
          montant: 1
        }
      },
      { $sort: { mois: 1 } }
    ]);

    // Boutiques préférées
    const boutiquesPreferees = await Achat.aggregate([
      { $match: { acheteur: acheteurId } },
      {
        $lookup: {
          from: 'produits',
          localField: 'produit',
          foreignField: '_id',
          as: 'produitInfo'
        }
      },
      { $unwind: '$produitInfo' },
      {
        $lookup: {
          from: 'boutiques',
          localField: 'produitInfo.boutique',
          foreignField: '_id',
          as: 'boutiqueInfo'
        }
      },
      { $unwind: '$boutiqueInfo' },
      {
        $group: {
          _id: '$boutiqueInfo._id',
          boutique: { $first: '$boutiqueInfo.nom' },
          count: { $sum: 1 },
          montant: { $sum: '$montantTotal' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalAchats,
      montantTotal,
      achatsParEtat,
      achatsParMois,
      boutiquesPreferees
    });

  } catch (error) {
    console.error('❌ Erreur récupération statistiques achats:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};


// @route   GET /api/commercant/achats/en-cours
// @desc    Obtenir les achats en cours pour le commercant
// @access  Private (Commercant)
exports.obtenirAchatsCommercantEnCours = async (req, res) => {
  try {
    const commercantId = req.user._id;

    // Pagination (valeurs par défaut sécurisées)
    const { page = 1, limit = 10, boutiqueId, etatsAchat, typesAchat } = req.query;
    const skip = (page - 1) * limit;

    const Boutique = require('../models/Boutique');

    let boutiqueIds = [];

    if (boutiqueId) {
      // Vérifier que la boutique appartient bien au commerçant
      const boutique = await Boutique.findOne({
        _id: boutiqueId,
        commercant: commercantId
      }).select('_id');

      if (!boutique) {
        return res.status(403).json({
          message: 'Boutique non autorisée ou introuvable'
        });
      }

      boutiqueIds = [boutique._id];
    } else {
      // Récupérer toutes les boutiques du commerçant
      const boutiques = await Boutique.find({
        commercant: commercantId
      }).select('_id');

      boutiqueIds = boutiques.map(b => b._id);
    }

    if (boutiqueIds.length === 0) {
      return res.json({
        achats: [],
        count: 0,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        message: 'Aucune boutique trouvée'
      });
    }

    // Produits des boutiques
    const produits = await Produit.find({
      boutique: { $in: boutiqueIds }
    }).select('_id');

    const produitIds = produits.map(p => p._id);

    let etats;
    if (etatsAchat) {
      etats = Array.isArray(etatsAchat)
        ? etatsAchat
        : [etatsAchat];
    } else {
      // Inclure Validee pour afficher les achats récents
      etats = [EtatAchatEnum.EnAttente, EtatAchatEnum.EnPreparation, EtatAchatEnum.Validee];
    }

    let types;
    if (typesAchat) {
      types = Array.isArray(typesAchat)
        ? typesAchat
        : [typesAchat];
    } else {
      types = [TypeAchatEnum.Livrer, TypeAchatEnum.Recuperer];
    }

    // Query de base
    const query = {
      produit: { $in: produitIds },
      etat: { $in: etats },
      'typeAchat.type': { $in: types }
    };

    // Total AVANT pagination
    const total = await Achat.countDocuments(query);

    // Achats paginés
    const achats = await Achat.find(query)
      .populate('produit', 'nom prix photo')
      .populate('acheteur', 'nom prenoms email telephone')
      .populate('facture', 'description montantTotal')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      achats,
      count: achats.length, // tu voulais garder count
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération achats commercant:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des achats'
    });
  }
};

// @route   PUT /api/commercant/achats/:id/livraison
// @desc    Valider la livraison d'un achat
// @access  Private (Commercant)
exports.validerLivraison = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { dureeLivraison } = req.body;
    const commercantId = req.user._id;

    console.log('🚚 Validation livraison achat:', id);
    console.log('⏱️  Durée livraison:', dureeLivraison);

    // Trouver l'achat
    const achat = await Achat.findById(id)
      .populate('produit')
      .populate('acheteur', 'nom prenoms email telephone');

    if (!achat) {
      return res.status(404).json({
        message: 'Achat non trouvé'
      });
    }

    // Vérifier que le produit appartient à une boutique du commercant
    const Boutique = require('../models/Boutique');
    const boutique = await Boutique.findOne({
      _id: achat.produit.boutique,
      commercant: commercantId
    });

    if (!boutique) {
      return res.status(403).json({
        message: 'Vous n\'êtes pas autorisé à valider cette livraison'
      });
    }

    // Vérifier que l'achat est de type Livrer
    if (achat.typeAchat.type !== TypeAchatEnum.Livrer) {
      return res.status(400).json({
        message: 'Cet achat n\'est pas une livraison'
      });
    }

    // Vérifier que l'achat est en attente
    if (achat.etat !== EtatAchatEnum.EnAttente) {
      return res.status(400).json({
        message: 'Cet achat ne peut plus être modifié',
        etatActuel: achat.etat
      });
    }

    // Calculer la date de fin
    const [heures, minutes, secondes] = dureeLivraison.split(':').map(Number);
    const dureeLivraisonMs = (heures * 3600 + minutes * 60 + secondes) * 1000;
    const dateFin = new Date(achat.typeAchat.dateDebut.getTime() + dureeLivraisonMs);

    // Mettre à jour l'achat
    achat.typeAchat.dateFin = dateFin;
    achat.etat = EtatAchatEnum.Validee;
    await achat.save();

    // Effectuer la transaction financière
    const portefeuilleAcheteur = await PorteFeuille.findOne({ owner: achat.acheteur._id });
    const portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercantId });

    if (!portefeuilleAcheteur || !portefeuilleCommercant) {
      return res.status(404).json({
        message: 'Portefeuille non trouvé'
      });
    }

    // Créer la transaction
    const transaction = new PFTransaction({
      fromWallet: portefeuilleAcheteur._id,
      toWallet: portefeuilleCommercant._id,
      type: TypeTransactionEnum.Achat,
      amount: achat.montantTotal,
      description: `Achat de ${achat.produit.nom}`,
      statut: 'Completee'
    });
    await transaction.save();

    // Mettre à jour les balances
    portefeuilleAcheteur.balance -= achat.montantTotal;
    portefeuilleCommercant.balance += achat.montantTotal;
    await portefeuilleAcheteur.save();
    await portefeuilleCommercant.save();

    // Créer une notification pour l'acheteur
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      type: 'Achat',
      message: `Votre commande de ${achat.produit.nom} a été validée et sera livrée`,
      receveur: achat.acheteur._id,
      urlRoute: `/achats/${achat._id}`
    });

    console.log('✅ Livraison validée avec succès');

    res.json({
      message: 'Livraison validée avec succès',
      // achat: {
      //   _id: achat._id,
      //   etat: achat.etat,
      //   typeAchat: achat.typeAchat,
      //   montantTotal: achat.montantTotal
      // },
      achat: achat,
      transaction: {
        _id: transaction._id,
        amount: transaction.amount,
        type: transaction.type
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation livraison:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la validation de la livraison'
    });
  }
};
