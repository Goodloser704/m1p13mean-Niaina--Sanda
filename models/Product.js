const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  description: String,
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  prixPromo: {
    type: Number,
    min: 0
  },
  categorie: {
    type: String,
    required: true
  },
  sousCategorie: String,
  images: [String],
  stock: {
    quantite: { type: Number, default: 0 },
    seuil: { type: Number, default: 5 }
  },
  caracteristiques: {
    taille: [String],
    couleur: [String],
    marque: String,
    autres: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index pour la recherche
productSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);