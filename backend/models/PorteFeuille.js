const mongoose = require('mongoose');

/**
 * 💰 Modèle PorteFeuille - CONFORME AUX SPÉCIFICATIONS
 * Selon note/Models-de-données_version_copiable.txt
 */

const porteFeuilleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un seul portefeuille par utilisateur
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour optimiser les requêtes
porteFeuilleSchema.index({ owner: 1 });

// Méthode statique pour créer un portefeuille pour un utilisateur
porteFeuilleSchema.statics.creerPourUtilisateur = async function(userId, balanceInitiale = 0) {
  const portefeuille = new this({
    owner: userId,
    balance: balanceInitiale
  });
  
  return await portefeuille.save();
};

// Méthode statique pour obtenir le portefeuille d'un utilisateur
porteFeuilleSchema.statics.obtenirParUtilisateur = function(userId) {
  return this.findOne({ owner: userId }).populate('owner', 'nom prenoms email role');
};

module.exports = mongoose.model('PorteFeuille', porteFeuilleSchema);