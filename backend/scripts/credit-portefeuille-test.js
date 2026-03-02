/**
 * 💰 Script pour créditer un portefeuille (pour tests)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const PorteFeuille = require('../models/PorteFeuille');
const User = require('../models/User');

async function creditPortefeuille() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les commerçants
    const commercants = await User.find({ role: 'Commercant' });
    console.log(`👥 ${commercants.length} commerçants trouvés\n`);

    let credited = 0;
    let created = 0;
    
    for (const commercant of commercants) {
      let portefeuille = await PorteFeuille.findOne({ owner: commercant._id });
      
      if (!portefeuille) {
        // Créer un portefeuille si inexistant
        portefeuille = await PorteFeuille.create({
          owner: commercant._id,
          balance: 5000
        });
        console.log(`💰 ${commercant.email}`);
        console.log(`   Portefeuille créé avec 5000Ar`);
        created++;
      } else {
        const oldBalance = portefeuille.balance;
        portefeuille.balance = 5000; // Créditer 5000Ar
        await portefeuille.save();
        
        console.log(`💰 ${commercant.email}`);
        console.log(`   Ancien solde: ${oldBalance}Ar`);
        console.log(`   Nouveau solde: ${portefeuille.balance}Ar`);
        credited++;
      }
    }

    console.log(`\n✅ ${credited} portefeuilles crédités avec 5000Ar`);
    console.log(`✅ ${created} portefeuilles créés avec 5000Ar`);
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

creditPortefeuille();
