const mongoose = require('mongoose');

const recepisseSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // Informations financières
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['Loyer', 'Caution', 'Frais', 'Remboursement', 'Autre'],
    required: true
  },
  // Numéro de reçu unique
  numeroRecepisse: {
    type: String,
    unique: true
  },
  // Références
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PFTransaction'
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique'
  },
  espace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Espace'
  },
  // Période couverte (pour les loyers)
  periode: {
    debut: Date,
    fin: Date
  },
  // Statut du reçu
  statut: {
    type: String,
    enum: ['Emis', 'Envoye', 'Recu', 'Archive'],
    default: 'Emis'
  },
  // Informations de signature/validation
  signature: {
    donneur: {
      nom: String,
      date: Date,
      signature: String // Base64 ou chemin vers l'image
    },
    receveur: {
      nom: String,
      date: Date,
      signature: String
    }
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
recepisseSchema.index({ receveur: 1, createdAt: -1 });
recepisseSchema.index({ donneur: 1, createdAt: -1 });
recepisseSchema.index({ numeroRecepisse: 1 });
recepisseSchema.index({ type: 1, createdAt: -1 });
recepisseSchema.index({ boutique: 1 });
recepisseSchema.index({ transaction: 1 });

// Générer un numéro de reçu unique avant la sauvegarde
recepisseSchema.pre('save', function(next) {
  if (!this.numeroRecepisse) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString(36).toUpperCase();
    this.numeroRecepisse = `REC-${year}${month}-${timestamp}`;
  }
  next();
});

// Méthode pour marquer comme envoyé
recepisseSchema.methods.marquerEnvoye = function() {
  this.statut = 'Envoye';
  this.metadata.dateEnvoi = new Date();
  return this.save();
};

// Méthode pour marquer comme reçu
recepisseSchema.methods.marquerRecu = function() {
  this.statut = 'Recu';
  this.metadata.dateReception = new Date();
  return this.save();
};

// Méthode pour ajouter une signature
recepisseSchema.methods.ajouterSignature = function(role, nomSignataire, signatureData) {
  if (role !== 'donneur' && role !== 'receveur') {
    throw new Error('Le rôle doit être "donneur" ou "receveur"');
  }
  
  this.signature[role] = {
    nom: nomSignataire,
    date: new Date(),
    signature: signatureData
  };
  
  return this.save();
};

// Méthode statique pour créer un reçu de loyer
recepisseSchema.statics.creerRecuLoyer = async function(commercantId, adminId, montant, boutique, espace, periode) {
  const recepisse = new this({
    receveur: commercantId,
    donneur: adminId,
    description: `Paiement de loyer pour la période du ${periode.debut.toLocaleDateString()} au ${periode.fin.toLocaleDateString()}`,
    montant,
    type: 'Loyer',
    boutique,
    espace,
    periode
  });
  
  await recepisse.save();
  return recepisse;
};

// Méthode statique pour obtenir les reçus d'un utilisateur
recepisseSchema.statics.obtenirParUtilisateur = function(userId, options = {}) {
  const { type = null, page = 1, limit = 20, role = 'all' } = options;
  
  let query = {};
  
  if (role === 'receveur') {
    query.receveur = userId;
  } else if (role === 'donneur') {
    query.donneur = userId;
  } else {
    query.$or = [{ receveur: userId }, { donneur: userId }];
  }
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('receveur', 'nom prenoms email')
    .populate('donneur', 'nom prenoms email')
    .populate('boutique', 'nom')
    .populate('espace', 'codeEspace')
    .populate('transaction')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Méthode statique pour obtenir les reçus de loyer d'une boutique
recepisseSchema.statics.obtenirRecusLoyerBoutique = function(boutiqueId) {
  return this.find({ boutique: boutiqueId, type: 'Loyer' })
    .populate('receveur', 'nom prenoms')
    .populate('donneur', 'nom prenoms')
    .populate('espace', 'codeEspace loyer')
    .sort({ createdAt: -1 });
};

// Méthode pour générer les données pour un PDF
recepisseSchema.methods.genererDonneesPDF = function() {
  return {
    numeroRecepisse: this.numeroRecepisse,
    dateEmission: this.createdAt,
    receveur: {
      nom: this.receveur.nom,
      prenoms: this.receveur.prenoms,
      email: this.receveur.email
    },
    donneur: {
      nom: this.donneur.nom,
      prenoms: this.donneur.prenoms,
      email: this.donneur.email
    },
    description: this.description,
    montant: this.montant,
    type: this.type,
    periode: this.periode,
    boutique: this.boutique ? {
      nom: this.boutique.nom
    } : null,
    espace: this.espace ? {
      code: this.espace.codeEspace,
      loyer: this.espace.loyer
    } : null,
    signatures: this.signature
  };
};

module.exports = mongoose.model('Recepisse', recepisseSchema);