const mongoose = require('mongoose');
const { StatutBoutiqueEnum, JourSemaineEnum } = require('../utils/enums');

const boutiqueSchema = new mongoose.Schema({
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
  commercant: { // Renommé selon les règles de gestion
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proprietaire: { // Alias pour compatibilité
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
    enum: [StatutBoutiqueEnum.Actif, StatutBoutiqueEnum.Inactif, StatutBoutiqueEnum.EnAttente],
    default: StatutBoutiqueEnum.EnAttente
  },
  statut: { // Alias pour compatibilité avec le code existant
    type: String,
    enum: ['en_attente', 'approuve', 'suspendu'],
    default: 'en_attente'
  },
  photo: {
    type: String,
    trim: true
  },
  espace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Espace'
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
  }],
  // Informations de contact et emplacement (pour compatibilité)
  emplacement: {
    zone: String,
    numeroLocal: String,
    etage: Number
  },
  contact: {
    telephone: String,
    email: String,
    siteWeb: String
  },
  horaires: {
    lundi: { ouverture: String, fermeture: String },
    mardi: { ouverture: String, fermeture: String },
    mercredi: { ouverture: String, fermeture: String },
    jeudi: { ouverture: String, fermeture: String },
    vendredi: { ouverture: String, fermeture: String },
    samedi: { ouverture: String, fermeture: String },
    dimanche: { ouverture: String, fermeture: String }
  },
  images: [String],
  logo: String,
  note: {
    moyenne: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 }
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
boutiqueSchema.index({ commercant: 1 });
boutiqueSchema.index({ proprietaire: 1 }); // Alias
boutiqueSchema.index({ statutBoutique: 1 });
boutiqueSchema.index({ statut: 1 }); // Alias
boutiqueSchema.index({ categorie: 1 });
boutiqueSchema.index({ espace: 1 });

// Validation des contraintes logiques
boutiqueSchema.pre('save', function(next) {
  // Synchroniser commercant et proprietaire
  if (this.isModified('commercant') && !this.isModified('proprietaire')) {
    this.proprietaire = this.commercant;
  } else if (this.isModified('proprietaire') && !this.isModified('commercant')) {
    this.commercant = this.proprietaire;
  }
  
  // Synchroniser statutBoutique et statut
  if (this.isModified('statutBoutique') && !this.isModified('statut')) {
    const mapping = {
      [StatutBoutiqueEnum.Actif]: 'approuve',
      [StatutBoutiqueEnum.Inactif]: 'suspendu',
      [StatutBoutiqueEnum.EnAttente]: 'en_attente'
    };
    this.statut = mapping[this.statutBoutique] || 'en_attente';
  }
  
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

// Méthode pour vérifier si la boutique est ouverte maintenant
boutiqueSchema.methods.estOuverte = function() {
  const maintenant = new Date();
  const jourActuel = maintenant.toLocaleDateString('fr-FR', { weekday: 'long' });
  const heureActuelle = maintenant.toTimeString().slice(0, 5); // HH:MM
  
  // Mapper le jour français vers l'enum
  const mappingJours = {
    'lundi': JourSemaineEnum.Lundi,
    'mardi': JourSemaineEnum.Mardi,
    'mercredi': JourSemaineEnum.Mercredi,
    'jeudi': JourSemaineEnum.Jeudi,
    'vendredi': JourSemaineEnum.Vendredi,
    'samedi': JourSemaineEnum.Samedi,
    'dimanche': JourSemaineEnum.Dimanche
  };
  
  const jourEnum = mappingJours[jourActuel.toLowerCase()];
  const horaireAujourdhui = this.horairesHebdo.find(h => h.jour === jourEnum);
  
  if (!horaireAujourdhui) {
    return false; // Fermé si pas d'horaire défini
  }
  
  return heureActuelle >= horaireAujourdhui.debut && heureActuelle <= horaireAujourdhui.fin;
};

// Méthode pour fermer la boutique (libérer l'espace)
boutiqueSchema.methods.fermer = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Changer le statut
    this.statutBoutique = StatutBoutiqueEnum.Inactif;
    this.statut = 'suspendu';
    
    // Libérer l'espace si occupé
    if (this.espace) {
      const Espace = mongoose.model('Espace');
      await Espace.findByIdAndUpdate(
        this.espace,
        {
          statut: 'Disponible',
          boutique: null,
          dateOccupation: null
        },
        { session }
      );
      
      this.espace = null;
    }
    
    await this.save({ session });
    await session.commitTransaction();
    
    return this;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Boutique', boutiqueSchema);