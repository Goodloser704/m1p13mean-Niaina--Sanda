const Loyer = require('../models/Loyer');
const Boutique = require('../models/Boutique');
const PorteFeuille = require('../models/PorteFeuille');

/**
 * 💰 Contrôleur Loyers
 * Gestion des paiements de loyer et historique
 */

/**
 * @route   GET /api/loyers/historique
 * @desc    Obtenir l'historique des paiements de loyer (filtrable par mois/année)
 * @access  Private (Admin)
 * @query   mois, annee, page, limit
 * @return  { loyers, pagination, statistiques }
 */
exports.obtenirHistorique = async (req, res) => {
  try {
    const { mois, annee, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (annee) query.annee = parseInt(annee);
    if (mois) query.mois = parseInt(mois);
    
    const loyers = await Loyer.find(query)
      .populate({
        path: 'boutique',
        select: 'nom commercant',
        populate: {
          path: 'commercant',
          select: 'nom prenoms email'
        }
      })
      .populate('espace', 'code surface')
      .sort({ annee: -1, mois: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Loyer.countDocuments(query);
    
    // Statistiques
    const stats = await Loyer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLoyers: { $sum: 1 },
          montantTotal: { $sum: '$montant' },
          totalPaye: {
            $sum: { $cond: [{ $eq: ['$statutPaiement', 'Paye'] }, 1, 0] }
          },
          montantPaye: {
            $sum: { $cond: [{ $eq: ['$statutPaiement', 'Paye'] }, '$montant', 0] }
          },
          totalEnAttente: {
            $sum: { $cond: [{ $eq: ['$statutPaiement', 'EnAttente'] }, 1, 0] }
          },
          totalEnRetard: {
            $sum: { $cond: [{ $eq: ['$statutPaiement', 'EnRetard'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      loyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistiques: stats[0] || {
        totalLoyers: 0,
        montantTotal: 0,
        totalPaye: 0,
        montantPaye: 0,
        totalEnAttente: 0,
        totalEnRetard: 0
      }
    });
  } catch (error) {
    console.error('Erreur obtention historique loyers:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de l\'historique'
    });
  }
};

/**
 * @route   GET /api/loyers/boutiques/impayees
 * @desc    Obtenir les boutiques n'ayant pas payé le loyer du mois en cours
 * @access  Private (Admin)
 * @query   mois, annee
 * @return  { boutiques, total }
 */
exports.obtenirBoutiquesImpayees = async (req, res) => {
  try {
    const { mois, annee } = req.query;
    
    const loyers = await Loyer.obtenirBoutiquesImpayees(
      mois ? parseInt(mois) : null,
      annee ? parseInt(annee) : null
    );
    
    const now = new Date();
    const moisCourant = mois ? parseInt(mois) : now.getMonth() + 1;
    const anneeCourante = annee ? parseInt(annee) : now.getFullYear();
    
    res.json({
      boutiques: loyers.map(loyer => ({
        _id: loyer._id,
        boutique: loyer.boutique,
        espace: loyer.espace,
        montant: loyer.montant,
        mois: loyer.mois,
        annee: loyer.annee,
        statutPaiement: loyer.statutPaiement,
        dateEcheance: loyer.dateEcheance,
        joursRetard: loyer.estEnRetard() 
          ? Math.floor((now - loyer.dateEcheance) / (1000 * 60 * 60 * 24))
          : 0
      })),
      total: loyers.length,
      periode: {
        mois: moisCourant,
        annee: anneeCourante
      }
    });
  } catch (error) {
    console.error('Erreur obtention boutiques impayées:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des boutiques impayées'
    });
  }
};

/**
 * @route   GET /api/loyers/boutiques/payees
 * @desc    Obtenir les boutiques ayant payé le loyer du mois en cours
 * @access  Private (Admin)
 * @query   mois, annee
 * @return  { boutiques, total }
 */
exports.obtenirBoutiquesPayees = async (req, res) => {
  try {
    const { mois, annee } = req.query;
    
    const loyers = await Loyer.obtenirBoutiquesPayees(
      mois ? parseInt(mois) : null,
      annee ? parseInt(annee) : null
    );
    
    const now = new Date();
    const moisCourant = mois ? parseInt(mois) : now.getMonth() + 1;
    const anneeCourante = annee ? parseInt(annee) : now.getFullYear();
    
    res.json({
      boutiques: loyers.map(loyer => ({
        _id: loyer._id,
        boutique: loyer.boutique,
        espace: loyer.espace,
        montant: loyer.montant,
        mois: loyer.mois,
        annee: loyer.annee,
        statutPaiement: loyer.statutPaiement,
        datePaiement: loyer.datePaiement,
        modePaiement: loyer.modePaiement,
        numeroTransaction: loyer.numeroTransaction
      })),
      total: loyers.length,
      periode: {
        mois: moisCourant,
        annee: anneeCourante
      }
    });
  } catch (error) {
    console.error('Erreur obtention boutiques payées:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des boutiques payées'
    });
  }
};

/**
 * @route   GET /api/loyers/statistiques
 * @desc    Obtenir les statistiques des loyers par année
 * @access  Private (Admin)
 * @query   annee
 * @return  { statistiques }
 */
exports.obtenirStatistiques = async (req, res) => {
  try {
    const { annee } = req.query;
    const anneeCourante = annee ? parseInt(annee) : new Date().getFullYear();
    
    const stats = await Loyer.obtenirStatistiques(anneeCourante);
    
    // Formater les statistiques par mois
    const statsMois = Array.from({ length: 12 }, (_, i) => {
      const mois = i + 1;
      const statMois = stats.find(s => s._id === mois);
      
      return {
        mois,
        nomMois: new Date(anneeCourante, i, 1).toLocaleDateString('fr-FR', { month: 'long' }),
        totalLoyers: statMois?.totalLoyers || 0,
        montantTotal: statMois?.montantTotal || 0,
        totalPaye: statMois?.totalPaye || 0,
        montantPaye: statMois?.montantPaye || 0,
        totalEnAttente: statMois?.totalEnAttente || 0,
        totalEnRetard: statMois?.totalEnRetard || 0,
        tauxPaiement: statMois?.totalLoyers 
          ? Math.round((statMois.totalPaye / statMois.totalLoyers) * 100)
          : 0
      };
    });
    
    // Statistiques globales de l'année
    const statsGlobales = stats.reduce((acc, stat) => ({
      totalLoyers: acc.totalLoyers + stat.totalLoyers,
      montantTotal: acc.montantTotal + stat.montantTotal,
      totalPaye: acc.totalPaye + stat.totalPaye,
      montantPaye: acc.montantPaye + stat.montantPaye,
      totalEnAttente: acc.totalEnAttente + stat.totalEnAttente,
      totalEnRetard: acc.totalEnRetard + stat.totalEnRetard
    }), {
      totalLoyers: 0,
      montantTotal: 0,
      totalPaye: 0,
      montantPaye: 0,
      totalEnAttente: 0,
      totalEnRetard: 0
    });
    
    statsGlobales.tauxPaiement = statsGlobales.totalLoyers
      ? Math.round((statsGlobales.totalPaye / statsGlobales.totalLoyers) * 100)
      : 0;
    
    res.json({
      annee: anneeCourante,
      parMois: statsMois,
      global: statsGlobales
    });
  } catch (error) {
    console.error('Erreur obtention statistiques loyers:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

/**
 * @route   GET /api/commercant/loyers/historique
 * @desc    Obtenir l'historique des loyers d'un commercant
 * @access  Private (Commercant)
 * @query   mois, annee, page, limit
 * @return  { loyers, pagination }
 */
exports.obtenirHistoriqueCommercant = async (req, res) => {
  try {
    const { mois, annee, page = 1, limit = 20 } = req.query;
    
    // Récupérer les boutiques du commercant
    const boutiques = await Boutique.find({ commercant: req.user._id });
    const boutiqueIds = boutiques.map(b => b._id);
    
    if (boutiqueIds.length === 0) {
      return res.json({
        loyers: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });
    }
    
    const query = { boutique: { $in: boutiqueIds } };
    if (annee) query.annee = parseInt(annee);
    if (mois) query.mois = parseInt(mois);
    
    const loyers = await Loyer.find(query)
      .populate('boutique', 'nom')
      .populate('espace', 'code surface')
      .sort({ annee: -1, mois: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Loyer.countDocuments(query);
    
    res.json({
      loyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention historique commercant:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de l\'historique'
    });
  }
};

/**
 * @route   POST /api/commercant/loyers/:loyerId/payer
 * @desc    Payer un loyer
 * @access  Private (Commercant)
 * @param   loyerId - ID du loyer
 * @body    { modePaiement }
 * @return  { message, loyer }
 */
exports.payerLoyer = async (req, res) => {
  try {
    const { loyerId } = req.params;
    const { modePaiement = 'Portefeuille' } = req.body;
    
    const loyer = await Loyer.findById(loyerId)
      .populate('boutique');
    
    if (!loyer) {
      return res.status(404).json({ message: 'Loyer non trouvé' });
    }
    
    // Vérifier que la boutique appartient au commercant
    if (loyer.boutique.commercant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    // Vérifier que le loyer n'est pas déjà payé
    if (loyer.statutPaiement === 'Paye') {
      return res.status(400).json({ message: 'Ce loyer est déjà payé' });
    }
    
    // Si paiement par portefeuille, vérifier le solde
    if (modePaiement === 'Portefeuille') {
      const portefeuille = await PorteFeuille.findOne({ owner: req.user._id });
      
      if (!portefeuille || portefeuille.balance < loyer.montant) {
        return res.status(400).json({ 
          message: 'Solde insuffisant',
          soldeActuel: portefeuille?.balance || 0,
          montantRequis: loyer.montant
        });
      }
      
      // Débiter le portefeuille
      portefeuille.balance -= loyer.montant;
      await portefeuille.save();
    }
    
    // Marquer le loyer comme payé
    await loyer.marquerPaye(modePaiement);
    
    res.json({
      message: 'Loyer payé avec succès',
      loyer: {
        _id: loyer._id,
        montant: loyer.montant,
        mois: loyer.mois,
        annee: loyer.annee,
        statutPaiement: loyer.statutPaiement,
        datePaiement: loyer.datePaiement,
        modePaiement: loyer.modePaiement,
        numeroTransaction: loyer.numeroTransaction
      }
    });
  } catch (error) {
    console.error('Erreur paiement loyer:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du paiement'
    });
  }
};

module.exports = exports;
