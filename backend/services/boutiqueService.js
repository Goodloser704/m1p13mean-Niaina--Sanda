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
      // Vérifier que l'utilisateur existe et a le rôle boutique
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.role !== 'boutique') {
        throw new Error('Seuls les utilisateurs avec le rôle boutique peuvent créer une boutique');
      }

      // Vérifier si l'utilisateur a déjà une boutique
      const existingBoutique = await Boutique.findOne({ proprietaire: userId });
      if (existingBoutique) {
        throw new Error('Vous avez déjà une boutique enregistrée');
      }

      // Créer la boutique
      const boutique = new Boutique({
        proprietaire: userId,
        ...boutiqueData,
        statut: 'en_attente'
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
      // Récupérer tous les admins actifs
      const adminUsers = await User.find({ 
        role: 'admin', 
        isActive: true 
      }).select('_id email nom prenom');

      if (adminUsers.length === 0) {
        console.warn('⚠️ Aucun admin trouvé pour recevoir la notification');
        return [];
      }

      // Créer les notifications pour tous les admins
      const notifications = await Promise.all(
        adminUsers.map(admin => 
          notificationService.createNotification({
            type: 'boutique_registration',
            title: '🏪 Nouvelle inscription boutique',
            message: `${user.prenom} ${user.nom} a inscrit sa boutique "${boutique.nom}" et attend votre validation.`,
            recipient: admin._id,
            recipientRole: 'admin',
            relatedEntity: {
              entityType: 'Boutique',
              entityId: boutique._id
            },
            data: {
              boutiqueId: boutique._id,
              boutiqueName: boutique.nom,
              ownerName: `${user.prenom} ${user.nom}`,
              ownerEmail: user.email,
              category: boutique.categorie,
              registrationDate: new Date()
            },
            priority: 'high',
            actionRequired: true,
            actionType: 'approve_boutique',
            actionUrl: `/admin/boutiques/pending/${boutique._id}`
          })
        )
      );

      console.log(`✅ ${notifications.length} notifications créées pour la boutique ${boutique.nom}`);
      return notifications;

    } catch (error) {
      console.error('❌ Erreur création notification boutique:', error.message);
      throw error;
    }
  }

  /**
   * 📋 Obtenir les boutiques en attente (Admin)
   */
  async getPendingBoutiques() {
    try {
      const boutiques = await Boutique.find({ statut: 'en_attente' })
        .populate('proprietaire', 'nom prenom email telephone')
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
        .populate('proprietaire', 'nom prenom email');

      if (!boutique) {
        throw new Error('Boutique non trouvée');
      }

      if (boutique.statut !== 'en_attente') {
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
   * 🏪 Obtenir la boutique d'un utilisateur
   */
  async getUserBoutique(userId) {
    try {
      const boutique = await Boutique.findOne({ proprietaire: userId });
      return boutique;
    } catch (error) {
      console.error('❌ Erreur récupération boutique utilisateur:', error.message);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les statistiques des boutiques (Admin)
   */
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
}

module.exports = new BoutiqueService();