const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * 🔔 Service de Notifications
 * Gère toutes les notifications du système
 */
class NotificationService {

  /**
   * 🏪 Créer une notification d'inscription boutique pour les admins
   */
  async createBoutiqueRegistrationNotification(boutiqueUser) {
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
      const notifications = await Notification.createBoutiqueRegistrationNotification(
        boutiqueUser, 
        adminUsers
      );

      console.log(`✅ ${notifications.length} notifications créées pour l'inscription de ${boutiqueUser.email}`);
      return notifications;

    } catch (error) {
      console.error('❌ Erreur création notification boutique:', error.message);
      throw new Error('Erreur lors de la création de la notification');
    }
  }

  /**
   * 📋 Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const notifications = await Notification.getByRecipient(userId, options);
      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error.message);
      throw new Error('Erreur lors de la récupération des notifications');
    }
  }

  /**
   * 🔢 Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.getUnreadCount(userId);
      return count;
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error.message);
      throw new Error('Erreur lors du comptage des notifications');
    }
  }

  /**
   * 🔢 Obtenir le nombre TOTAL de notifications d'un utilisateur
   */
  async getTotalCount(userId, options = {}) {
    try {
      const {
        includeRead = true,
        includeArchived = false,
        type = null
      } = options;

      const query = {
        recipient: userId,
        isArchived: includeArchived
      };

      if (!includeRead) {
        query.isRead = false;
      }

      if (type) {
        query.type = type;
      }

      const count = await Notification.countDocuments(query);
      return count;
    } catch (error) {
      console.error('❌ Erreur comptage total notifications:', error.message);
      throw new Error('Erreur lors du comptage total des notifications');
    }
  }

  /**
   * ✅ Marquer une notification comme lue
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error.message);
      throw error;
    }
  }

  /**
   * ✅ Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      console.log(`✅ ${result.modifiedCount} notifications marquées comme lues pour ${userId}`);
      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error.message);
      throw new Error('Erreur lors du marquage des notifications');
    }
  }

  /**
   * 🗑️ Archiver une notification
   */
  async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      await notification.archive();
      return notification;
    } catch (error) {
      console.error('❌ Erreur archivage notification:', error.message);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les statistiques des notifications pour un admin
   */
  async getAdminNotificationStats(adminId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { recipient: adminId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            unread: { $sum: { $cond: ['$isRead', 0, 1] } },
            actionRequired: { $sum: { $cond: ['$actionRequired', 1, 0] } }
          }
        }
      ]);

      const totalUnread = await this.getUnreadCount(adminId);
      const totalActionRequired = await Notification.countDocuments({
        recipient: adminId,
        actionRequired: true,
        isRead: false
      });

      return {
        byType: stats,
        totalUnread,
        totalActionRequired
      };
    } catch (error) {
      console.error('❌ Erreur stats notifications:', error.message);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * 🔔 Créer une notification générique
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      console.log(`✅ Notification créée: ${notification.title} pour ${notification.recipient}`);
      return notification;
    } catch (error) {
      console.error('❌ Erreur création notification:', error.message);
      throw new Error('Erreur lors de la création de la notification');
    }
  }

  /**
   * 🧹 Nettoyer les anciennes notifications
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isArchived: true,
        isRead: true
      });

      console.log(`🧹 ${result.deletedCount} anciennes notifications supprimées`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error.message);
      throw new Error('Erreur lors du nettoyage des notifications');
    }
  }
}

module.exports = new NotificationService();