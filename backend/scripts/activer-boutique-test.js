require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Boutique = require('../models/Boutique');
const User = require('../models/User');

/**
 * 🏪 Script pour activer la boutique de test
 */

async function activerBoutiqueTest() {
  try {
    console.log('🏪 Activation de la boutique de test...\n');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le commerçant
    const commercant = await User.findOne({ email: 'commercant@test.com' });
    if (!commercant) {
      throw new Error('Commerçant non trouvé');
    }

    // Trouver et activer la boutique
    const boutique = await Boutique.findOne({ commercant: commercant._id });
    if (!boutique) {
      throw new Error('Boutique non trouvée');
    }

    console.log(`📍 Boutique trouvée: ${boutique.nom}`);
    console.log(`   Statut actuel: ${boutique.statut}`);
    console.log(`   isActive: ${boutique.isActive}`);

    boutique.statut = 'Actif';
    boutique.isActive = true;
    await boutique.save();

    console.log(`\n✅ Boutique activée avec succès!`);
    console.log(`   Nouveau statut: ${boutique.statut}`);
    console.log(`   isActive: ${boutique.isActive}`);

    console.log('\n🔌 Déconnexion de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

activerBoutiqueTest();
