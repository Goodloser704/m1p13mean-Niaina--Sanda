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
    required: false, // Rendu optionnel car synchronisé avec password
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
    required: false // Rendu optionnel car synchronisé avec prenom
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

// Synchronisation des champs avant validation
userSchema.pre('validate', function(next) {
  console.log('🔧 [USER-MODEL] === DEBUT pre(validate) - Synchronisation ===');
  
  // Synchroniser mdp et password
  if (this.password && !this.mdp) {
    console.log('🔧 [USER-MODEL] Copie password -> mdp (pre-validate)');
    this.mdp = this.password;
  } else if (this.mdp && !this.password) {
    console.log('🔧 [USER-MODEL] Copie mdp -> password (pre-validate)');
    this.password = this.mdp;
  }
  
  // Synchroniser prenoms et prenom
  if (this.prenom && !this.prenoms) {
    console.log('🔧 [USER-MODEL] Copie prenom -> prenoms (pre-validate)');
    this.prenoms = this.prenom;
  } else if (this.prenoms && !this.prenom) {
    console.log('🔧 [USER-MODEL] Copie prenoms -> prenom (pre-validate)');
    this.prenom = this.prenoms;
  }
  
  console.log('✅ [USER-MODEL] === FIN pre(validate) ===');
  next();
});

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  try {
    console.log('🔧 [USER-MODEL] === DEBUT pre(save) ===');
    console.log('🔧 [USER-MODEL] Document avant traitement:', {
      email: this.email,
      nom: this.nom,
      prenom: this.prenom,
      prenoms: this.prenoms,
      role: this.role,
      hasPassword: !!this.password,
      hasMdp: !!this.mdp,
      isModifiedPassword: this.isModified('password'),
      isModifiedMdp: this.isModified('mdp'),
      isModifiedPrenom: this.isModified('prenom'),
      isModifiedPrenoms: this.isModified('prenoms')
    });
    
    console.log('🔧 [USER-MODEL] Étape 1: Synchronisation mdp et password');
    // Synchroniser mdp et password
    if (this.isModified('password') && !this.isModified('mdp')) {
      console.log('🔧 [USER-MODEL] Copie password -> mdp');
      this.mdp = this.password;
    } else if (this.isModified('mdp') && !this.isModified('password')) {
      console.log('🔧 [USER-MODEL] Copie mdp -> password');
      this.password = this.mdp;
    }
    
    console.log('🔧 [USER-MODEL] Étape 2: Synchronisation prenoms et prenom');
    // Synchroniser prenoms et prenom
    if (this.isModified('prenom') && !this.isModified('prenoms')) {
      console.log('🔧 [USER-MODEL] Copie prenom -> prenoms');
      this.prenoms = this.prenom;
    } else if (this.isModified('prenoms') && !this.isModified('prenom')) {
      console.log('🔧 [USER-MODEL] Copie prenoms -> prenom');
      this.prenom = this.prenoms;
    }
    
    console.log('🔧 [USER-MODEL] Étape 3: Vérification besoin de hachage');
    // Si aucun mot de passe n'est modifié, continuer
    if (!this.isModified('password') && !this.isModified('mdp')) {
      console.log('✅ [USER-MODEL] Aucun mot de passe modifié - skip hachage');
      return next();
    }
    
    console.log('🔧 [USER-MODEL] Étape 4: Hachage du mot de passe');
    // Utiliser le mot de passe disponible
    const passwordToHash = this.password || this.mdp;
    if (!passwordToHash) {
      console.error('❌ [USER-MODEL] Aucun mot de passe à hacher');
      return next(new Error('Mot de passe requis'));
    }
    
    console.log('🔧 [USER-MODEL] Hachage en cours...');
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);
    console.log('✅ [USER-MODEL] Mot de passe haché avec succès');
    
    this.password = hashedPassword;
    this.mdp = hashedPassword;
    
    console.log('✅ [USER-MODEL] === FIN pre(save) RÉUSSI ===');
    next();
  } catch (error) {
    console.error('❌ [USER-MODEL] === ERREUR pre(save) ===');
    console.error('❌ [USER-MODEL] Message:', error.message);
    console.error('❌ [USER-MODEL] Name:', error.name);
    console.error('❌ [USER-MODEL] Stack:', error.stack);
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔧 [USER-MODEL] comparePassword appelé');
    const passwordToCompare = this.password || this.mdp;
    if (!passwordToCompare) {
      console.error('❌ [USER-MODEL] Aucun mot de passe trouvé pour la comparaison');
      return false;
    }
    console.log('✅ [USER-MODEL] Comparaison mot de passe en cours');
    const result = await bcrypt.compare(candidatePassword, passwordToCompare);
    console.log('✅ [USER-MODEL] Comparaison terminée:', result ? 'MATCH' : 'NO MATCH');
    return result;
  } catch (error) {
    console.error('❌ [USER-MODEL] Erreur comparaison mot de passe:', error);
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