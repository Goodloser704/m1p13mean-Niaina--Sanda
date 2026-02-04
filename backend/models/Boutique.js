const mongoose = require('mongoose');
const { StatutBoutiqueEnum, JourSemaineEnum } = require('../utils/enums');

/**
 * 🏪 Modèle Boutique - CONFORME AUX SPÉCIFICATIONS
 * Selon note/Models-de-données_version_copiable.txt
 */

const boutiqueSchema = new mongoose.Schema({
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
  commercant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategorieBoutique',
    required: true
  },
  statutBoutique: {
    type: String,
    required: true,
    enum: [StatutBoutiqueEnum.Actif, StatutBoutiqueEnum.Inactif],
    default: StatutBoutiqueEnum.Inactif
  },
  photo: {
    type: String
    // Optional selon spécifications
  },
  espace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Espace'
    // Optional selon spécifications
  },
  horairesHebdo: [{
    jour: {
      type: String,
      required: true,
      enum: [
        JourSemaineEnum.Lundi, JourSemaineEnum.Mardi, JourSemaineEnum.Mercredi,
        JourSemaineEnum.Jeudi, JourSemaineEnum.Vendredi, JourSemaineEnum.Samedi,
        JourSemaineEnum.Dimanche
      ]
    },
    debut: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:MM
    },
    fin: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:MM
    }
  }]
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour optimiser les requêtes
boutiqueSchema.index({ commercant: 1 });
boutiqueSchema.index({ statutBoutique: 1 });
boutiqueSchema.index({ categorie: 1 });
boutiqueSchema.index({ espace: 1 });

// Validation des contraintes logiques selon spécifications
boutiqueSchema.pre('save', function(next) {
  // Validation des horaires hebdomadaires
  if (this.horairesHebdo && this.horairesHebdo.length > 0) {
    // Maximum 7 horaires
    if (this.horairesHebdo.length > 7) {
      return next(new Error('Maximum 7 horaires autorisés'));
    }
    
    // Jours uniques
    const jours = this.horairesHebdo.map(h => h.jour);
    const joursUniques = [...new Set(jours)];
    if (jours.length !== joursUniques.length) {
      return next(new Error('Chaque jour ne peut apparaître qu\'une seule fois'));
    }
    
    // Validation debut < fin
    for (const horaire of this.horairesHebdo) {
      if (horaire.debut >= horaire.fin) {
        return next(new Error(`L'heure de début (${horaire.debut}) doit être antérieure à l'heure de fin (${horaire.fin}) pour ${horaire.jour}`));
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('Boutique', boutiqueSchema);