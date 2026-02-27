const mongoose = require('mongoose');
const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');

/**
 * 🔐 Script de création des comptes par défaut - LOCAL
 * Crée 3 comptes de test: Admin, Client, Commerçant
 */

const defaultAccounts = [
  {
    nom: 'Admin',
    prenoms: 'Système',
    email: 'admin@mall.com',
    mdp: 'Admin123456!',
    role: 'Admin',
    telephone: '+261340000001',
    isActive: true
  },
  {
    nom: 'Client',
    prenoms: 'Test',
    email: 'client@test.com',
    mdp: 'Client123456!',
    role: 'Acheteur',
    telephone: '+261340000002',
    isActive: true
  },
  {
    nom: 'Commercant',
    prenoms: 'Test',
    email: 'commercant@test.com',
    mdp: 'Commercant123456!',
    role: 'Commercant',
    telephone: '+261340000003',
    isActive: true
  }
];

async function createAccounts() {
  try {
    console.log('🔐 Création des comptes par défaut...\n');
    
    // Connexion à MongoDB LOCAL
    console.log('📡 Connexion à MongoDB Local...');
    await mongoose.connect('mongodb://localhost:27017/mall_db');
    console.log('✅ Connecté à MongoDB\n');
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const accountData of defaultAccounts) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: accountData.email });
        
        if (existingUser) {
          console.log(`⏭️  ${accountData.role}: ${accountData.email} existe déjà`);
          skipped++;
          continue;
        }
        
        // Créer l'utilisateur
        const user = await User.create(accountData);
        console.log(`✅ ${accountData.role}: ${accountData.email} créé (ID: ${user._id})`);
        
        // Créer le portefeuille
        const portefeuille = await PorteFeuille.create({
          owner: user._id,
          solde: 0
        });
        console.log(`   💰 Portefeuille créé (ID: ${portefeuille._id})`);
        
        created++;
        
      } catch (error) {
        console.error(`❌ Erreur pour ${accountData.email}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 === RÉSUMÉ ===`);
    console.log(`✅ Créés: ${created}`);
    console.log(`⏭️  Ignorés (déjà existants): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📝 Total: ${defaultAccounts.length}\n`);
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

createAccounts();
