const jwt = require('jsonwebtoken');
const User = require('../models/User');
const notificationService = require('./notificationService');

/**
 * 🔐 Service d'Authentification
 * Contient toute la logique métier pour l'authentification
 */
class AuthService {
  
  /**
   * 🎫 Générer un token JWT
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );
  }

  /**
   * 📧 Vérifier si un email existe déjà
   */
  async checkEmailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  /**
   * ➕ Créer un nouvel utilisateur
   */
  async createUser(userData) {
    const { email, password, nom, prenom, role, telephone, adresse } = userData;
    
    // Vérifier si l'email existe déjà
    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer l'utilisateur
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role,
      telephone,
      adresse,
      // Les boutiques sont créées en attente de validation
      isActive: role === 'client' ? true : false,
      status: role === 'boutique' ? 'pending' : 'active'
    });

    await user.save();
    
    // 🔔 Si c'est une boutique, créer une notification pour les admins
    if (role === 'boutique') {
      try {
        await notificationService.createBoutiqueRegistrationNotification(user);
        console.log(`🔔 Notification d'inscription boutique envoyée pour ${email}`);
      } catch (notifError) {
        console.error('⚠️ Erreur notification boutique:', notifError.message);
        // Ne pas faire échouer l'inscription si la notification échoue
      }
    }
    
    // Générer le token seulement si le compte est actif
    let token = null;
    if (user.isActive) {
      token = this.generateToken(user._id);
    }
    
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        isActive: user.isActive,
        status: user.status
      },
      message: role === 'boutique' 
        ? 'Inscription réussie ! Votre demande est en attente de validation par un administrateur.'
        : 'Inscription réussie !'
    };
  }

  /**
   * 🔍 Rechercher un utilisateur par email
   */
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * 🔐 Authentifier un utilisateur
   */
  async authenticateUser(email, password) {
    // Trouver l'utilisateur
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Identifiants invalides');
    }

    // Vérifier le statut du compte
    if (user.role === 'boutique' && user.status === 'pending') {
      throw new Error('Votre compte boutique est en attente de validation par un administrateur');
    }

    if (user.role === 'boutique' && user.status === 'rejected') {
      throw new Error('Votre demande d\'inscription boutique a été refusée');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Générer le token
    const token = this.generateToken(user._id);
    
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        status: user.status
      }
    };
  }

  /**
   * 👤 Obtenir le profil utilisateur complet
   */
  async getUserProfile(user) {
    return {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      adresse: user.adresse,
      dateNaissance: user.dateNaissance,
      genre: user.genre,
      nomBoutique: user.nomBoutique,
      descriptionBoutique: user.descriptionBoutique,
      categorieActivite: user.categorieActivite,
      numeroSiret: user.numeroSiret,
      adresseBoutique: user.adresseBoutique,
      isActive: user.isActive,
      status: user.status,
      createdAt: user.createdAt
    };
  }

  /**
   * 📝 Mettre à jour le profil utilisateur
   */
  async updateUserProfile(userId, profileData) {
    const {
      nom, prenom, email, telephone, adresse, dateNaissance, genre,
      nomBoutique, descriptionBoutique, categorieActivite, numeroSiret, adresseBoutique
    } = profileData;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour les champs
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (adresse !== undefined) updateData.adresse = adresse;
    if (dateNaissance !== undefined) updateData.dateNaissance = dateNaissance;
    if (genre !== undefined) updateData.genre = genre;

    // Champs spécifiques aux propriétaires de boutique
    if (user.role === 'proprietaire' || user.role === 'boutique') {
      if (nomBoutique !== undefined) updateData.nomBoutique = nomBoutique;
      if (descriptionBoutique !== undefined) updateData.descriptionBoutique = descriptionBoutique;
      if (categorieActivite !== undefined) updateData.categorieActivite = categorieActivite;
      if (numeroSiret !== undefined) updateData.numeroSiret = numeroSiret;
      if (adresseBoutique !== undefined) updateData.adresseBoutique = adresseBoutique;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    console.log(`✅ Profil mis à jour pour utilisateur ${userId}`);
    
    return updatedUser;
  }

  /**
   * 🔑 Changer le mot de passe utilisateur
   */
  async changeUserPassword(userId, currentPassword, newPassword) {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    console.log(`✅ Mot de passe changé pour utilisateur ${userId}`);
  }

  /**
   * 🗑️ Supprimer le compte utilisateur
   */
  async deleteUserAccount(userId) {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    console.log(`✅ Compte supprimé pour utilisateur ${userId}`);
  }

  /**
   * 🔍 Rechercher des utilisateurs (pour admin)
   */
  async searchUsers(query, role = null) {
    const searchCriteria = {
      $or: [
        { nom: { $regex: query, $options: 'i' } },
        { prenom: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    if (role) {
      searchCriteria.role = role;
    }

    return await User.find(searchCriteria)
      .select('-password')
      .sort({ createdAt: -1 });
  }

  /**
   * 🔄 Mettre à jour le statut d'un utilisateur
   */
  async updateUserStatus(userId, isActive) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  }

  /**
   * ✅ Approuver une boutique (Admin seulement)
   */
  async approveBoutique(boutiqueId, adminId) {
    const boutique = await User.findOne({
      _id: boutiqueId,
      role: 'boutique'
    });

    if (!boutique) {
      throw new Error('Boutique non trouvée');
    }

    if (boutique.status !== 'pending') {
      throw new Error('Cette boutique n\'est pas en attente de validation');
    }

    // Mettre à jour le statut
    boutique.status = 'approved';
    boutique.isActive = true;
    boutique.approvedBy = adminId;
    boutique.approvedAt = new Date();

    await boutique.save();

    console.log(`✅ Boutique ${boutique.email} approuvée par admin ${adminId}`);
    
    return boutique;
  }

  /**
   * ❌ Rejeter une boutique (Admin seulement)
   */
  async rejectBoutique(boutiqueId, adminId, reason = '') {
    const boutique = await User.findOne({
      _id: boutiqueId,
      role: 'boutique'
    });

    if (!boutique) {
      throw new Error('Boutique non trouvée');
    }

    if (boutique.status !== 'pending') {
      throw new Error('Cette boutique n\'est pas en attente de validation');
    }

    // Mettre à jour le statut
    boutique.status = 'rejected';
    boutique.isActive = false;
    boutique.rejectedBy = adminId;
    boutique.rejectedAt = new Date();
    boutique.rejectionReason = reason;

    await boutique.save();

    console.log(`❌ Boutique ${boutique.email} rejetée par admin ${adminId}`);
    
    return boutique;
  }

  /**
   * 📋 Obtenir les boutiques en attente (Admin seulement)
   */
  async getPendingBoutiques() {
    return await User.find({
      role: 'boutique',
      status: 'pending'
    })
    .select('-password')
    .sort({ createdAt: -1 });
  }
}

module.exports = new AuthService();