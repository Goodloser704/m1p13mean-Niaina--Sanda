const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * 🧹 Script pour nettoyer les comptes admin invalides
 * Supprime les comptes avec le rôle "admin" (minuscule) qui n'est pas valide
 */

async function cleanInvalidAdmins() {
  try {
    console.log('🧹 Nettoyage des comptes admin invalides...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher les comptes avec le rôle invalide "admin" (minuscule)
    const invalidAdmins = await mongoose.connection.db.collection('users').find({
      role: 'admin' // minuscule = invalide
    }).toArray();

    console.log(`📋 Comptes invalides trouvés: ${invalidAdmins.length}\n`);

    if (invalidAdmins.length === 0) {
      console.log('✅ Aucun compte invalide à nettoyer');
      await mongoose.disconnect();
      return;
    }

    invalidAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.prenoms || 'N/A'} ${admin.nom}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🎭 Rôle invalide: "${admin.role}"`);
      console.log(`   🆔 ID: ${admin._id}`);
      console.log('');
    });

    // Supprimer les comptes invalides
    console.log('🗑️  Suppression des comptes invalides...');
    const result = await mongoose.connection.db.collection('users').deleteMany({
      role: 'admin' // minuscule = invalide
    });

    console.log(`✅ ${result.deletedCount} compte(s) supprimé(s)\n`);

    // Vérifier les comptes admin valides restants
    const validAdmins = await mongoose.connection.db.collection('users').find({
      role: 'Admin' // majuscule = valide
    }).toArray();

    console.log(`📋 Comptes Admin valides restants: ${validAdmins.length}\n`);
    validAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.prenoms || 'N/A'} ${admin.nom}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🎭 Rôle: "${admin.role}"`);
      console.log('');
    });

    console.log('✅ Nettoyage terminé!');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec admin@mallapp.com');

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
cleanInvalidAdmins();
