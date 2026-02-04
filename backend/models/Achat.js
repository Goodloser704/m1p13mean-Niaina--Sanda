const mongoose = require('mongoose');
const { TypeAchatEnum, EtatAchatEnum } = require('../utils/enums');

/**
 * 🛒 Modèle Achat - CONFORME AUX SPÉCIFICATIONS
 * Selon note/Models-de-données_version_copiable.txt
 */

const achatSchema = new mongoose.Schema({
  acheteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  facture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture',
    required: true
  },
  typeAchat: {
    type: {
      type: String,
      required: true,
      enum: [TypeAchatEnum.Recuperer, TypeAchatEnum.Livrer]
    },
    dateDebut: {
      type: Date,
      required: true,
      default: Date.now
    },
    dateFin: {
      type: Date,
      required: true
    }
  },
  etat: {
    type: String,
    required: true,
    enum: [EtatAchatEnum.EnAttente, EtatAchatEnum.Validee],
    default: EtatAchatEnum.EnAttente
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour optimiser les requêtes
achatSchema.index({ acheteur: 1, createdAt: -1 });
achatSchema.index({ produit: 1 });
achatSchema.index({ facture: 1 });
achatSchema.index({ etat: 1, 'typeAchat.type': 1 });

// Middleware pre-save pour calculer la dateFin selon le type d'achat
achatSchema.pre('save', async function(next) {
  try {
    // Calculer la dateFin selon le type d'achat
    if (this.isNew || this.isModified('typeAchat')) {
      if (this.typeAchat.type === TypeAchatEnum.Recuperer) {
        // Pour récupération: dateFin = dateDebut + tempsPreparation
        const Produit = mongoose.model('Produit');
        const produit = await Produit.findById(this.produit);
        
        if (produit && produit.tempsPreparation && produit.tempsPreparation !== null) {
          // Convertir tempsPreparation (hh:mm:ss) en millisecondes
          const [heures, minutes, secondes] = produit.tempsPreparation.split(':').map(Number);
          const tempsMs = (heures * 3600 + minutes * 60 + secondes) * 1000;
          this.typeAchat.dateFin = new Date(this.typeAchat.dateDebut.getTime() + tempsMs);
        } else {
          // Disponible de suite si tempsPreparation = null
          this.typeAchat.dateFin = this.typeAchat.dateDebut;
        }
      } else if (this.typeAchat.type === TypeAchatEnum.Livrer) {
        // Pour livraison: dateFin sera calculée quand le commerçant saisit la durée
        // En attendant, on met la même date que dateDebut
        this.typeAchat.dateFin = this.typeAchat.dateDebut;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Achat', achatSchema);