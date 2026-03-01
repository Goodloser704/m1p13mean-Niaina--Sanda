const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  description: String,
  categorie: {
    type: String,
    enum: ['Mode', 'Électronique', 'Alimentation', 'Beauté', 'Sport', 'Maison', 'Autre'],
    required: true
  },
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
  statut: {
    type: String,
    enum: ['en_attente', 'approuve', 'suspendu'],
    default: 'en_attente'
  },
  note: {
    moyenne: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 }
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Boutique', boutiqueSchema);