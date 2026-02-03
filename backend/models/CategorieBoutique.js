const mongoose = require('mongoose');

const categorieBoutiqueSchema = new mongoose.Schema({
  categorie: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
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
    match: /^#[0-9A-F]{6}$/i, // Format hexadécimal
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
categorieBoutiqueSchema.index({ categorie: 1 });
categorieBoutiqueSchema.index({ isActive: 1, ordre: 1 });

// Méthode statique pour obtenir toutes les catégories actives
categorieBoutiqueSchema.statics.obtenirCategoriesActives = function() {
  return this.find({ isActive: true }).sort({ ordre: 1, categorie: 1 });
};

// Méthode statique pour créer les catégories par défaut
categorieBoutiqueSchema.statics.creerCategoriesParDefaut = async function() {
  const categoriesParDefaut = [
    { categorie: 'Vetements', description: 'Mode et vêtements', icone: '👗', couleur: '#e91e63', ordre: 1 },
    { categorie: 'Telephonie', description: 'Téléphones et accessoires', icone: '📱', couleur: '#2196f3', ordre: 2 },
    { categorie: 'Restaurant', description: 'Restauration et alimentation', icone: '🍕', couleur: '#ff9800', ordre: 3 },
    { categorie: 'Bijouterie', description: 'Bijoux et accessoires', icone: '💎', couleur: '#9c27b0', ordre: 4 },
    { categorie: 'Autres', description: 'Autres commerces', icone: '🏪', couleur: '#6c757d', ordre: 5 }
  ];
  
  for (const cat of categoriesParDefaut) {
    await this.findOneAndUpdate(
      { categorie: cat.categorie },
      cat,
      { upsert: true, new: true }
    );
  }
};

// Méthode pour obtenir le nombre de boutiques par catégorie
categorieBoutiqueSchema.methods.getNombreBoutiques = async function() {
  const Boutique = mongoose.model('Boutique');
  return await Boutique.countDocuments({ categorie: this._id });
};

module.exports = mongoose.model('CategorieBoutique', categorieBoutiqueSchema);