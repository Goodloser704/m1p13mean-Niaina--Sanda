const { validationResult } = require('express-validator');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');
const Recepisse = require('../models/Recepisse');
const Boutique = require('../models/Boutique');
const Espace = require('../models/Espace');
const notificationService = require('../services/notificationService');

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
      if (req.user.role !== 'Commercant') {
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
          proprietaire: req.user._id,
          statutBoutique: 'Actif'
        }).populate('espace');
      } else {
        // Prendre la première boutique active du commerçant
        boutique = await Boutique.findOne({ 
          proprietaire: req.user._id,
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
      const adminUser = await require('../models/User').findOne({ role: 'admin' });
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
      const descriptionTransaction = `Loyer boutique ${boutique.nom} - Période ${periodeLoyer} - Espace ${boutique.espace.numero}`;
      
      const transaction = await PFTransaction.creerTransaction({
        fromWallet: portefeuilleCommercant._id,
        toWallet: portefeuilleAdmin._id,
        type: 'Loyer',
        amount: montantLoyer,
        description: descriptionTransaction
      });

      console.log(`✅ Transaction créée: ${transaction._id}`);

      // Créer le reçu
      const recepisse = await Recepisse.create({
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
}

module.exports = new LoyerController();