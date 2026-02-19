const mongoose = require('mongoose');

/**
 * 💰 Modèle Loyer - Paiements de loyer des boutiques
 * Gestion de l'historique des paiements mensuels
 */

const loyerSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  espace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Espace',
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  mois: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  annee: {
    type: Number,
    required: true,
    min: 2020
  },
  datePaiement: {
    type: Date,
    default: null
  },
  statutPaiement: {
    type: String,
    enum: ['EnAttente', 'Paye', 'EnRetard'],
    default: 'EnAttente'
  },
  dateEcheance: {
    type: Date,
    required: true
  },
  modePaiement: {
    type: String,
    enum: ['Portefeuille', 'Carte', 'Especes', 'Virement'],
    default: null
  },
  numeroTransaction: {
    type: String,
    unique: true,
    sparse: true
  },
  remarques: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
loyerSchema.index({ boutique: 1, mois: 1, annee: 1 }, { unique: true });
loyerSchema.index({ espace: 1, statutPaiement: 1 });
loyerSchema.index({ statutPaiement: 1, dateEcheance: 1 });
loyerSchema.index({ annee: 1, mois: 1 });
loyerSchema.index({ numeroTransaction: 1 });

// Méthode pour marquer comme payé
loyerSchema.methods.marquerPaye = function(modePaiement = 'Portefeuille') {
  this.statutPaiement = 'Paye';
  this.datePaiement = new Date();
  this.modePaiement = modePaiement;
  
  // Générer un numéro de transaction
  if (!this.numeroTransaction) {
    const timestamp = Date.now().toString(36).toUpperCase();
    this.numeroTransaction = `LOYER-${this.annee}${String(this.mois).padStart(2, '0')}-${timestamp}`;
  }
  
  return this.save();
};

// Méthode pour vérifier si en retard
loyerSchema.methods.estEnRetard = function() {
  if (this.statutPaiement === 'Paye') return false;
  return new Date() > this.dateEcheance;
};

// Middleware pour mettre à jour le statut automatiquement
loyerSchema.pre('save', function(next) {
  if (this.statutPaiement === 'EnAttente' && this.estEnRetard()) {
    this.statutPaiement = 'EnRetard';
  }
  next();
});

// Méthode statique pour créer un loyer mensuel
loyerSchema.statics.creerLoyerMensuel = async function(boutiqueId, espaceId, montant, mois, annee) {
  // Calculer la date d'échéance (5ème jour du mois)
  const dateEcheance = new Date(annee, mois - 1, 5);
  
  const loyer = new this({
    boutique: boutiqueId,
    espace: espaceId,
    montant,
    mois,
    annee,
    dateEcheance
  });
  
  return await loyer.save();
};

// Méthode statique pour obtenir l'historique d'une boutique
loyerSchema.statics.obtenirHistorique = function(boutiqueId, options = {}) {
  const { annee, mois, page = 1, limit = 20 } = options;
  
  const query = { boutique: boutiqueId };
  
  if (annee) query.annee = parseInt(annee);
  if (mois) query.mois = parseInt(mois);
  
  return this.find(query)
    .populate('boutique', 'nom')
    .populate('espace', 'code surface')
    .sort({ annee: -1, mois: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
};

// Méthode statique pour obtenir les boutiques avec loyer impayé du mois en cours
loyerSchema.statics.obtenirBoutiquesImpayees = async function(mois, annee) {
  const now = new Date();
  const moisCourant = mois || now.getMonth() + 1;
  const anneeCourante = annee || now.getFullYear();
  
  return await this.find({
    mois: moisCourant,
    annee: anneeCourante,
    statutPaiement: { $in: ['EnAttente', 'EnRetard'] }
  })
    .populate({
      path: 'boutique',
      select: 'nom commercant',
      populate: {
        path: 'commercant',
        select: 'nom prenoms email telephone'
      }
    })
    .populate('espace', 'code surface loyer')
    .sort({ dateEcheance: 1 });
};

// Méthode statique pour obtenir les boutiques avec loyer payé du mois en cours
loyerSchema.statics.obtenirBoutiquesPayees = async function(mois, annee) {
  const now = new Date();
  const moisCourant = mois || now.getMonth() + 1;
  const anneeCourante = annee || now.getFullYear();
  
  return await this.find({
    mois: moisCourant,
    annee: anneeCourante,
    statutPaiement: 'Paye'
  })
    .populate({
      path: 'boutique',
      select: 'nom commercant',
      populate: {
        path: 'commercant',
        select: 'nom prenoms email'
      }
    })
    .populate('espace', 'code surface loyer')
    .sort({ datePaiement: -1 });
};

// Méthode statique pour obtenir les statistiques des loyers
loyerSchema.statics.obtenirStatistiques = async function(annee) {
  const anneeCourante = annee || new Date().getFullYear();
  
  return await this.aggregate([
    { $match: { annee: anneeCourante } },
    {
      $group: {
        _id: '$mois',
        totalLoyers: { $sum: 1 },
        totalMontant: { $sum: '$montant' },
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
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Loyer', loyerSchema);
