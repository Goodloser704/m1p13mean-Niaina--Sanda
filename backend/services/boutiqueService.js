const Boutique = require('../models/Boutique');
const User = require('../models/User');
const CategorieBoutique = require('../models/CategorieBoutique');
const notificationService = require('./notificationService');

/**
 * 🏪 Service de Boutique
 * Gère les inscriptions et validations de boutiques
 */
class BoutiqueService {

  /**
   * 📝 Créer une nouvelle inscription boutique
   */
  async createBoutiqueRegistration(userId, boutiqueData) {
    try {
      // Vérifier que l'utilisateur existe et a le rôle Commercant
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Accepter 'Commercant' ou 'boutique' pour compatibilité
      if (user.role !== 'Commercant' && user.role !== 'boutique') {
        throw new Error('Seuls les commerçants peuvent créer une boutique');
      }

      // Vérifier que la catégorie existe et est active
      if (!boutiqueData.categorie) {
        throw new Error('La catégorie est requise');
      }

      const categorie = await CategorieBoutique.findById(boutiqueData.categorie);
      if (!categorie) {
        throw new Error('Catégorie non trouvée');
      }

      if (!categorie.isActive) {
        throw new Error('Cette catégorie n\'est plus disponible');
      }

      // Vérifier si une boutique avec le même nom existe déjà pour cet utilisateur
      const existingBoutique = await Boutique.findOne({ 
        commercant: userId, 
        nom: boutiqueData.nom 
      });
      if (existingBoutique) {
        throw new Error('Vous avez déjà une boutique avec ce nom');
      }

      // Créer la boutique avec le statut Inactif (devient Actif après approbation demande location)
      const boutique = new Boutique({
        commercant: user,
        ...boutiqueData,
        statutBoutique: 'Inactif' // Boutique inactive par défaut
      });

      await boutique.save();

      console.log(`✅ Boutique créée: ${boutique.nom} par ${user.email} (statut: Inactif)`);
      return boutique;

    } catch (error) {
      console.error('❌ Erreur création boutique:', error.message);
      throw error;
    }
  }

  /**
   * 🔔 Créer notification pour les admins
   */
  async createBoutiqueNotification(boutique, user) {
    try {
      console.log(`🔔 Création notification pour boutique: ${boutique.nom}`);
      
      // Récupérer tous les admins actifs (accepter Admin et admin)
      const adminUsers = await User.find({ 
        role: { $in: ['Admin', 'admin'] }, 
        isActive: true 
      }).select('_id email nom prenoms'); // Utiliser 'prenoms' selon spécifications

      console.log(`👥 Admins trouvés: ${adminUsers.length}`);
      
      if (adminUsers.length === 0) {
        console.warn('⚠️ Aucun admin trouvé pour recevoir la notification');
        return [];
      }

      // Créer les notifications pour tous les admins
      const notifications = await Promise.all(
        adminUsers.map(async (admin) => {
          console.log(`📧 Création notification pour admin: ${admin.email}`);
          
          try {
            const notif = await notificationService.createNotification({
              type: 'Paiement', // Type valide dans l'enum
              title: '🏪 Nouvelle inscription boutique',
              message: `${user.prenoms} ${user.nom} a inscrit sa boutique "${boutique.nom}" et attend votre validation.`,
              receveur: admin._id, // Utiliser 'receveur' au lieu de 'recipient'
              recipient: admin._id,
              recipientRole: 'admin',
              relatedEntity: {
                entityType: 'Boutique',
                entityId: boutique._id
              },
              data: {
                boutiqueId: boutique._id,
                boutiqueName: boutique.nom,
                ownerName: `${user.prenoms} ${user.nom}`,
                ownerEmail: user.email,
                category: boutique.categorie,
                registrationDate: new Date()
              },
              priority: 'high',
              actionRequired: true,
              actionType: 'approve_boutique',
              actionUrl: `/admin/boutiques/pending/${boutique._id}`
            });
            
            console.log(`✅ Notification créée pour ${admin.email}: ${notif._id}`);
            return notif;
          } catch (notifError) {
            console.error(`❌ Erreur création notification pour ${admin.email}:`, notifError.message);
            console.error(`   Stack:`, notifError.stack);
            throw notifError;
          }
        })
      );

      console.log(`✅ ${notifications.length} notifications créées pour la boutique ${boutique.nom}`);
      return notifications;

    } catch (error) {
      console.error('❌ Erreur création notification boutique:', error.message);
      console.error('   Stack:', error.stack);
      // NE PAS catcher silencieusement - laisser l'erreur remonter
      throw error;
    }
  }

  /**
   * 📋 Obtenir les boutiques inactives (pour admin)
   * Note: Les boutiques sont créées Inactif et deviennent Actif via demande de location
   */
  async getPendingBoutiques() {
    try {
      const boutiques = await Boutique.find({ statutBoutique: 'Inactif' })
        .populate('commercant', 'nom prenoms email telephone')
        .populate('categorie', 'nom description')
        .populate('espace', 'code etage')
        .sort({ dateCreation: -1 });

      return boutiques;
    } catch (error) {
      console.error('❌ Erreur récupération boutiques inactives:', error.message);
      throw new Error('Erreur lors de la récupération des boutiques inactives');
    }
  }

  /**
   * ✅ Activer une boutique (via approbation demande de location)
   * Note: Cette méthode est appelée quand une demande de location est approuvée
   */
  async approveBoutique(boutiqueId, adminId) {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('commercant', 'nom prenoms email')
        .populate('categorie', 'nom description');

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      if (boutique.statutBoutique === 'Actif') {
        throw new Error('Cette boutique est déjà active');
      }

      // Mettre à jour le statut
      boutique.statutBoutique = 'Actif';
      await boutique.save();

      // Créer notification pour le propriétaire
      await notificationService.createNotification({
        type: 'Paiement',
        title: '✅ Boutique activée',
        message: `Votre boutique "${boutique.nom}" a été activée et est maintenant visible dans le centre commercial.`,
        receveur: boutique.commercant._id,
        recipient: boutique.commercant._id,
        recipientRole: 'boutique',
        relatedEntity: {
          entityType: 'Boutique',
          entityId: boutique._id
        },
        data: {
          boutiqueId: boutique._id,
          boutiqueName: boutique.nom,
          activationDate: new Date()
        },
        priority: 'high',
        actionRequired: false
      });

      console.log(`✅ Boutique activée: ${boutique.nom}`);
      return boutique;

    } catch (error) {
      console.error('❌ Erreur activation boutique:', error.message);
      throw error;
    }
  }

  /**
   * ❌ Désactiver une boutique (Admin)
   * Note: Remplace le rejet - une boutique peut être désactivée
   */
  async rejectBoutique(boutiqueId, adminId, reason = '') {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('commercant', 'nom prenoms email');

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      // Désactiver la boutique
      boutique.statutBoutique = 'Inactif';
      await boutique.save();

      // Créer notification pour le propriétaire
      await notificationService.createNotification({
        type: 'Paiement',
        title: '⚠️ Boutique désactivée',
        message: `Votre boutique "${boutique.nom}" a été désactivée. ${reason ? `Raison: ${reason}` : ''}`,
        receveur: boutique.commercant._id,
        recipient: boutique.commercant._id,
        recipientRole: 'boutique',
        relatedEntity: {
          entityType: 'Boutique',
          entityId: boutique._id
        },
        data: {
          boutiqueId: boutique._id,
          boutiqueName: boutique.nom,
          deactivationReason: reason,
          deactivationDate: new Date()
        },
        priority: 'high',
        actionRequired: false
      });

      console.log(`❌ Boutique désactivée: ${boutique.nom}`);
      return { message: 'Boutique désactivée', reason };

    } catch (error) {
      console.error('❌ Erreur désactivation boutique:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 Obtenir une boutique par ID
   */
  async getBoutiqueById(boutiqueId) {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('commercant', 'nom prenom email telephone');

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      return boutique;
    } catch (error) {
      console.error('❌ Erreur récupération boutique:', error.message);
      throw error;
    }
  }

  /**
   * 🏪 Obtenir toutes les boutiques d'un utilisateur
   */
  async getUserBoutiques(userId) {
    try {
      const boutiques = await Boutique.find({ commercant: userId })
        .populate([
          { path: 'commercant', select: 'nom prenoms' },
          { path: 'categorie', select: 'nom description' },
          { 
            path: 'espace', 
            select: 'code surface loyer',
            populate: { path: 'etage', select: 'nom niveau' } 
          }
        ])
        .sort({ createdAt: -1 });
      return boutiques;
    } catch (error) {
      console.error('❌ Erreur récupération boutiques utilisateur:', error.message);
      throw error;
    }
  }

  /**
   * 🏪 Obtenir une boutique spécifique d'un utilisateur
   */
  async getUserBoutique(userId, boutiqueId = null) {
    try {
      let query = { commercant: userId };
      if (boutiqueId) {
        query._id = boutiqueId;
      }
      
      const boutique = await Boutique.findOne(query)
        .populate('categorie', 'nom description')
        .populate('espace', 'code surface loyer'); // Ajout de 'loyer'
      return boutique;
    } catch (error) {
      console.error('❌ Erreur récupération boutique utilisateur:', error.message);
      throw error;
    }
  }

  /**
   * ✏️ Mettre à jour une boutique
   */
  async updateBoutique(boutiqueId, userId, updateData) {
    try {
      const boutique = await Boutique.findOne({
        _id: boutiqueId,
        commercant: userId
      });

      if (!boutique) {
        throw new Error('Boutique non trouvée ou vous n\'êtes pas le propriétaire');
      }

      // Ne pas permettre de changer le statut via cette méthode
      delete updateData.statut;
      delete updateData.commercant;

      console.log(`Boutique updatedData: ${JSON.stringify(updateData)}`);

      Object.assign(boutique, updateData);
      await boutique.save();

      console.log(`✅ Boutique mise à jour: ${boutique.nom}`);
      return boutique;

    } catch (error) {
      console.error('❌ Erreur mise à jour boutique:', error.message);
      throw error;
    }
  }

  /**
   * 🗑️ Supprimer une boutique
   */
  async deleteBoutique(boutiqueId, userId) {
    try {
      const boutique = await Boutique.findOne({
        _id: boutiqueId,
        commercant: userId
      });

      if (!boutique) {
        throw new Error('Boutique non trouvée ou vous n\'êtes pas le propriétaire');
      }

      await Boutique.findByIdAndDelete(boutiqueId);
      console.log(`✅ Boutique supprimée: ${boutique.nom}`);
      
      return { message: 'Boutique supprimée avec succès' };

    } catch (error) {
      console.error('❌ Erreur suppression boutique:', error.message);
      throw error;
    }
  }
  
  async getBoutiqueStats() {
    try {
      const stats = await Boutique.aggregate([
        {
          $group: {
            _id: '$statutBoutique',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            statutBoutique: '$_id',
            count: 1
          }
        }
      ]);
  
      const totalBoutiques = await Boutique.countDocuments();
  
      // Stats par catégorie (avec lookup pour récupérer le nom)
      const boutiquesParCategorie = await Boutique.aggregate([
        {
          $lookup: {
            from: 'categorieboutiques', // nom collection exacte dans MongoDb
            localField: 'categorie',
            foreignField: '_id',
            as: 'categorieInfo'
          }
        },
        {
          $unwind: '$categorieInfo'
        },
        {
          $group: {
            _id: '$categorieInfo.nom',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            categorie: '$_id',
            count: 1
          }
        }
      ]);
  
      return {
        parStatut: stats,
        total: totalBoutiques,
        parCategorie: boutiquesParCategorie
      };
  
    } catch (error) {
      console.error('❌ Erreur statistiques boutiques:', error.message);
      throw error;
    }
  }

  /**
   * 🏪 Obtenir toutes les boutiques avec pagination
   */
  async getAllBoutiques(page = 1, limit = 20) {
    try {
      console.log(`🔍 Récupération de toutes les boutiques approuvées (page ${page}, limit ${limit})...`);
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const boutiques = await Boutique.find({ statutBoutique: 'Actif' })
        .populate('commercant', 'nom prenoms email telephone')
        .populate('categorie', 'nom description')
        .populate('espace', 'code etage')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Boutique.countDocuments({ statutBoutique: 'Actif' });

      console.log(`✅ ${boutiques.length} boutiques actives trouvées (total: ${total})`);
      
      return {
        boutiques,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération toutes boutiques:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * 🏪 Obtenir toutes les boutiques par statut avec pagination
   */
  async getAllBoutiquesByStatut(statut, page = 1, limit = 20) {
    try {
      console.log(`🔍 Récupération boutiques par statut: ${statut} (page ${page}, limit ${limit})...`);
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Valider le statut
      const statutsValides = ['Actif', 'Inactif'];
      if (!statutsValides.includes(statut)) {
        throw new Error(`Statut invalide. Valeurs acceptées: ${statutsValides.join(', ')}`);
      }
      
      const boutiques = await Boutique.find({ statutBoutique: statut })
        .populate([
          { path: 'commercant', select: 'nom prenoms email telephone' },
          { path: 'categorie', select: 'nom description' },
          { 
            path: 'espace', 
            select: 'code etage',
            populate: { path: 'etage', select: 'nom niveau' }
          }
        ])
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Boutique.countDocuments({ statutBoutique: statut });

      console.log(`✅ ${boutiques.length} boutiques trouvées avec statut ${statut} (total: ${total})`);
      
      return {
        boutiques,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération boutiques par statut:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * 🏪 Obtenir les boutiques d'un propriétaire (alias pour getUserBoutiques)
   */
  async getBoutiquesByOwner(userId) {
    return await this.getUserBoutiques(userId);
  }
}

module.exports = new BoutiqueService();
module.exports = new BoutiqueService();
