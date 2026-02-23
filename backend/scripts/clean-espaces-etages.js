/**
 * 🧹 Script de nettoyage des espaces et étages de test
 * Supprime uniquement les données créées lors des tests
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');

async function cleanTestData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Supprimer les espaces de test (code commence par TST)
    console.log('🧹 Suppression des espaces de test (code TST*)...');
    const espacesDeleted = await Espace.deleteMany({
      $or: [
        { code: { $regex: /^TST/i } },
        { etage: null }, // Espaces sans étage
        { etage: { $exists: false } } // Espaces sans champ étage
      ]
    });
    console.log(`✅ ${espacesDeleted.deletedCount} espaces de test supprimés`);

    // Supprimer les étages de test (niveau >= 10)
    console.log('\n🧹 Suppression des étages de test (niveau >= 10)...');
    const etagesDeleted = await Etage.deleteMany({
      niveau: { $gte: 10 }
    });
    console.log(`✅ ${etagesDeleted.deletedCount} étages de test supprimés`);

    // Afficher les statistiques
    const totalEtages = await Etage.countDocuments();
    const totalEspaces = await Espace.countDocuments();
    
    console.log('\n📊 Statistiques après nettoyage:');
    console.log(`   - Étages restants: ${totalEtages}`);
    console.log(`   - Espaces restants: ${totalEspaces}`);

    // Afficher les étages restants
    if (totalEtages > 0) {
      console.log('\n📋 Étages restants:');
      const etages = await Etage.find().sort({ niveau: 1 });
      etages.forEach(etage => {
        console.log(`   - Niveau ${etage.niveau}: ${etage.nom}`);
      });
    }

    console.log('\n✅ Nettoyage terminé avec succès!');
    
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanTestData();

