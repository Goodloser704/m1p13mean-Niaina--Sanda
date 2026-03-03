const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

async function checkAdminMallPortefeuille() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Trouver admin@mall.com
    const admin = await User.findOne({ email: 'admin@mall.com' });
    if (!admin) {
      console.log('❌ admin@mall.com non trouvé!');
      process.exit(1);
    }
    
    console.log(`👤 Admin: ${admin.email}`);
    console.log(`   ID: ${admin._id}\n`);

    // 2. Vérifier son portefeuille
    let portefeuille = await PorteFeuille.findOne({ owner: admin._id });
    
    if (!portefeuille) {
      console.log('❌ Portefeuille non trouvé pour admin@mall.com');
      console.log('   Création du portefeuille...\n');
      
      portefeuille = await PorteFeuille.create({
        owner: admin._id,
        balance: 0
      });
      
      console.log(`✅ Portefeuille créé: ${portefeuille._id}`);
      console.log(`   Solde: ${portefeuille.balance}Ar\n`);
    } else {
      console.log(`💰 Portefeuille: ${portefeuille._id}`);
      console.log(`   Solde: ${portefeuille.balance}Ar\n`);
    }

    // 3. Vérifier les transactions
    const transactions = await PFTransaction.find({
      $or: [
        { fromWallet: portefeuille._id },
        { toWallet: portefeuille._id }
      ],
      statut: 'Completee'
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`📊 Transactions: ${transactions.length}\n`);
    
    if (transactions.length > 0) {
      console.log('Dernières transactions:');
      transactions.forEach((t, i) => {
        const direction = t.toWallet?.toString() === portefeuille._id.toString() ? '📥' : '📤';
        console.log(`${i + 1}. ${direction} ${t.type}: ${t.amount}Ar`);
        console.log(`   ${t.description}`);
        console.log(`   ${t.createdAt}\n`);
      });
    } else {
      console.log('⚠️  Aucune transaction trouvée');
    }

    // 4. Compter les transactions par type
    const stats = await PFTransaction.aggregate([
      {
        $match: {
          $or: [
            { fromWallet: portefeuille._id },
            { toWallet: portefeuille._id }
          ],
          statut: 'Completee'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('📈 Statistiques par type:');
      stats.forEach(s => {
        console.log(`   ${s._id}: ${s.count} transactions, ${s.total}Ar`);
      });
    }

    console.log('\n✅ Vérification terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAdminMallPortefeuille();
