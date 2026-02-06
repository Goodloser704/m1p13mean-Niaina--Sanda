const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

/**
 * 🔧 Script pour lister et corriger les comptes admin
 */

async function listAndFixAdmins() {
  try {
    console.log('🔍 Analyse des comptes administrateurs...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher tous les admins (avec différentes casses)
    const admins = await User.find({
      $or: [
        { role: 'Admin' },
        { role: 'admin' },
        { role: 'ADMIN' }
      ]
    });

    console.log(`📋 Comptes administrateurs trouvés: ${admins.length}\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.prenoms} ${admin.nom}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🎭 Rôle: "${admin.role}"`);
      console.log(`   🆔 ID: ${admin._id}`);
      console.log(`   ✅ Actif: ${admin.isActive}`);
      console.log('');
    });

    // Proposer une correction
    console.log('🔧 CORRECTION PROPOSÉE:');
    console.log('1. Garder admin@mallapp.com avec le rôle "Admin"');
    console.log('2. Supprimer ou désactiver admin@mall.com avec le rôle "admin"\n');

    // Corriger le rôle de admin@mallapp.com s'il n'est pas "Admin"
    const mainAdmin = admins.find(a => a.email === 'admin@mallapp.com');
    if (mainAdmin && mainAdmin.role !== 'Admin') {
      console.log(`🔄 Correction du rôle de ${mainAdmin.email}...`);
      mainAdmin.role = 'Admin';
      await mainAdmin.save();
      console.log(`✅ Rôle corrigé: ${mainAdmin.role}\n`);
    }

    // Désactiver l'ancien admin@mall.com
    const oldAdmin = admins.find(a => a.email === 'admin@mall.com' && a.role === 'admin');
    if (oldAdmin) {
      console.log(`🔄 Désactivation de ${oldAdmin.email}...`);
      oldAdmin.isActive = false;
      await oldAdmin.save();
      console.log(`✅ Compte désactivé\n`);
    }

    console.log('✅ Correction terminée!');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec:');
    console.log('   📧 Email: admin@mallapp.com');
    console.log('   🔑 Mot de passe: (votre mot de passe actuel)');

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
listAndFixAdmins();
