const mongoose = require('mongoose');
const { TypeAchatEnum, EtatAchatEnum } = require('../utils/enums');

const achatSchema = new mongoose.Schema({
  acheteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  facture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture',
    required: true
  },
  // Informations sur l'achat
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0
  },
  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },
  // Type d'achat et dates
  typeAchat: {
    type: {
      type: String,
      required: true,
      enum: [TypeAchatEnum.Recuperer, TypeAchatEnum.Livrer]
    },
    dateDebut: {
      type: Date,
      required: true,
      default: Date.now
    },
    dateFin: {
      type: Date,
      required: true
    }
  },
  etat: {
    type: String,
    required: true,
    enum: [EtatAchatEnum.EnAttente, EtatAchatEnum.Validee, EtatAchatEnum.Annulee],
    default: EtatAchatEnum.EnAttente
  },
  // Informations de livraison (si applicable)
  adresseLivraison: {
    nom: String,
    rue: String,
    ville: String,
    codePostal: String,
    telephone: String
  },
  dureelivraison: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ // Format HH:MM:SS
  },
  // Informations de suivi
  dateValidation: {
    type: Date
  },
  dateAnnulation: {
    type: Date
  },
  raisonAnnulation: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Métadonnées
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
achatSchema.index({ acheteur: 1, createdAt: -1 });
achatSchema.index({ produit: 1 });
achatSchema.index({ facture: 1 });
achatSchema.index({ etat: 1, 'typeAchat.type': 1 });
achatSchema.index({ 'typeAchat.dateFin': 1 });

// Middleware pre-save pour calculer la dateFin et le montant
achatSchema.pre('save', async function(next) {
  try {
    // Calculer le montant total
    if (this.isModified('quantite') || this.isModified('prixUnitaire')) {
      this.montantTotal = this.quantite * this.prixUnitaire;
    }
    
    // Calculer la dateFin selon le type d'achat
    if (this.isNew || this.isModified('typeAchat')) {
      if (this.typeAchat.type === TypeAchatEnum.Recuperer) {
        // Pour récupération: dateFin = dateDebut + tempsPreparation
        const Produit = mongoose.model('Produit');
        const produit = await Produit.findById(this.produit);
        
        if (produit && produit.tempsPreparation && produit.tempsPreparation !== 'null') {
          const tempsPreparationMinutes = produit.getTempsPreparationMinutes();
          this.typeAchat.dateFin = new Date(this.typeAchat.dateDebut.getTime() + (tempsPreparationMinutes * 60000));
        } else {
          // Disponible de suite
          this.typeAchat.dateFin = this.typeAchat.dateDebut;
        }
      } else if (this.typeAchat.type === TypeAchatEnum.Livrer) {
        // Pour livraison: dateFin sera calculée quand le commerçant saisit la durée
        if (!this.typeAchat.dateFin) {
          this.typeAchat.dateFin = this.typeAchat.dateDebut; // Temporaire
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware post-save pour décrémenter le stock
achatSchema.post('save', async function(doc) {
  if (doc.etat === EtatAchatEnum.EnAttente || doc.etat === EtatAchatEnum.Validee) {
    try {
      const Produit = mongoose.model('Produit');
      const produit = await Produit.findById(doc.produit);
      
      if (produit && produit.estDisponible(doc.quantite)) {
        await produit.decrementerStock(doc.quantite);
      }
    } catch (error) {
      console.error('Erreur lors de la décrémentation du stock:', error);
    }
  }
});

// Méthode pour valider l'achat
achatSchema.methods.valider = async function() {
  this.etat = EtatAchatEnum.Validee;
  this.dateValidation = new Date();
  
  await this.save();
  
  // Créer la transaction portefeuille si validé
  await this.creerTransactionPortefeuille();
  
  // Créer une notification pour le commerçant
  await this.creerNotificationVente();
  
  return this;
};

// Méthode pour annuler l'achat
achatSchema.methods.annuler = async function(raison = '') {
  // Remettre le stock
  const Produit = mongoose.model('Produit');
  const produit = await Produit.findById(this.produit);
  if (produit) {
    await produit.incrementerStock(this.quantite);
  }
  
  this.etat = EtatAchatEnum.Annulee;
  this.dateAnnulation = new Date();
  this.raisonAnnulation = raison;
  
  return this.save();
};

// Méthode pour définir la durée de livraison (pour les achats "Livrer")
achatSchema.methods.definirDureeLivraison = function(dureeHHMMSS) {
  if (this.typeAchat.type !== TypeAchatEnum.Livrer) {
    throw new Error('Cette méthode ne s\'applique qu\'aux achats de type "Livrer"');
  }
  
  this.dureelivraison = dureeHHMMSS;
  
  // Calculer la nouvelle dateFin
  const [heures, minutes, secondes] = dureeHHMMSS.split(':').map(Number);
  const dureeMs = (heures * 3600 + minutes * 60 + secondes) * 1000;
  this.typeAchat.dateFin = new Date(this.typeAchat.dateDebut.getTime() + dureeMs);
  
  // Passer automatiquement à "Validee"
  this.etat = EtatAchatEnum.Validee;
  this.dateValidation = new Date();
  
  return this.save();
};

// Méthode pour créer la transaction portefeuille
achatSchema.methods.creerTransactionPortefeuille = async function() {
  const PFTransaction = mongoose.model('PFTransaction');
  const PorteFeuille = mongoose.model('PorteFeuille');
  const Produit = mongoose.model('Produit');
  const Boutique = mongoose.model('Boutique');
  
  try {
    // Récupérer les informations nécessaires
    const produit = await Produit.findById(this.produit).populate('boutique');
    const boutique = await Boutique.findById(produit.boutique._id).populate('commercant');
    
    const portefeuilleAcheteur = await PorteFeuille.obtenirParUtilisateur(this.acheteur);
    const portefeuilleCommercant = await PorteFeuille.obtenirParUtilisateur(boutique.commercant._id);
    
    if (portefeuilleAcheteur && portefeuilleCommercant) {
      await PFTransaction.effectuerTransaction(
        portefeuilleAcheteur._id,
        portefeuilleCommercant._id,
        'Achat',
        this.montantTotal,
        `Achat de ${this.quantite}x ${produit.nom}`,
        {
          entityType: 'Achat',
          entityId: this._id
        }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
  }
};

// Méthode pour créer une notification de vente
achatSchema.methods.creerNotificationVente = async function() {
  const Notification = mongoose.model('Notification');
  const Produit = mongoose.model('Produit');
  const Boutique = mongoose.model('Boutique');
  
  try {
    const produit = await Produit.findById(this.produit).populate('boutique');
    const boutique = await Boutique.findById(produit.boutique._id).populate('commercant');
    
    if (boutique && boutique.commercant) {
      await Notification.create({
        type: 'Vente',
        message: `Nouvelle vente: ${this.quantite}x ${produit.nom} pour ${this.montantTotal}€`,
        receveur: boutique.commercant._id,
        estLu: false,
        urlRoute: `/commercant/achats/${this._id}`
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
  }
};

// Méthodes statiques
achatSchema.statics.obtenirAchatsEnCours = function(acheteurId) {
  return this.find({
    acheteur: acheteurId,
    etat: { $in: [EtatAchatEnum.EnAttente, EtatAchatEnum.Validee] }
  })
  .populate('produit', 'nom images')
  .populate('produit.boutique', 'nom')
  .populate('facture', 'numeroFacture')
  .sort({ createdAt: -1 });
};

achatSchema.statics.obtenirHistoriqueAchats = function(acheteurId, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  return this.find({ acheteur: acheteurId })
    .populate('produit', 'nom images prix')
    .populate('produit.boutique', 'nom')
    .populate('facture', 'numeroFacture dateEmission')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

achatSchema.statics.obtenirAchatsParBoutique = function(boutiqueId, options = {}) {
  const { etat = null, typeAchat = null, page = 1, limit = 20 } = options;
  
  const query = {};
  if (etat) query.etat = etat;
  if (typeAchat) query['typeAchat.type'] = typeAchat;
  
  return this.find(query)
    .populate('produit')
    .populate('acheteur', 'nom prenoms email telephone')
    .populate('facture', 'numeroFacture')
    .populate({
      path: 'produit',
      match: { boutique: boutiqueId }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

module.exports = mongoose.model('Achat', achatSchema);