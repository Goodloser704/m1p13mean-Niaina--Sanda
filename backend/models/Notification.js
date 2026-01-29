const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['boutique_registration', 'boutique_approved', 'boutique_rejected', 'order_placed', 'payment_received', 'system_alert']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRole: {
    type: String,
    required: true,
    enum: ['admin', 'boutique', 'client']
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['User', 'Boutique', 'Order', 'Product']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Données supplémentaires flexibles
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
    enum: ['approve_boutique', 'review_order', 'verify_payment', 'none'],
    default: 'none'
  },
  actionUrl: {
    type: String // URL pour l'action à effectuer
  },
  expiresAt: {
    type: Date // Pour les notifications temporaires
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes du modèle
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
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