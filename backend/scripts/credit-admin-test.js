/**
 * Créditer le portefeuille admin avec une transaction de test
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

async function creditAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const admin = await User.findOne({ email: 'admin@mall.com' });
    if (!admin) {
      console.log('❌ admin@mall.com non trouvé');
      process.exit(1);
    }

    const pf = await PorteFeuille.findOne({ owner: admin._id });
    if (!pf) {
      console.log('❌ Portefeuille non trouvé');
      process.exit(1);
    }

    console.log(`💰 Solde actuel: ${pf.balance}€\n`);
    console.log('💳 Ajout d\'une transaction de test de 100€...\n');

    // Créer une transaction de recharge
    const transaction = await PFTransaction.create({
      toWallet: pf._id,
      type: 'Recharge',
      amount: 100,
      description: 'Test de recharge - Vérification frontend',
      statut: 'Completee',
      numeroTransaction: `TEST-${Date.now()}`
    });

    // Mettre à jour le solde
    pf.balance += 100;
    await pf.save();

    console.log(`✅ Transaction créée: ${transaction._id}`);
    console.log(`💰 Nouveau solde: ${pf.balance}€\n`);

    // Vérifier les transactions
    const txs = await PFTransaction.find({
      toWallet: pf._id,
      statut: 'Completee'
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`📊 Dernières transactions (${txs.length}):`);
    txs.forEach((t, i) => {
      console.log(`${i + 1}. ${t.type}: ${t.amount}€ - ${t.description}`);
    });

    console.log('\n✅ Terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

creditAdmin();
