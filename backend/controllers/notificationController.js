const notificationService = require('../services/notificationService');

/**
 * 🔔 Contrôleur des Notifications
 * Gestion des notifications utilisateurs et administrateurs
 */
class NotificationController {

  /**
   * @route   GET /api/notifications
   * @desc    Obtenir les notifications de l'utilisateur connecté
   * @access  Private
   * @query   page, limit, includeRead, type
   * @return  { notifications, unreadCount, pagination }
   */
  async getUserNotifications(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔔 [${timestamp}] Récupération notifications utilisateur`);
    console.log(`   👤 User ID: ${req.user._id}`);
    
    try {
      const { 
        page = 1, 
        limit = 20, 
        includeRead = 'true',
        type = null 
      } = req.query;

      const options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        includeRead: includeRead === 'true',
        type: type || null
      };

      const notifications = await notificationService.getUserNotifications(
        req.user._id, 
        options
      );

      const unreadCount = await notificationService.getUnreadCount(req.user._id);

      console.log(`✅ ${notifications.length} notifications récupérées`);
      
      res.json({
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: notifications.length === parseInt(limit)
        }
      });

    } catch (error) {
      console.error(`❌ Erreur récupération notifications:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔢 Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔢 [${timestamp}] Comptage notifications non lues`);
    console.log(`   👤 User ID: ${req.user._id}`);
    
    try {
      const count = await notificationService.getUnreadCount(req.user._id);
      
      console.log(`✅ ${count} notifications non lues`);
      
      res.json({ unreadCount: count });

    } catch (error) {
      console.error(`❌ Erreur comptage notifications:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✅ Marquer une notification comme lue
   */
  async markAsRead(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Marquage notification comme lue`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🔔 Notification ID: ${req.params.notificationId}`);
    
    try {
      const { notificationId } = req.params;
      
      const notification = await notificationService.markAsRead(
        notificationId, 
        req.user._id
      );

      console.log(`✅ Notification marquée comme lue: ${notification.title}`);
      
      res.json({
        message: 'Notification marquée comme lue',
        notification
      });

    } catch (error) {
      console.error(`❌ Erreur marquage notification:`, error.message);
      
      if (error.message === 'Notification non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✅ Marquer toutes les notifications comme lues
   */
  async markAllAsRead(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Marquage toutes notifications comme lues`);
    console.log(`   👤 User ID: ${req.user._id}`);
    
    try {
      const count = await notificationService.markAllAsRead(req.user._id);

      console.log(`✅ ${count} notifications marquées comme lues`);
      
      res.json({
        message: `${count} notifications marquées comme lues`,
        count
      });

    } catch (error) {
      console.error(`❌ Erreur marquage toutes notifications:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🗑️ Archiver une notification
   */
  async archiveNotification(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🗑️ [${timestamp}] Archivage notification`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`   🔔 Notification ID: ${req.params.notificationId}`);
    
    try {
      const { notificationId } = req.params;
      
      const notification = await notificationService.archiveNotification(
        notificationId, 
        req.user._id
      );

      console.log(`✅ Notification archivée: ${notification.title}`);
      
      res.json({
        message: 'Notification archivée',
        notification
      });

    } catch (error) {
      console.error(`❌ Erreur archivage notification:`, error.message);
      
      if (error.message === 'Notification non trouvée') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 📊 Obtenir les statistiques des notifications (Admin seulement)
   */
  async getAdminStats(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Statistiques notifications admin`);
    console.log(`   👤 Admin ID: ${req.user._id}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const stats = await notificationService.getAdminNotificationStats(req.user._id);

      console.log(`✅ Statistiques récupérées`);
      
      res.json(stats);

    } catch (error) {
      console.error(`❌ Erreur statistiques notifications:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new NotificationController();