const mongoose = require('mongoose');
const PorteFeuille = require('../models/PorteFeuille');
const User = require('../models/User');
const PFTransaction = require('../models/PFTransaction');

// Lire le .env
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function crediterCommercant() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver le commerçant
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    if (!commercant) {
      console.log('❌ Commerçant non trouvé');
      process.exit(1);
    }

    console.log(`\n👤 Commerçant: ${commercant.nom} ${commercant.prenoms}`);
    console.log(`   Email: ${commercant.email}`);

    // Trouver son portefeuille
    const portefeuille = await PorteFeuille.findOne({ owner: commercant._id });
    if (!portefeuille) {
      console.log('❌ Portefeuille non trouvé');
      process.exit(1);
    }

    console.log(`\n💰 Solde actuel: ${portefeuille.balance}€`);

    // Ajouter 1200€
    const montantAjoute = 1200;
    portefeuille.balance += montantAjoute;
    await portefeuille.save();

    console.log(`✅ Ajout de ${montantAjoute}€`);
    console.log(`💰 Nouveau solde: ${portefeuille.balance}€`);

    // Créer une transaction pour traçabilité
    const transaction = await PFTransaction.create({
      toWallet: portefeuille._id,
      type: 'Recharge',
      amount: montantAjoute,
      description: 'Crédit manuel pour tests - Ajout de 1200€',
      statut: 'Completee',
      numeroTransaction: `CREDIT-${Date.now()}`
    });

    console.log(`\n📝 Transaction créée: ${transaction._id}`);
    console.log(`   Numéro: ${transaction.numeroTransaction}`);

    await mongoose.disconnect();
    console.log('\n✅ Terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

crediterCommercant();
