const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PorteFeuille = require('../models/PorteFeuille');

async function crediterPortefeuille() {
  try {
    console.log('💰 Crédit du portefeuille commerçant...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le commerçant
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    if (!commercant) {
      console.log('❌ Commerçant non trouvé');
      process.exit(1);
    }

    console.log(`👤 Commerçant: ${commercant.nom} ${commercant.prenoms}`);

    // Trouver ou créer le portefeuille
    let portefeuille = await PorteFeuille.findOne({ owner: commercant._id });
    
    if (!portefeuille) {
      portefeuille = await PorteFeuille.create({
        owner: commercant._id,
        balance: 0
      });
      console.log('📝 Portefeuille créé');
    }

    console.log(`💵 Solde actuel: ${portefeuille.balance}Ar`);

    // Créditer 10000Ar
    portefeuille.balance += 10000;
    await portefeuille.save();

    console.log(`✅ Solde après crédit: ${portefeuille.balance}Ar`);
    console.log('\n✅ Crédit effectué avec succès!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

crediterPortefeuille();
