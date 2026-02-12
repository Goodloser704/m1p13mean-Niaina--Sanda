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
    default: 0
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
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

module.exports = mongoose.model('TestItem', testItemSchema);
