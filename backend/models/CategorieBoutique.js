const mongoose = require('mongoose');

const categorieBoutiqueSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  categorie: { // Alias pour compatibilité
    type: String,
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
categorieBoutiqueSchema.index({ nom: 1 });
categorieBoutiqueSchema.index({ categorie: 1 });
categorieBoutiqueSchema.index({ isActive: 1, ordre: 1 });

// Synchroniser nom et categorie
categorieBoutiqueSchema.pre('save', function(next) {
  if (this.isModified('nom') && !this.isModified('categorie')) {
    this.categorie = this.nom;
  } else if (this.isModified('categorie') && !this.isModified('nom')) {
    this.nom = this.categorie;
  }
  next();
});

// Méthode statique pour obtenir toutes les catégories actives
categorieBoutiqueSchema.statics.obtenirCategoriesActives = function() {
  return this.find({ isActive: true }).sort({ ordre: 1, nom: 1 });
};

// Méthode statique pour créer les catégories par défaut
categorieBoutiqueSchema.statics.creerCategoriesParDefaut = async function() {
  const categoriesParDefaut = [
    { nom: 'Vêtements', description: 'Mode et vêtements', icone: '👗', couleur: '#e91e63', ordre: 1 },
    { nom: 'Téléphonie', description: 'Téléphones et accessoires', icone: '📱', couleur: '#2196f3', ordre: 2 },
    { nom: 'Restaurant', description: 'Restauration et alimentation', icone: '🍕', couleur: '#ff9800', ordre: 3 },
    { nom: 'Bijouterie', description: 'Bijoux et accessoires', icone: '💎', couleur: '#9c27b0', ordre: 4 },
    { nom: 'Autres', description: 'Autres commerces', icone: '🏪', couleur: '#6c757d', ordre: 5 }
  ];
  
  for (const cat of categoriesParDefaut) {
    await this.findOneAndUpdate(
      { nom: cat.nom },
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