const mongoose = require('mongoose');

const espaceSchema = new mongoose.Schema({
  centreCommercial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CentreCommercial',
    required: true
  },
  code: { // Renommé selon les règles de gestion
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  codeEspace: { // Alias pour compatibilité
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  numero: { // Alias supplémentaire pour compatibilité
    type: String,
    trim: true,
    maxlength: 20
  },
  surface: {
    type: Number,
    required: true,
    min: 1,
    max: 10000 // Surface max en m²
  },
  superficie: { // Alias pour compatibilité
    type: Number,
    min: 1,
    max: 10000
  },
  etage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etage',
    required: true
  },
  loyer: {
    type: Number,
    required: true,
    min: 0
  },
  prixLoyer: { // Alias pour compatibilité
    type: Number,
    min: 0
  },
  statut: {
    type: String,
    enum: ['Disponible', 'Occupee'], // Selon les règles de gestion exactes
    default: 'Disponible',
    required: true
  },
  // Informations sur l'occupation
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    default: null
  },
  dateOccupation: {
    type: Date,
    default: null
  },
  // Informations supplémentaires
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  caracteristiques: {
    vitrine: {
      type: Boolean,
      default: false
    },
    climatisation: {
      type: Boolean,
      default: false
    },
    stockage: {
      type: Boolean,
      default: false
    },
    accesPMR: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
espaceSchema.index({ codeEspace: 1 });
espaceSchema.index({ etage: 1 });
espaceSchema.index({ statut: 1 });
espaceSchema.index({ surface: 1 });
espaceSchema.index({ loyer: 1 });

// Middleware pre-save pour gérer l'occupation
espaceSchema.pre('save', function(next) {
  if (this.statut === 'Occupe' && !this.dateOccupation) {
    this.dateOccupation = new Date();
  } else if (this.statut === 'Disponible') {
    this.boutique = null;
    this.dateOccupation = null;
  }
  next();
});

// Méthode pour calculer le prix au m²
espaceSchema.methods.getPrixParM2 = function() {
  return this.surface > 0 ? (this.loyer / this.surface).toFixed(2) : 0;
};

// Méthode pour vérifier la disponibilité
espaceSchema.methods.isDisponible = function() {
  return this.statut === 'Disponible' && this.isActive;
};

// Méthode statique pour rechercher des espaces
espaceSchema.statics.rechercherEspaces = function(criteres = {}) {
  const query = { isActive: true };
  
  if (criteres.etage !== undefined) query.etage = criteres.etage;
  if (criteres.statut) query.statut = criteres.statut;
  if (criteres.surfaceMin) query.surface = { $gte: criteres.surfaceMin };
  if (criteres.surfaceMax) {
    query.surface = query.surface || {};
    query.surface.$lte = criteres.surfaceMax;
  }
  if (criteres.loyerMax) query.loyer = { $lte: criteres.loyerMax };
  
  return this.find(query).populate('boutique', 'nom proprietaire');
};

module.exports = mongoose.model('Espace', espaceSchema);