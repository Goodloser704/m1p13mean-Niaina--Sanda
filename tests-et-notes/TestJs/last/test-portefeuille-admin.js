/**
 * 🧪 Test portefeuille admin et transactions loyers
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './mall-app/backend/.env' });

const User = require('../../../mall-app/backend/models/User');
const PorteFeuille = require('../../../mall-app/backend/models/PorteFeuille');
const PFTransaction = require('../../../mall-app/backend/models/PFTransaction');

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
    const portefeuilleAdmin = await PorteFeuille.findOne({ owner: admin._id });
    if (!portefeuilleAdmin) {
      console.log('❌ Portefeuille admin non trouvé!');
      console.log('   Création du portefeuille admin...');
      
      const nouveauPortefeuille = await PorteFeuille.create({
        owner: admin._id,
        balance: 0
      });
      
      console.log(`✅ Portefeuille admin créé: ${nouveauPortefeuille._id}`);
      console.log(`   Solde initial: ${nouveauPortefeuille.balance}€`);
    } else {
      console.log(`\n💰 Portefeuille admin: ${portefeuilleAdmin._id}`);
      console.log(`   Solde: ${portefeuilleAdmin.balance}€`);
    }

    // 3. Vérifier les transactions de type Loyer
    const transactionsLoyer = await PFTransaction.find({
      type: 'Loyer',
      statut: 'Completee'
    })
    .populate('fromWallet', 'owner')
    .populate('toWallet', 'owner')
    .sort({ createdAt: -1 })
    .limit(10);

    console.log(`\n📊 Transactions de loyer: ${transactionsLoyer.length}`);
    
    if (transactionsLoyer.length > 0) {
      console.log('\nDernières transactions:');
      transactionsLoyer.forEach((t, i) => {
        console.log(`\n${i + 1}. Transaction ${t._id}`);
        console.log(`   Montant: ${t.amount}€`);
        console.log(`   De: ${t.fromWallet?._id}`);
        console.log(`   Vers: ${t.toWallet?._id}`);
        console.log(`   Description: ${t.description}`);
        console.log(`   Date: ${t.createdAt}`);
      });
    }

    // 4. Vérifier les transactions VERS l'admin
    const portefeuilleAdminActuel = await PorteFeuille.findOne({ owner: admin._id });
    
    if (portefeuilleAdminActuel) {
      const transactionsVersAdmin = await PFTransaction.find({
        toWallet: portefeuilleAdminActuel._id,
        statut: 'Completee'
      }).sort({ createdAt: -1 });

      console.log(`\n📥 Transactions VERS admin: ${transactionsVersAdmin.length}`);
      
      if (transactionsVersAdmin.length > 0) {
        console.log('\nDétails:');
        transactionsVersAdmin.forEach((t, i) => {
          console.log(`${i + 1}. ${t.type}: ${t.amount}€ - ${t.description}`);
        });
        
        const totalRecu = transactionsVersAdmin.reduce((sum, t) => sum + t.amount, 0);
        console.log(`\n💰 Total reçu: ${totalRecu}€`);
        console.log(`💰 Solde actuel: ${portefeuilleAdminActuel.balance}€`);
        
        if (Math.abs(totalRecu - portefeuilleAdminActuel.balance) > 0.01) {
          console.log(`⚠️  ATTENTION: Différence entre total reçu et solde!`);
        }
      }
    }

    // 5. Vérifier les transactions DEPUIS les commerçants
    const commercants = await User.find({ role: 'Commercant' });
    console.log(`\n👥 Commerçants trouvés: ${commercants.length}`);
    
    for (const commercant of commercants.slice(0, 3)) {
      const portefeuilleCommercant = await PorteFeuille.findOne({ owner: commercant._id });
      if (portefeuilleCommercant) {
        const transactionsLoyers = await PFTransaction.find({
          fromWallet: portefeuilleCommercant._id,
          type: 'Loyer',
          statut: 'Completee'
        });
        
        if (transactionsLoyers.length > 0) {
          console.log(`\n   ${commercant.email}:`);
          console.log(`   - Loyers payés: ${transactionsLoyers.length}`);
          console.log(`   - Total: ${transactionsLoyers.reduce((sum, t) => sum + t.amount, 0)}€`);
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
