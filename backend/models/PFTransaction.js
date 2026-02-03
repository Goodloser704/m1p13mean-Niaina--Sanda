const mongoose = require('mongoose');
const { TypeTransactionEnum } = require('../utils/enums');

const pfTransactionSchema = new mongoose.Schema({
  fromWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PorteFeuille',
    required: true
  },
  toWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PorteFeuille',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [TypeTransactionEnum.Achat, TypeTransactionEnum.Loyer, TypeTransactionEnum.Commission]
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01 // Montant minimum
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Références vers les entités liées
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Boutique', 'Achat', 'DemandeLocation', 'Recepisse']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // Statut de la transaction
  statut: {
    type: String,
    enum: ['EnAttente', 'Completee', 'Echouee', 'Annulee'],
    default: 'EnAttente'
  },
  // Informations de traçabilité
  numeroTransaction: {
    type: String,
    unique: true
  },
  dateExecution: {
    type: Date
  },
  // Métadonnées
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
pfTransactionSchema.index({ fromWallet: 1, createdAt: -1 });
pfTransactionSchema.index({ toWallet: 1, createdAt: -1 });
pfTransactionSchema.index({ type: 1, createdAt: -1 });
pfTransactionSchema.index({ statut: 1 });
pfTransactionSchema.index({ numeroTransaction: 1 });

// Générer un numéro de transaction unique avant la sauvegarde
pfTransactionSchema.pre('save', function(next) {
  if (!this.numeroTransaction) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.numeroTransaction = `TXN-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Méthode statique pour effectuer une transaction
pfTransactionSchema.statics.effectuerTransaction = async function(fromWalletId, toWalletId, type, amount, description, relatedEntity = null) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const PorteFeuille = mongoose.model('PorteFeuille');
    
    // Récupérer les portefeuilles
    const fromWallet = await PorteFeuille.findById(fromWalletId).session(session);
    const toWallet = await PorteFeuille.findById(toWalletId).session(session);
    
    if (!fromWallet || !toWallet) {
      throw new Error('Portefeuille non trouvé');
    }
    
    // Vérifier le solde suffisant
    if (!fromWallet.aSoldeSuffisant(amount)) {
      throw new Error('Solde insuffisant');
    }
    
    // Créer la transaction
    const transaction = new this({
      fromWallet: fromWalletId,
      toWallet: toWalletId,
      type,
      amount,
      description,
      relatedEntity,
      statut: 'EnAttente'
    });
    
    await transaction.save({ session });
    
    // Effectuer les transferts
    await fromWallet.debiter(amount, `${type} - ${description}`);
    await toWallet.crediter(amount, `${type} - ${description}`);
    
    // Marquer la transaction comme complétée
    transaction.statut = 'Completee';
    transaction.dateExecution = new Date();
    await transaction.save({ session });
    
    await session.commitTransaction();
    
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Méthode statique pour obtenir l'historique d'un portefeuille
pfTransactionSchema.statics.obtenirHistorique = function(walletId, options = {}) {
  const { page = 1, limit = 20, type = null } = options;
  
  const query = {
    $or: [
      { fromWallet: walletId },
      { toWallet: walletId }
    ],
    statut: 'Completee'
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('fromWallet', 'owner')
    .populate('toWallet', 'owner')
    .populate('fromWallet.owner', 'nom prenoms email')
    .populate('toWallet.owner', 'nom prenoms email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Méthode pour obtenir le type de transaction pour un portefeuille donné
pfTransactionSchema.methods.getTypeForWallet = function(walletId) {
  if (this.fromWallet.toString() === walletId.toString()) {
    return 'Sortie';
  } else if (this.toWallet.toString() === walletId.toString()) {
    return 'Entrée';
  }
  return 'Inconnue';
};

module.exports = mongoose.model('PFTransaction', pfTransactionSchema);