const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'boutique', 'client'],
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  telephone: String,
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: { type: String, default: 'France' }
  },
  // 👤 Champs de profil personnel
  dateNaissance: Date,
  genre: {
    type: String,
    enum: ['homme', 'femme', 'autre']
  },
  // 🏪 Champs spécifiques aux propriétaires de boutique
  nomBoutique: String,
  descriptionBoutique: String,
  categorieActivite: {
    type: String,
    enum: ['mode', 'electronique', 'maison', 'beaute', 'sport', 'alimentation', 'autre']
  },
  numeroSiret: String,
  adresseBoutique: String,
  isActive: {
    type: Boolean,
    default: true
  },
  // 🏪 Champs spécifiques aux boutiques
  status: {
    type: String,
    enum: ['active', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'active'
  },
  // Validation par admin
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  // Informations boutique supplémentaires
  businessInfo: {
    siret: String,
    description: String,
    category: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour optimiser les requêtes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthodes pour les boutiques
userSchema.methods.isPendingBoutique = function() {
  return this.role === 'boutique' && this.status === 'pending';
};

userSchema.methods.isApprovedBoutique = function() {
  return this.role === 'boutique' && this.status === 'approved';
};

userSchema.methods.canLogin = function() {
  if (this.role === 'boutique') {
    return this.isActive && (this.status === 'approved' || this.status === 'active');
  }
  return this.isActive;
};

// Méthodes statiques
userSchema.statics.getPendingBoutiques = function() {
  return this.find({ role: 'boutique', status: 'pending' })
    .select('-password')
    .sort({ createdAt: -1 });
};

userSchema.statics.getApprovedBoutiques = function() {
  return this.find({ role: 'boutique', status: { $in: ['approved', 'active'] } })
    .select('-password')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);