/**
 * 🧪 Test portefeuille admin et transactions loyers
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');
const PFTransaction = require('../models/PFTransaction');

async function testPortefeuilleAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Vérifier que l'admin existe
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.log('❌ Aucun compte admin trouvé!');
      process.exit(1);
    }
    console.log(`\n👤 Admin trouvé: ${admin.email} (${admin._id})`);

    // 2. Vérifier le portefeuille admin
    let portefeuilleAdmin = await PorteFeuille.findOne({ owner: admin._id });
    if (!portefeuilleAdmin) {
      console.log('❌ Portefeuille admin non trouvé!');
      console.log('   Création du portefeuille admin...');
      
      portefeuilleAdmin = await PorteFeuille.create({
        owner: admin._id,
        balance: 0
      });
      
      console.log(`✅ Portefeuille admin créé: ${portefeuilleAdmin._id}`);
      console.log(`   Solde initial: ${portefeuilleAdmin.balance}Ar`);
    } else {
      console.log(`\n💰 Portefeuille admin: ${portefeuilleAdmin._id}`);
      console.log(`   Solde: ${portefeuilleAdmin.balance}Ar`);
    }

    // 3. Vérifier les transactions de type Loyer
    const transactionsLoyer = await PFTransaction.find({
      type: 'Loyer',
      statut: 'Completee'
    })
    .populate('fromWallet', 'owner balance')
    .populate('toWallet', 'owner balance')
    .sort({ createdAt: -1 })
    .limit(10);

    console.log(`\n📊 Transactions de loyer totales: ${transactionsLoyer.length}`);
    
    if (transactionsLoyer.length > 0) {
      console.log('\nDernières transactions:');
      transactionsLoyer.forEach((t, i) => {
        console.log(`\n${i + 1}. Transaction ${t._id}`);
        console.log(`   Montant: ${t.amount}Ar`);
        console.log(`   De: ${t.fromWallet?._id} (solde: ${t.fromWallet?.balance}Ar)`);
        console.log(`   Vers: ${t.toWallet?._id} (solde: ${t.toWallet?.balance}Ar)`);
        console.log(`   Description: ${t.description}`);
        console.log(`   Date: ${t.createdAt}`);
        console.log(`   Statut: ${t.statut}`);
      });
    }

    // 4. Vérifier les transactions VERS l'admin
    const transactionsVersAdmin = await PFTransaction.find({
      toWallet: portefeuilleAdmin._id,
      statut: 'Completee'
    }).sort({ createdAt: -1 });

    console.log(`\n📥 Transactions VERS admin: ${transactionsVersAdmin.length}`);
    
    if (transactionsVersAdmin.length > 0) {
      console.log('\nDétails:');
      transactionsVersAdmin.forEach((t, i) => {
        console.log(`${i + 1}. ${t.type}: ${t.amount}Ar - ${t.description} (${t.createdAt})`);
      });
      
      const totalRecu = transactionsVersAdmin.reduce((sum, t) => sum + t.amount, 0);
      console.log(`\n💰 Total reçu (selon transactions): ${totalRecu}Ar`);
      console.log(`💰 Solde actuel portefeuille: ${portefeuilleAdmin.balance}Ar`);
      
      if (Math.abs(totalRecu - portefeuilleAdmin.balance) > 0.01) {
        console.log(`⚠️  ATTENTION: Différence de ${Math.abs(totalRecu - portefeuilleAdmin.balance)}Ar!`);
      } else {
        console.log(`✅ Solde cohérent avec les transactions`);
      }
    } else {
      console.log('⚠️  Aucune transaction vers l\'admin trouvée!');
    }

    // 5. Vérifier les transactions DEPUIS les commerçants
    const commercants = await User.find({ role: 'Commercant' }).limit(5);
    console.log(`\n👥 Commerçants trouvés: ${commercants.length}`);
    
    for (const commercant of commercants) {
      const portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
      if (portefeuilleCommercant) {
        const transactionsLoyers = await PFTransaction.find({
          fromWallet: portefeuilleCommercant._id,
          type: 'Loyer',
          statut: 'Completee'
        });
        
        if (transactionsLoyers.length > 0) {
          console.log(`\n   ${commercant.email}:`);
          console.log(`   - Portefeuille: ${portefeuilleCommercant._id}`);
          console.log(`   - Solde: ${portefeuilleCommercant.balance}Ar`);
          console.log(`   - Loyers payés: ${transactionsLoyers.length}`);
          console.log(`   - Total payé: ${transactionsLoyers.reduce((sum, t) => sum + t.amount, 0)}Ar`);
          
          // Vérifier si ces transactions pointent vers l'admin
          const versAdmin = transactionsLoyers.filter(t => 
            t.toWallet && t.toWallet.toString() === portefeuilleAdmin._id.toString()
          );
          console.log(`   - Vers admin: ${versAdmin.length}/${transactionsLoyers.length}`);
        }
      }
    }

    console.log('\n✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testPortefeuilleAdmin();
