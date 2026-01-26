const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  produits: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    prix: {
      type: Number,
      required: true
    },
    options: {
      taille: String,
      couleur: String
    }
  }],
  montantTotal: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirme', 'prepare', 'pret', 'livre', 'annule'],
    default: 'en_attente'
  },
  modePaiement: {
    type: String,
    enum: ['carte', 'especes', 'cheque', 'virement'],
    required: true
  },
  adresseLivraison: {
    nom: String,
    rue: String,
    ville: String,
    codePostal: String,
    telephone: String
  },
  notes: String,
  dateCommande: {
    type: Date,
    default: Date.now
  },
  dateLivraison: Date
});

module.exports = mongoose.model('Order', orderSchema);