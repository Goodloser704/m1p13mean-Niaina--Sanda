const mongoose = require('mongoose');
const { EtatDemandeEnum } = require('../utils/enums');

const demandeLocationSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  espace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Espace',
    required: true
  },
  etatDemande: {
    type: String,
    required: true,
    enum: [EtatDemandeEnum.EnAttente, EtatDemandeEnum.Acceptee, EtatDemandeEnum.Refusee],
    default: EtatDemandeEnum.EnAttente
  },
  // Informations sur la demande
  dateDebutSouhaitee: {
    type: Date,
    required: true
  },
  dureeContrat: {
    type: Number, // en mois
    required: true,
    min: 1,
    max: 120 // Maximum 10 ans
  },
  messageCommercant: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Informations sur la réponse admin
  dateReponse: {
    type: Date
  },
  adminRepondant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageAdmin: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  raisonRefus: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Informations contractuelles (si acceptée)
  contrat: {
    dateDebut: Date,
    dateFin: Date,
    loyerMensuel: Number,
    caution: Number,
    conditionsSpeciales: String
  },
  // Statut de la demande
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
demandeLocationSchema.index({ boutique: 1, createdAt: -1 });
demandeLocationSchema.index({ espace: 1, etatDemande: 1 });
demandeLocationSchema.index({ etatDemande: 1, createdAt: -1 });
demandeLocationSchema.index({ adminRepondant: 1 });

// Validation: une seule demande en attente par boutique pour un espace donné
demandeLocationSchema.index(
  { boutique: 1, espace: 1, etatDemande: 1 },
  { 
    unique: true,
    partialFilterExpression: { etatDemande: EtatDemandeEnum.EnAttente }
  }
);

// Middleware pre-save pour validation
demandeLocationSchema.pre('save', async function(next) {
  // Vérifier que l'espace est disponible lors de la création
  if (this.isNew && this.etatDemande === EtatDemandeEnum.EnAttente) {
    const Espace = mongoose.model('Espace');
    const espace = await Espace.findById(this.espace);
    
    if (!espace || espace.statut !== 'Disponible') {
      throw new Error('L\'espace n\'est pas disponible');
    }
  }
  
  // Mettre à jour la date de réponse si l'état change
  if (this.isModified('etatDemande') && this.etatDemande !== EtatDemandeEnum.EnAttente) {
    this.dateReponse = new Date();
  }
  
  next();
});

// Méthode pour accepter une demande
demandeLocationSchema.methods.accepter = async function(adminId, contratInfo, messageAdmin = '') {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Mettre à jour la demande
    this.etatDemande = EtatDemandeEnum.Acceptee;
    this.adminRepondant = adminId;
    this.messageAdmin = messageAdmin;
    this.contrat = contratInfo;
    
    await this.save({ session });
    
    // Mettre à jour l'espace
    const Espace = mongoose.model('Espace');
    await Espace.findByIdAndUpdate(
      this.espace,
      {
        statut: 'Occupee',
        boutique: this.boutique,
        dateOccupation: contratInfo.dateDebut || new Date()
      },
      { session }
    );
    
    // Mettre à jour la boutique
    const Boutique = mongoose.model('Boutique');
    await Boutique.findByIdAndUpdate(
      this.boutique,
      { espace: this.espace },
      { session }
    );
    
    await session.commitTransaction();
    
    // Créer une notification pour le commerçant
    await this.creerNotificationAcceptation();
    
    return this;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Méthode pour refuser une demande
demandeLocationSchema.methods.refuser = async function(adminId, raisonRefus, messageAdmin = '') {
  this.etatDemande = EtatDemandeEnum.Refusee;
  this.adminRepondant = adminId;
  this.raisonRefus = raisonRefus;
  this.messageAdmin = messageAdmin;
  
  await this.save();
  
  // Créer une notification pour le commerçant
  await this.creerNotificationRefus();
  
  return this;
};

// Méthode pour créer une notification d'acceptation
demandeLocationSchema.methods.creerNotificationAcceptation = async function() {
  const Notification = mongoose.model('Notification');
  const Boutique = mongoose.model('Boutique');
  
  const boutique = await Boutique.findById(this.boutique).populate('proprietaire');
  
  if (boutique && boutique.proprietaire) {
    await Notification.create({
      type: 'Paiement',
      message: `Votre demande de location pour l'espace ${this.espace} a été acceptée. Vous pouvez maintenant procéder au paiement du loyer.`,
      receveur: boutique.proprietaire._id,
      estLu: false,
      urlRoute: `/commercant/boutiques/${this.boutique}/location`
    });
  }
};

// Méthode pour créer une notification de refus
demandeLocationSchema.methods.creerNotificationRefus = async function() {
  const Notification = mongoose.model('Notification');
  const Boutique = mongoose.model('Boutique');
  
  const boutique = await Boutique.findById(this.boutique).populate('proprietaire');
  
  if (boutique && boutique.proprietaire) {
    await Notification.create({
      type: 'Paiement',
      message: `Votre demande de location pour l'espace ${this.espace} a été refusée. Raison: ${this.raisonRefus}`,
      receveur: boutique.proprietaire._id,
      estLu: false,
      urlRoute: `/commercant/boutiques/${this.boutique}/demandes-location`
    });
  }
};

// Méthodes statiques
demandeLocationSchema.statics.obtenirDemandesEnAttente = function() {
  return this.find({ etatDemande: EtatDemandeEnum.EnAttente, isActive: true })
    .populate('boutique', 'nom proprietaire')
    .populate('boutique.proprietaire', 'nom prenoms email')
    .populate('espace', 'codeEspace surface loyer etage')
    .sort({ createdAt: -1 });
};

demandeLocationSchema.statics.obtenirDemandesParBoutique = function(boutiqueId) {
  return this.find({ boutique: boutiqueId, isActive: true })
    .populate('espace', 'codeEspace surface loyer etage')
    .populate('adminRepondant', 'nom prenoms')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('DemandeLocation', demandeLocationSchema);