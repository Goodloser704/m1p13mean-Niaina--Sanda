const mongoose = require('mongoose');

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
    default: 0,
    min: 0 // La balance ne peut pas être négative
  },
  // Informations supplémentaires pour le suivi
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Historique des modifications de balance (pour audit)
  historiqueBalance: [{
    ancienneBalance: Number,
    nouvelleBalance: Number,
    difference: Number,
    raison: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
porteFeuilleSchema.index({ owner: 1 });
porteFeuilleSchema.index({ isActive: 1 });

// Middleware pre-save pour mettre à jour la dernière modification
porteFeuilleSchema.pre('save', function(next) {
  if (this.isModified('balance')) {
    this.derniereMiseAJour = new Date();
  }
  next();
});

// Méthode pour ajouter de l'argent
porteFeuilleSchema.methods.crediter = function(montant, raison = 'Crédit') {
  const ancienneBalance = this.balance;
  this.balance += montant;
  
  // Ajouter à l'historique
  this.historiqueBalance.push({
    ancienneBalance,
    nouvelleBalance: this.balance,
    difference: montant,
    raison
  });
  
  return this.save();
};

// Méthode pour retirer de l'argent
porteFeuilleSchema.methods.debiter = function(montant, raison = 'Débit') {
  if (this.balance < montant) {
    throw new Error('Solde insuffisant');
  }
  
  const ancienneBalance = this.balance;
  this.balance -= montant;
  
  // Ajouter à l'historique
  this.historiqueBalance.push({
    ancienneBalance,
    nouvelleBalance: this.balance,
    difference: -montant,
    raison
  });
  
  return this.save();
};

// Méthode pour vérifier si le solde est suffisant
porteFeuilleSchema.methods.aSoldeSuffisant = function(montant) {
  return this.balance >= montant;
};

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
  return this.findOne({ owner: userId, isActive: true }).populate('owner', 'nom prenoms email role');
};

module.exports = mongoose.model('PorteFeuille', porteFeuilleSchema);