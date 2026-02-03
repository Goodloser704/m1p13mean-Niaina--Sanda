const mongoose = require('mongoose');

const etageSchema = new mongoose.Schema({
  niveau: { // Selon les règles de gestion
    type: Number,
    required: true,
    unique: true,
    min: -2, // Sous-sols possibles
    max: 10  // Limite raisonnable
  },
  numero: { // Alias pour compatibilité
    type: Number,
    required: true,
    unique: true,
    min: -2, // Sous-sols possibles
    max: 10  // Limite raisonnable
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

// Middleware pre-save pour synchroniser niveau et numero
etageSchema.pre('save', function(next) {
  if (this.isModified('niveau') && !this.isModified('numero')) {
    this.numero = this.niveau;
  } else if (this.isModified('numero') && !this.isModified('niveau')) {
    this.niveau = this.numero;
  }
  next();
});

// Méthode pour obtenir le nombre d'espaces par étage
etageSchema.methods.getNombreEspaces = async function() {
  const Espace = mongoose.model('Espace');
  return await Espace.countDocuments({ etage: this._id });
};

// Méthode pour obtenir les espaces disponibles
etageSchema.methods.getEspacesDisponibles = async function() {
  const Espace = mongoose.model('Espace');
  return await Espace.countDocuments({ 
    etage: this._id, 
    statut: 'Disponible' 
  });
};

module.exports = mongoose.model('Etage', etageSchema);