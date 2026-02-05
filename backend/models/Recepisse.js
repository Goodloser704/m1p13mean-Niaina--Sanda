const mongoose = require('mongoose');

/**
 * 📄 Modèle Reçu/Reçépissé
 * Gestion des reçus de paiement (loyers, achats, etc.)
 */
const recepisseSchema = new mongoose.Schema({
  // Informations de base
  numeroRecepisse: {
    type: String,
    unique: true,
    required: true
  },
  
  // Parties impliquées (conformes aux spécifications)
  receveur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  donneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Alias pour compatibilité avec l'implémentation existante
  emetteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Références
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: false
  },
  
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PFTransaction',
    required: true
  },
  
  // Détails financiers
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Type de reçu
  type: {
    type: String,
    enum: ['Loyer', 'Achat', 'Commission', 'Remboursement', 'Autre'],
    required: true
  },
  
  // Période concernée (pour les loyers)
  periode: {
    type: String, // Format YYYY-MM
    required: false
  },
  
  // Description
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Dates
  dateEmission: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Statut
  statut: {
    type: String,
    enum: ['Emis', 'Annule'],
    default: 'Emis'
  },
  
  // Métadonnées
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  collection: 'recepisse'
});

// Index pour les recherches
recepisseSchema.index({ destinataire: 1, dateEmission: -1 });
recepisseSchema.index({ emetteur: 1, dateEmission: -1 });
recepisseSchema.index({ transaction: 1 });
recepisseSchema.index({ numeroRecepisse: 1 });
recepisseSchema.index({ type: 1, periode: 1 });

// Middleware pour synchroniser les champs et générer le numéro de reçu
recepisseSchema.pre('save', async function(next) {
  // Synchroniser receveur/destinataire et donneur/emetteur
  if (this.isModified('receveur') && !this.isModified('destinataire')) {
    this.destinataire = this.receveur;
  } else if (this.isModified('destinataire') && !this.isModified('receveur')) {
    this.receveur = this.destinataire;
  }
  
  if (this.isModified('donneur') && !this.isModified('emetteur')) {
    this.emetteur = this.donneur;
  } else if (this.isModified('emetteur') && !this.isModified('donneur')) {
    this.donneur = this.emetteur;
  }
  
  // Générer le numéro de reçu
  if (this.isNew && !this.numeroRecepisse) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.numeroRecepisse = `REC-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Méthodes statiques
recepisseSchema.statics.obtenirParUtilisateur = function(userId, options = {}) {
  const query = { receveur: userId, statut: 'Emis' };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.periode) {
    query.periode = options.periode;
  }
  
  if (options.dateDebut || options.dateFin) {
    query.dateEmission = {};
    if (options.dateDebut) {
      query.dateEmission.$gte = new Date(options.dateDebut);
    }
    if (options.dateFin) {
      query.dateEmission.$lte = new Date(options.dateFin);
    }
  }
  
  return this.find(query)
    .populate('donneur', 'nom prenoms email')
    .populate('receveur', 'nom prenoms email')
    .populate('boutique', 'nom')
    .populate('transaction')
    .sort({ dateEmission: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

recepisseSchema.statics.obtenirParTransaction = function(transactionId) {
  return this.findOne({ transaction: transactionId, statut: 'Emis' })
    .populate('donneur', 'nom prenoms email')
    .populate('receveur', 'nom prenoms email')
    .populate('boutique', 'nom')
    .populate('transaction');
};

// Méthodes d'instance
recepisseSchema.methods.annuler = function(raison) {
  this.statut = 'Annule';
  this.metadata = {
    ...this.metadata,
    raisonAnnulation: raison,
    dateAnnulation: new Date()
  };
  return this.save();
};

recepisseSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Formater les montants
  if (obj.montant) {
    obj.montantFormate = `${obj.montant.toFixed(2)}€`;
  }
  
  // Formater les dates
  if (obj.dateEmission) {
    obj.dateEmissionFormatee = obj.dateEmission.toLocaleDateString('fr-FR');
  }
  
  return obj;
};

// Validation personnalisée
recepisseSchema.pre('validate', function(next) {
  // Vérifier que le donneur et le receveur sont différents
  if (this.donneur && this.receveur && 
      this.donneur.toString() === this.receveur.toString()) {
    next(new Error('Le donneur et le receveur ne peuvent pas être identiques'));
  }
  
  // Vérifier la période pour les loyers
  if (this.type === 'Loyer' && !this.periode) {
    next(new Error('La période est requise pour les reçus de loyer'));
  }
  
  next();
});

// Logging
recepisseSchema.post('save', function(doc) {
  console.log(`📄 Reçu créé: ${doc.numeroRecepisse} - ${doc.montant}€ (${doc.type})`);
});

recepisseSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    console.log(`📄 Reçu mis à jour: ${doc.numeroRecepisse}`);
  }
});

module.exports = mongoose.model('Recepisse', recepisseSchema);