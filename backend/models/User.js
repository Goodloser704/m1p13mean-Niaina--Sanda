const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { RoleEnum } = require('../utils/enums');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mdp: { // Renommé selon les règles de gestion
    type: String,
    required: true,
    minlength: 6
  },
  password: { // Alias pour compatibilité
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: [RoleEnum.Admin, RoleEnum.Commercant, RoleEnum.Acheteur],
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenoms: { // Renommé selon les règles de gestion
    type: String,
    required: true
  },
  prenom: { // Alias pour compatibilité
    type: String,
    required: true
  },
  telephone: String,
  photo: String, // Ajouté selon les règles de gestion
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
  try {
    // Synchroniser mdp et password
    if (this.isModified('password') && !this.isModified('mdp')) {
      this.mdp = this.password;
    } else if (this.isModified('mdp') && !this.isModified('password')) {
      this.password = this.mdp;
    }
    
    // Synchroniser prenoms et prenom
    if (this.isModified('prenom') && !this.isModified('prenoms')) {
      this.prenoms = this.prenom;
    } else if (this.isModified('prenoms') && !this.isModified('prenom')) {
      this.prenom = this.prenoms;
    }
    
    // Si aucun mot de passe n'est modifié, continuer
    if (!this.isModified('password') && !this.isModified('mdp')) {
      return next();
    }
    
    // Utiliser le mot de passe disponible
    const passwordToHash = this.password || this.mdp;
    if (!passwordToHash) {
      return next(new Error('Mot de passe requis'));
    }
    
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);
    this.password = hashedPassword;
    this.mdp = hashedPassword;
    next();
  } catch (error) {
    console.error('❌ Erreur pre-save User:', error);
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const passwordToCompare = this.password || this.mdp;
    if (!passwordToCompare) {
      console.error('❌ Aucun mot de passe trouvé pour la comparaison');
      return false;
    }
    return await bcrypt.compare(candidatePassword, passwordToCompare);
  } catch (error) {
    console.error('❌ Erreur comparaison mot de passe:', error);
    return false;
  }
};

// Méthodes pour les boutiques
userSchema.methods.isPendingBoutique = function() {
  return this.role === RoleEnum.Commercant && this.status === 'pending';
};

userSchema.methods.isApprovedBoutique = function() {
  return this.role === RoleEnum.Commercant && this.status === 'approved';
};

userSchema.methods.canLogin = function() {
  if (this.role === RoleEnum.Commercant) {
    return this.isActive && (this.status === 'approved' || this.status === 'active');
  }
  return this.isActive;
};

// Méthodes statiques
userSchema.statics.getPendingBoutiques = function() {
  return this.find({ role: RoleEnum.Commercant, status: 'pending' })
    .select('-password -mdp')
    .sort({ createdAt: -1 });
};

userSchema.statics.getApprovedBoutiques = function() {
  return this.find({ role: RoleEnum.Commercant, status: { $in: ['approved', 'active'] } })
    .select('-password -mdp')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);