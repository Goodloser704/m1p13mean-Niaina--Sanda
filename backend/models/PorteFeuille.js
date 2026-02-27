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

// Méthode d'instance pour créditer le portefeuille
porteFeuilleSchema.methods.crediter = async function(montant, description = 'Crédit') {
  if (montant <= 0) {
    throw new Error('Le montant doit être positif');
  }
  
  this.balance += montant;
  this.derniereMiseAJour = new Date();
  await this.save();
  
  // Créer une transaction
  const PFTransaction = mongoose.model('PFTransaction');
  await PFTransaction.create({
    type: 'Recharge',
    amount: montant,
    description,
    toWallet: this._id,
    statut: 'Completee'
  });
  
  return this;
};

// Méthode d'instance pour débiter le portefeuille
porteFeuilleSchema.methods.debiter = async function(montant, description = 'Débit') {
  if (montant <= 0) {
    throw new Error('Le montant doit être positif');
  }
  
  if (this.balance < montant) {
    throw new Error('Solde insuffisant');
  }
  
  this.balance -= montant;
  this.derniereMiseAJour = new Date();
  await this.save();
  
  // Créer une transaction
  const PFTransaction = mongoose.model('PFTransaction');
  await PFTransaction.create({
    type: 'Retrait',
    amount: montant,
    description,
    fromWallet: this._id,
    statut: 'Completee'
  });
  
  return this;
};

module.exports = mongoose.model('PorteFeuille', porteFeuilleSchema);