const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { RoleEnum } = require('../utils/enums');

/**
 * 👤 Modèle Utilisateur - CONFORME AUX SPÉCIFICATIONS
 * Selon note/Models-de-données_version_copiable.txt
 */

const userSchema = new mongoose.Schema({
  // Champs OBLIGATOIRES selon spécifications
  nom: {
    type: String,
    required: true,
    trim: true
  },
  
  prenoms: { // Selon spécification (pluriel)
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  telephone: {
    type: String,
    // Optional selon spécifications
  },
  
  mdp: { // Selon spécification (pas "password")
    type: String,
    required: true,
    minlength: 6
  },
  
  photo: {
    type: String
    // Optional selon spécifications
  },
  
  role: {
    type: String,
    required: true,
    enum: [RoleEnum.Admin, RoleEnum.Commercant, RoleEnum.Acheteur]
  },
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour les recherches
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mdp a été modifié
  if (!this.isModified('mdp')) return next();
  
  try {
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    this.mdp = await bcrypt.hash(this.mdp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.mdp);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

// Méthode pour obtenir les informations publiques
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.mdp;
  return user;
};

module.exports = mongoose.model('User', userSchema);