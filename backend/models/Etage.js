const mongoose = require('mongoose');

const etageSchema = new mongoose.Schema({
  numero: { // Champ principal
    type: Number,
    required: true,
    unique: true,
    min: -2, // Sous-sols possibles
    max: 50  // Limite augmentée pour les tests
  },
  niveau: { // Alias pour compatibilité - optionnel
    type: Number,
    unique: true,
    sparse: true, // Permet les valeurs null/undefined
    min: -2,
    max: 50
  },
  nom: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
etageSchema.index({ niveau: 1 });
etageSchema.index({ numero: 1 }); // Alias
etageSchema.index({ isActive: 1 });

// Middleware pre-save pour synchroniser numero et niveau
etageSchema.pre('save', function(next) {
  // Si numero est fourni mais pas niveau, copier numero vers niveau
  if (this.numero !== undefined && this.niveau === undefined) {
    this.niveau = this.numero;
  }
  // Si niveau est fourni mais pas numero, copier niveau vers numero
  else if (this.niveau !== undefined && this.numero === undefined) {
    this.numero = this.niveau;
  }
  next();
});

// Méthode pour obtenir le nombre d'espaces par étage
etageSchema.methods.getNombreEspaces = async function() {
  const Espace = mongoose.model('Espace');
  return await Espace.countDocuments({ 
    etage: this._id,
    isActive: true 
  });
};

// Méthode pour obtenir les espaces disponibles
etageSchema.methods.getEspacesDisponibles = async function() {
  const Espace = mongoose.model('Espace');
  return await Espace.countDocuments({ 
    etage: this._id,
    isActive: true,
    statut: 'Disponible' 
  });
};

module.exports = mongoose.model('Etage', etageSchema);