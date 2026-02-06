const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

/**
 * 🔧 Script pour corriger l'email de l'admin
 * Change admin@mallapp.com en admin@mall.com
 */

async function fixAdminEmail() {
  try {
    console.log('🔧 Correction de l\'email admin...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher l'utilisateur avec l'ancien email
    const oldEmail = 'admin@mallapp.com';
    const newEmail = 'admin@mall.com';

    console.log(`🔍 Recherche de l'utilisateur: ${oldEmail}`);
    const user = await User.findOne({ email: oldEmail });

    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${oldEmail}`);
      console.log(`\n💡 Vérification des admins existants...`);
      
      const admins = await User.find({ role: 'Admin' });
      console.log(`\n📋 Admins trouvés (${admins.length}):`);
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin._id})`);
      });
      
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   👤 Nom: ${user.prenoms} ${user.nom}`);
    console.log(`   📧 Email actuel: ${user.email}`);
    console.log(`   🎭 Rôle: ${user.role}`);
    console.log(`   🆔 ID: ${user._id}`);

    // Vérifier si le nouvel email existe déjà
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      console.log(`\n⚠️  Un utilisateur avec l'email ${newEmail} existe déjà!`);
      console.log(`   🆔 ID: ${existingUser._id}`);
      console.log(`   🎭 Rôle: ${existingUser.role}`);
      console.log(`\n💡 Vous devez d'abord supprimer ou modifier cet utilisateur.`);
      await mongoose.disconnect();
      return;
    }

    // Mettre à jour l'email
    console.log(`\n🔄 Mise à jour de l'email...`);
    user.email = newEmail;
    await user.save();

    console.log(`✅ Email mis à jour avec succès!`);
    console.log(`   📧 Nouvel email: ${user.email}`);
    console.log(`\n🎉 Vous pouvez maintenant vous connecter avec: ${newEmail}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
fixAdminEmail();
