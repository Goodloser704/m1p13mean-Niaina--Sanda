const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      adresse
    });

    await user.save();
    
    // Générer le token
    const token = this.generateToken(user._id);
    
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
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
        role: user.role
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
      isActive: user.isActive,
      createdAt: user.createdAt
    };
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
}

module.exports = new AuthService();