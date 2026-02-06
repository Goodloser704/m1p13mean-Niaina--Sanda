const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Importer les modèles
const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');

/**
 * 🔐 Script de création des comptes par défaut
 * Crée 3 comptes de test: Admin, Client, Commerçant
 */

const defaultAccounts = [
  {
    nom: 'Admin',
    prenoms: 'Système',
    email: 'admin@mall.com',
    mdp: 'Admin123456!',
    role: 'Admin',
    telephone: '0340000001',
    isActive: true
  },
  {
    nom: 'Test',
    prenoms: 'Client',
    email: 'client@test.com',
    mdp: 'Client123456!',
    role: 'Acheteur',
    telephone: '0340000002',
    isActive: true
  },
  {
    nom: 'Test',
    prenoms: 'Commerçant',
    email: 'commercant@test.com',
    mdp: 'Commercant123456!',
    role: 'Commercant',
    telephone: '0340000003',
    isActive: true
  }
];

async function createDefaultAccounts() {
  try {
    console.log('🔐 Création des comptes par défaut...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const accountData of defaultAccounts) {
      try {
        // Vérifier si le compte existe déjà
        const existingUser = await User.findOne({ email: accountData.email });
        
        if (existingUser) {
          console.log(`⏭️  ${accountData.role}: ${accountData.email} existe déjà`);
          skipped++;
          continue;
        }

        // Créer l'utilisateur
        const user = new User(accountData);
        await user.save();
        
        // Créer le portefeuille
        const portefeuille = await PorteFeuille.creerPourUtilisateur(user._id);
        
        console.log(`✅ ${accountData.role}: ${accountData.email}`);
        console.log(`   👤 Nom: ${accountData.prenoms} ${accountData.nom}`);
        console.log(`   🎫 ID: ${user._id}`);
        console.log(`   💰 Portefeuille: ${portefeuille._id}\n`);
        
        created++;

      } catch (error) {
        console.error(`❌ Erreur pour ${accountData.email}:`, error.message);
        errors++;
      }
    }

    // Résumé
    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`✅ Créés: ${created}`);
    console.log(`⏭️  Ignorés (déjà existants): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📝 Total: ${defaultAccounts.length}`);

    if (created > 0) {
      console.log('\n🎉 Comptes créés avec succès!');
      console.log('\n📋 Identifiants de connexion:');
      defaultAccounts.forEach(acc => {
        console.log(`   ${acc.role}: ${acc.email} / ${acc.mdp}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
createDefaultAccounts();
