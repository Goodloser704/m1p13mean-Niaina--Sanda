const mongoose = require('mongoose');

const centreCommercialSchema = new mongoose.Schema({
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
  adresse: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  telephone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  photo: {
    type: String,
    trim: true
  },
  // Informations supplémentaires
  horairesGeneraux: {
    lundi: { ouverture: String, fermeture: String },
    mardi: { ouverture: String, fermeture: String },
    mercredi: { ouverture: String, fermeture: String },
    jeudi: { ouverture: String, fermeture: String },
    vendredi: { ouverture: String, fermeture: String },
    samedi: { ouverture: String, fermeture: String },
    dimanche: { ouverture: String, fermeture: String }
  },
  siteWeb: {
    type: String,
    trim: true
  },
  reseauxSociaux: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
centreCommercialSchema.index({ nom: 1 });
centreCommercialSchema.index({ isActive: 1 });

// Méthode pour obtenir les informations de base
centreCommercialSchema.methods.getInfosDeBase = function() {
  return {
    nom: this.nom,
    description: this.description,
    adresse: this.adresse,
    email: this.email,
    telephone: this.telephone
  };
};

// Méthode statique pour obtenir le centre commercial principal
centreCommercialSchema.statics.getPrincipal = function() {
  return this.findOne({ isActive: true }).sort({ createdAt: 1 });
};

module.exports = mongoose.model('CentreCommercial', centreCommercialSchema);