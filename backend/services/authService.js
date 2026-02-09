const jwt = require('jsonwebtoken');
const User = require('../models/User');
const notificationService = require('./notificationService');

/**
 * 🔐 Service d'Authentification - CONFORME AUX SPÉCIFICATIONS
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
    console.log('🔧 [SERVICE] === DEBUT createUser ===');
    console.log('🔧 [SERVICE] Données reçues:', JSON.stringify(userData, null, 2));
    
    const { email, mdp, nom, prenoms, role, telephone, photo, genre } = userData;
    let user;
    
    try {
      console.log('🔧 [SERVICE] Étape 1: Vérification email existant...');
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        console.log('🔧 [SERVICE] Email déjà existant - erreur');
        throw new Error('Cet email est déjà utilisé');
      }
      console.log('✅ [SERVICE] Email disponible');

      console.log('🔧 [SERVICE] Étape 2: Création objet User...');
      
      // Créer l'utilisateur avec les champs conformes aux spécifications
      user = new User({
        email,
        mdp,
        nom,
        prenoms,
        role,
        telephone,
        photo: photo || undefined, // Utiliser la valeur fournie ou undefined (pas null)
        genre: genre || undefined, // Utiliser la valeur fournie ou undefined (pas null)
        isActive: true // Explicitly set to true to ensure account is active
      });

      console.log('🔧 [SERVICE] Étape 3: Sauvegarde User en base...');
      await user.save();
      console.log('✅ [SERVICE] User sauvegardé avec succès - ID:', user._id);

      // Créer le portefeuille automatiquement selon les spécifications
      console.log('🔧 [SERVICE] Étape 4: Création PorteFeuille...');
      const PorteFeuille = require('../models/PorteFeuille');
      const portefeuille = await PorteFeuille.creerPourUtilisateur(user._id);
      console.log('✅ [SERVICE] PorteFeuille créé avec succès - ID:', portefeuille._id);

      // Générer le token
      const token = this.generateToken(user._id);

      const result = {
        message: 'Inscription réussie',
        token,
        user: user.getPublicProfile(),
        portefeuille
      };

      console.log('✅ [SERVICE] === FIN createUser RÉUSSI ===');
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] ERREUR lors de createUser:', error.message);
      throw error;
    }
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
  async authenticateUser(email, mdp) {
    // Trouver l'utilisateur
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(mdp);
    if (!isMatch) {
      throw new Error('Identifiants invalides');
    }

    // Générer le token
    const token = this.generateToken(user._id);
    
    return {
      token,
      user: user.getPublicProfile()
    };
  }

  /**
   * 👤 Obtenir le profil utilisateur complet
   */
  async getUserProfile(user) {
    return user.getPublicProfile();
  }

  /**
   * 📝 Mettre à jour le profil utilisateur
   */
  async updateUserProfile(userId, profileData) {
    const { nom, prenoms, email, telephone, photo, genre } = profileData;

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
    if (prenoms) updateData.prenoms = prenoms;
    if (email) updateData.email = email;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (photo !== undefined) updateData.photo = photo;
    if (genre !== undefined) updateData.genre = genre;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    console.log(`✅ Profil mis à jour pour utilisateur ${userId}`);
    
    return updatedUser.getPublicProfile();
  }
}

module.exports = new AuthService();