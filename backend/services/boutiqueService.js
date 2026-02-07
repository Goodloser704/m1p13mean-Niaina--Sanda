const Boutique = require('../models/Boutique');
const User = require('../models/User');
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

      // Vérifier si une boutique avec le même nom existe déjà pour cet utilisateur
      const existingBoutique = await Boutique.findOne({ 
        commercant: userId, 
        nom: boutiqueData.nom 
      });
      if (existingBoutique) {
        throw new Error('Vous avez déjà une boutique avec ce nom');
      }

      // Créer la boutique avec le statut EnAttente (en attente de validation admin)
      const boutique = new Boutique({
        commercant: userId,
        ...boutiqueData,
        statutBoutique: 'EnAttente' // Boutique en attente de validation
      });

      await boutique.save();

      // Créer les notifications pour les admins
      await this.createBoutiqueNotification(boutique, user);

      console.log(`✅ Boutique créée: ${boutique.nom} par ${user.email}`);
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
   * 📋 Obtenir les boutiques en attente (Admin)
   */
  async getPendingBoutiques() {
    try {
      const boutiques = await Boutique.find({ statutBoutique: 'EnAttente' })
        .populate('commercant', 'nom prenoms email telephone') // Utiliser 'prenoms' selon spécifications
        .sort({ dateCreation: -1 });

      return boutiques;
    } catch (error) {
      console.error('❌ Erreur récupération boutiques en attente:', error.message);
      throw new Error('Erreur lors de la récupération des boutiques en attente');
    }
  }

  /**
   * ✅ Approuver une boutique (Admin)
   */
  async approveBoutique(boutiqueId, adminId) {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('commercant', 'nom prenoms email'); // Utiliser 'prenoms' selon spécifications

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      if (boutique.statutBoutique !== 'EnAttente') {
        throw new Error('Cette boutique a déjà été traitée');
      }

      // Mettre à jour le statut
      boutique.statut = 'approuve';
      await boutique.save();

      // Créer notification pour le propriétaire
      await notificationService.createNotification({
        type: 'boutique_approved',
        title: '✅ Boutique approuvée',
        message: `Félicitations ! Votre boutique "${boutique.nom}" a été approuvée et est maintenant active dans le centre commercial.`,
        recipient: boutique.proprietaire._id,
        recipientRole: 'boutique',
        relatedEntity: {
          entityType: 'Boutique',
          entityId: boutique._id
        },
        data: {
          boutiqueId: boutique._id,
          boutiqueName: boutique.nom,
          approvalDate: new Date()
        },
        priority: 'high',
        actionRequired: false
      });

      console.log(`✅ Boutique approuvée: ${boutique.nom}`);
      return boutique;

    } catch (error) {
      console.error('❌ Erreur approbation boutique:', error.message);
      throw error;
    }
  }

  /**
   * ❌ Rejeter une boutique (Admin)
   */
  async rejectBoutique(boutiqueId, adminId, reason = '') {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('proprietaire', 'nom prenom email');

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      if (boutique.statut !== 'en_attente') {
        throw new Error('Cette boutique a déjà été traitée');
      }

      // Supprimer la boutique (ou marquer comme rejetée)
      await Boutique.findByIdAndDelete(boutiqueId);

      // Créer notification pour le propriétaire
      await notificationService.createNotification({
        type: 'boutique_rejected',
        title: '❌ Boutique rejetée',
        message: `Votre demande d'inscription pour la boutique "${boutique.nom}" a été rejetée. ${reason ? `Raison: ${reason}` : ''}`,
        recipient: boutique.proprietaire._id,
        recipientRole: 'boutique',
        relatedEntity: {
          entityType: 'Boutique',
          entityId: boutique._id
        },
        data: {
          boutiqueId: boutique._id,
          boutiqueName: boutique.nom,
          rejectionReason: reason,
          rejectionDate: new Date()
        },
        priority: 'high',
        actionRequired: false
      });

      console.log(`❌ Boutique rejetée: ${boutique.nom}`);
      return { message: 'Boutique rejetée', reason };

    } catch (error) {
      console.error('❌ Erreur rejet boutique:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 Obtenir une boutique par ID
   */
  async getBoutiqueById(boutiqueId) {
    try {
      const boutique = await Boutique.findById(boutiqueId)
        .populate('proprietaire', 'nom prenom email telephone');

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
        .populate('categorie', 'nom description')
        .populate('espace', 'code surface')
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
        .populate('espace', 'code surface');
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
        proprietaire: userId
      });

      if (!boutique) {
        throw new Error('Boutique non trouvée ou vous n\'êtes pas le propriétaire');
      }

      // Ne pas permettre de changer le statut via cette méthode
      delete updateData.statut;
      delete updateData.proprietaire;

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
   * 🗑️ Supprimer une boutique (seulement si en attente)
   */
  async deleteBoutique(boutiqueId, userId) {
    try {
      const boutique = await Boutique.findOne({
        _id: boutiqueId,
        proprietaire: userId
      });

      if (!boutique) {
        throw new Error('Boutique non trouvée ou vous n\'êtes pas le propriétaire');
      }

      if (boutique.statut !== 'en_attente') {
        throw new Error('Seules les boutiques en attente peuvent être supprimées');
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
            _id: '$statut',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalBoutiques = await Boutique.countDocuments();
      const boutiquesParCategorie = await Boutique.aggregate([
        { $match: { statut: 'approuve' } },
        {
          $group: {
            _id: '$categorie',
            count: { $sum: 1 }
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
   * 🏪 Obtenir toutes les boutiques (Admin seulement)
   */
  async getAllBoutiques() {
    try {
      console.log('🔍 Récupération de toutes les boutiques approuvées...');
      
      const boutiques = await Boutique.find({ statutBoutique: 'Actif' })
        .populate('commercant', 'nom prenoms email telephone') // Utiliser 'prenoms' selon spécifications
        .sort({ createdAt: -1 });

      console.log(`✅ ${boutiques.length} boutiques actives trouvées`);
      return boutiques;
    } catch (error) {
      console.error('❌ Erreur récupération toutes boutiques:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }
}

module.exports = new BoutiqueService();