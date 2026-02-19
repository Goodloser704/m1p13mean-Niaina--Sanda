const mongoose = require('mongoose');

const etageSchema = new mongoose.Schema({
  niveau: { // Champ principal selon spécifications
    type: Number,
    required: true,
    unique: true,
    min: -2, // Sous-sols possibles
    max: 50  // Limite augmentée pour les tests
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
etageSchema.index({ isActive: 1 });

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