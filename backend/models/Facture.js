const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  acheteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // Informations de facturation
  numeroFacture: {
    type: String,
    unique: true
  },
  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },
  montantTTC: {
    type: Number,
    required: true,
    min: 0
  },
  tauxTVA: {
    type: Number,
    default: 20, // 20% par défaut
    min: 0,
    max: 100
  },
  // Statut de la facture
  statut: {
    type: String,
    enum: ['Brouillon', 'Emise', 'Payee', 'Annulee'],
    default: 'Brouillon'
  },
  // Dates importantes
  dateEmission: {
    type: Date,
    default: Date.now
  },
  dateEcheance: {
    type: Date
  },
  datePaiement: {
    type: Date
  },
  // Informations de paiement
  modePaiement: {
    type: String,
    enum: ['Portefeuille', 'Carte', 'Especes', 'Virement'],
    default: 'Portefeuille'
  },
  // Métadonnées
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
factureSchema.index({ acheteur: 1, createdAt: -1 });
factureSchema.index({ numeroFacture: 1 });
factureSchema.index({ statut: 1 });
factureSchema.index({ dateEmission: -1 });

// Générer un numéro de facture unique avant la sauvegarde
factureSchema.pre('save', function(next) {
  if (!this.numeroFacture) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString(36).toUpperCase();
    this.numeroFacture = `FAC-${year}${month}-${timestamp}`;
  }
  next();
});

// Méthode pour calculer le montant TTC
factureSchema.methods.calculerMontantTTC = function() {
  this.montantTTC = this.montantTotal * (1 + this.tauxTVA / 100);
  return this.montantTTC;
};

// Méthode pour marquer comme payée
factureSchema.methods.marquerPayee = function(modePaiement = 'Portefeuille') {
  this.statut = 'Payee';
  this.datePaiement = new Date();
  this.modePaiement = modePaiement;
  return this.save();
};

// Méthode pour annuler la facture
factureSchema.methods.annuler = function(raison = '') {
  this.statut = 'Annulee';
  this.metadata.raisonAnnulation = raison;
  this.metadata.dateAnnulation = new Date();
  return this.save();
};

// Méthode pour obtenir le nombre d'achats liés
factureSchema.methods.getNombreAchats = async function() {
  const Achat = mongoose.model('Achat');
  return await Achat.countDocuments({ facture: this._id });
};

// Méthode statique pour obtenir les factures d'un acheteur
factureSchema.statics.obtenirParAcheteur = function(acheteurId, options = {}) {
  const { page = 1, limit = 20, statut = null } = options;
  
  const query = { acheteur: acheteurId };
  if (statut) {
    query.statut = statut;
  }
  
  return this.find(query)
    .populate('acheteur', 'nom prenoms email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Méthode statique pour créer une facture pour un panier
factureSchema.statics.creerPourPanier = async function(acheteurId, achats, description = 'Achat en ligne') {
  // Calculer le montant total
  let montantTotal = 0;
  for (const achat of achats) {
    const Produit = mongoose.model('Produit');
    const produit = await Produit.findById(achat.produit);
    if (produit) {
      montantTotal += produit.prix * achat.quantite;
    }
  }
  
  const facture = new this({
    acheteur: acheteurId,
    description,
    montantTotal,
    statut: 'Emise'
  });
  
  facture.calculerMontantTTC();
  await facture.save();
  
  return facture;
};

module.exports = mongoose.model('Facture', factureSchema);