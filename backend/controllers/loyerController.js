const { validationResult } = require('express-validator');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');
const Recepisse = require('../models/Recepisse');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const notificationService = require('../services/notificationService');
const { RoleEnum } = require('../utils/enums');

/**
 * 💰 Contrôleur Paiement Loyer
 * Gestion des paiements de loyer des commerçants
 */
class LoyerController {

  /**
   * @route   POST /api/commercant/loyers/pay
   * @desc    Effectuer le paiement du loyer
   * @access  Private (Commercant)
   * @body    { boutiqueId?, montant?, periode? }
   * @return  { recepisse, transaction }
   */
  async payLoyer(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`💰 [${timestamp}] Paiement loyer`);
    console.log(`   👤 Commercant ID: ${req.user._id}`);
    console.log(`   📝 Données:`, JSON.stringify(req.body, null, 2));
    
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ Validation échouée:`, errors.array());
        return res.status(400).json({ 
          message: 'Données invalides',
          errors: errors.array() 
        });
      }

      // Vérifier que l'utilisateur est un commerçant
      if (req.user.role !== RoleEnum.Commercant) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Seuls les commerçants peuvent payer des loyers' 
        });
      }

      const { boutiqueId, montant, periode } = req.body;

      // Récupérer la boutique du commerçant
      let boutique;
      if (boutiqueId) {
        boutique = await Boutique.findOne({ 
          _id: boutiqueId, 
          commercant: req.user._id,
          statutBoutique: 'Actif'
        }).populate('espace');
      } else {
        // Prendre la première boutique active du commerçant
        boutique = await Boutique.findOne({ 
          commercant: req.user._id,
          statutBoutique: 'Actif'
        }).populate('espace');
      }

      if (!boutique) {
        console.log(`❌ Boutique non trouvée ou inactive`);
        return res.status(404).json({ 
          message: 'Boutique non trouvée ou inactive' 
        });
      }

      if (!boutique.espace) {
        console.log(`❌ Espace non assigné à la boutique`);
        return res.status(400).json({ 
          message: 'Aucun espace assigné à cette boutique' 
        });
      }

      // Calculer le montant du loyer si non fourni
      const montantLoyer = montant || boutique.espace.prixLocation || 500; // Montant par défaut
      const periodeLoyer = periode || new Date().toISOString().slice(0, 7); // YYYY-MM

      console.log(`💰 Montant loyer: ${montantLoyer}€ pour la période ${periodeLoyer}`);

      // Vérifier si le loyer n'a pas déjà été payé pour cette période
      const loyerExistant = await PFTransaction.findOne({
        type: 'Loyer',
        description: { $regex: `Boutique ${boutique._id}.*${periodeLoyer}` },
        statut: 'Completee'
      });

      if (loyerExistant) {
        console.log(`⚠️ Loyer déjà payé pour cette période`);
        return res.status(400).json({ 
          message: `Le loyer pour la période ${periodeLoyer} a déjà été payé` 
        });
      }

      // Récupérer le portefeuille du commerçant
      const portefeuilleCommercant = await PorteFeuille.obtenirParUtilisateur(req.user._id);
      if (!portefeuilleCommercant) {
        console.log(`❌ Portefeuille commerçant non trouvé`);
        return res.status(404).json({ 
          message: 'Portefeuille non trouvé' 
        });
      }

      // Vérifier le solde
      if (portefeuilleCommercant.balance < montantLoyer) {
        console.log(`❌ Solde insuffisant: ${portefeuilleCommercant.balance}€ < ${montantLoyer}€`);
        return res.status(400).json({ 
          message: 'Solde insuffisant pour payer le loyer',
          soldeActuel: portefeuilleCommercant.balance,
          montantRequis: montantLoyer
        });
      }

      // Récupérer le portefeuille admin (destinataire des loyers)
      const adminUser = await require('../models/User').findOne({ role: 'Admin' });
const { RoleEnum } = require('../utils/enums');
      if (!adminUser) {
        console.log(`❌ Compte admin non trouvé`);
        return res.status(500).json({ 
          message: 'Erreur système: compte administrateur non trouvé' 
        });
      }

      const portefeuilleAdmin = await PorteFeuille.obtenirParUtilisateur(adminUser._id);
      if (!portefeuilleAdmin) {
        console.log(`❌ Portefeuille admin non trouvé`);
        return res.status(500).json({ 
          message: 'Erreur système: portefeuille administrateur non trouvé' 
        });
      }

      // Effectuer la transaction
      const descriptionTransaction = `Loyer boutique ${boutique.nom} - Période ${periodeLoyer} - Espace ${boutique.espace.code}`;
      
      // Créer la transaction
      const transaction = await PFTransaction.create({
        fromWallet: portefeuilleCommercant._id,
        toWallet: portefeuilleAdmin._id,
        type: 'Loyer',
        amount: montantLoyer,
        description: descriptionTransaction,
        statut: 'Completee',
        numeroTransaction: `TXN-${Date.now()}`
      });
      
      // Mettre à jour les soldes
      portefeuilleCommercant.balance -= montantLoyer;
      await portefeuilleCommercant.save();
      
      portefeuilleAdmin.balance += montantLoyer;
      await portefeuilleAdmin.save();

      console.log(`✅ Transaction créée: ${transaction._id}`);

      // Créer le reçu avec numéro généré
      const count = await Recepisse.countDocuments();
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const numeroRecepisse = `REC-${year}${month}-${String(count + 1).padStart(6, '0')}`;
      
      const recepisse = await Recepisse.create({
        numeroRecepisse,
        donneur: adminUser._id,
        receveur: req.user._id,
        boutique: boutique._id,
        transaction: transaction._id,
        montant: montantLoyer,
        periode: periodeLoyer,
        type: 'Loyer',
        description: descriptionTransaction,
        dateEmission: new Date()
      });

      console.log(`📄 Reçu créé: ${recepisse._id}`);

      // Envoyer une notification au commerçant
      await notificationService.createNotification({
        type: 'Paiement',
        title: 'Paiement de loyer effectué',
        message: `Votre loyer de ${montantLoyer}€ pour la période ${periodeLoyer} a été payé avec succès.`,
        receveur: req.user._id,
        urlRoute: `/mes-boutiques/${boutique._id}`
      });

      // Envoyer une notification à l'admin
      await notificationService.createNotification({
        type: 'Paiement',
        title: 'Nouveau paiement de loyer',
        message: `${req.user.nom} ${req.user.prenoms} a payé le loyer de ${montantLoyer}€ pour ${boutique.nom}.`,
        receveur: adminUser._id,
        urlRoute: `/admin/dashboard`
      });

      console.log(`✅ Paiement loyer terminé avec succès`);
      
      res.json({
        message: 'Loyer payé avec succès',
        recepisse: {
          _id: recepisse._id,
          montant: recepisse.montant,
          periode: recepisse.periode,
          dateEmission: recepisse.dateEmission,
          boutique: {
            _id: boutique._id,
            nom: boutique.nom,
            espace: {
              numero: boutique.espace.numero,
              etage: boutique.espace.etage
            }
          }
        },
        transaction: {
          _id: transaction._id,
          montant: transaction.amount,
          statut: transaction.statut,
          dateTransaction: transaction.createdAt
        },
        nouveauSolde: portefeuilleCommercant.balance - montantLoyer
      });

    } catch (error) {
      console.error(`❌ Erreur paiement loyer:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      
      if (error.message.includes('Solde insuffisant')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur lors du paiement' });
    }
  }

  /**
   * @route   GET /api/commercant/loyers/historique
   * @desc    Obtenir l'historique des paiements de loyer
   * @access  Private (Commercant)
   * @return  { loyers, pagination }
   */
  async getHistoriqueLoyers(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📋 [${timestamp}] Historique loyers`);
    console.log(`   👤 Commercant ID: ${req.user._id}`);
    
    try {
      const { page = 1, limit = 20 } = req.query;

      // Récupérer le portefeuille du commerçant
      const portefeuille = await PorteFeuille.obtenirParUtilisateur(req.user._id);
      if (!portefeuille) {
        return res.status(404).json({ message: 'Portefeuille non trouvé' });
      }

      // Récupérer les transactions de loyer
      const loyers = await PFTransaction.find({
        fromWallet: portefeuille._id,
        type: 'Loyer',
        statut: 'Completee'
      })
      .populate('toWallet', 'owner')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await PFTransaction.countDocuments({
        fromWallet: portefeuille._id,
        type: 'Loyer',
        statut: 'Completee'
      });

      console.log(`✅ ${loyers.length} paiements de loyer récupérés`);
      
      res.json({
        loyers: loyers.map(loyer => ({
          _id: loyer._id,
          montant: loyer.amount,
          description: loyer.description,
          dateTransaction: loyer.createdAt,
          statut: loyer.statut
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error(`❌ Erreur historique loyers:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/admin/loyers/historique-par-periode
   * @desc    Obtenir l'historique des paiements de loyer par mois/année
   * @access  Private (Admin)
   * @query   mois (YYYY-MM), annee (YYYY), page, limit
   * @return  { loyers, statistiques, pagination }
   */
  async getHistoriqueParPeriode(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Historique loyers par période`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== RoleEnum.Admin) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Accès réservé aux administrateurs' 
        });
      }

      const { mois, annee, page = 1, limit = 50 } = req.query;

      // Construire le filtre de période
      let periodeFilter = {};
      if (mois) {
        // Format YYYY-MM
        if (!/^\d{4}-\d{2}$/.test(mois)) {
          return res.status(400).json({ 
            message: 'Format de mois invalide. Utilisez YYYY-MM' 
          });
        }
        periodeFilter.periode = mois;
      } else if (annee) {
        // Format YYYY
        if (!/^\d{4}$/.test(annee)) {
          return res.status(400).json({ 
            message: 'Format d\'année invalide. Utilisez YYYY' 
          });
        }
        periodeFilter.periode = { $regex: `^${annee}` };
      }

      // Récupérer les reçus de loyer
      const loyers = await Recepisse.find({
        type: 'Loyer',
        statut: 'Emis',
        ...periodeFilter
      })
      .populate('receveur', 'nom prenoms email')
      .populate('boutique', 'nom')
      .populate('transaction')
      .sort({ periode: -1, dateEmission: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Recepisse.countDocuments({
        type: 'Loyer',
        statut: 'Emis',
        ...periodeFilter
      });

      // Calculer les statistiques
      const statistiques = await Recepisse.aggregate([
        {
          $match: {
            type: 'Loyer',
            statut: 'Emis',
            ...periodeFilter
          }
        },
        {
          $group: {
            _id: null,
            totalMontant: { $sum: '$montant' },
            nombrePaiements: { $sum: 1 },
            montantMoyen: { $avg: '$montant' },
            montantMin: { $min: '$montant' },
            montantMax: { $max: '$montant' }
          }
        }
      ]);

      console.log(`✅ ${loyers.length} paiements de loyer récupérés`);
      
      res.json({
        loyers: loyers.map(loyer => ({
          _id: loyer._id,
          numeroRecepisse: loyer.numeroRecepisse,
          montant: loyer.montant,
          periode: loyer.periode,
          dateEmission: loyer.dateEmission,
          receveur: loyer.receveur ? {
            _id: loyer.receveur._id,
            nom: loyer.receveur.nom,
            prenoms: loyer.receveur.prenoms,
            email: loyer.receveur.email
          } : null,
          boutique: loyer.boutique ? {
            _id: loyer.boutique._id,
            nom: loyer.boutique.nom
          } : null,
          description: loyer.description
        })),
        statistiques: statistiques.length > 0 ? {
          totalMontant: statistiques[0].totalMontant,
          nombrePaiements: statistiques[0].nombrePaiements,
          montantMoyen: Math.round(statistiques[0].montantMoyen * 100) / 100,
          montantMin: statistiques[0].montantMin,
          montantMax: statistiques[0].montantMax
        } : {
          totalMontant: 0,
          nombrePaiements: 0,
          montantMoyen: 0,
          montantMin: 0,
          montantMax: 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error(`❌ Erreur historique par période:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/admin/loyers/statut-paiements-mois-courant
   * @desc    Obtenir le statut complet des paiements du mois en cours (payées + impayées)
   * @access  Private (Admin)
   * @return  { periode, boutiquesPayees, boutiquesImpayees, statistiques }
   */
  async getStatutPaiementsMoisCourant(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Statut paiements mois courant`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== RoleEnum.Admin) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Accès réservé aux administrateurs' 
        });
      }

      // Calculer automatiquement le mois en cours
      const now = new Date();
      const periodeRecherche = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      console.log(`📅 Période automatique: ${periodeRecherche}`);

      // Récupérer toutes les boutiques actives avec espace
      const boutiquesActives = await Boutique.find({
        statutBoutique: 'Actif',
        espace: { $ne: null }
      })
      .populate('commercant', 'nom prenoms email telephone')
      .populate({
        path: 'espace',
        select: 'code loyer etage',
        populate: {
          path: 'etage',
          select: 'numero nom'
        }
      });

      console.log(`🏪 ${boutiquesActives.length} boutiques actives trouvées`);

      // Récupérer les paiements de loyer pour la période
      const paiementsEffectues = await Recepisse.find({
        type: 'Loyer',
        statut: 'Emis',
        periode: periodeRecherche
      }).select('boutique montant dateEmission numeroRecepisse');

      const boutiquesPayeesIds = new Set(
        paiementsEffectues.map(p => p.boutique?.toString()).filter(Boolean)
      );

      // Créer un map des paiements par boutique
      const paiementsMap = new Map();
      paiementsEffectues.forEach(p => {
        if (p.boutique) {
          paiementsMap.set(p.boutique.toString(), {
            montant: p.montant,
            date: p.dateEmission,
            numeroRecepisse: p.numeroRecepisse
          });
        }
      });

      console.log(`✅ ${boutiquesPayeesIds.size} boutiques ont payé`);

      // Séparer les boutiques payées et impayées
      const boutiquesPayees = [];
      const boutiquesImpayees = [];

      boutiquesActives.forEach(boutique => {
        const boutiqueId = boutique._id.toString();
        const paiement = paiementsMap.get(boutiqueId);
        
        const boutiqueData = {
          _id: boutique._id,
          nom: boutique.nom,
          commercant: boutique.commercant ? {
            _id: boutique.commercant._id,
            nom: boutique.commercant.nom,
            prenoms: boutique.commercant.prenoms,
            email: boutique.commercant.email,
            telephone: boutique.commercant.telephone
          } : null,
          espace: boutique.espace ? {
            _id: boutique.espace._id,
            code: boutique.espace.code,
            loyer: boutique.espace.loyer,
            etage: boutique.espace.etage ? {
              numero: boutique.espace.etage.numero,
              nom: boutique.espace.etage.nom
            } : null
          } : null
        };

        if (paiement) {
          // Boutique payée
          boutiquesPayees.push({
            ...boutiqueData,
            montantPaye: paiement.montant,
            datePaiement: paiement.date,
            numeroRecepisse: paiement.numeroRecepisse,
            statut: 'Payé'
          });
        } else {
          // Boutique impayée
          boutiquesImpayees.push({
            ...boutiqueData,
            montantDu: boutique.espace?.loyer || 0,
            statut: 'Impayé'
          });
        }
      });

      // Calculer les statistiques
      const totalEncaisse = boutiquesPayees.reduce(
        (sum, b) => sum + (b.montantPaye || 0), 
        0
      );

      const totalMontantDu = boutiquesImpayees.reduce(
        (sum, b) => sum + (b.montantDu || 0), 
        0
      );

      const tauxPaiement = boutiquesActives.length > 0
        ? Math.round((boutiquesPayees.length / boutiquesActives.length) * 100)
        : 0;

      console.log(`📊 Statistiques: ${boutiquesPayees.length} payées, ${boutiquesImpayees.length} impayées`);
      
      res.json({
        periode: periodeRecherche,
        moisCourant: {
          annee: now.getFullYear(),
          mois: now.getMonth() + 1,
          nomMois: now.toLocaleDateString('fr-FR', { month: 'long' })
        },
        boutiquesPayees,
        boutiquesImpayees,
        statistiques: {
          nombreBoutiquesActives: boutiquesActives.length,
          nombreBoutiquesPayees: boutiquesPayees.length,
          nombreBoutiquesImpayees: boutiquesImpayees.length,
          totalEncaisse: Math.round(totalEncaisse * 100) / 100,
          totalMontantDu: Math.round(totalMontantDu * 100) / 100,
          tauxPaiement
        }
      });

    } catch (error) {
      console.error(`❌ Erreur statut paiements:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/admin/loyers/boutiques-payees
   * @desc    Obtenir la liste des boutiques qui ont payé le loyer
   * @access  Private (Admin)
   * @query   mois (YYYY-MM, optionnel - par défaut mois en cours)
   * @return  { boutiquesPayees, statistiques }
   */
  async getBoutiquesPayees(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Boutiques avec loyer payé`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== RoleEnum.Admin) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Accès réservé aux administrateurs' 
        });
      }

      // Déterminer la période à vérifier
      const { mois } = req.query;
      let periodeRecherche;
      
      if (mois) {
        if (!/^\d{4}-\d{2}$/.test(mois)) {
          return res.status(400).json({ 
            message: 'Format de mois invalide. Utilisez YYYY-MM' 
          });
        }
        periodeRecherche = mois;
      } else {
        // Mois en cours par défaut
        const now = new Date();
        periodeRecherche = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }

      console.log(`📅 Période recherchée: ${periodeRecherche}`);

      // Récupérer les paiements de loyer pour la période
      const paiementsEffectues = await Recepisse.find({
        type: 'Loyer',
        statut: 'Emis',
        periode: periodeRecherche
      })
      .populate({
        path: 'boutique',
        populate: [
          {
            path: 'commercant',
            select: 'nom prenoms email telephone'
          },
          {
            path: 'espace',
            select: 'code loyer etage',
            populate: {
              path: 'etage',
              select: 'numero nom'
            }
          }
        ]
      })
      .sort({ dateEmission: -1 });

      console.log(`✅ ${paiementsEffectues.length} paiements trouvés`);

      // Construire la liste des boutiques payées avec détails
      const boutiquesPayees = paiementsEffectues
        .filter(p => p.boutique) // Filtrer les paiements sans boutique
        .map(paiement => ({
          _id: paiement.boutique._id,
          nom: paiement.boutique.nom,
          commercant: paiement.boutique.commercant ? {
            _id: paiement.boutique.commercant._id,
            nom: paiement.boutique.commercant.nom,
            prenoms: paiement.boutique.commercant.prenoms,
            email: paiement.boutique.commercant.email,
            telephone: paiement.boutique.commercant.telephone
          } : null,
          espace: paiement.boutique.espace ? {
            _id: paiement.boutique.espace._id,
            code: paiement.boutique.espace.code,
            loyer: paiement.boutique.espace.loyer,
            etage: paiement.boutique.espace.etage ? {
              numero: paiement.boutique.espace.etage.numero,
              nom: paiement.boutique.espace.etage.nom
            } : null
          } : null,
          montantPaye: paiement.montant,
          datePaiement: paiement.dateEmission,
          numeroRecepisse: paiement.numeroRecepisse,
          periode: paiement.periode
        }));

      // Calculer les statistiques
      const totalEncaisse = boutiquesPayees.reduce(
        (sum, b) => sum + (b.montantPaye || 0), 
        0
      );

      // Récupérer le nombre total de boutiques actives pour contexte
      const totalBoutiquesActives = await Boutique.countDocuments({
        statutBoutique: 'Actif',
        espace: { $ne: null }
      });

      const tauxPaiement = totalBoutiquesActives > 0
        ? Math.round((boutiquesPayees.length / totalBoutiquesActives) * 100)
        : 0;

      console.log(`✅ ${boutiquesPayees.length} boutiques ont payé`);
      
      res.json({
        periode: periodeRecherche,
        boutiquesPayees,
        statistiques: {
          nombreBoutiquesActives: totalBoutiquesActives,
          nombreBoutiquesPayees: boutiquesPayees.length,
          nombreBoutiquesImpayees: totalBoutiquesActives - boutiquesPayees.length,
          totalEncaisse: Math.round(totalEncaisse * 100) / 100,
          tauxPaiement
        }
      });

    } catch (error) {
      console.error(`❌ Erreur boutiques payées:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * @route   GET /api/admin/loyers/boutiques-impayees
   * @desc    Obtenir la liste des boutiques avec loyer impayé pour le mois en cours
   * @access  Private (Admin)
   * @query   mois (YYYY-MM, optionnel - par défaut mois en cours)
   * @return  { boutiquesImpayees, statistiques }
   */
  async getBoutiquesImpayees(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🚨 [${timestamp}] Boutiques avec loyer impayé`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== RoleEnum.Admin) {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ 
          message: 'Accès réservé aux administrateurs' 
        });
      }

      // Déterminer la période à vérifier
      const { mois } = req.query;
      let periodeRecherche;
      
      if (mois) {
        if (!/^\d{4}-\d{2}$/.test(mois)) {
          return res.status(400).json({ 
            message: 'Format de mois invalide. Utilisez YYYY-MM' 
          });
        }
        periodeRecherche = mois;
      } else {
        // Mois en cours par défaut
        const now = new Date();
        periodeRecherche = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }

      console.log(`📅 Période recherchée: ${periodeRecherche}`);

      // Récupérer toutes les boutiques actives avec espace
      const boutiquesActives = await Boutique.find({
        statutBoutique: 'Actif',
        espace: { $ne: null }
      })
      .populate('commercant', 'nom prenoms email telephone')
      .populate({
        path: 'espace',
        select: 'code loyer etage',
        populate: {
          path: 'etage',
          select: 'numero nom'
        }
      });

      console.log(`🏪 ${boutiquesActives.length} boutiques actives trouvées`);

      // Récupérer les paiements de loyer pour la période
      const paiementsEffectues = await Recepisse.find({
        type: 'Loyer',
        statut: 'Emis',
        periode: periodeRecherche
      }).select('boutique');

      const boutiquesPayees = new Set(
        paiementsEffectues.map(p => p.boutique?.toString()).filter(Boolean)
      );

      console.log(`✅ ${boutiquesPayees.size} boutiques ont payé`);

      // Identifier les boutiques impayées
      const boutiquesImpayees = boutiquesActives
        .filter(boutique => !boutiquesPayees.has(boutique._id.toString()))
        .map(boutique => ({
          _id: boutique._id,
          nom: boutique.nom,
          commercant: boutique.commercant ? {
            _id: boutique.commercant._id,
            nom: boutique.commercant.nom,
            prenoms: boutique.commercant.prenoms,
            email: boutique.commercant.email,
            telephone: boutique.commercant.telephone
          } : null,
          espace: boutique.espace ? {
            _id: boutique.espace._id,
            code: boutique.espace.code,
            loyer: boutique.espace.loyer,
            etage: boutique.espace.etage ? {
              numero: boutique.espace.etage.numero,
              nom: boutique.espace.etage.nom
            } : null
          } : null,
          montantDu: boutique.espace?.loyer || 0,
          periode: periodeRecherche
        }));

      // Calculer les statistiques
      const totalMontantDu = boutiquesImpayees.reduce(
        (sum, b) => sum + (b.montantDu || 0), 
        0
      );

      console.log(`🚨 ${boutiquesImpayees.length} boutiques n'ont pas payé`);
      
      res.json({
        periode: periodeRecherche,
        boutiquesImpayees,
        statistiques: {
          nombreBoutiquesActives: boutiquesActives.length,
          nombreBoutiquesPayees: boutiquesPayees.size,
          nombreBoutiquesImpayees: boutiquesImpayees.length,
          totalMontantDu: Math.round(totalMontantDu * 100) / 100,
          tauxPaiement: boutiquesActives.length > 0 
            ? Math.round((boutiquesPayees.size / boutiquesActives.length) * 100) 
            : 0
        }
      });

    } catch (error) {
      console.error(`❌ Erreur boutiques impayées:`, error.message);
      console.error(`   📊 Stack:`, error.stack);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new LoyerController();