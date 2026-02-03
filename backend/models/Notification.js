const mongoose = require('mongoose');
const { TypeNotificationEnum } = require('../utils/enums');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [TypeNotificationEnum.Paiement, TypeNotificationEnum.Achat, TypeNotificationEnum.Vente]
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  receveur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estLu: {
    type: Boolean,
    required: true,
    default: false
  },
  urlRoute: {
    type: String
  },
  // Champs supplémentaires pour compatibilité avec l'ancien système
  title: {
    type: String,
    maxlength: 200
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipientRole: {
    type: String,
    enum: ['admin', 'boutique', 'client']
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['User', 'Boutique', 'Order', 'Product', 'Achat', 'DemandeLocation']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionType: {
    type: String,
    enum: ['approve_boutique', 'review_order', 'verify_payment', 'approve_location', 'none'],
    default: 'none'
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
notificationSchema.index({ receveur: 1, estLu: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // Compatibilité
notificationSchema.index({ recipientRole: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware pre-save pour synchroniser les champs
notificationSchema.pre('save', function(next) {
  // Synchroniser receveur et recipient
  if (this.isModified('receveur') && !this.isModified('recipient')) {
    this.recipient = this.receveur;
  } else if (this.isModified('recipient') && !this.isModified('receveur')) {
    this.receveur = this.recipient;
  }
  
  // Synchroniser estLu et isRead
  if (this.isModified('estLu') && !this.isModified('isRead')) {
    this.isRead = this.estLu;
  } else if (this.isModified('isRead') && !this.isModified('estLu')) {
    this.estLu = this.isRead;
  }
  
  // Générer title si pas présent
  if (!this.title && this.message) {
    this.title = this.message.substring(0, 50) + (this.message.length > 50 ? '...' : '');
  }
  
  next();
});

// Méthodes du modèle
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.estLu = true;
  return this.save();
};

notificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Méthodes statiques
notificationSchema.statics.createBoutiqueRegistrationNotification = async function(boutiqueUser, adminUsers) {
  const notifications = adminUsers.map(admin => ({
    type: 'boutique_registration',
    title: '🏪 Nouvelle demande d\'inscription boutique',
    message: `${boutiqueUser.prenom} ${boutiqueUser.nom} (${boutiqueUser.email}) souhaite ouvrir une boutique et attend votre validation.`,
    recipient: admin._id,
    recipientRole: 'admin',
    relatedEntity: {
      entityType: 'User',
      entityId: boutiqueUser._id
    },
    data: {
      boutiqueEmail: boutiqueUser.email,
      boutiqueName: `${boutiqueUser.prenom} ${boutiqueUser.nom}`,
      registrationDate: new Date()
    },
    priority: 'high',
    actionRequired: true,
    actionType: 'approve_boutique',
    actionUrl: `/admin/boutiques/pending/${boutiqueUser._id}`
  }));

  return await this.insertMany(notifications);
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false, isArchived: false });
};

notificationSchema.statics.getByRecipient = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    includeRead = true,
    includeArchived = false,
    type = null
  } = options;

  const query = {
    recipient: userId,
    isArchived: includeArchived
  };

  if (!includeRead) {
    query.isRead = false;
  }

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .populate('relatedEntity.entityId')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Notification', notificationSchema);