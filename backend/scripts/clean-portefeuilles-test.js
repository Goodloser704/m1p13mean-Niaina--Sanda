require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

/**
 * 🧹 Script de nettoyage des données de test pour les portefeuilles
 * Supprime les utilisateurs de test et leurs données associées
 */

async function cleanPortefeuilles() {
  try {
    console.log('🧹 Nettoyage des données de test...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Liste des emails de test à supprimer
    const testEmails = [
      'jean.dupont@test.com',
      'sophie.martin@test.com',
      'pierre.bernard@test.com',
      'marie.dubois@test.com',
      'luc.petit@test.com',
      'temp.test@test.com',
      'cascade.test@test.com'
    ];

    console.log('📊 État avant nettoyage:');
    const usersBefore = await User.countDocuments();
    const portefeuillesBefore = await PorteFeuille.countDocuments();
    const transactionsBefore = await PFTransaction.countDocuments();
    
    console.log(`  - Utilisateurs: ${usersBefore}`);
    console.log(`  - Portefeuilles: ${portefeuillesBefore}`);
    console.log(`  - Transactions: ${transactionsBefore}\n`);

    // Trouver les utilisateurs de test
    const testUsers = await User.find({ email: { $in: testEmails } });
    console.log(`🔍 Trouvé ${testUsers.length} utilisateurs de test à supprimer\n`);

    let deletedUsers = 0;
    let deletedPortefeuilles = 0;
    let deletedTransactions = 0;

    for (const user of testUsers) {
      console.log(`🗑️  Suppression: ${user.prenoms} ${user.nom} (${user.email})`);
      
      // Trouver le portefeuille de l'utilisateur
      const portefeuille = await PorteFeuille.findOne({ owner: user._id });
      
      if (portefeuille) {
        console.log(`  → Portefeuille trouvé: ${portefeuille.balance}€`);
        
        // Supprimer les transactions liées
        const txResult = await PFTransaction.deleteMany({
          $or: [
            { fromWallet: portefeuille._id },
            { toWallet: portefeuille._id }
          ]
        });
        
        console.log(`  → ${txResult.deletedCount} transactions supprimées`);
        deletedTransactions += txResult.deletedCount;
        
        // Supprimer le portefeuille
        await PorteFeuille.deleteOne({ _id: portefeuille._id });
        console.log(`  → Portefeuille supprimé`);
        deletedPortefeuilles++;
      }
      
      // Supprimer l'utilisateur
      await User.deleteOne({ _id: user._id });
      console.log(`  → Utilisateur supprimé\n`);
      deletedUsers++;
    }

    console.log('📊 État après nettoyage:');
    const usersAfter = await User.countDocuments();
    const portefeuillesAfter = await PorteFeuille.countDocuments();
    const transactionsAfter = await PFTransaction.countDocuments();
    
    console.log(`  - Utilisateurs: ${usersAfter} (${usersBefore - usersAfter} supprimés)`);
    console.log(`  - Portefeuilles: ${portefeuillesAfter} (${portefeuillesBefore - portefeuillesAfter} supprimés)`);
    console.log(`  - Transactions: ${transactionsAfter} (${transactionsBefore - transactionsAfter} supprimées)\n`);

    console.log(`📊 === RÉSUMÉ ===`);
    console.log(`✅ Utilisateurs supprimés: ${deletedUsers}`);
    console.log(`✅ Portefeuilles supprimés: ${deletedPortefeuilles}`);
    console.log(`✅ Transactions supprimées: ${deletedTransactions}\n`);

    console.log('🔌 Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le nettoyage
cleanPortefeuilles();
