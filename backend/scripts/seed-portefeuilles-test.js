require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

/**
 * 💰 Script de seed pour les portefeuilles de test
 * Crée des utilisateurs et portefeuilles avec des transactions variées
 */

async function seedPortefeuilles() {
  try {
    console.log('💰 Seed des portefeuilles de test...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Créer des utilisateurs de test supplémentaires
    const usersData = [
      {
        nom: 'Dupont',
        prenoms: 'Jean',
        email: 'jean.dupont@test.com',
        mdp: 'Test123456!',
        role: 'Commercant',
        telephone: '0340000010',
        genre: 'Masculin',
        isActive: true
      },
      {
        nom: 'Martin',
        prenoms: 'Sophie',
        email: 'sophie.martin@test.com',
        mdp: 'Test123456!',
        role: 'Commercant',
        telephone: '0340000011',
        genre: 'Feminin',
        isActive: true
      },
      {
        nom: 'Bernard',
        prenoms: 'Pierre',
        email: 'pierre.bernard@test.com',
        mdp: 'Test123456!',
        role: 'Acheteur',
        telephone: '0340000012',
        genre: 'Masculin',
        isActive: true
      },
      {
        nom: 'Dubois',
        prenoms: 'Marie',
        email: 'marie.dubois@test.com',
        mdp: 'Test123456!',
        role: 'Acheteur',
        telephone: '0340000013',
        genre: 'Feminin',
        isActive: true
      },
      {
        nom: 'Petit',
        prenoms: 'Luc',
        email: 'luc.petit@test.com',
        mdp: 'Test123456!',
        role: 'Commercant',
        telephone: '0340000014',
        genre: 'Masculin',
        isActive: true
      }
    ];

    const createdUsers = [];
    
    for (const userData of usersData) {
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Utilisateur créé: ${userData.email}`);
      } else {
        console.log(`⏭️  Utilisateur existe: ${userData.email}`);
      }
      
      createdUsers.push(user);
    }

    console.log('\n💰 Création des portefeuilles...\n');

    // Créer des portefeuilles avec différents soldes
    const portefeuillesData = [
      { user: createdUsers[0], balance: 1500 },  // Jean Dupont
      { user: createdUsers[1], balance: 3200 },  // Sophie Martin
      { user: createdUsers[2], balance: 500 },   // Pierre Bernard
      { user: createdUsers[3], balance: 800 },   // Marie Dubois
      { user: createdUsers[4], balance: 2100 }   // Luc Petit
    ];

    const createdPortefeuilles = [];

    for (const pfData of portefeuillesData) {
      let portefeuille = await PorteFeuille.findOne({ owner: pfData.user._id });
      
      if (!portefeuille) {
        portefeuille = new PorteFeuille({
          owner: pfData.user._id,
          balance: pfData.balance
        });
        await portefeuille.save();
        console.log(`✅ Portefeuille créé pour ${pfData.user.prenoms} ${pfData.user.nom}: ${pfData.balance}Ar`);
      } else {
        // Mettre à jour le solde
        portefeuille.balance = pfData.balance;
        await portefeuille.save();
        console.log(`⏭️  Portefeuille mis à jour pour ${pfData.user.prenoms} ${pfData.user.nom}: ${pfData.balance}Ar`);
      }
      
      createdPortefeuilles.push(portefeuille);
    }

    console.log('\n💸 Création des transactions de test...\n');

    // Créer des transactions variées
    const transactionsData = [
      // Recharges
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[0]._id,
        amount: 500,
        description: 'Recharge par carte bancaire',
        statut: 'Completee'
      },
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[1]._id,
        amount: 1000,
        description: 'Recharge par PayPal',
        statut: 'Completee'
      },
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[2]._id,
        amount: 200,
        description: 'Recharge par virement',
        statut: 'Completee'
      },
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[3]._id,
        amount: 300,
        description: 'Recharge par carte bancaire',
        statut: 'Completee'
      },
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[4]._id,
        amount: 600,
        description: 'Recharge par PayPal',
        statut: 'Completee'
      },
      // Loyers (entre commerçants et admin)
      {
        type: 'Loyer',
        fromWallet: createdPortefeuilles[0]._id,
        toWallet: createdPortefeuilles[1]._id,
        amount: 500,
        description: 'Loyer mensuel - Janvier 2026',
        statut: 'Completee'
      },
      {
        type: 'Loyer',
        fromWallet: createdPortefeuilles[1]._id,
        toWallet: createdPortefeuilles[4]._id,
        amount: 750,
        description: 'Loyer mensuel - Janvier 2026',
        statut: 'Completee'
      },
      {
        type: 'Loyer',
        fromWallet: createdPortefeuilles[4]._id,
        toWallet: createdPortefeuilles[0]._id,
        amount: 600,
        description: 'Loyer mensuel - Février 2026',
        statut: 'Completee'
      },
      // Achats (entre acheteurs et commerçants)
      {
        type: 'Achat',
        fromWallet: createdPortefeuilles[2]._id,
        toWallet: createdPortefeuilles[0]._id,
        amount: 150,
        description: 'Achat produit - Vêtements',
        statut: 'Completee'
      },
      {
        type: 'Achat',
        fromWallet: createdPortefeuilles[3]._id,
        toWallet: createdPortefeuilles[1]._id,
        amount: 250,
        description: 'Achat produit - Électronique',
        statut: 'Completee'
      },
      {
        type: 'Achat',
        fromWallet: createdPortefeuilles[2]._id,
        toWallet: createdPortefeuilles[4]._id,
        amount: 80,
        description: 'Achat produit - Accessoires',
        statut: 'Completee'
      },
      {
        type: 'Achat',
        fromWallet: createdPortefeuilles[3]._id,
        toWallet: createdPortefeuilles[0]._id,
        amount: 120,
        description: 'Achat produit - Chaussures',
        statut: 'Completee'
      },
      // Commissions
      {
        type: 'Commission',
        fromWallet: createdPortefeuilles[0]._id,
        toWallet: createdPortefeuilles[1]._id,
        amount: 50,
        description: 'Commission sur vente',
        statut: 'Completee'
      },
      {
        type: 'Commission',
        fromWallet: createdPortefeuilles[4]._id,
        toWallet: createdPortefeuilles[1]._id,
        amount: 30,
        description: 'Commission sur vente',
        statut: 'Completee'
      },
      // Transactions en attente
      {
        type: 'Achat',
        fromWallet: createdPortefeuilles[2]._id,
        toWallet: createdPortefeuilles[1]._id,
        amount: 100,
        description: 'Achat en attente de validation',
        statut: 'EnAttente'
      },
      // Transaction échouée
      {
        type: 'Recharge',
        toWallet: createdPortefeuilles[3]._id,
        amount: 500,
        description: 'Recharge échouée - Carte refusée',
        statut: 'Echouee'
      }
    ];

    let transactionCount = 0;
    
    for (const txData of transactionsData) {
      // Vérifier si une transaction similaire existe déjà
      const existingTx = await PFTransaction.findOne({
        type: txData.type,
        amount: txData.amount,
        description: txData.description,
        toWallet: txData.toWallet,
        fromWallet: txData.fromWallet
      });

      if (!existingTx) {
        const transaction = new PFTransaction(txData);
        await transaction.save();
        transactionCount++;
        console.log(`✅ Transaction créée: ${txData.type} - ${txData.amount}Ar (${txData.statut})`);
      } else {
        console.log(`⏭️  Transaction existe: ${txData.type} - ${txData.amount}Ar`);
      }
    }

    console.log(`\n📊 === RÉSUMÉ ===`);
    console.log(`✅ Utilisateurs: ${createdUsers.length}`);
    console.log(`✅ Portefeuilles: ${createdPortefeuilles.length}`);
    console.log(`✅ Nouvelles transactions: ${transactionCount}`);
    console.log(`📝 Total transactions dans la base: ${await PFTransaction.countDocuments()}`);

    console.log('\n🔌 Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le seed
seedPortefeuilles();
