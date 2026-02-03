const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  typeProduit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeProduit',
    required: true
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  tempsPreparation: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$|^null$/, // Format HH:MM:SS ou null
    default: null
  },
  stock: {
    nombreDispo: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Informations supplémentaires
  images: [String],
  caracteristiques: {
    taille: [String],
    couleur: [String],
    marque: String,
    autres: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Statistiques
  nombreVentes: {
    type: Number,
    default: 0
  },
  note: {
    moyenne: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
produitSchema.index({ boutique: 1, isActive: 1 });
produitSchema.index({ typeProduit: 1 });
produitSchema.index({ nom: 'text', description: 'text' });
produitSchema.index({ prix: 1 });
produitSchema.index({ 'stock.nombreDispo': 1 });

// Middleware pre-save pour mettre à jour le stock
produitSchema.pre('save', function(next) {
  if (this.isModified('stock.nombreDispo')) {
    this.stock.updatedAt = new Date();
  }
  next();
});

// Méthode pour vérifier la disponibilité
produitSchema.methods.estDisponible = function(quantiteDemandee = 1) {
  return this.isActive && this.stock.nombreDispo >= quantiteDemandee;
};

// Méthode pour décrémenter le stock
produitSchema.methods.decrementerStock = function(quantite) {
  if (this.stock.nombreDispo < quantite) {
    throw new Error('Stock insuffisant');
  }
  
  this.stock.nombreDispo -= quantite;
  this.stock.updatedAt = new Date();
  this.nombreVentes += quantite;
  
  return this.save();
};

// Méthode pour incrémenter le stock (annulation, retour)
produitSchema.methods.incrementerStock = function(quantite) {
  this.stock.nombreDispo += quantite;
  this.stock.updatedAt = new Date();
  
  return this.save();
};

// Méthode pour calculer le temps de préparation en minutes
produitSchema.methods.getTempsPreparationMinutes = function() {
  if (!this.tempsPreparation || this.tempsPreparation === 'null') {
    return 0;
  }
  
  const [heures, minutes, secondes] = this.tempsPreparation.split(':').map(Number);
  return (heures * 60) + minutes + (secondes / 60);
};

// Méthode statique pour rechercher des produits
produitSchema.statics.rechercher = function(criteres = {}) {
  const {
    boutique,
    typeProduit,
    recherche,
    prixMin,
    prixMax,
    enStock = true,
    page = 1,
    limit = 20
  } = criteres;
  
  const query = { isActive: true };
  
  if (boutique) query.boutique = boutique;
  if (typeProduit) query.typeProduit = typeProduit;
  if (recherche) {
    query.$text = { $search: recherche };
  }
  if (prixMin !== undefined) {
    query.prix = { ...query.prix, $gte: prixMin };
  }
  if (prixMax !== undefined) {
    query.prix = { ...query.prix, $lte: prixMax };
  }
  if (enStock) {
    query['stock.nombreDispo'] = { $gt: 0 };
  }
  
  return this.find(query)
    .populate('boutique', 'nom')
    .populate('typeProduit', 'type')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

module.exports = mongoose.model('Produit', produitSchema);