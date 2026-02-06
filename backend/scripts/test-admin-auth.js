const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

/**
 * 🧪 Script pour tester l'authentification admin
 */

async function testAdminAuth() {
  try {
    console.log('🧪 Test d\'authentification admin...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher l'admin
    const email = 'admin@mallapp.com';
    console.log(`🔍 Recherche de: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Utilisateur non trouvé`);
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   👤 Nom: ${user.prenoms} ${user.nom}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🎭 Rôle: "${user.role}"`);
    console.log(`   🆔 ID: ${user._id}`);
    console.log(`   ✅ Actif: ${user.isActive}`);
    console.log('');

    // Générer un token JWT
    console.log('🔑 Génération d\'un token JWT...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    console.log(`✅ Token généré: ${token.substring(0, 50)}...`);
    console.log('');

    // Décoder le token
    console.log('🔍 Décodage du token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log(`✅ Token décodé - User ID: ${decoded.id}`);
    console.log('');

    // Récupérer l'utilisateur depuis le token
    console.log('👤 Récupération de l\'utilisateur depuis le token...');
    const userFromToken = await User.findById(decoded.id).select('-password -mdp');
    
    if (!userFromToken) {
      console.log(`❌ Utilisateur non trouvé depuis le token`);
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Utilisateur récupéré:`);
    console.log(`   👤 Nom: ${userFromToken.prenoms} ${userFromToken.nom}`);
    console.log(`   📧 Email: ${userFromToken.email}`);
    console.log(`   🎭 Rôle: "${userFromToken.role}"`);
    console.log('');

    // Vérifier les autorisations
    console.log('🛡️  Vérification des autorisations...');
    const allowedRoles = ['Admin'];
    const isAuthorized = allowedRoles.includes(userFromToken.role);
    
    if (isAuthorized) {
      console.log(`✅ Autorisation accordée pour le rôle "${userFromToken.role}"`);
    } else {
      console.log(`❌ Autorisation refusée pour le rôle "${userFromToken.role}"`);
      console.log(`   Rôles autorisés: ${allowedRoles.join(', ')}`);
    }

    console.log('\n🎉 Test terminé!');
    console.log('\n💡 Pour utiliser ce token dans vos requêtes:');
    console.log(`   Authorization: Bearer ${token}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
testAdminAuth();
