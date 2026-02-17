const mongoose = require('mongoose');

/**
 * 🧪 Modèle TestItem
 * Modèle simple pour tester le workflow de développement
 */
const testItemSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'archive'],
    default: 'actif'
  },
  valeur: {
    type: Number,
    default: 0,
    min: 0

  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  notes: [{
    type: Number,
    min: 1,
    max: 5
  }],
  noteMoyenne: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  priorité:{
     type:String,
     enum:['🟢','🟡','🔴','🔥'],
  },
  historique: [{
    date: {
      type: Date,
      default: Date.now
    },
    champsModifies: [String],
    anciennesValeurs: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
testItemSchema.index({ createur: 1, statut: 1 });
testItemSchema.index({ titre: 'text', description: 'text' });

// Méthode pour activer/désactiver
testItemSchema.methods.toggleStatut = function() {
  this.statut = this.statut === 'actif' ? 'inactif' : 'actif';
  return this.save();
};

// Méthode statique pour obtenir les stats
testItemSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { createur: mongoose.mongo.ObjectId.createFromHexString(userId) } },
    {
      $group: {
        _id: '$statut',
        count: { $sum: 1 },
        totalValeur: { $sum: '$valeur' }
      }
    }
  ]);
  
  return stats;
};

testItemSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    // 1. Convertir tous les tags en minuscules
    const tagsMinuscules = this.tags.map(tag => tag.toLowerCase());
    
    // 2. Enlever les doublons avec Set
    const tagsUniques = [...new Set(tagsMinuscules)];
    
    // 3. Remplacer les tags
    this.tags = tagsUniques;
    
    console.log(`🏷️ Tags nettoyés: ${this.tags.join(', ')}`);
  }
  
  // 📜 Historique: Sauvegarder les modifications
  if (!this.isNew && this.isModified()) {
    const modifiedFields = this.modifiedPaths();
    
    // Ignorer certains champs automatiques
    const fieldsToIgnore = ['updatedAt', 'historique', '__v'];
    const relevantFields = modifiedFields.filter(field => !fieldsToIgnore.includes(field));
    
    if (relevantFields.length > 0) {
      const anciennesValeurs = new Map();
      
      // Sauvegarder les anciennes valeurs
      relevantFields.forEach(field => {
        // Récupérer la valeur originale depuis la base de données
        const oldValue = this._doc[field];
        anciennesValeurs.set(field, oldValue);
      });
      
      // Ajouter à l'historique
      this.historique.push({
        date: new Date(),
        champsModifies: relevantFields,
        anciennesValeurs: anciennesValeurs
      });
      
      console.log(`📜 Historique ajouté: ${relevantFields.join(', ')}`);
    }
  }
  
  next();
});

module.exports = mongoose.model('TestItem', testItemSchema);
