const mongoose = require('mongoose');

/**
 * 📦 Modèle Produit - CONFORME AUX SPÉCIFICATIONS
 * Selon note/Models-de-données_version_copiable.txt
 */

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
    // Optional selon spécifications
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
    // Format "hh:mm:ss" ou null selon spécifications
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    default: null
  },
  stock: {
    nombreDispo: {
      type: Number,
      required: true,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour optimiser les requêtes
produitSchema.index({ boutique: 1 });
produitSchema.index({ typeProduit: 1 });
produitSchema.index({ nom: 'text', description: 'text' });

// Middleware pre-save pour mettre à jour le stock
produitSchema.pre('save', function(next) {
  if (this.isModified('stock.nombreDispo')) {
    this.stock.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Produit', produitSchema);