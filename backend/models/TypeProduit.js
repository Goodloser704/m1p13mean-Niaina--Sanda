const mongoose = require('mongoose');

const typeProduitSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  icone: {
    type: String,
    trim: true,
    maxlength: 50
  },
  couleur: {
    type: String,
    trim: true,
    match: /^#[0-9A-F]{6}$/i,
    default: '#6c757d'
  },
  ordre: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
typeProduitSchema.index({ boutique: 1, type: 1 }, { unique: true }); // Un type par boutique
typeProduitSchema.index({ boutique: 1, isActive: 1, ordre: 1 });

// Méthode statique pour obtenir les types d'une boutique
typeProduitSchema.statics.obtenirTypesParBoutique = function(boutiqueId) {
  return this.find({ boutique: boutiqueId, isActive: true })
    .sort({ ordre: 1, type: 1 });
};

// Méthode pour obtenir le nombre de produits de ce type
typeProduitSchema.methods.getNombreProduits = async function() {
  const Produit = mongoose.model('Produit');
  return await Produit.countDocuments({ typeProduit: this._id, isActive: true });
};

// Méthode statique pour créer des types par défaut pour une boutique
typeProduitSchema.statics.creerTypesParDefaut = async function(boutiqueId, categorieBoutique) {
  let typesParDefaut = [];
  
  switch (categorieBoutique) {
    case 'Restaurant':
      typesParDefaut = [
        { type: 'Entrées', icone: '🥗', couleur: '#4caf50' },
        { type: 'Plats principaux', icone: '🍽️', couleur: '#ff9800' },
        { type: 'Desserts', icone: '🍰', couleur: '#e91e63' },
        { type: 'Boissons', icone: '🥤', couleur: '#2196f3' }
      ];
      break;
    case 'Vetements':
      typesParDefaut = [
        { type: 'Hauts', icone: '👕', couleur: '#9c27b0' },
        { type: 'Bas', icone: '👖', couleur: '#3f51b5' },
        { type: 'Chaussures', icone: '👟', couleur: '#795548' },
        { type: 'Accessoires', icone: '👜', couleur: '#607d8b' }
      ];
      break;
    case 'Telephonie':
      typesParDefaut = [
        { type: 'Smartphones', icone: '📱', couleur: '#2196f3' },
        { type: 'Accessoires', icone: '🔌', couleur: '#ff9800' },
        { type: 'Réparations', icone: '🔧', couleur: '#4caf50' }
      ];
      break;
    case 'Bijouterie':
      typesParDefaut = [
        { type: 'Colliers', icone: '📿', couleur: '#9c27b0' },
        { type: 'Bagues', icone: '💍', couleur: '#e91e63' },
        { type: 'Bracelets', icone: '⌚', couleur: '#ff9800' },
        { type: 'Boucles d\'oreilles', icone: '💎', couleur: '#3f51b5' }
      ];
      break;
    default:
      typesParDefaut = [
        { type: 'Produits généraux', icone: '📦', couleur: '#6c757d' }
      ];
  }
  
  for (let i = 0; i < typesParDefaut.length; i++) {
    const typeData = {
      ...typesParDefaut[i],
      boutique: boutiqueId,
      ordre: i + 1
    };
    
    await this.findOneAndUpdate(
      { boutique: boutiqueId, type: typeData.type },
      typeData,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('TypeProduit', typeProduitSchema);