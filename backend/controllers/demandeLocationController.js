const DemandeLocation = require('../models/DemandeLocation');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const { validationResult } = require('express-validator');
const { EtatDemandeEnum } = require('../utils/enums');

/**
 * 🏪 Contrôleur Demande de Location
 * Gestion des demandes de location d'espaces pour les boutiques
 */

// @route   POST /api/demandes-location
// @desc    Créer une demande de location
// @access  Private (Commercant)
// @body    { boutiqueId, espaceId, dateDebutSouhaitee, dureeContrat, messageCommercant }
// @return  { message, demande }
exports.creerDemande = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const {
      boutiqueId,
      espaceId,
      dateDebutSouhaitee,
      dureeContrat,
      messageCommercant
    } = req.body;
    
    // Vérifier que la boutique appartient au commerçant
    const boutique = await Boutique.findOne({
      _id: boutiqueId,
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    });
    
    if (!boutique) {
      return res.status(404).json({
        message: 'Boutique non trouvée ou non autorisée'
      });
    }
    
    // Vérifier que l'espace est disponible
    const espace = await Espace.findById(espaceId);
    if (!espace || espace.statut !== 'Disponible') {
      return res.status(400).json({
        message: 'Espace non disponible'
      });
    }
    
    // Vérifier qu'il n'y a pas déjà une demande en attente pour cette boutique et cet espace
    const demandeExistante = await DemandeLocation.findOne({
      boutique: boutiqueId,
      espace: espaceId,
      etatDemande: EtatDemandeEnum.EnAttente
    });
    
    if (demandeExistante) {
      return res.status(400).json({
        message: 'Une demande est déjà en attente pour cet espace'
      });
    }
    
    const demande = new DemandeLocation({
      boutique: boutiqueId,
      espace: espaceId,
      dateDebutSouhaitee: new Date(dateDebutSouhaitee),
      dureeContrat,
      messageCommercant
    });
    
    await demande.save();
    
    // Populer les données pour la réponse
    await demande.populate([
      { path: 'boutique', select: 'nom' },
      { path: 'espace', select: 'codeEspace surface loyer etage' }
    ]);
    
    // Créer une notification pour les admins
    await creerNotificationPourAdmins(demande);
    
    res.status(201).json({
      message: 'Demande de location créée avec succès',
      demande
    });
  } catch (error) {
    console.error('Erreur création demande:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création de la demande'
    });
  }
};

// @route   GET /api/demandes-location/me
// @desc    Obtenir mes demandes de location
// @access  Private (Commercant)
exports.obtenirMesDemandes = async (req, res) => {
  try {
    const { page = 1, limit = 20, etat } = req.query;
    
    // Récupérer les boutiques du commerçant
    const boutiques = await Boutique.find({
      $or: [
        { commercant: req.user._id },
        { proprietaire: req.user._id }
      ]
    }).select('_id');
    
    const boutiqueIds = boutiques.map(b => b._id);
    
    let query = { boutique: { $in: boutiqueIds }, isActive: true };
    
    if (etat) {
      query.etatDemande = etat;
    }
    
    const demandes = await DemandeLocation.find(query)
      .populate('boutique', 'nom')
      .populate('espace', 'codeEspace surface loyer etage')
      .populate('adminRepondant', 'nom prenoms')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await DemandeLocation.countDocuments(query);
    
    res.json({
      demandes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention mes demandes:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des demandes'
    });
  }
};

// @route   GET /api/demandes-location
// @desc    Obtenir toutes les demandes (Admin)
// @access  Private (Admin)
exports.obtenirToutesDemandes = async (req, res) => {
  try {
    const { page = 1, limit = 20, etat, search } = req.query;
    
    let query = { isActive: true };
    
    if (etat) {
      query.etatDemande = etat;
    }
    
    if (search) {
      // Recherche par nom de boutique ou code d'espace
      const boutiques = await Boutique.find({
        nom: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const espaces = await Espace.find({
        codeEspace: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.$or = [
        { boutique: { $in: boutiques.map(b => b._id) } },
        { espace: { $in: espaces.map(e => e._id) } }
      ];
    }
    
    const demandes = await DemandeLocation.find(query)
      .populate({
        path: 'boutique',
        select: 'nom',
        populate: {
          path: 'commercant proprietaire',
          select: 'nom prenoms email'
        }
      })
      .populate('espace', 'codeEspace surface loyer etage')
      .populate('adminRepondant', 'nom prenoms')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await DemandeLocation.countDocuments(query);
    
    res.json({
      demandes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur obtention toutes demandes:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des demandes'
    });
  }
};

// @route   PUT /api/demandes-location/:id/accepter
// @desc    Accepter une demande de location
// @access  Private (Admin)
exports.accepterDemande = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const {
      dateDebut,
      dateFin,
      loyerMensuel,
      caution,
      conditionsSpeciales,
      messageAdmin
    } = req.body;
    
    const demande = await DemandeLocation.findById(id)
      .populate('boutique')
      .populate('espace');
    
    if (!demande) {
      return res.status(404).json({
        message: 'Demande non trouvée'
      });
    }
    
    if (demande.etatDemande !== EtatDemandeEnum.EnAttente) {
      return res.status(400).json({
        message: 'Cette demande a déjà été traitée'
      });
    }
    
    const contratInfo = {
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      loyerMensuel: loyerMensuel || demande.espace.loyer,
      caution,
      conditionsSpeciales
    };
    
    await demande.accepter(req.user._id, contratInfo, messageAdmin);
    
    res.json({
      message: 'Demande acceptée avec succès',
      demande
    });
  } catch (error) {
    console.error('Erreur acceptation demande:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'acceptation de la demande'
    });
  }
};

// @route   PUT /api/demandes-location/:id/refuser
// @desc    Refuser une demande de location
// @access  Private (Admin)
exports.refuserDemande = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { raisonRefus, messageAdmin } = req.body;
    
    const demande = await DemandeLocation.findById(id);
    
    if (!demande) {
      return res.status(404).json({
        message: 'Demande non trouvée'
      });
    }
    
    if (demande.etatDemande !== EtatDemandeEnum.EnAttente) {
      return res.status(400).json({
        message: 'Cette demande a déjà été traitée'
      });
    }
    
    await demande.refuser(req.user._id, raisonRefus, messageAdmin);
    
    res.json({
      message: 'Demande refusée',
      demande
    });
  } catch (error) {
    console.error('Erreur refus demande:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du refus de la demande'
    });
  }
};

// @route   GET /api/demandes-location/:id
// @desc    Obtenir une demande par ID
// @access  Private
exports.obtenirDemandeParId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const demande = await DemandeLocation.findById(id)
      .populate({
        path: 'boutique',
        populate: {
          path: 'commercant proprietaire',
          select: 'nom prenoms email telephone'
        }
      })
      .populate('espace')
      .populate('adminRepondant', 'nom prenoms email');
    
    if (!demande) {
      return res.status(404).json({
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier les permissions
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'admin';
    const isOwner = demande.boutique.commercant?._id.toString() === req.user._id.toString() ||
                   demande.boutique.proprietaire?._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'Accès non autorisé'
      });
    }
    
    res.json({ demande });
  } catch (error) {
    console.error('Erreur obtention demande:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de la demande'
    });
  }
};

// @route   DELETE /api/demandes-location/:id
// @desc    Annuler une demande (soft delete)
// @access  Private (Commercant propriétaire)
exports.annulerDemande = async (req, res) => {
  try {
    const { id } = req.params;
    
    const demande = await DemandeLocation.findById(id).populate('boutique');
    
    if (!demande) {
      return res.status(404).json({
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que c'est le propriétaire de la boutique
    const isOwner = demande.boutique.commercant?.toString() === req.user._id.toString() ||
                   demande.boutique.proprietaire?.toString() === req.user._id.toString();
    
    if (!isOwner) {
      return res.status(403).json({
        message: 'Seul le propriétaire de la boutique peut annuler cette demande'
      });
    }
    
    if (demande.etatDemande !== EtatDemandeEnum.EnAttente) {
      return res.status(400).json({
        message: 'Seules les demandes en attente peuvent être annulées'
      });
    }
    
    demande.isActive = false;
    await demande.save();
    
    res.json({
      message: 'Demande annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation demande:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'annulation de la demande'
    });
  }
};

// Fonction utilitaire pour créer des notifications pour les admins
async function creerNotificationPourAdmins(demande) {
  try {
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    
    const admins = await User.find({ 
      $or: [
        { role: 'Admin' },
        { role: 'admin' }
      ],
      isActive: true 
    });
    
    for (const admin of admins) {
      await Notification.create({
        type: 'Paiement',
        message: `Nouvelle demande de location pour l'espace ${demande.espace.codeEspace} par la boutique ${demande.boutique.nom}`,
        receveur: admin._id,
        recipient: admin._id,
        estLu: false,
        isRead: false,
        urlRoute: `/admin/demandes-location/${demande._id}`,
        actionRequired: true,
        actionType: 'approve_location',
        priority: 'high'
      });
    }
  } catch (error) {
    console.error('Erreur création notifications admins:', error);
  }
}