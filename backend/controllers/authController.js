const { validationResult } = require('express-validator');
const authService = require('../services/authService');

/**
 * 🎮 Contrôleur d'Authentification
 * Gère les requêtes HTTP et appelle les services appropriés
 */
class AuthController {

  /**
   * 📝 Inscription d'un nouvel utilisateur
   */
  async register(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] Tentative d'inscription`);
    console.log(`   📧 Email: ${req.body.email}`);
    console.log(`   👤 Rôle: ${req.body.role}`);
    
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

      // Appeler le service
      console.log(`➕ Création nouvel utilisateur: ${req.body.email}`);
      const result = await authService.createUser(req.body);
      
      console.log(`✅ Utilisateur créé avec succès: ${result.user.id}`);
      
      // Message différent selon le rôle
      if (req.body.role === 'boutique') {
        console.log(`🔔 Notification envoyée aux admins pour validation boutique`);
      } else {
        console.log(`🎫 Token généré pour: ${result.user.id}`);
      }

      res.status(201).json({
        message: result.message,
        token: result.token,
        user: result.user
      });

    } catch (error) {
      console.error(`❌ Erreur inscription:`, error.message);
      
      if (error.message === 'Cet email est déjà utilisé') {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔐 Connexion d'un utilisateur
   */
  async login(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] Tentative de connexion`);
    console.log(`   📧 Email: ${req.body.email}`);
    
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

      const { email, password } = req.body;

      // Appeler le service
      console.log(`🔍 Authentification utilisateur: ${email}`);
      const result = await authService.authenticateUser(email, password);
      
      console.log(`✅ Connexion réussie: ${result.user.id} (${result.user.role})`);
      console.log(`🎫 Token généré et envoyé`);

      res.json({
        message: 'Connexion réussie',
        ...result
      });

    } catch (error) {
      console.error(`❌ Erreur connexion:`, error.message);
      
      if (error.message.includes('Identifiants invalides') || 
          error.message.includes('Compte désactivé')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 👤 Obtenir le profil de l'utilisateur connecté
   */
  async getProfile(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`👤 [${timestamp}] Demande profil utilisateur`);
    console.log(`   🎫 User ID: ${req.user._id}`);
    console.log(`   👤 Rôle: ${req.user.role}`);
    
    try {
      // Appeler le service
      const userProfile = await authService.getUserProfile(req.user);
      
      console.log(`✅ Profil envoyé pour: ${req.user._id}`);
      
      res.json({
        user: userProfile
      });

    } catch (error) {
      console.error(`❌ Erreur récupération profil:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔍 Rechercher des utilisateurs (Admin seulement)
   */
  async searchUsers(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Recherche utilisateurs`);
    console.log(`   👤 Admin: ${req.user._id}`);
    console.log(`   🔍 Query: ${req.query.q}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { q: query, role } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ 
          message: 'La recherche doit contenir au moins 2 caractères' 
        });
      }

      // Appeler le service
      const users = await authService.searchUsers(query, role);
      
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      
      res.json({
        users,
        count: users.length
      });

    } catch (error) {
      console.error(`❌ Erreur recherche utilisateurs:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 🔄 Mettre à jour le statut d'un utilisateur (Admin seulement)
   */
  async updateUserStatus(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] Mise à jour statut utilisateur`);
    console.log(`   👤 Admin: ${req.user._id}`);
    console.log(`   🎯 Target: ${req.params.userId}`);
    console.log(`   📊 Status: ${req.body.isActive}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { userId } = req.params;
      const { isActive } = req.body;

      // Appeler le service
      const updatedUser = await authService.updateUserStatus(userId, isActive);
      
      console.log(`✅ Statut mis à jour pour: ${userId}`);
      
      res.json({
        message: 'Statut utilisateur mis à jour',
        user: updatedUser
      });

    } catch (error) {
      console.error(`❌ Erreur mise à jour statut:`, error.message);
      
      if (error.message === 'Utilisateur non trouvé') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * 📋 Obtenir les boutiques en attente de validation (Admin seulement)
   */
  async getPendingBoutiques(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`📋 [${timestamp}] Récupération boutiques en attente`);
    console.log(`   👤 Admin: ${req.user._id}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const pendingBoutiques = await authService.getPendingBoutiques();
      
      console.log(`✅ ${pendingBoutiques.length} boutiques en attente trouvées`);
      
      res.json({
        boutiques: pendingBoutiques,
        count: pendingBoutiques.length
      });

    } catch (error) {
      console.error(`❌ Erreur récupération boutiques:`, error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ✅ Approuver une boutique (Admin seulement)
   */
  async approveBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Approbation boutique`);
    console.log(`   👤 Admin: ${req.user._id}`);
    console.log(`   🏪 Boutique: ${req.params.boutiqueId}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      
      const approvedBoutique = await authService.approveBoutique(boutiqueId, req.user._id);
      
      console.log(`✅ Boutique approuvée: ${approvedBoutique.email}`);
      
      res.json({
        message: 'Boutique approuvée avec succès',
        boutique: {
          id: approvedBoutique._id,
          email: approvedBoutique.email,
          nom: approvedBoutique.nom,
          prenom: approvedBoutique.prenom,
          status: approvedBoutique.status,
          approvedAt: approvedBoutique.approvedAt
        }
      });

    } catch (error) {
      console.error(`❌ Erreur approbation boutique:`, error.message);
      
      if (error.message.includes('non trouvée') || error.message.includes('pas en attente')) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * ❌ Rejeter une boutique (Admin seulement)
   */
  async rejectBoutique(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`❌ [${timestamp}] Rejet boutique`);
    console.log(`   👤 Admin: ${req.user._id}`);
    console.log(`   🏪 Boutique: ${req.params.boutiqueId}`);
    console.log(`   📝 Raison: ${req.body.reason || 'Non spécifiée'}`);
    
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        console.log(`❌ Accès refusé - Rôle: ${req.user.role}`);
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { boutiqueId } = req.params;
      const { reason } = req.body;
      
      const rejectedBoutique = await authService.rejectBoutique(boutiqueId, req.user._id, reason);
      
      console.log(`❌ Boutique rejetée: ${rejectedBoutique.email}`);
      
      res.json({
        message: 'Boutique rejetée',
        boutique: {
          id: rejectedBoutique._id,
          email: rejectedBoutique.email,
          nom: rejectedBoutique.nom,
          prenom: rejectedBoutique.prenom,
          status: rejectedBoutique.status,
          rejectedAt: rejectedBoutique.rejectedAt,
          rejectionReason: rejectedBoutique.rejectionReason
        }
      });

    } catch (error) {
      console.error(`❌ Erreur rejet boutique:`, error.message);
      
      if (error.message.includes('non trouvée') || error.message.includes('pas en attente')) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = new AuthController();